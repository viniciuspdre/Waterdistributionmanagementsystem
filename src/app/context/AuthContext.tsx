import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { UserDTO } from '../types';

interface AuthContextType {
  user: UserDTO | null;
  login: (email: string, password: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('hf_token', response.token);
      
      // Salvar um perfil básico para a UI, pois a API retorna apenas o Token.
      // Em produção, leríamos os claims do JWT.
      const userProfile: UserDTO = { name: email.split('@')[0], email }; 
      setUser(userProfile);
      localStorage.setItem('currentUserProfile', JSON.stringify(userProfile));
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
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
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
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