import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
// First try to get from import.meta.env (Vite)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development & testing purposes only
// In production, always use environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn('Environment variables not found. Using fallback for development only.');
  // ⚠️ IMPORTANT: Replace these values with your actual Supabase URL and anon key
  // This is a temporary solution - move these to .env.local in the frontend directory
  supabaseUrl = 'https://your-project.supabase.co';
  supabaseKey = 'your-anon-key';
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
