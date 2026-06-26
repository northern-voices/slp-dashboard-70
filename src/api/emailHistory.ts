import { supabase } from '@/lib/supabase'

export const getEmailHistory = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('email_recipient_history')
    .select('email')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false })

  if (error) throw error
  return data.map(row => row.email)
}

export const upsertEmailHistory = async (userId: string, emails: string[]): Promise<void> => {
  const rows = emails.map(email => ({
    user_id: userId,
    email,
    last_used_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('email_recipient_history')
    .upsert(rows, { onConflict: 'user_id,email' })

  if (error) throw error
}
