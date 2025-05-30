
import { Database } from '@/types/supabase';
import { supabaseService } from './supabaseService';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];

export class ReportService {
  static async getReports(): Promise<Report[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('reports')
        .select(`
          *,
          screening:screenings(
            *,
            student:students(*)
          )
        `);

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReports:', error);
      throw error;
    }
  }

  static async getReportById(id: string): Promise<Report | null> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('reports')
        .select(`
          *,
          screening:screenings(
            *,
            student:students(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching report:', error);
        throw error;
      }

      return data;
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
      const insertData: ReportInsert = {
        screening_id: reportData.screening_id,
        title: reportData.title,
        content: reportData.content,
        recommendations: reportData.recommendations || null,
        follow_up_required: reportData.follow_up_required || false,
        follow_up_date: reportData.follow_up_date || null,
        status: reportData.status || 'draft'
      };

      const { data, error } = await supabaseService.getClient()
        .from('reports')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating report:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createReport:', error);
      throw error;
    }
  }

  static async updateReport(id: string, updates: Partial<ReportInsert>): Promise<Report> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating report:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateReport:', error);
      throw error;
    }
  }

  static async deleteReport(id: string): Promise<void> {
    try {
      const { error } = await supabaseService.getClient()
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting report:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteReport:', error);
      throw error;
    }
  }
}
