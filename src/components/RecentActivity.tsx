
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Screenings */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span>Recent Screenings</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentScreenings.map((screening) => (
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
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span>Upcoming Tasks</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-amber-25 rounded-xl border border-amber-100">
            <div>
              <div className="font-semibold text-gray-900 mb-1">Monthly Reports Due</div>
              <div className="text-sm text-gray-600">5 reports pending submission</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-amber-700 mb-2">Due Tomorrow</div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                Review
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-25 rounded-xl border border-blue-100">
            <div>
              <div className="font-semibold text-gray-900 mb-1">IEP Meeting Prep</div>
              <div className="text-sm text-gray-600">Emma Rodriguez - Progress review</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-700 mb-2">May 25, 2024</div>
              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Prepare
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-emerald-25 rounded-xl border border-emerald-100">
            <div>
              <div className="font-semibold text-gray-900 mb-1">Team Training</div>
              <div className="text-sm text-gray-600">New assessment protocols</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-emerald-700 mb-2">Next Week</div>
              <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
