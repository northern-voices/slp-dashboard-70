
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';

const RecentActivity = () => {
  const recentScreenings = [
    {
      id: 1,
      studentName: 'Emma Rodriguez',
      screeningType: 'Speech',
      date: '2024-05-23',
      status: 'completed',
      grade: '3rd Grade'
    },
    {
      id: 2,
      studentName: 'Michael Chen',
      screeningType: 'Hearing',
      date: '2024-05-23',
      status: 'pending',
      grade: '1st Grade'
    },
    {
      id: 3,
      studentName: 'Sophia Williams',
      screeningType: 'Progress',
      date: '2024-05-22',
      status: 'completed',
      grade: '4th Grade'
    },
    {
      id: 4,
      studentName: 'James Johnson',
      screeningType: 'Speech',
      date: '2024-05-22',
      status: 'in_progress',
      grade: '2nd Grade'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending Review';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Screenings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Recent Screenings</span>
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentScreenings.map((screening) => (
            <div key={screening.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{screening.studentName}</div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>{screening.screeningType}</span>
                    <span>•</span>
                    <span>{screening.grade}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(screening.status)}>
                  {getStatusText(screening.status)}
                </Badge>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {screening.date}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Upcoming Tasks</span>
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <div className="font-medium text-gray-900">Monthly Reports Due</div>
              <div className="text-sm text-gray-600">5 reports pending submission</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-yellow-700">Due Tomorrow</div>
              <Button size="sm" className="mt-1">
                Review
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <div className="font-medium text-gray-900">IEP Meeting Prep</div>
              <div className="text-sm text-gray-600">Emma Rodriguez - Progress review</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-700">May 25, 2024</div>
              <Button size="sm" variant="outline" className="mt-1">
                Prepare
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="font-medium text-gray-900">Team Training</div>
              <div className="text-sm text-gray-600">New assessment protocols</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-700">Next Week</div>
              <Button size="sm" variant="outline" className="mt-1">
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;
