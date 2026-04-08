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
  console.log('AuthReducer: Action received:', action.type, 'payload' in action ? action.payload : 'no payload');
  
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
      debugger
      console.log('AuthReducer: LOGIN_SUCCESS action - setting isAuthenticated to true');
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

  console.log('AuthProvider: Initial auth state:', auth);

  // Initialize Keycloak
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        // Prevent multiple initializations
        // if (keycloak.authenticated !== undefined) {
        //   console.log(keycloak.authenticated)
        //   console.log('AuthProvider: Keycloak already initialized, skipping...');
        //   return;
        // }


        if ((keycloak as any).__initialized) return;



        console.log('AuthProvider: Starting Keycloak initialization...');
        dispatch({ type: 'INIT_KEYCLOAK_START' });
        
        // const authenticated = await keycloak.init({
        //   onLoad: "check-sso",
        //   silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
        //   pkceMethod: "S256",
        //   checkLoginIframe: false,
        //   enableLogging: process.env.NODE_ENV === "development",
        //   redirectUri: window.location.origin
        // } as any);

        const authenticated = await keycloak.init({
  onLoad: "check-sso",
  pkceMethod: "S256",
  checkLoginIframe: false,
} as any);

(keycloak as any).__initialized = true;

        console.log('AuthProvider: Keycloak init result:', { authenticated, hasToken: !!keycloak.token });

        if (authenticated && keycloak.token) {
          console.log('AuthContext: User authenticated, setting up user profile');
          
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
              familyName: userProfile.lastName
            };

            console.log('AuthContext: User profile created:', user);

            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user, keycloak } 
            });
          
            console.log('AuthContext: Dispatched LOGIN_SUCCESS, new auth state should have isAuthenticated: true');
          
            // Trigger success event
            window.dispatchEvent(new CustomEvent('loginSuccess'));
          } catch (error) {
            console.error('AuthContext: Error loading user profile:', error);
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
      console.log("Token refreshed");
    } else {
      console.log("Token still valid");
    }
  } catch (err) {
    console.error("Refresh failed", err);
    dispatch({ type: "LOGOUT" });
  }
};

        // Set up auth event listeners
        keycloak.onAuthSuccess = () => {
          console.log('Auth successful');
        };

        keycloak.onAuthError = (error) => {
          console.error('Auth error:', error);
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Authentication failed' });
        };

        keycloak.onAuthLogout = () => {
          console.log('Auth logout');
          dispatch({ type: 'LOGOUT' });
        };

      } catch (error) {
        console.error('Keycloak initialization error:', error);
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
        redirectUri: window.location.origin
      });
      
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
        console.error('Logout error:', error);
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
