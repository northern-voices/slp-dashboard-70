
-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Security Definer Functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.slp_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.slp_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_has_role(target_role public.user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.slp_profiles 
    WHERE user_id = auth.uid() AND role = target_role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_can_access_school(school_id UUID)
RETURNS BOOLEAN AS $$
  SELECT CASE 
    WHEN public.get_current_user_role() = 'admin' THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.school_assignments sa
      JOIN public.slp_profiles sp ON sa.slp_profile_id = sp.id
      WHERE sp.user_id = auth.uid() AND sa.school_id = school_id
    )
  END;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Organizations RLS Policies
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (id = public.get_current_user_organization_id());

CREATE POLICY "Admins can manage their organization" ON public.organizations
  FOR ALL USING (
    id = public.get_current_user_organization_id() AND 
    public.user_has_role('admin')
  );

-- Schools RLS Policies
CREATE POLICY "Users can view schools in their organization" ON public.schools
  FOR SELECT USING (organization_id = public.get_current_user_organization_id());

CREATE POLICY "Admins can manage schools in their organization" ON public.schools
  FOR ALL USING (
    organization_id = public.get_current_user_organization_id() AND 
    public.user_has_role('admin')
  );

-- SLP Profiles RLS Policies
CREATE POLICY "Users can view profiles in their organization" ON public.slp_profiles
  FOR SELECT USING (organization_id = public.get_current_user_organization_id());

CREATE POLICY "Users can update their own profile" ON public.slp_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage profiles in their organization" ON public.slp_profiles
  FOR ALL USING (
    organization_id = public.get_current_user_organization_id() AND 
    (public.user_has_role('admin') OR user_id = auth.uid())
  );

-- Students RLS Policies
CREATE POLICY "Users can view students in accessible schools" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.schools s 
      WHERE s.id = students.school_id 
      AND s.organization_id = public.get_current_user_organization_id()
      AND (
        public.user_has_role('admin') OR 
        public.user_can_access_school(s.id)
      )
    )
  );

CREATE POLICY "Users can manage students in accessible schools" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.schools s 
      WHERE s.id = students.school_id 
      AND s.organization_id = public.get_current_user_organization_id()
      AND (
        public.user_has_role('admin') OR 
        public.user_can_access_school(s.id)
      )
    )
  );

-- Screenings RLS Policies
CREATE POLICY "Users can view screenings for accessible students" ON public.screenings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.schools sc ON st.school_id = sc.id
      WHERE st.id = screenings.student_id 
      AND sc.organization_id = public.get_current_user_organization_id()
      AND (
        public.user_has_role('admin') OR 
        public.user_can_access_school(sc.id) OR
        screenings.slp_id IN (
          SELECT id FROM public.slp_profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage their own screenings" ON public.screenings
  FOR ALL USING (
    slp_id IN (SELECT id FROM public.slp_profiles WHERE user_id = auth.uid()) OR
    public.user_has_role('admin')
  );

-- Reports RLS Policies
CREATE POLICY "Users can view reports for accessible screenings" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.screenings sc
      JOIN public.students st ON sc.student_id = st.id
      JOIN public.schools sch ON st.school_id = sch.id
      WHERE sc.id = reports.screening_id 
      AND sch.organization_id = public.get_current_user_organization_id()
      AND (
        public.user_has_role('admin') OR 
        public.user_can_access_school(sch.id) OR
        sc.slp_id IN (
          SELECT id FROM public.slp_profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage reports for their screenings" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.screenings sc
      WHERE sc.id = reports.screening_id 
      AND (
        sc.slp_id IN (SELECT id FROM public.slp_profiles WHERE user_id = auth.uid()) OR
        public.user_has_role('admin')
      )
    )
  );

-- User Roles RLS Policies
CREATE POLICY "Users can view roles in their organization" ON public.user_roles
  FOR SELECT USING (organization_id = public.get_current_user_organization_id());

CREATE POLICY "Admins can manage roles in their organization" ON public.user_roles
  FOR ALL USING (
    organization_id = public.get_current_user_organization_id() AND 
    public.user_has_role('admin')
  );

-- School Assignments RLS Policies
CREATE POLICY "Users can view assignments in their organization" ON public.school_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.slp_profiles sp
      JOIN public.schools s ON school_assignments.school_id = s.id
      WHERE sp.id = school_assignments.slp_profile_id
      AND s.organization_id = public.get_current_user_organization_id()
    )
  );

CREATE POLICY "Admins can manage assignments in their organization" ON public.school_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.schools s
      WHERE s.id = school_assignments.school_id
      AND s.organization_id = public.get_current_user_organization_id()
      AND public.user_has_role('admin')
    )
  );

-- Activity Logs RLS Policies
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity logs in their organization" ON public.activity_logs
  FOR SELECT USING (
    public.user_has_role('admin') AND
    EXISTS (
      SELECT 1 FROM public.slp_profiles sp
      WHERE sp.user_id = activity_logs.user_id
      AND sp.organization_id = public.get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can create their own activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());
