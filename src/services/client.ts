import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL veya Anon Key eksik! .env dosyanızı kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// VERİLERİN SİTEYE YANSIMASINI SAĞLAYAN KRİTİK SERVİS
export const authService = {
    getCurrentUser: async () => {
        // 1. Önce aktif Auth oturumunu kontrol et
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return null;
        }

        // 2. Auth ID'si ile 'profiles' tablosundaki (SQL ile güncellediğin) verileri çek
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("Profil veritabanından çekilemedi:", profileError);
            // Profil henüz oluşmamışsa sadece user bilgisini dön
            return { id: user.id, email: user.email, plan: 'free', credits: 0 };
        }

        return profile;
    }
};