import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pnlxsfwpkdgqifeebcbu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubHhzZndwa2RncWlmZWViY2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjQyOTgsImV4cCI6MjA4OTUwMDI5OH0.pTTjqCxnrZSmlbd3FYoa4EL87W-jBEnPUGb6_wBUFqw'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)