
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SLP Screening Platform
          </h1>
          {title && (
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 SLP Screening Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
