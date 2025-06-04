
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Share2, 
  Mail, 
  Link, 
  Download, 
  Printer, 
  Calendar,
  Users,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportShareActionsProps {
  reportId: number;
  reportTitle: string;
  reportType: string;
  status: string;
}

const ReportShareActions = ({ reportId, reportTitle, reportType, status }: ReportShareActionsProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleQuickSend = async (audience: string) => {
    setIsSharing(true);
    console.log(`Quick sending report ${reportId} to ${audience}`);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Report Sent",
        description: `${reportTitle} has been sent to ${audience}`,
      });
      setIsSharing(false);
    }, 1000);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/reports/shared/${reportId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to clipboard",
    });
  };

  const handleScheduleSend = () => {
    toast({
      title: "Schedule Send",
      description: "Schedule send feature coming soon",
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print",
      description: "Opening print dialog...",
    });
  };

  if (status !== 'completed') {
    return (
      <Badge variant="secondary" className="text-xs">
        {status === 'pending' ? 'Processing...' : 'Failed'}
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Quick send buttons for common audiences */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleQuickSend('Teachers')}
        disabled={isSharing}
        className="h-8 text-xs"
      >
        <Users className="w-3 h-3 mr-1" />
        Teachers
      </Button>

      {/* More share options dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Share2 className="w-3 h-3 mr-1" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleQuickSend('Administrators')}>
            <Mail className="w-4 h-4 mr-2" />
            Send to Administrators
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickSend('Parents')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Send to Parents
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleShareLink}>
            <Link className="w-4 h-4 mr-2" />
            Copy Share Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleScheduleSend}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Send
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="h-8">
        <Download className="w-3 h-3 mr-1" />
        Export
      </Button>
    </div>
  );
};

export default ReportShareActions;
