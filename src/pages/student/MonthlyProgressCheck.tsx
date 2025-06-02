
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import ProgressCheckHeader from '@/components/students/progress-check/ProgressCheckHeader';
import ProgressCheckForm from '@/components/students/progress-check/ProgressCheckForm';
import { useToast } from '@/hooks/use-toast';

const MonthlyProgressCheck = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Monthly progress check submitted:', values);
      toast({
        title: 'Progress Check Saved',
        description: 'The monthly progress check has been successfully recorded.',
      });
      navigate(`/students/${studentId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the progress check. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/students/${studentId}`);
  };

  if (!studentId) {
    return <div>Student ID not found</div>;
  }

  return (
    <OrganizationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex-1 bg-gray-25 p-4 md:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                <ProgressCheckHeader studentId={studentId} />
                <ProgressCheckForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrganizationProvider>
  );
};

export default MonthlyProgressCheck;
