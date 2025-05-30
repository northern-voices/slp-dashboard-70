import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, BarChart3, User, TrendingUp, Download, X, Loader2 } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { reportService } from '@/services/reportService';
import { useToast } from '@/hooks/use-toast';
import { Report } from '@/types/database';
interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const GenerateReportModal = ({
  isOpen,
  onClose
}: GenerateReportModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('last_30_days');
  const {
    execute: generateReport,
    loading: isGenerating
  } = useAsync();
  const {
    toast
  } = useToast();
  const reportTemplates = [{
    id: 'template-1',
    name: 'Standard Individual Report',
    description: 'Comprehensive individual student assessment report',
    icon: User,
    type: 'individual'
  }, {
    id: 'template-2',
    name: 'Monthly Summary Report',
    description: 'Monthly summary of all screenings and assessments',
    icon: BarChart3,
    type: 'summary'
  }, {
    id: 'template-3',
    name: 'Progress Report',
    description: 'Track student progress over time',
    icon: TrendingUp,
    type: 'progress'
  }];
  const mockSchools = ['Lincoln Elementary', 'Washington Middle School', 'Roosevelt High School', 'Jefferson Academy'];
  const gradeOptions = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'];
  const toggleSelection = (array: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const newArray = array.includes(item) ? array.filter(i => i !== item) : [...array, item];
    setter(newArray);
  };
  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a report template to continue.",
        variant: "destructive"
      });
      return;
    }
    try {
      const reportData = {
        schools: selectedSchools,
        grades: selectedGrades,
        dateRange,
        title: reportTitle,
        description: reportDescription
      };
      const report = (await generateReport(() => reportService.generateReport(selectedTemplate, reportData))) as Report;
      if (outputFormat !== 'preview') {
        const blob = await reportService.exportReport(report.id, outputFormat as 'pdf' | 'csv' | 'xlsx');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTitle || 'report'}.${outputFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast({
        title: "Report Generated Successfully",
        description: `Your ${reportTemplates.find(t => t.id === selectedTemplate)?.name} has been generated and ${outputFormat === 'preview' ? 'is ready for preview' : 'downloaded'}.`
      });
      onClose();
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generate Report</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Create and download reports instantly with your selected parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Report Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportTemplates.map(template => <Card key={template.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`} onClick={() => setSelectedTemplate(template.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <template.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-gray-900 text-sm font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </CardContent>
          </Card>

          {/* Report Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportTitle">Report Title</Label>
                <Input id="reportTitle" placeholder="e.g., November Screening Summary" value={reportTitle} onChange={e => setReportTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDescription">Description (Optional)</Label>
                <Textarea id="reportDescription" placeholder="Brief description of this report..." value={reportDescription} onChange={e => setReportDescription(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="current_year">Current Year</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outputFormat">Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="xlsx">Excel Workbook</SelectItem>
                    <SelectItem value="preview">Preview Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {/* Schools Filter */}
              <div className="space-y-2">
                <Label>Schools (Optional)</Label>
                <div className="space-y-2">
                  {mockSchools.slice(0, 4).map(school => <label key={school} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedSchools.includes(school)} onChange={() => toggleSelection(selectedSchools, school, setSelectedSchools)} className="rounded" />
                      <span>{school}</span>
                    </label>)}
                </div>
                {selectedSchools.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSchools.map(school => <Badge key={school} variant="secondary" className="text-xs">
                        {school}
                        <button onClick={() => toggleSelection(selectedSchools, school, setSelectedSchools)} className="ml-1 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>)}
                  </div>}
              </div>

              {/* Grades Filter */}
              <div className="space-y-2">
                <Label>Grade Levels (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {gradeOptions.map(grade => <label key={grade} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedGrades.includes(grade)} onChange={() => toggleSelection(selectedGrades, grade, setSelectedGrades)} className="rounded" />
                      <span>{grade}</span>
                    </label>)}
                </div>
                {selectedGrades.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                    {selectedGrades.slice(0, 3).map(grade => <Badge key={grade} variant="secondary" className="text-xs">
                        {grade}
                      </Badge>)}
                    {selectedGrades.length > 3 && <Badge variant="secondary" className="text-xs">
                        +{selectedGrades.length - 3} more
                      </Badge>}
                  </div>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating || !selectedTemplate}>
              {isGenerating ? <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </> : <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default GenerateReportModal;