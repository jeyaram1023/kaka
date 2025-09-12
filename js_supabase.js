// js_supabase.js - Supabase configuration

// Replace these with your actual Supabase project details
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Wait for Supabase to load, then initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if supabase is available
    if (typeof supabase !== 'undefined') {
        // Initialize Supabase client
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Make supabase globally available
        window.supabase = supabaseClient;
        
        console.log('Supabase initialized successfully');
    } else {
        console.error('Supabase library not loaded. Please check your internet connection.');
    }
});

// Also try to initialize immediately if supabase is already loaded
if (typeof supabase !== 'undefined') {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
    console.log('Supabase initialized immediately');
}