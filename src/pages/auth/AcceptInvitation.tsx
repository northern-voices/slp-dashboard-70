
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthFormField from '@/components/auth/AuthFormField';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { useAuth } from '@/contexts/AuthContext';

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { acceptInvitation } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Simulate fetching invitation data from token
    if (token) {
      setInvitationData({
        email: 'invited.user@example.com',
        role: 'slp',
        organizationName: 'Springfield School District',
        invitedBy: 'Dr. Sarah Johnson'
      });
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!token) return;
    
    setIsLoading(true);
    try {
      await acceptInvitation(token, {
        ...formData,
        email: invitationData.email,
        role: invitationData.role
      });
      
      toast({
        title: "Account created successfully",
        description: "Welcome to the platform! Let's complete your profile.",
      });
      
      navigate('/onboarding');
    } catch (error) {
      toast({
        title: "Failed to accept invitation",
        description: "Please check the invitation link and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitationData) {
    return (
      <AuthLayout title="Loading...">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Accept Invitation" 
      subtitle={`Join ${invitationData.organizationName}`}
    >
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">You've been invited to join:</h3>
        <p className="text-blue-800">{invitationData.organizationName}</p>
        <p className="text-sm text-blue-600 mt-1">
          Role: {invitationData.role === 'slp' ? 'Speech-Language Pathologist' : invitationData.role}
        </p>
        <p className="text-sm text-blue-600">
          Invited by: {invitationData.invitedBy}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AuthFormField
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
            error={errors.firstName}
            required
          />
          
          <AuthFormField
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
            error={errors.lastName}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
            {invitationData.email}
          </div>
        </div>
        
        <AuthFormField
          label="Password"
          type="password"
          placeholder="Create a secure password"
          value={formData.password}
          onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
          error={errors.password}
          required
        />
        
        <PasswordStrengthIndicator password={formData.password} />
        
        <AuthFormField
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
          error={errors.confirmPassword}
          required
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Accept Invitation & Create Account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default AcceptInvitation;
