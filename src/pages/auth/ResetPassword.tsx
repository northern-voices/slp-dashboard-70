
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthFormField from '@/components/auth/AuthFormField';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { useAuth } from '@/contexts/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setIsLoading(true);
    try {
      await updatePassword(token, password);
      toast({
        title: "Password updated successfully",
        description: "You can now sign in with your new password.",
      });
      navigate('/auth/login');
    } catch (error) {
      toast({
        title: "Failed to update password",
        description: "The reset link may be expired. Please request a new one.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Set New Password" 
      subtitle="Choose a strong password for your account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthFormField
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          required
        />
        
        <PasswordStrengthIndicator password={password} />
        
        <AuthFormField
          label="Confirm New Password"
          type="password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          required
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
