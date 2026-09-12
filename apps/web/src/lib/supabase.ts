import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] ?? 'http://127.0.0.1:54321';
const supabasePublishableKey = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ?? 'mock-key';

/**
 * Browser Supabase client configured per spec:
 * - flowType: 'pkce'
 * - persistSession: true
 * - autoRefreshToken: true
 * - detectSessionInUrl: false
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
