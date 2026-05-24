import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, FirstAccessRequiredError } from '../services/authService';
import { userService } from '../services/userService';
import { UserDTO } from '../types';

interface AuthContextType {
  user: UserDTO | null;
  login: (email: string, password: string) => Promise<boolean>;
  completeFirstAccess: (
    userId: number,
    newPassword: string,
    email: string,
    userName?: string,
  ) => Promise<void>;
  logout: () => void;
  updateUser: (id: number, name: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    // Escutar eventos de logout disparados pela API
    const handleLogout = () => logout();
    document.addEventListener('auth:logout', handleLogout);

    // Recupera usuário atual do storage (mock de perfil, já que a API não possui endpoint /me)
    const currentUser = localStorage.getItem('currentUserProfile');
    const token = localStorage.getItem('hf_token');
    
    if (currentUser && token) {
      setUser(JSON.parse(currentUser));
    } else {
      logout();
    }

    return () => {
      document.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const persistSession = (token: string, profile: UserDTO) => {
    localStorage.setItem('hf_token', token);
    setUser(profile);
    localStorage.setItem('currentUserProfile', JSON.stringify(profile));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      persistSession(response.token, {
        name: email.split('@')[0],
        email,
      });
      return true;
    } catch (error) {
      if (error instanceof FirstAccessRequiredError) {
        throw error;
      }
      console.error('Login failed:', error);
      throw error;
    }
  };

  const completeFirstAccess = async (
    userId: number,
    newPassword: string,
    email: string,
    userName?: string,
  ) => {
    const response = await authService.changePassword({ userId, newPassword });
    persistSession(response.token, {
      id: userId,
      name: userName ?? email.split('@')[0],
      email,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hf_token');
    localStorage.removeItem('currentUserProfile');
  };

  const updateUser = async (id: number, name: string, email: string) => {
    try {
      if (!user) return;
      
      const updatedUser = await userService.updateUser(id, { name, email });
      setUser(updatedUser);
      localStorage.setItem('currentUserProfile', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, completeFirstAccess, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}