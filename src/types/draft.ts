
export interface Draft {
  id: string;
  user_id: string;
  student_id?: string;
  screening_type: 'speech' | 'hearing';
  title: string;
  form_data: any;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  student_name?: string;
  user_name?: string;
}

export interface DraftAction {
  type: 'view' | 'edit' | 'delete' | 'duplicate';
  label: string;
  icon: any;
  className?: string;
}
