import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fhpujrchfkonvsnegvrq.supabase.co'
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZocHVqcmNoZmtvbnZzbmVndnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODU2MDcsImV4cCI6MjA3ODQ2MTYwN30.762HrFaMI0L5ue4tE0sMDVbT6Br2eUFMVQEpPsn-Cv8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
