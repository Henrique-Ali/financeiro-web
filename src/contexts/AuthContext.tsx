import React, { useState } from 'react';
import type { User } from '../types';
import { AuthContext } from './AuthContextObject';

const EXPIRATION_TIME = 12 * 60 * 60 * 1000; // 12 horas em milissegundos

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Recupera o usuário do LocalStorage ao iniciar e valida o tempo
  React.useEffect(() => {
    const savedData = localStorage.getItem('financeiro_session');
    if (savedData) {
      try {
        const { user: savedUser, timestamp } = JSON.parse(savedData);
        const now = Date.now();

        if (now - timestamp < EXPIRATION_TIME) {
          setUser(savedUser);
          setIsAuthenticated(true);
        } else {
          // Sessão expirada
          localStorage.removeItem('financeiro_session');
        }
      } catch (error) {
        console.error('Erro ao carregar sessão do LocalStorage', error);
        localStorage.removeItem('financeiro_session');
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await fetch('https://z6ogy2t70b.execute-api.sa-east-1.amazonaws.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: identifier,
          senha_hash: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Usuário ou senha incorretos');
      }

      const authenticatedUser: User = {
        id: data.id,
        name: data.nome,
        email: data.email || identifier,
        token: data.token
      };

      setUser(authenticatedUser);
      setIsAuthenticated(true);
      
      // Salva usuário e timestamp atual
      localStorage.setItem('financeiro_session', JSON.stringify({
        user: authenticatedUser,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('https://z6ogy2t70b.execute-api.sa-east-1.amazonaws.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: name,
          email: email,
          senha_hash: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      const authenticatedUser: User = {
        id: data.id,
        name: data.nome,
        email: email,
        token: data.token
      };

      setUser(authenticatedUser);
      setIsAuthenticated(true);
      
      // Salva usuário e timestamp atual
      localStorage.setItem('financeiro_session', JSON.stringify({
        user: authenticatedUser,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('financeiro_session');
  };

  if (!isInitialized) {
    return null; // Evita redirecionamento indevido enquanto carrega a sessão
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
