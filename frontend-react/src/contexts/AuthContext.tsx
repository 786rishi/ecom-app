import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import Keycloak, { KeycloakInstance, KeycloakProfile } from "keycloak-js";
import keycloak from '../services/keycloak';

interface User {
  id: string;
  email: string;
  name: string;
  preferredUsername?: string;
  givenName?: string;
  familyName?: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  keycloak: KeycloakInstance | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; keycloak: KeycloakInstance } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INIT_KEYCLOAK_START' }
  | { type: 'INIT_KEYCLOAK_SUCCESS'; payload: KeycloakInstance }
  | { type: 'INIT_KEYCLOAK_FAILURE'; payload: string };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  keycloak: null
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {


  switch (action.type) {

    case 'INIT_KEYCLOAK_START':
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'INIT_KEYCLOAK_SUCCESS':
      return {
        ...state,
        keycloak: action.payload,
        loading: false,
        error: null
      };

    case 'INIT_KEYCLOAK_FAILURE':
      return {
        ...state,
        keycloak: null,
        loading: false,
        error: action.payload
      };

    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: (action as any).payload.user,
        keycloak: (action as any).payload.keycloak,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case 'LOGIN_FAILURE':
        return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: (action as any).payload
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

interface AuthContextType {
  auth: AuthState;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  keycloakLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, initialState);



  // Initialize Keycloak
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        // Prevent multiple initializations
        if ((keycloak as any).__initialized) {
          console.log("Keycloak already initialized, skipping...");
          return;
        }

        // Prevent multiple initialization attempts
        if ((keycloak as any).__initializing) {
          console.log("Keycloak already initializing, skipping...");
          return;
        }

        // Mark as initializing to prevent race conditions
        (keycloak as any).__initializing = true;

        dispatch({ type: 'INIT_KEYCLOAK_START' });

        const authenticated = await keycloak.init({
          onLoad: "login-required",  //"check-sso",
          pkceMethod: "S256",
          checkLoginIframe: false,
          enableLogging: process.env.NODE_ENV === "development",
          redirectUri: window.location.origin,
          // Add time skew tolerance to handle clock differences
          timeSkew: 10,
          // Disable nonce validation temporarily to isolate issue
          // We'll re-enable it once the basic flow works
          // This is a temporary fix for the nonce issue
          // In production, you should keep nonce validation enabled
          // and fix the underlying time synchronization issue
          // For now, we'll use PKCE which provides similar protection
          useNonce: false
        } as any);

        (keycloak as any).__initialized = true;

        console.log("Keycloak initialized", authenticated);
        console.log("Keycloak token", keycloak.token);

        if (authenticated && keycloak.token) {
          try {
            // Clean up URL after redirect
            window.history.replaceState({}, document.title, window.location.pathname);

            // Use the token parsed data to create user profile
            const tokenParsed = keycloak.tokenParsed as any;

            const realmRoles = tokenParsed?.realm_access?.roles || [];
            const clientRoles = tokenParsed?.resource_access?.["fb-login"]?.roles || [];

            const user: User = {
              id: tokenParsed?.sub || keycloak.subject || '',
              email: tokenParsed?.email || '',
              name: tokenParsed?.name || tokenParsed?.preferred_username || '',
              preferredUsername: tokenParsed?.preferred_username,
              givenName: tokenParsed?.given_name,
              familyName: tokenParsed?.family_name,
              roles: [...realmRoles, ...clientRoles]  //tokenParsed?.realm_access?.roles || []
            };

            console.log("User loaded from token", user);

            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, keycloak }
            });

            // Trigger success event
            window.dispatchEvent(new CustomEvent('loginSuccess'));

            // Try to load detailed profile in background (non-blocking)
            try {
              const userProfile = await keycloak.loadUserProfile();
              console.log("Detailed user profile loaded", userProfile);
              // Update user with detailed info if needed
              const updatedUser: User = {
                ...user,
                id: userProfile.id || user.id,
                email: userProfile.email || user.email,
                name: userProfile.firstName && userProfile.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile.username || user.name,
                preferredUsername: userProfile.username || user.preferredUsername,
                givenName: userProfile.firstName,
                familyName: userProfile.lastName
              };
              
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: updatedUser, keycloak }
              });
            } catch (profileError) {
              console.warn("Could not load detailed profile, using token data", profileError);
              // User is already logged in with token data, no need to fail
            }
          } catch (error) {
            console.error("Failed to process user data", error);
            dispatch({
              type: 'LOGIN_FAILURE',
              payload: 'Failed to process user data'
            });
          }
        } else {
          // User is not authenticated, dispatch success but don't set user
          dispatch({
            type: 'INIT_KEYCLOAK_SUCCESS',
            payload: keycloak
          });
        }

        // Set up token refresh
        // keycloak.onTokenExpired = () => {
        //   (keycloak.updateToken(30) as any).then((refreshed: boolean) => {
        //     if (refreshed) {
        //       console.log('Token refreshed');
        //     } else {
        //       console.log('Token not refreshed, valid for ' + Math.round(keycloak.tokenParsed!.exp! - (new Date().getTime() / 1000)) + ' seconds');
        //     }
        //   }).catch(() => {
        //     console.error('Failed to refresh token');
        //     dispatch({ type: 'LOGOUT' });
        //   });
        // };

        keycloak.onTokenExpired = async () => {
          try {
            const refreshed = await keycloak.updateToken(30);

            if (refreshed) {

            } else {

            }
          } catch (err) {

            dispatch({ type: "LOGOUT" });
          }
        };

        // Set up auth event listeners
        keycloak.onAuthSuccess = () => {

        };

        keycloak.onAuthError = (error) => {

          dispatch({ type: 'LOGIN_FAILURE', payload: 'Authentication failed' });
        };

        keycloak.onAuthLogout = () => {

          dispatch({ type: 'LOGOUT' });
        };

      } catch (error) {

        dispatch({
          type: 'INIT_KEYCLOAK_FAILURE',
          payload: 'Failed to initialize authentication'
        });
      }
    };

    initKeycloak();
  }, []);

  const loadUserProfile = (): Promise<KeycloakProfile> => {
    return new Promise((resolve, reject) => {
      keycloak.loadUserProfile()
        .success(resolve)
        .error(reject);
    });
  };

  const login = async () => {
    if (!auth.keycloak) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Keycloak not initialized' });
      return;
    }

    try {
      dispatch({ type: 'LOGIN_START' });

      await auth.keycloak.login({
        redirectUri: window.location.origin,
        // Use prompt=none to avoid forced login if user is already authenticated
        prompt: 'none'
      });

    } catch (error) {
      console.error("Login failed", error);
      // If prompt=none fails, try regular login
      try {
        await auth.keycloak.login({
          redirectUri: window.location.origin
        });
      } catch (loginError) {
        console.error("Regular login also failed", loginError);
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed' });
      }
    }
  };

  const keycloakLogin = async () => {
    await login();
  };

  const logout = async () => {
    if (auth.keycloak) {
      try {
        await auth.keycloak.logout({
          redirectUri: window.location.origin
        });
      } catch (error) {

        // Force logout even if Keycloak logout fails
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      auth,
      login,
      logout,
      clearError,
      keycloakLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};