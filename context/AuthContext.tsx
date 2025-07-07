import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { login as loginAPI, register as registerAPI } from '../api/auth';
import { getMe } from '../api/user';
import { RegisterData } from '@/types/auth';
import api from '@/api/api';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  initializing: true,
  loading: false,
  error: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { }
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Carrega token + user uma única vez
  useEffect(() => {
    (async () => {
      try {
        const storagedToken = await AsyncStorage.getItem('@vittaaqui:token');
        if (storagedToken) {
          setToken(storagedToken);
          const userData = await getMe();
          setUser(userData);
        }
      } catch {
        await AsyncStorage.removeItem('@vittaaqui:token');
        setToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // 3. Sincroniza header Authorization do axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // 4. Funções estáveis com useCallback
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token: jwt, user: userData } = await loginAPI({ email, password });
      await AsyncStorage.setItem('@vittaaqui:token', jwt);
      setToken(jwt);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Falha no login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const { token: jwt, user: userData } = await registerAPI(data);
      await AsyncStorage.setItem('@vittaaqui:token', jwt);
      setToken(jwt);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Falha no cadastro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await AsyncStorage.removeItem('@vittaaqui:token');
      setUser(null);
      setToken(null);
    } catch (err: any) {
      setError('Não foi possível sair');
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. (cont.) Memoiza todo o objeto de contexto
  const contextValue = useMemo(() => ({
    user,
    token,
    initializing,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }), [user, token, initializing, loading, error, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

