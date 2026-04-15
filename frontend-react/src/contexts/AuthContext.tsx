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
      console.log("INIT_KEYCLOAK_START");
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'INIT_KEYCLOAK_SUCCESS':
      console.log("INIT_KEYCLOAK_SUCCESS");
      return {
        ...state,
        keycloak: action.payload,
        loading: false,
        error: null
      };

    case 'INIT_KEYCLOAK_FAILURE':
      console.log("INIT_KEYCLOAK_FAILURE", action);
      return {
        ...state,
        keycloak: null,
        loading: false,
        error: action.payload
      };

    case 'LOGIN_START':
      console.log("LOGIN_START");
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      console.log("LOGIN_SUCCESS", action);

      return {
        ...state,
        user: (action as any).payload.user,
        keycloak: (action as any).payload.keycloak,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case 'LOGIN_FAILURE':
      console.log("LOGIN_FAILURE", action);
        return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: (action as any).payload
      };

    case 'LOGOUT':
      console.log("LOGOUT");
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case 'CLEAR_ERROR':
      console.log("CLEAR_ERROR");
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

        if ((keycloak as any).__initialized) return;




        dispatch({ type: 'INIT_KEYCLOAK_START' });

        // const authenticated = await keycloak.init({
        //   onLoad: "check-sso",
        //   silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
        //   pkceMethod: "S256",
        //   checkLoginIframe: false,
        //   enableLogging: process.env.NODE_ENV === "development",
        //   redirectUri: window.location.origin
        // } as any);


        let authenticated;
        
        try {
          authenticated = await keycloak.init({
            onLoad: "check-sso", //"login-required",  //"check-sso",
            //pkceMethod: "S256",
            checkLoginIframe: false,
          } as any);
        } catch (error) {
          console.error("Keycloak initialization failed", error);
        }
 

        (keycloak as any).__initialized = true;

        console.log("Keycloak initialized", authenticated);
        console.log("Keycloak token", keycloak.token);

        if (authenticated && keycloak.token) {


          try {
            window.history.replaceState({}, document.title, window.location.pathname);

            const userProfile: any = await keycloak.loadUserProfile();
            //await loadUserProfile();          
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

            console.log("User loaded", user);

            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, keycloak }
            });



            // Trigger success event
            window.dispatchEvent(new CustomEvent('loginSuccess'));
          } catch (error) {

            dispatch({
              type: 'LOGIN_FAILURE',
              payload: 'Failed to load user profile'
            });
          }
        } else {
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

      // await auth.keycloak.login({
      //   redirectUri: window.location.origin
      // });

      const authenticated = await keycloak.init({
        onLoad: "check-sso",   // ✅ better here
      //  pkceMethod: "S256",
        checkLoginIframe: false,
      });

    } catch (error) {

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