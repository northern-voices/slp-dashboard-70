
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteScreeningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScreenings: string[];
  selectedCount: number;
  onDelete: (action: string) => void;
}

const DeleteScreeningsModal = ({ 
  isOpen, 
  onClose, 
  selectedScreenings, 
  selectedCount, 
  onDelete 
}: DeleteScreeningsModalProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const handleDelete = () => {
    console.log('Deleting screenings:', {
      selectedScreenings,
      deleteReason
    });

    // In a real implementation, this would soft delete the records
    onDelete('delete');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Screenings
          </DialogTitle>
          <DialogDescription>
            This action will delete {selectedCount} screening{selectedCount > 1 ? 's' : ''}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 mb-1">Warning</p>
                <p className="text-red-700">
                  You are about to permanently delete {selectedCount} screening record{selectedCount > 1 ? 's' : ''}. 
                  This will remove all associated data including:
                </p>
                <ul className="mt-2 text-red-700 list-disc list-inside space-y-1">
                  <li>Screening results and scores</li>
                  <li>Notes and recommendations</li>
                  <li>Associated reports and documentation</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="delete-reason" className="text-sm font-medium mb-2 block">
              Reason for Deletion (Required)
            </label>
            <select
              id="delete-reason"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="duplicate">Duplicate screening</option>
              <option value="error">Data entry error</option>
              <option value="request">Student/parent request</option>
              <option value="invalid">Invalid screening data</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmDelete}
              onCheckedChange={(checked) => setConfirmDelete(checked === true)}
            />
            <label htmlFor="confirm" className="text-sm">
              I understand this action is permanent and cannot be undone
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={!confirmDelete || !deleteReason}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedCount} Screening{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteScreeningsModal;
