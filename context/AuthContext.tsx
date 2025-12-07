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
import api from '../api/api';
import { RegisterData } from '@/types/auth';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  initializing: true,
  loading: false,
  error: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  updateUser: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Ao montar, recarrega token e user do storage (SEM chamar getMe)
  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem('@vittaaqui:token'),
          AsyncStorage.getItem('@vittaaqui:user'),
        ]);
        if (t) {
          setToken(t);
          api.defaults.headers.common.Authorization = `Bearer ${t}`;
        }
        if (u) {
          setUser(JSON.parse(u));
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // 2) signIn: ajusta header, grava token+user no storage e no estado
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token: jwt, user: userData } = await loginAPI({ email, password });
      // 2.1 Header
      api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
      // 2.2 Persistência
      await AsyncStorage.setItem('@vittaaqui:token', jwt);
      await AsyncStorage.setItem('@vittaaqui:user', JSON.stringify(userData));
      // 2.3 Estado
      setToken(jwt);
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Falha no login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 3) signUp: registra e em seguida chama signIn para simplificar
  const signUp = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      await registerAPI(data);
      await signIn(data.email, data.password);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Falha no cadastro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  // 4) signOut: limpa storage, header e estado
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        AsyncStorage.removeItem('@vittaaqui:token'),
        AsyncStorage.removeItem('@vittaaqui:user'),
      ]);
      delete api.defaults.headers.common.Authorization;
      setToken(null);
      setUser(null);
    } catch (err: any) {
      setError('Não foi possível sair');
    } finally {
      setLoading(false);
    }
  }, []);

  // 5) updateUser: atualiza dados do usuário no estado e storage
  const updateUser = useCallback(async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('@vittaaqui:user', JSON.stringify(userData));
  }, []);

  const contextValue = useMemo((): AuthContextProps => ({
    user,
    token,
    initializing,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUser,
  }), [user, token, initializing, loading, error, signIn, signUp, signOut, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

