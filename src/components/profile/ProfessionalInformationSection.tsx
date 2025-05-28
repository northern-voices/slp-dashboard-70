
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Award, Calendar } from 'lucide-react';

const ProfessionalInformationSection = () => {
  const licenses = [
    {
      name: 'Speech-Language Pathology License',
      number: 'SLP-12345-CA',
      issuer: 'California Board of Speech-Language Pathology',
      expiration: '2025-12-31',
      status: 'active'
    },
    {
      name: 'Administrative Credential',
      number: 'ADMIN-67890-CA',
      issuer: 'California Department of Education',
      expiration: '2026-06-30',
      status: 'active'
    }
  ];

  const certifications = [
    {
      name: 'Certificate of Clinical Competence',
      organization: 'ASHA',
      earned: '2018-05-15',
      status: 'current'
    },
    {
      name: 'Autism Spectrum Disorders Certification',
      organization: 'Autism Society',
      earned: '2020-03-20',
      status: 'current'
    }
  ];

  const developmentGoals = [
    {
      title: 'Complete Advanced Assessment Training',
      progress: 75,
      target: '2024-12-31'
    },
    {
      title: 'Leadership Development Program',
      progress: 40,
      target: '2025-06-30'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'current':
        return 'bg-success/10 text-success';
      case 'expiring':
        return 'bg-warning/10 text-warning';
      case 'expired':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="w-5 h-5 mr-2" />
          Professional Information
        </CardTitle>
        <CardDescription>
          View your licenses, certifications, and professional development progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Licenses Section */}
        <div>
          <h4 className="font-semibold mb-3">Professional Licenses</h4>
          <div className="space-y-3">
            {licenses.map((license, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium">{license.name}</h5>
                    <p className="text-sm text-muted-foreground">License #{license.number}</p>
                  </div>
                  <Badge className={getStatusColor(license.status)}>
                    {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Issued by: {license.issuer}</p>
                  <p className="flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Expires: {new Date(license.expiration).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Section */}
        <div>
          <h4 className="font-semibold mb-3">Certifications</h4>
          <div className="space-y-3">
            {certifications.map((cert, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium flex items-center">
                      <Award className="w-4 h-4 mr-2 text-brand" />
                      {cert.name}
                    </h5>
                    <p className="text-sm text-muted-foreground">{cert.organization}</p>
                  </div>
                  <Badge className={getStatusColor(cert.status)}>
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earned: {new Date(cert.earned).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Development Section */}
        <div>
          <h4 className="font-semibold mb-3">Professional Development Goals</h4>
          <div className="space-y-4">
            {developmentGoals.map((goal, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{goal.title}</h5>
                  <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Target completion: {new Date(goal.target).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalInformationSection;
