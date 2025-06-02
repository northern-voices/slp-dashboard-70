
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import UsersTable from './UsersTable';

interface UsersTabContentProps {
  mockSLPs: any[];
  onInviteUser: () => void;
  onEditUser: (user: any) => void;
  onDeactivateUser: (userId: string) => void;
  onResendInvite: (userId: string) => void;
}

const UsersTabContent = ({
  mockSLPs,
  onInviteUser,
  onEditUser,
  onDeactivateUser,
  onResendInvite
}: UsersTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={onInviteUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <UsersTable 
        users={mockSLPs}
        onEditUser={onEditUser}
        onDeactivateUser={onDeactivateUser}
        onResendInvite={onResendInvite}
      />
    </div>
  );
};

export default UsersTabContent;
