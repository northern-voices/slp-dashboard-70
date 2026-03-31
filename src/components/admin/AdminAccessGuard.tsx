
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface AdminAccessGuardProps {
  children: React.ReactNode;
  userRole: string;
}

const AdminAccessGuard = ({ children, userRole }: AdminAccessGuardProps) => {
  if (userRole !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin Access Required</h1>
        <p className="text-gray-600">You need administrator privileges to access this panel.</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminAccessGuard;
