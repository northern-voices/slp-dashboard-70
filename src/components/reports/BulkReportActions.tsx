
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Download, 
  Trash2, 
  Users, 
  FileText,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkReportActionsProps {
  selectedReports: number[];
  onSelectionChange: (reportIds: number[]) => void;
  totalReports: number;
}

const BulkReportActions = ({ selectedReports, onSelectionChange, totalReports }: BulkReportActionsProps) => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleBulkSend = async (audience: string) => {
    if (selectedReports.length === 0) {
      toast({
        title: "No Reports Selected",
        description: "Please select at least one report to send",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    console.log(`Bulk sending ${selectedReports.length} reports to ${audience}`);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Reports Sent",
        description: `${selectedReports.length} reports have been sent to ${audience}`,
      });
      setIsSending(false);
      onSelectionChange([]);
    }, 2000);
  };

  const handleBulkExport = () => {
    if (selectedReports.length === 0) {
      toast({
        title: "No Reports Selected",
        description: "Please select at least one report to export",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exporting Reports",
      description: `Preparing ${selectedReports.length} reports for download...`,
    });
  };

  const handlePackageReports = () => {
    if (selectedReports.length === 0) {
      toast({
        title: "No Reports Selected",
        description: "Please select at least one report to package",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Packaging Reports",
      description: `Creating combined package of ${selectedReports.length} reports...`,
    });
  };

  if (selectedReports.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-4 text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Select reports to enable bulk actions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedReports.length} of {totalReports} selected
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onSelectionChange([])}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear Selection
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkSend('Teachers')}
              disabled={isSending}
              className="bg-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Send to Teachers
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkSend('Administrators')}
              disabled={isSending}
              className="bg-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send to Admins
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePackageReports}
              className="bg-white"
            >
              <Package className="w-4 h-4 mr-2" />
              Package All
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBulkExport}
              className="bg-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkReportActions;
