import { createClient } from '@supabase/supabase-js';

// Ortam değişkenlerini alıyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL veya Anon Key eksik! .env dosyanızı kontrol edin.');
}

// Gerçek Supabase istemcisini oluşturup dışarı aktarıyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey);