import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Student } from '@/types/database';
import { ScreeningFormData } from '@/types/screening';
import { StudentService } from '@/services/studentService';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import IndividualSpeechScreeningForm from '@/components/screening/speech/IndividualSpeechScreeningForm';
import ClassWideSpeechScreeningForm from '@/components/screening/speech/ClassWideSpeechScreeningForm';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const SpeechScreeningContent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useOrganization();
  
  const [student, setStudent] = React.useState<Student | null>(null);
  const [loading, setLoading] = React.useState(false);

  const mode = searchParams.get('mode'); // 'classwide' or null (individual)
  const isClassWide = mode === 'classwide';

  React.useEffect(() => {
    if (studentId && !isClassWide) {
      const fetchStudent = async () => {
        setLoading(true);
        try {
          const studentData = await StudentService.getStudentById(studentId);
          setStudent(studentData);
        } catch (error) {
          console.error('Failed to fetch student:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [studentId, isClassWide]);

  const handleSubmit = (screeningData: ScreeningFormData | any) => {
    console.log('Speech screening submitted:', screeningData);
    
    if (isClassWide) {
      toast({
        title: "Class-wide Speech Screening completed",
        description: `Speech screening completed for ${screeningData.students?.length || 0} students.`
      });
    } else {
      toast({
        title: "Speech Screening completed",
        description: "Speech screening has been recorded successfully."
      });
    }
    
    // Navigate back to appropriate page
    if (studentId && !isClassWide) {
      navigate(`/students/${studentId}`);
    } else {
      navigate('/screenings');
    }
  };

  const handleCancel = () => {
    if (studentId && !isClassWide) {
      navigate(`/students/${studentId}`);
    } else {
      navigate('/screenings');
    }
  };

  const handleViewDrafts = () => {
    navigate('/drafts');
  };

  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';
  const userRole = userProfile?.role || 'slp';

  if (loading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-25">
        <SidebarProvider>
          <AppSidebar userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
          <SidebarInset>
            <Header userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-25">
      <SidebarProvider>
        <AppSidebar userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
        <SidebarInset>
          <Header userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/students">Students</BreadcrumbLink>
                    </BreadcrumbItem>
                    {student && !isClassWide && (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href={`/students/${studentId}`}>
                            {student.first_name} {student.last_name}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </>
                    )}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {isClassWide ? 'Class-Wide Speech Screening' : 'Speech Screening'}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              
              {/* Title and View Drafts Button */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {isClassWide ? 'Class-Wide Speech Screening' : 'Speech Screening'}
                  </h1>
                  {student && !isClassWide ? (
                    <p className="text-gray-600">
                      Creating speech screening for {student.first_name} {student.last_name}
                    </p>
                  ) : isClassWide ? (
                    <p className="text-gray-600">
                      Creating speech screening for multiple students
                    </p>
                  ) : null}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewDrafts}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4" />
                  View Drafts
                </Button>
              </div>
            </div>

            {/* Screening Form */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                {isClassWide ? (
                  <ClassWideSpeechScreeningForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                ) : (
                  <IndividualSpeechScreeningForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    existingStudent={student}
                  />
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

const SpeechScreening = () => {
  return (
    <OrganizationProvider>
      <SpeechScreeningContent />
    </OrganizationProvider>
  );
};

export default SpeechScreening;
