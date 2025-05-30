import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { ScreeningFormData } from '@/types/screening';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

interface ScreeningFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student;
  formType?: 'speech' | 'hearing' | 'progress';
  title?: string;
}

const ScreeningFormModal: React.FC<ScreeningFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingStudent,
  formType,
  title,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title || "New Screening"}</DialogTitle>
        </DialogHeader>
        
        {/* Form Content - Replace with your actual form */}
        <div className="grid gap-4 py-4">
          {/* Example Form Fields - Replace with your actual form fields */}
          <div>
            <label htmlFor="studentName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Student Name
            </label>
            <input
              type="text"
              id="studentName"
              placeholder="Enter student name"
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-brand focus:text-brand focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={existingStudent ? `${existingStudent.first_name} ${existingStudent.last_name}` : ''}
              disabled={!!existingStudent}
            />
          </div>
          <div>
            <label htmlFor="screeningNotes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Screening Notes
            </label>
            <textarea
              id="screeningNotes"
              placeholder="Enter screening notes"
              className="flex h-24 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-brand focus:text-brand focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => onSubmit({ student_info: { first_name: 'test', last_name: 'test' } })}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScreeningFormModal;
