
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';
import { useOrganization } from '@/contexts/OrganizationContext';

interface RecentScreeningData {
  id: string;
  studentName: string;
  screeningType: string;
  date: string;
  status: string;
  grade: string;
}

const RecentActivity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, isLoading: contextLoading } = useOrganization();
  const [recentScreenings, setRecentScreenings] = useState<RecentScreeningData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentScreenings = async () => {
      try {
        setIsLoading(true);
        const screenings = await supabaseService.getScreenings();
        
        // Transform screenings data for display
        const transformedScreenings = screenings.slice(0, 4).map(screening => ({
          id: screening.id,
          studentName: screening.student ? `${screening.student.first_name} ${screening.student.last_name}` : 'Unknown Student',
          screeningType: screening.screening_type.charAt(0).toUpperCase() + screening.screening_type.slice(1),
          date: new Date(screening.screening_date).toLocaleDateString(),
          status: screening.status,
          grade: screening.student?.grade || 'N/A'
        }));

        setRecentScreenings(transformedScreenings);
      } catch (error) {
        console.error('Error fetching recent screenings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!contextLoading && userProfile) {
      fetchRecentScreenings();
    }
  }, [contextLoading, userProfile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'scheduled':
        return 'Scheduled';
      case 'in_progress':
        return 'In Progress';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleViewAllScreenings = () => {
    navigate('/students');
    toast({
      title: "Navigating to Students",
      description: "View all student screenings and records",
    });
  };

  if (isLoading || contextLoading) {
    return (
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span>Recent Screenings</span>
          </CardTitle>
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-25 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 justify-start">
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span>Recent Screenings</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-900"
            onClick={handleViewAllScreenings}
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentScreenings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent screenings found</p>
              <p className="text-sm text-gray-400">Screenings will appear here as they are created</p>
            </div>
          ) : (
            recentScreenings.map(screening => (
              <div key={screening.id} className="flex items-center justify-between p-4 bg-gray-25 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{screening.studentName}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span className="font-medium">{screening.screeningType}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{screening.grade}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getStatusColor(screening.status)} font-medium border`}>
                    {getStatusText(screening.status)}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-2 flex items-center justify-end">
                    <Calendar className="w-3 h-3 mr-1" />
                    {screening.date}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;
