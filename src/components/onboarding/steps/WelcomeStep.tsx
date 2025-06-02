
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, GraduationCap, FileText, Users, BarChart3 } from 'lucide-react';

interface WelcomeStepProps {
  onComplete: () => void;
  userRole: string;
}

const WelcomeStep = ({ onComplete, userRole }: WelcomeStepProps) => {
  const features = [
    {
      icon: GraduationCap,
      title: 'Student Management',
      description: 'Manage student profiles and track their progress'
    },
    {
      icon: FileText,
      title: 'Screening & Reports',
      description: 'Conduct screenings and generate comprehensive reports'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'View detailed analytics and track outcomes'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Work together with your team and share insights'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Platform!</h3>
        <p className="text-gray-600">
          Your profile is now complete. Here's what you can do with your {' '}
          {userRole === 'slp' ? 'Speech-Language Pathologist' : userRole} account:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <feature.icon className="w-5 h-5 text-blue-600 mr-2" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Quick Start Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Start by exploring the dashboard to get familiar with the interface</li>
          <li>• Review your assigned schools and student lists</li>
          <li>• Check out the screening tools and report templates</li>
          <li>• Update your notification preferences anytime in settings</li>
        </ul>
      </div>

      <div className="text-center pt-4">
        <Button onClick={onComplete} size="lg" className="px-12">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
