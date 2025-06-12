
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tvdnhcocgvuzeonejiut.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZG5oY29jZ3Z1emVvbmVqaXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDgxOTEsImV4cCI6MjA2NDcyNDE5MX0.5UL2Kxs1Y2vUBRe8qCcy-JTC4emf4p6Vo4s2qetSJYk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
