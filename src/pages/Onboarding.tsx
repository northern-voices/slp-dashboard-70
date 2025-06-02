
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import PersonalInfoStep from '@/components/onboarding/steps/PersonalInfoStep';
import ProfessionalInfoStep from '@/components/onboarding/steps/ProfessionalInfoStep';
import PreferencesStep from '@/components/onboarding/steps/PreferencesStep';
import WelcomeStep from '@/components/onboarding/steps/WelcomeStep';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Professional Info
    licenseNumber: '',
    licenseState: '',
    yearsExperience: '',
    specializations: [],
    bio: '',
    education: '',
    
    // Preferences
    emailNotifications: true,
    smsNotifications: false,
    reportReminders: true,
    weeklyDigest: true,
    timezone: 'PST',
    language: 'en'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stepTitles = [
    'Personal Info',
    'Professional Info', 
    'Preferences',
    'Welcome'
  ];

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    }
    
    if (currentStep === 2) {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
      if (!formData.licenseState) newErrors.licenseState = 'License state is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data (simulate API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile completed successfully",
        description: "Welcome! You're all set to start using the platform.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            errors={errors}
          />
        );
      case 2:
        return (
          <ProfessionalInfoStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            errors={errors}
          />
        );
      case 3:
        return (
          <PreferencesStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <WelcomeStep
            onComplete={handleComplete}
            userRole={user?.role || 'slp'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={4}
          stepTitles={stepTitles}
        />
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
