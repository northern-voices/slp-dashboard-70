
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Table, FileImage } from 'lucide-react';

interface ExportScreeningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScreenings: string[];
  onExport: (action: string) => void;
}

const ExportScreeningsModal = ({ isOpen, onClose, selectedScreenings, onExport }: ExportScreeningsModalProps) => {
  const [format, setFormat] = useState('csv');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeResults, setIncludeResults] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);

  const handleExport = () => {
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `screenings_export_${timestamp}.${format}`;
    
    // Simulate export generation
    console.log('Exporting screenings:', {
      format,
      selectedScreenings,
      includeDetails,
      includeResults,
      includeNotes,
      filename
    });

    // In a real implementation, this would generate and download the file
    onExport('export');
    onClose();
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: Table, description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', icon: FileText, description: 'Microsoft Excel spreadsheet' },
    { value: 'pdf', label: 'PDF', icon: FileImage, description: 'Portable document format' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Screenings</DialogTitle>
          <DialogDescription>
            Export {selectedScreenings.length} selected screening{selectedScreenings.length > 1 ? 's' : ''} to a file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Export Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Include Data</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="details"
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
                <label htmlFor="details" className="text-sm">Student details and screening info</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="results"
                  checked={includeResults}
                  onCheckedChange={setIncludeResults}
                />
                <label htmlFor="results" className="text-sm">Screening results and outcomes</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notes"
                  checked={includeNotes}
                  onCheckedChange={setIncludeNotes}
                />
                <label htmlFor="notes" className="text-sm">Notes and recommendations</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportScreeningsModal;
