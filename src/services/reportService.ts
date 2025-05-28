
import { Report } from '@/types/database';
import { apiClient } from './api';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'summary' | 'progress';
  fields: string[];
}

// Mock data for reports - fixed to match Report interface
const mockReports: Report[] = [
  {
    id: '1',
    screening_id: 'screening-1',
    title: 'Monthly Screening Summary - November 2024',
    content: 'Comprehensive screening results for all students',
    recommendations: 'Continue monitoring progress',
    follow_up_required: true,
    follow_up_date: '2024-12-15',
    generated_at: '2024-11-01T00:00:00Z',
    status: 'final',
  },
  {
    id: '2',
    screening_id: 'screening-2',
    title: 'Individual Report - Emma Thompson',
    content: 'Speech screening assessment results',
    recommendations: 'No immediate follow-up required',
    follow_up_required: false,
    generated_at: '2024-11-15T00:00:00Z',
    status: 'final',
  },
  {
    id: '3',
    screening_id: 'screening-3',
    title: 'Progress Report - Math Johnson',
    content: '6-month progress evaluation',
    recommendations: 'Schedule follow-up in 3 months',
    follow_up_required: true,
    follow_up_date: '2025-02-20',
    generated_at: '2024-11-20T00:00:00Z',
    status: 'draft',
  },
];

const mockTemplates: ReportTemplate[] = [
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
  async getReports(): Promise<Report[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockReports;
  },

  async getReport(id: string): Promise<Report | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockReports.find(report => report.id === id) || null;
  },

  async generateReport(templateId: string, data: unknown): Promise<Report> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation time
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    const newReport: Report = {
      id: `report-${Date.now()}`,
      screening_id: 'screening-new',
      title: `Generated Report - ${template.name}`,
      content: 'Generated report content based on template',
      recommendations: 'Generated recommendations based on template data',
      follow_up_required: false,
      generated_at: new Date().toISOString(),
      status: 'draft',
    };

    mockReports.push(newReport);
    return newReport;
  },

  async getTemplates(): Promise<ReportTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTemplates;
  },

  async exportReport(reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Mock file generation
    const content = `Mock ${format.toUpperCase()} content for report ${reportId}`;
    return new Blob([content], { 
      type: format === 'pdf' ? 'application/pdf' : 
            format === 'csv' ? 'text/csv' : 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  },
};
