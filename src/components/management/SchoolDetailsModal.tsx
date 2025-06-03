
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, User, Phone, AtSign, MapPin, CalendarDays, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useManagement } from '@/hooks/useManagement';

interface SchoolDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: any;
  onEdit: (school: any) => void;
}

const SchoolDetailsModal = ({ isOpen, onClose, school, onEdit }: SchoolDetailsModalProps) => {
  const { getGradeLabel } = useManagement();
  
  if (!school) return null;

  const infoItems = [
    { icon: Building2, label: "School Name", value: school.name },
    { icon: User, label: "Principal", value: school.principal || "N/A" },
    { icon: AtSign, label: "Principal Email", value: school.principalEmail || "N/A" },
    { icon: Phone, label: "Phone", value: school.phone || "N/A" },
    { icon: MapPin, label: "Address", value: school.address || "N/A" },
    { icon: Building2, label: "District", value: school.district || "N/A" }
  ];

  const sortedGrades = [...(school.grades || [])].sort((a, b) => {
    // Custom sort logic for school grades
    if (a === 'PreK') return -1;
    if (b === 'PreK') return 1;
    if (a === 'K') return b === 'PreK' ? 1 : -1;
    if (b === 'K') return a === 'PreK' ? 1 : -1;
    return parseInt(a) - parseInt(b);
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            School Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid gap-4">
            {infoItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-md">
                  <item.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-base">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-3">
              <div className="bg-gray-100 p-2 rounded-md">
                <GraduationCap className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Available Grades</p>
                {sortedGrades.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {sortedGrades.map(grade => (
                      <Badge key={grade} variant="secondary">
                        {getGradeLabel(grade)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-base">No grades specified</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Notes</p>
            <p className="text-sm p-3 bg-gray-50 rounded-md min-h-[80px]">
              {school.notes || "No additional notes."}
            </p>
          </div>
          
          <Card className="bg-gray-50 p-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-xl font-bold">{school.studentCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">SLPs</p>
              <p className="text-xl font-bold">{school.slpCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="mt-1">
                {school.status === 'active' ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </div>
          </Card>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit(school)}>
              Edit School
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDetailsModal;
