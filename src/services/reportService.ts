
import { Report } from '@/types/database';
import { BaseApiService } from './baseApiService';

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

// Mock data for reports - fixed to match Report interface
const mockReports: Report[] = [
  {
    id: '1',
    screening_id: 'screening-1',
    title: 'Monthly Screening Summary - November 2024',
    content: 'Comprehensive screening results for all students screened during November. This report includes statistical analysis of screening outcomes, identification rates, and follow-up recommendations.',
    recommendations: 'Continue monitoring progress for identified students',
    follow_up_required: true,
    follow_up_date: '2024-12-15',
    generated_at: '2024-11-01T00:00:00Z',
    status: 'final',
  },
  {
    id: '2',
    screening_id: 'screening-2',
    title: 'Individual Report - Emma Thompson',
    content: 'Speech and language screening assessment results for Emma Thompson, Grade 8. Assessment completed on November 15, 2024.',
    recommendations: 'No immediate follow-up required. Continue regular monitoring.',
    follow_up_required: false,
    generated_at: '2024-11-15T00:00:00Z',
    status: 'final',
  },
  {
    id: '3',
    screening_id: 'screening-3',
    title: 'Progress Report - Math Johnson',
    content: '6-month progress evaluation for Math Johnson showing improvement in articulation and language comprehension skills.',
    recommendations: 'Schedule follow-up assessment in 3 months to continue tracking progress.',
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

class ReportService extends BaseApiService {
  async getReports(filters?: ReportFilters): Promise<Report[]> {
    try {
      // In a real implementation, this would make an API call with filters
      // return await this.get<Report[]>('/reports', { headers: { ...filters } });
      
      // For now, simulate API delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockReports;
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  }

  async getReport(id: string): Promise<Report | null> {
    try {
      // return await this.get<Report>(`/reports/${id}`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockReports.find(report => report.id === id) || null;
    } catch (error) {
      console.error(`Failed to fetch report ${id}:`, error);
      throw error;
    }
  }

  async generateReport(templateId: string, data: unknown): Promise<Report> {
    try {
      // return await this.post<Report>('/reports/generate', { templateId, data });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      const template = mockTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template with id ${templateId} not found`);
      }

      const newReport: Report = {
        id: `report-${Date.now()}`,
        screening_id: 'screening-new',
        title: `Generated Report - ${template.name}`,
        content: 'Generated report content based on template and provided data.',
        recommendations: 'Generated recommendations based on template data and analysis.',
        follow_up_required: false,
        generated_at: new Date().toISOString(),
        status: 'draft',
      };

      mockReports.push(newReport);
      return newReport;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  async getTemplates(): Promise<ReportTemplate[]> {
    try {
      // return await this.get<ReportTemplate[]>('/reports/templates');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockTemplates;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  }

  async exportReport(reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<Blob> {
    try {
      // return await this.get<Blob>(`/reports/${reportId}/export?format=${format}`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      const content = `Mock ${format.toUpperCase()} content for report ${reportId}`;
      return new Blob([content], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'csv' ? 'text/csv' : 
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } catch (error) {
      console.error(`Failed to export report ${reportId}:`, error);
      throw error;
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      // await this.delete(`/reports/${id}`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockReports.findIndex(report => report.id === id);
      if (index !== -1) {
        mockReports.splice(index, 1);
      }
    } catch (error) {
      console.error(`Failed to delete report ${id}:`, error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
