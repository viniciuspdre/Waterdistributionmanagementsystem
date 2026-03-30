import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (name: string, email: string) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser extends User {
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
    }
  }, []);

  const register = (name: string, email: string, password: string): boolean => {
    // Verificar se o email já existe
    const users = getAllUsers();
    const emailExists = users.some((u) => u.email === email);

    if (emailExists) {
      return false;
    }

    // Criar novo usuário
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // Em produção, isso deveria ser hasheado!
      createdAt: new Date().toISOString(),
    };

    // Salvar usuário
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Fazer login automático após cadastro
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return true;
  };

  const login = (email: string, password: string): boolean => {
    const users = getAllUsers();
    const foundUser = users.find((u) => u.email === email && u.password === password);

    if (!foundUser) {
      return false;
    }

    // Remover senha do objeto de usuário
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (name: string, email: string) => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) =>
      u.email === user.email ? { ...u, name, email } : u
    );

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!user) return false;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.email === user.email);

    if (!currentUser || currentUser.password !== oldPassword) {
      return false;
    }

    const updatedUsers = users.map((u: any) =>
      u.email === user.email ? { ...u, password: newPassword } : u
    );

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, changePassword }}>
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

// Função auxiliar para obter todos os usuários
function getAllUsers(): StoredUser[] {
  const stored = localStorage.getItem('users');
  return stored ? JSON.parse(stored) : [];
}