// Universal Agent Platform - Supabase Client
// Handles both real Supabase and demo mode
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { mockSupabase } from './mockClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ENABLE_DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

let client;

// Check if we're in demo mode or if Supabase is not configured
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && 
                           !SUPABASE_URL.includes('localhost') || 
                           !ENABLE_DEMO_MODE;

if (ENABLE_DEMO_MODE || !isSupabaseConfigured) {
  console.log('🎯 Running in DEMO mode - using mock data');
  client = mockSupabase;
} else {
  console.log('🔗 Connecting to real Supabase instance');
  client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

export const supabase = client;