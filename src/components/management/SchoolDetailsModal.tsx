
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2, Phone, Mail, Users, GraduationCap, Edit, UserCheck } from 'lucide-react';

interface SchoolDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: any | null;
  onEdit?: (school: any) => void;
}

const SchoolDetailsModal = ({
  isOpen,
  onClose,
  school,
  onEdit
}: SchoolDetailsModalProps) => {
  if (!school) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Mock assigned SLPs data
  const assignedSLPs = [
    { name: "Dr. Sarah Johnson", role: "SLP", email: "sarah.johnson@district.edu" },
    { name: "Ms. Emily Chen", role: "Supervisor", email: "emily.chen@district.edu" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold flex items-center">
              <Building2 className="w-6 h-6 mr-3 text-blue-600" />
              {school.name}
            </DialogTitle>
            {getStatusBadge(school.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">School Name</label>
                  <p className="text-gray-900 font-medium">{school.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(school.status)}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{school.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Principal</label>
                  <p className="text-gray-900 font-medium">{school.principal}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    (555) 123-4567
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    principal@{school.name.toLowerCase().replace(/\s+/g, '')}.edu
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{school.studentCount}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{school.slpCount}</p>
                  <p className="text-sm text-gray-600">Assigned SLPs</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">24</p>
                  <p className="text-sm text-gray-600">Active Screenings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned SLPs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Assigned SLPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignedSLPs.map((slp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{slp.name}</p>
                      <p className="text-sm text-gray-600">{slp.email}</p>
                    </div>
                    <Badge variant="outline">{slp.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit?.(school)} className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit School
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDetailsModal;
