import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ADMIN_KEY_ROLE!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 