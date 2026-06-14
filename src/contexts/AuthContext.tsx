import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from '@/api/client';
import { authApi, type LoginInput, type RegisterInput } from '@/api/auth.api';
import type { User } from '@/types/api.types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    navigate('/auth/login');
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }

    const me = await authApi.getMe();
    setUser(me);
    setToken(currentToken);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
      navigate('/auth/login');
    });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await authApi.getMe();
        if (!cancelled) {
          setUser(me);
          setToken(storedToken);
        }
      } catch {
        clearStoredToken();
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const result = await authApi.login(input);
    setStoredToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authApi.register(input);
    setStoredToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
