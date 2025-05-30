
import { Database } from '@/types/supabase';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];

// Mock data for demonstration
const mockReports: Report[] = [];

export class ReportService {
  static async getReports(): Promise<Report[]> {
    try {
      console.log('Fetching reports (mock data)');
      return mockReports;
    } catch (error) {
      console.error('Error in getReports:', error);
      throw error;
    }
  }

  static async getReportById(id: string): Promise<Report | null> {
    try {
      const report = mockReports.find(r => r.id === id);
      console.log('Report fetched by ID (mock):', report);
      return report || null;
    } catch (error) {
      console.error('Error in getReportById:', error);
      throw error;
    }
  }

  static async createReport(reportData: {
    screening_id: string;
    title: string;
    content: string;
    recommendations?: string;
    follow_up_required?: boolean;
    follow_up_date?: string;
    status?: 'draft' | 'final' | 'reviewed';
  }): Promise<Report> {
    try {
      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        screening_id: reportData.screening_id,
        title: reportData.title,
        content: reportData.content,
        recommendations: reportData.recommendations || null,
        follow_up_required: reportData.follow_up_required || false,
        follow_up_date: reportData.follow_up_date || null,
        status: reportData.status || 'draft',
        generated_at: new Date().toISOString()
      };

      mockReports.push(newReport);
      console.log('Report created (mock):', newReport);
      return newReport;
    } catch (error) {
      console.error('Error in createReport:', error);
      throw error;
    }
  }

  static async updateReport(id: string, updates: Partial<ReportInsert>): Promise<Report> {
    try {
      const reportIndex = mockReports.findIndex(r => r.id === id);
      if (reportIndex === -1) {
        throw new Error('Report not found');
      }

      const updatedReport = {
        ...mockReports[reportIndex],
        ...updates
      };

      mockReports[reportIndex] = updatedReport;
      console.log('Report updated (mock):', updatedReport);
      return updatedReport;
    } catch (error) {
      console.error('Error in updateReport:', error);
      throw error;
    }
  }

  static async deleteReport(id: string): Promise<void> {
    try {
      const reportIndex = mockReports.findIndex(r => r.id === id);
      if (reportIndex !== -1) {
        mockReports.splice(reportIndex, 1);
        console.log('Report deleted (mock):', id);
      }
    } catch (error) {
      console.error('Error in deleteReport:', error);
      throw error;
    }
  }
}
