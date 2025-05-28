
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserX, Mail, Trash2, ChevronDown } from 'lucide-react';

interface UsersBulkActionsProps {
  selectedCount: number;
  selectedUsers: string[];
  onBulkAction: (action: string, userIds: string[]) => void;
}

const UsersBulkActions = ({ selectedCount, selectedUsers, onBulkAction }: UsersBulkActionsProps) => {
  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
      <span className="text-sm font-medium text-blue-900">
        {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            Actions
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onBulkAction('activate', selectedUsers)}>
            <UserX className="w-4 h-4 mr-2" />
            Activate Users
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onBulkAction('deactivate', selectedUsers)}>
            <UserX className="w-4 h-4 mr-2" />
            Deactivate Users
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onBulkAction('resend-invite', selectedUsers)}>
            <Mail className="w-4 h-4 mr-2" />
            Resend Invites
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onBulkAction('delete', selectedUsers)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Users
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UsersBulkActions;
