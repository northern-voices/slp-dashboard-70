
import { z } from 'zod';

// Dynamic schema factory function
export const createScreeningFormSchema = (isCreatingNewStudent: boolean) => {
  const baseSchema = {
    screening_type: z.enum(['initial', 'follow_up', 'annual', 'referral']),
    screening_date: z.string().min(1, 'Screening date is required'),
    form_type: z.enum(['speech', 'hearing', 'progress']),
    general_notes: z.string(),
    recommendations: z.string(),
    follow_up_required: z.boolean(),
    follow_up_date: z.string().optional(),
  };

  if (isCreatingNewStudent) {
    return z.object({
      ...baseSchema,
      student_id: z.string().optional(),
      student_info: z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        date_of_birth: z.string().min(1, 'Date of birth is required'),
        grade: z.string().optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
      }),
    });
  } else {
    return z.object({
      ...baseSchema,
      student_id: z.string().min(1, 'Student selection is required'),
      student_info: z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        date_of_birth: z.string().optional(),
        grade: z.string().optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
      }).optional(),
    });
  }
};

export type ScreeningFormSchemaType<T extends boolean> = z.infer<ReturnType<typeof createScreeningFormSchema>>;
