import { ReactNode, createContext, useContext, useState } from 'react';

export interface AuthState {
  name: string | undefined;
  isAuthenticated: boolean;
}

const defaultAuthState: AuthState = {
  name: undefined,
  isAuthenticated: false
}

export type AuthContextType = {
  authState: AuthState
  onAuthenticateFn: (username: string, password: string) => Promise<void>;
  onRevokeAuthFn: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  authState: defaultAuthState,
  onAuthenticateFn: async () => {},
  onRevokeAuthFn: async () => {}
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext);
export const useAuthState = () => useContext(AuthContext);

type Props = {
  children: ReactNode;
}

const AuthContextProvider: React.FC<Props> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  const onAuthenticateFn = async (username: string, password: string) => { 
    const url = `/api/signin`;
    try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const {name} = await res.json();

        setAuthState({name, isAuthenticated: true})
      } catch (error: unknown) {
        console.error(error);
      }
  }

  const onRevokeAuthFn = async () => {
    const url = `/api/signout`;
    try {
        const res = await fetch(url, {
          method: 'POST'
        });
        
        setAuthState(defaultAuthState)
      } catch (error: unknown) {
        console.error(error);
    }
  }

  return <AuthContext.Provider value={{ authState, onAuthenticateFn, onRevokeAuthFn }}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;