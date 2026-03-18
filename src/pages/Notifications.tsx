
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  HandHeart, 
  AlertTriangle, 
  User, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import { Notification, NOTIFICATION_TYPE_CONFIG, NotificationType } from '@/types/notifications';
import { mockNotifications } from '@/data/mockNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'school_support':
        return HandHeart;
      case 'screening_alert':
        return AlertTriangle;
      case 'student_update':
        return User;
      case 'system_reminder':
        return Clock;
      case 'urgent':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
  const urgentNotifications = filteredNotifications.filter(n => n.priority === 'urgent');

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markSelectedAsRead = () => {
    setNotifications(prev => 
      prev.map(n => selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n)
    );
    setSelectedNotifications([]);
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const toggleSelectAll = () => {
    const currentTabNotifications = getTabNotifications(activeTab);
    const allSelected = currentTabNotifications.every(n => selectedNotifications.includes(n.id));
    
    if (allSelected) {
      setSelectedNotifications(prev => prev.filter(id => !currentTabNotifications.find(n => n.id === id)));
    } else {
      setSelectedNotifications(prev => [...new Set([...prev, ...currentTabNotifications.map(n => n.id)])]);
    }
  };

  const [activeTab, setActiveTab] = useState('all');

  const getTabNotifications = (tab: string) => {
    switch (tab) {
      case 'unread':
        return unreadNotifications;
      case 'urgent':
        return urgentNotifications;
      default:
        return filteredNotifications;
    }
  };

  const renderNotification = (notification: Notification) => {
    const Icon = getIcon(notification.type);
    const config = NOTIFICATION_TYPE_CONFIG[notification.type];
    const isSelected = selectedNotifications.includes(notification.id);

    return (
      <div
        key={notification.id}
        className={cn(
          "p-4 border border-gray-200 rounded-lg hover:bg-gray-25 transition-colors",
          !notification.isRead && "bg-blue-25 border-blue-200",
          isSelected && "ring-2 ring-blue-500"
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleNotificationSelection(notification.id)}
            className="mt-1"
          />
          
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">{notification.message}</p>
                
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{formatTimeAgo(notification.timestamp)}</span>
                  <div className={cn("w-2 h-2 rounded-full", getPriorityColor(notification.priority))} />
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="capitalize">{notification.priority} priority</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {notification.actionUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View
                  </Button>
                )}
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Header className="shrink-0" />
          
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Manage your notifications and stay updated on important activities</p>
              </div>

              {/* Controls */}
              <div className="mb-6 space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as NotificationType | 'all')}>
                      <SelectTrigger className="w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="school_support">School Support</SelectItem>
                        <SelectItem value="screening_alert">Screening Alert</SelectItem>
                        <SelectItem value="student_update">Student Update</SelectItem>
                        <SelectItem value="system_reminder">System Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'priority')}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort by Date</SelectItem>
                        <SelectItem value="priority">Sort by Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markSelectedAsRead}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deleteSelected}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <TabsList>
                    <TabsTrigger value="all">
                      All ({filteredNotifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread">
                      Unread ({unreadNotifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="urgent">
                      Urgent ({urgentNotifications.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {getTabNotifications(activeTab).every(n => selectedNotifications.includes(n.id)) ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  </div>
                </div>

                <TabsContent value="all" className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    filteredNotifications.map(renderNotification)
                  )}
                </TabsContent>

                <TabsContent value="unread" className="space-y-4">
                  {unreadNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-500">You have no unread notifications</p>
                    </div>
                  ) : (
                    unreadNotifications.map(renderNotification)
                  )}
                </TabsContent>

                <TabsContent value="urgent" className="space-y-4">
                  {urgentNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No urgent notifications</h3>
                      <p className="text-gray-500">You have no urgent notifications that require immediate attention</p>
                    </div>
                  ) : (
                    urgentNotifications.map(renderNotification)
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
