
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const { toast } = useToast();
  const { verifyEmail } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setError('Invalid verification link');
        setIsLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setIsVerified(true);
        toast({
          title: "Email verified successfully",
          description: "Your email has been verified. You can now log in.",
        });
      } catch (error) {
        setError('Failed to verify email. The link may be expired or invalid.');
        toast({
          title: "Verification failed",
          description: "Please request a new verification email.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    handleVerification();
  }, [token, verifyEmail, toast]);

  if (isLoading) {
    return (
      <AuthLayout title="Verifying Email">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email address...</p>
        </div>
      </AuthLayout>
    );
  }

  if (isVerified) {
    return (
      <AuthLayout title="Email Verified" subtitle="Your email has been successfully verified">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Email Successfully Verified
            </h3>
            <p className="text-gray-600">
              Your email address has been verified. You can now sign in to your account.
            </p>
          </div>
          
          <Link to="/auth/login">
            <Button className="w-full">
              Continue to Sign In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verification Failed" subtitle="Unable to verify your email address">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verification Failed
          </h3>
          <p className="text-gray-600 mb-4">
            {error || 'The verification link is invalid or has expired.'}
          </p>
        </div>
        
        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Request New Verification Email
          </Button>
          
          <Link to="/auth/login">
            <Button variant="ghost" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
