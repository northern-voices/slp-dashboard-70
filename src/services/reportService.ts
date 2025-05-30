
import { supabaseService } from './supabaseService';
import type { Database } from '@/integrations/supabase/types';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'summary' | 'progress';
  fields: string[];
}

export interface ReportFilters {
  timeframe?: string;
  reportType?: string;
  status?: string;
  schoolId?: string;
}

// Template definitions for report generation
const reportTemplates: ReportTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard Individual Report',
    description: 'Comprehensive individual student assessment report',
    type: 'individual',
    fields: ['student_info', 'assessment_results', 'recommendations'],
  },
  {
    id: 'template-2',
    name: 'Monthly Summary Report',
    description: 'Monthly summary of all screenings and assessments',
    type: 'summary',
    fields: ['summary_stats', 'trend_analysis', 'action_items'],
  },
];

export const reportService = {
  async getReports(screeningId?: string): Promise<Report[]> {
    return await supabaseService.getReports(screeningId);
  },

  async getReport(id: string): Promise<Report | null> {
    const reports = await supabaseService.getReports();
    return reports.find(report => report.id === id) || null;
  },

  async generateReport(templateId: string, data: unknown): Promise<Report> {
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    // Create a new report based on template
    const reportData: ReportInsert = {
      screening_id: 'temp-screening-id', // This should come from the data parameter
      title: `Generated Report - ${template.name}`,
      content: 'Generated report content based on template and provided data.',
      recommendations: 'Generated recommendations based on template data and analysis.',
      follow_up_required: false,
      follow_up_date: null,
      status: 'draft' as const,
    };

    return await supabaseService.createReport(reportData);
  },

  async getTemplates(): Promise<ReportTemplate[]> {
    // Return static templates for now - these could be stored in DB later
    return reportTemplates;
  },

  async exportReport(reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<Blob> {
    // Simulate export functionality - in real implementation this would generate actual files
    await new Promise(resolve => setTimeout(resolve, 1500));
    const content = `Mock ${format.toUpperCase()} content for report ${reportId}`;
    return new Blob([content], { 
      type: format === 'pdf' ? 'application/pdf' : 
            format === 'csv' ? 'text/csv' : 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  },

  async deleteReport(id: string): Promise<void> {
    const { error } = await supabaseService.supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
