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
    console.log('AuthContext useEffect triggered - starting Keycloak initialization');
    const initKeycloak = async () => {
      try {
        console.log('Initializing Keycloak...');
        console.log('Keycloak instance:', keycloak);
        console.log('Keycloak config:', (keycloak as any)._realm);
        
        if ((keycloak as any).__initialized) {
          console.log('Keycloak already initialized');
          return;
        }

        console.log('Starting Keycloak initialization...');
        dispatch({ type: 'INIT_KEYCLOAK_START' });

        // const authenticated = await keycloak.init({
        //   onLoad: "check-sso",
        //   silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
        //   pkceMethod: "S256",
        //   checkLoginIframe: false,
        //   enableLogging: process.env.NODE_ENV === "development",
        //   redirectUri: window.location.origin
        // } as any);

        // For HTTP environments, use minimal configuration to avoid Web Crypto API issues
        const isHttpEnvironment = window.location.protocol === 'http:';
        
        if (isHttpEnvironment) {
          console.log('HTTP environment detected, using minimal Keycloak configuration');
          
          // Try a simpler initialization for HTTP environments
          const authenticated = await keycloak.init({
            onLoad: "check-sso",
            checkLoginIframe: false,
            enableLogging: process.env.NODE_ENV === "development",
            // Omit redirectUri and other parameters that might trigger crypto operations
          } as any);
          
          console.log('Keycloak initialization completed. Authenticated:', authenticated);
          console.log('Keycloak token present:', !!keycloak.token);
          console.log('Current URL:', window.location.href);

          (keycloak as any).__initialized = true;

          if (authenticated && keycloak.token) {
            try {
              window.history.replaceState({}, document.title, window.location.pathname);

              const userProfile: any = await keycloak.loadUserProfile();
              const user: User = {
                id: userProfile.id || keycloak.subject || '',
                email: userProfile.email || '',
                name: userProfile.firstName && userProfile.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile.username || '',
                preferredUsername: userProfile.username,
                givenName: userProfile.firstName,
                familyName: userProfile.lastName,
                roles: keycloak.tokenParsed?.realm_access?.roles || []
              };

              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, keycloak }
              });

              window.dispatchEvent(new CustomEvent('loginSuccess'));
            } catch (error) {
              dispatch({
                type: 'LOGIN_FAILURE',
                payload: 'Failed to load user profile'
              });
            }
          } else {
            console.log('User not authenticated, Keycloak initialized successfully');
            dispatch({
              type: 'INIT_KEYCLOAK_SUCCESS',
              payload: keycloak
            });
          }
        } else {
          // HTTPS environment - use full configuration
          const keycloakConfig = {
            onLoad: "check-sso",
            pkceMethod: "S256",
            checkLoginIframe: false,
            redirectUri: window.location.origin,
            silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
            enableLogging: process.env.NODE_ENV === "development",
          };

          const authenticated = await keycloak.init(keycloakConfig as any);

          console.log('Keycloak initialization completed. Authenticated:', authenticated);
          console.log('Keycloak token present:', !!keycloak.token);
          console.log('Current URL:', window.location.href);

          (keycloak as any).__initialized = true;

          if (authenticated && keycloak.token) {
            try {
              window.history.replaceState({}, document.title, window.location.pathname);

              const userProfile: any = await keycloak.loadUserProfile();
              const user: User = {
                id: userProfile.id || keycloak.subject || '',
                email: userProfile.email || '',
                name: userProfile.firstName && userProfile.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile.username || '',
                preferredUsername: userProfile.username,
                givenName: userProfile.firstName,
                familyName: userProfile.lastName,
                roles: keycloak.tokenParsed?.realm_access?.roles || []
              };

              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, keycloak }
              });

              window.dispatchEvent(new CustomEvent('loginSuccess'));
            } catch (error) {
              dispatch({
                type: 'LOGIN_FAILURE',
                payload: 'Failed to load user profile'
              });
            }
          } else {
            console.log('User not authenticated, Keycloak initialized successfully');
            dispatch({
              type: 'INIT_KEYCLOAK_SUCCESS',
              payload: keycloak
            });
          }
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
        console.error('Keycloak initialization failed:', error);
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
    console.log('Login function called');
    console.log('Keycloak instance:', auth.keycloak);
    
    if (!auth.keycloak) {
      console.error('Keycloak not initialized');
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Keycloak not initialized' });
      return;
    }

    try {
      console.log('Starting login process...');
      dispatch({ type: 'LOGIN_START' });

      // For HTTP environments, use minimal login configuration
      const isHttpEnvironment = window.location.protocol === 'http:';
      const loginConfig = isHttpEnvironment ? {} : { redirectUri: window.location.origin };

      await auth.keycloak.login(loginConfig);

    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed' });
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
