
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Calendar, MapPin, Monitor } from 'lucide-react';

const ActivitySecuritySection = () => {
  const recentActivity = [
    {
      type: 'login',
      description: 'Logged in successfully',
      timestamp: '2024-11-20T10:30:00Z',
      location: 'San Francisco, CA',
      device: 'Chrome on Windows',
      status: 'success'
    },
    {
      type: 'profile_update',
      description: 'Updated notification preferences',
      timestamp: '2024-11-19T14:22:00Z',
      location: 'San Francisco, CA',
      device: 'Chrome on Windows',
      status: 'success'
    },
    {
      type: 'password_change',
      description: 'Password changed successfully',
      timestamp: '2024-11-18T09:15:00Z',
      location: 'San Francisco, CA',
      device: 'Safari on iPhone',
      status: 'success'
    },
    {
      type: 'failed_login',
      description: 'Failed login attempt',
      timestamp: '2024-11-17T22:45:00Z',
      location: 'Unknown',
      device: 'Unknown',
      status: 'warning'
    },
    {
      type: 'report_generated',
      description: 'Generated monthly student report',
      timestamp: '2024-11-16T16:00:00Z',
      location: 'San Francisco, CA',
      device: 'Chrome on Windows',
      status: 'info'
    }
  ];

  const securityEvents = [
    {
      type: 'login_success',
      description: 'Successful login from new device',
      timestamp: '2024-11-20T10:30:00Z',
      severity: 'low'
    },
    {
      type: 'password_change',
      description: 'Password changed',
      timestamp: '2024-11-18T09:15:00Z',
      severity: 'medium'
    },
    {
      type: 'failed_login',
      description: 'Multiple failed login attempts',
      timestamp: '2024-11-17T22:45:00Z',
      severity: 'high'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'failed_login':
        return <Shield className="w-4 h-4" />;
      case 'profile_update':
      case 'password_change':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      case 'info':
        return 'bg-info/10 text-info';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-success/10 text-success';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'high':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your recent actions and system interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-md">
                <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.description}</p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    <p className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatTimestamp(activity.timestamp)}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {activity.location}
                    </p>
                    <p className="flex items-center">
                      <Monitor className="w-3 h-3 mr-1" />
                      {activity.device}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Events
          </CardTitle>
          <CardDescription>
            Important security-related activities on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-md">
                <div className={`p-1 rounded-full ${getSeverityColor(event.severity)}`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{event.description}</p>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitySecuritySection;
