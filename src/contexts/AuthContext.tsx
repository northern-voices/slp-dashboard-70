
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, organizationName: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, newPassword: string) => Promise<void>;
  acceptInvitation: (token: string, userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    if (token) {
      // Simulate loading user data
      setTimeout(() => {
        setUser({
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'slp',
          organizationId: '1',
          isEmailVerified: true,
          onboardingCompleted: true
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        role: 'slp',
        organizationId: '1',
        isEmailVerified: true,
        onboardingCompleted: true
      };
      
      localStorage.setItem('authToken', 'mock-token');
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const signup = async (email: string, password: string, organizationName: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name: '',
        role: 'admin',
        organizationId: '1',
        isEmailVerified: false,
        onboardingCompleted: false
      };
      
      localStorage.setItem('authToken', 'mock-token');
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    // Simulate email verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (user) {
      setUser({ ...user, isEmailVerified: true });
    }
  };

  const resetPassword = async (email: string) => {
    // Simulate password reset email
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const updatePassword = async (token: string, newPassword: string) => {
    // Simulate password update
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const acceptInvitation = async (token: string, userData: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '2',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organizationId: '1',
        isEmailVerified: true,
        onboardingCompleted: false
      };
      
      localStorage.setItem('authToken', 'mock-token');
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    signup,
    verifyEmail,
    resetPassword,
    updatePassword,
    acceptInvitation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
