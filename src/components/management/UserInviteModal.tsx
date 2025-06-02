
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail, UserPlus } from 'lucide-react';

interface UserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userData: any) => void;
}

const UserInviteModal = ({ isOpen, onClose, onInvite }: UserInviteModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'slp',
    licenseNumber: '',
    selectedSchools: [] as string[]
  });

  const mockSchools = [
    { id: '1', name: 'Lincoln Elementary School' },
    { id: '2', name: 'Washington Middle School' },
    { id: '3', name: 'Roosevelt High School' },
    { id: '4', name: 'Jefferson Elementary' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Generate invitation link (in real app, this would come from backend)
    const invitationToken = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invitationLink = `${window.location.origin}/invite/${invitationToken}`;

    onInvite({ ...formData, invitationLink });
    
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${formData.email}. They will receive an email with a link to join the organization.`
    });
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'slp',
      licenseNumber: '',
      selectedSchools: []
    });
    onClose();
  };

  const handleSchoolToggle = (schoolId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSchools: prev.selectedSchools.includes(schoolId)
        ? prev.selectedSchools.filter(id => id !== schoolId)
        : [...prev.selectedSchools, schoolId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite New User
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slp">Speech-Language Pathologist</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="Enter license number"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Assign to Schools</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {mockSchools.map((school) => (
                <div key={school.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`school-${school.id}`}
                    checked={formData.selectedSchools.includes(school.id)}
                    onCheckedChange={() => handleSchoolToggle(school.id)}
                  />
                  <Label htmlFor={`school-${school.id}`} className="text-sm font-normal">
                    {school.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserInviteModal;
