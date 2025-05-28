
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Activity, Search, Download, Filter } from 'lucide-react';

const AdminActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const mockLogs = [
    {
      id: 1,
      timestamp: '2024-11-20 14:30:25',
      user: 'Sarah Johnson',
      action: 'Login',
      details: 'Successful login from 192.168.1.100',
      severity: 'info'
    },
    {
      id: 2,
      timestamp: '2024-11-20 14:25:10',
      user: 'Emily Chen',
      action: 'User Created',
      details: 'Created new user: Michael Rodriguez',
      severity: 'info'
    },
    {
      id: 3,
      timestamp: '2024-11-20 14:20:45',
      user: 'System',
      action: 'Backup',
      details: 'Automated backup completed successfully',
      severity: 'success'
    },
    {
      id: 4,
      timestamp: '2024-11-20 14:15:30',
      user: 'Unknown',
      action: 'Failed Login',
      details: 'Failed login attempt from 203.0.113.1',
      severity: 'warning'
    },
    {
      id: 5,
      timestamp: '2024-11-20 14:10:15',
      user: 'Sarah Johnson',
      action: 'Settings Changed',
      details: 'Updated system security settings',
      severity: 'info'
    },
    {
      id: 6,
      timestamp: '2024-11-20 14:05:00',
      user: 'System',
      action: 'Error',
      details: 'Database connection timeout - retrying',
      severity: 'error'
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesUser = userFilter === 'all' || log.user === userFilter;
    
    return matchesSearch && matchesAction && matchesUser;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Activity Logs
          </CardTitle>
          <CardDescription>Monitor system activity and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                <SelectItem value="Emily Chen">Emily Chen</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.details}
                    </TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityLogs;
