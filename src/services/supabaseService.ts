import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Organization = Tables['organizations']['Row'];
type School = Tables['schools']['Row'];
type Student = Tables['students']['Row'];
type SLPProfile = Tables['slp_profiles']['Row'];
type Screening = Tables['screenings']['Row'];
type Report = Tables['reports']['Row'];
type SchoolAssignment = Tables['school_assignments']['Row'];

export class SupabaseService {
  // Organization Methods
  async getOrganizations() {
    const { data, error } = await supabase
      .from('organizations')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getCurrentUserOrganization() {
    const { data, error } = await supabase
      .from('slp_profiles')
      .select('organization:organizations(*)')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    
    if (error) throw error;
    return data.organization;
  }

  // School Methods
  async getSchools(organizationId?: string) {
    let query = supabase
      .from('schools')
      .select('*, organization:organizations(*)');
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data;
  }

  async createSchool(schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('schools')
      .insert([schoolData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSchool(id: string, updates: Partial<School>) {
    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteSchool(id: string) {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Student Methods
  async getStudents(schoolId?: string) {
    let query = supabase
      .from('students')
      .select(`
        *,
        school:schools(*, organization:organizations(*))
      `);
    
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    const { data, error } = await query.order('last_name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStudent(id: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteStudent(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // SLP Profile Methods
  async getCurrentUserProfile() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('slp_profiles')
      .select('*, organization:organizations(*)')
      .eq('user_id', user.user.id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getSLPProfiles(organizationId?: string) {
    let query = supabase
      .from('slp_profiles')
      .select('*, organization:organizations(*)');
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    
    const { data, error } = await query.order('last_name');
    
    if (error) throw error;
    return data;
  }

  async updateSLPProfile(id: string, updates: Partial<SLPProfile>) {
    const { data, error } = await supabase
      .from('slp_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Screening Methods
  async getScreenings(filters?: { studentId?: string; slpId?: string; status?: string }) {
    let query = supabase
      .from('screenings')
      .select(`
        *,
        student:students(*),
        slp:slp_profiles(*),
        reports:reports(*)
      `);
    
    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    
    if (filters?.slpId) {
      query = query.eq('slp_id', filters.slpId);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('screening_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createScreening(data: {
    student_id: string;
    slp_id: string;
    screening_date: string;
    screening_type: Database['public']['Enums']['screening_type'];
    status?: Database['public']['Enums']['screening_status'];
    notes?: string;
  }): Promise<Screening> {
    const { data: screening, error } = await supabase
      .from('screenings')
      .insert({
        ...data,
        status: data.status || 'scheduled' as Database['public']['Enums']['screening_status']
      })
      .select()
      .single();

    if (error) throw error;
    return screening;
  }

  async updateScreening(id: string, updates: Partial<Screening>) {
    const { data, error } = await supabase
      .from('screenings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Report Methods
  async getReports(screeningId?: string) {
    let query = supabase
      .from('reports')
      .select(`
        *,
        screening:screenings(*, student:students(*))
      `);
    
    if (screeningId) {
      query = query.eq('screening_id', screeningId);
    }
    
    const { data, error } = await query.order('generated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createReport(reportData: Omit<Report, 'id' | 'generated_at'>) {
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateReport(id: string, updates: Partial<Report>) {
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // School Assignment Methods
  async getSchoolAssignments(slpProfileId?: string) {
    let query = supabase
      .from('school_assignments')
      .select(`
        *,
        slp_profile:slp_profiles(*),
        school:schools(*)
      `);
    
    if (slpProfileId) {
      query = query.eq('slp_profile_id', slpProfileId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  async createSchoolAssignment(assignment: {
    slp_profile_id: string;
    school_id: string;
  }) {
    const { data, error } = await supabase
      .from('school_assignments')
      .insert([assignment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteSchoolAssignment(id: string) {
    const { error } = await supabase
      .from('school_assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Activity Logging
  async logActivity(activity: {
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: any;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        user_id: user.user.id,
        ...activity
      }]);
    
    if (error) console.error('Failed to log activity:', error);
  }

  // Dashboard Stats
  async getDashboardStats() {
    const currentUserProfile = await this.getCurrentUserProfile();
    const organizationId = currentUserProfile.organization_id;

    // Get counts for dashboard
    const [
      studentsCount,
      screeningsCount,
      reportsCount,
      schoolsCount
    ] = await Promise.all([
      supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('active', true),
      supabase
        .from('screenings')
        .select('id', { count: 'exact' }),
      supabase
        .from('reports')
        .select('id', { count: 'exact' }),
      supabase
        .from('schools')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
    ]);

    return {
      totalStudents: studentsCount.count || 0,
      totalScreenings: screeningsCount.count || 0,
      totalReports: reportsCount.count || 0,
      totalSchools: schoolsCount.count || 0
    };
  }
}

export const supabaseService = new SupabaseService();
