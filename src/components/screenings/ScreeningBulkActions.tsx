
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Mail, X } from 'lucide-react';

interface ScreeningBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

const ScreeningBulkActions = ({ 
  selectedCount, 
  onBulkAction, 
  onClearSelection 
}: ScreeningBulkActionsProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} screening{selectedCount > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('export')}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('email')}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Reports
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('delete')}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningBulkActions;
