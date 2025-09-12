// js_supabase.js - Supabase configuration

// Replace these with your actual Supabase project details
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make supabase globally available
window.supabase = supabase;