
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type ScreeningStatus = Database['public']['Enums']['screening_status'];

class SupabaseService {
  private static instance: SupabaseService;
  private supabase;

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient() {
    return this.supabase;
  }

  // Organization methods
  public async getOrganizations() {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  public async getOrganizationBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  }

  // School methods
  public async getSchoolsByOrganization(organizationId: string) {
    const { data, error } = await this.supabase
      .from('schools')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    return data;
  }

  public async getSchoolById(schoolId: string) {
    const { data, error } = await this.supabase
      .from('schools')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', schoolId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Student methods
  public async getStudentsBySchool(schoolId: string) {
    const { data, error } = await this.supabase
      .from('students')
      .select(`
        *,
        school:schools(*)
      `)
      .eq('school_id', schoolId)
      .eq('active', true)
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  public async getStudentById(studentId: string) {
    const { data, error } = await this.supabase
      .from('students')
      .select(`
        *,
        school:schools(
          *,
          organization:organizations(*)
        )
      `)
      .eq('id', studentId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Screening methods
  public async getScreeningsByStudent(studentId: string) {
    const { data, error } = await this.supabase
      .from('screenings')
      .select(`
        *,
        student:students(*),
        reports:reports(*)
      `)
      .eq('student_id', studentId)
      .order('screening_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  public async getScreeningById(screeningId: string) {
    const { data, error } = await this.supabase
      .from('screenings')
      .select(`
        *,
        student:students(*),
        reports:reports(*)
      `)
      .eq('id', screeningId)
      .single();
    
    if (error) throw error;
    return data;
  }

  public async createScreening(screeningData: {
    student_id: string;
    slp_id: string;
    screening_date: string;
    screening_type: 'initial' | 'follow_up' | 'annual' | 'referral';
    status?: ScreeningStatus;
    notes?: string;
  }) {
    const { data, error } = await this.supabase
      .from('screenings')
      .insert({
        ...screeningData,
        status: (screeningData.status as ScreeningStatus) || 'scheduled'
      })
      .select(`
        *,
        student:students(*),
        reports:reports(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  public async updateScreeningStatus(screeningId: string, status: string) {
    const { data, error } = await this.supabase
      .from('screenings')
      .update({ status: status as ScreeningStatus })
      .eq('id', screeningId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Report methods
  public async getReportsByScreening(screeningId: string) {
    const { data, error } = await this.supabase
      .from('reports')
      .select(`
        *,
        screening:screenings(
          *,
          student:students(*)
        )
      `)
      .eq('screening_id', screeningId)
      .order('generated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  public async getReportById(reportId: string) {
    const { data, error } = await this.supabase
      .from('reports')
      .select(`
        *,
        screening:screenings(
          *,
          student:students(*)
        )
      `)
      .eq('id', reportId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // SLP Profile methods
  public async getSLPProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('slp_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  public async getSLPsByOrganization(organizationId: string) {
    const { data, error } = await this.supabase
      .from('slp_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('organization_id', organizationId)
      .eq('active', true);
    
    if (error) throw error;
    return data;
  }

  // School Assignment methods
  public async getSchoolAssignments(slpProfileId: string) {
    const { data, error } = await this.supabase
      .from('school_assignments')
      .select(`
        *,
        school:schools(
          *,
          organization:organizations(*)
        )
      `)
      .eq('slp_profile_id', slpProfileId);
    
    if (error) throw error;
    return data;
  }
}

export const supabaseService = SupabaseService.getInstance();
