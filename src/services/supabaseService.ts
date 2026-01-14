import { createClient } from '@supabase/supabase-js';
import type { SavedRecord } from '../types';

// --- TYPES ---
export interface UserProfile {
    id: string;
    email: string;
    plan: 'free' | 'starter' | 'growth' | 'agency';
    credits: number;
    is_subscribed?: boolean;
}

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// --- SUPABASE CLIENT ---
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- AUTH SERVICE ---
export const authService = {
    // Magic Link Sign In
    signInWithMagicLink: async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({ 
            email,
            options: { emailRedirectTo: window.location.origin }
        });
        return { error };
    },

    // Password Sign In
    signInWithPassword: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        return { data, error };
    },

    // Sign Up
    signUp: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password 
        });
        return { data, error };
    },

    // OAuth Sign In
    signInWithOAuth: async (provider: 'google' | 'github') => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin }
        });
        return { data, error };
    },

    // Reset Password
    resetPassword: async (email: string) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        return { data, error };
    },

    // Update Password
    updatePassword: async (newPassword: string) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    },

    // Sign Out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get Current User with Profile
    getCurrentUser: async (): Promise<UserProfile | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (error || !profile) {
            return {
                id: user.id,
                email: user.email!,
                plan: 'free',
                credits: 0,
                is_subscribed: false
            };
        }
        
        return profile as UserProfile;
    },

    // Auth State Listener
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// --- DATABASE SERVICE ---
export const dbService = {
    // Deduct Credits
    deductCredits: async (amount: number = 1): Promise<{ success: boolean; newBalance: number }> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, newBalance: 0 };

        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();
        
        if (fetchError || !profile) {
            return { success: false, newBalance: 0 };
        }

        if (profile.credits < amount) {
            return { success: false, newBalance: profile.credits };
        }

        const newBalance = profile.credits - amount;
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newBalance })
            .eq('id', user.id);
        
        if (updateError) {
            return { success: false, newBalance: profile.credits };
        }

        return { success: true, newBalance };
    },

    // Add Credits
    addCredits: async (amount: number): Promise<UserProfile | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();
        
        const currentCredits = profile?.credits || 0;
        const newCredits = currentCredits + amount;

        const { data, error } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', user.id)
            .select()
            .single();
        
        if (error) throw error;
        return data as UserProfile;
    },

    // Upgrade Plan
    upgradePlan: async (plan: 'starter' | 'growth' | 'agency'): Promise<UserProfile | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const creditsMap = {
            starter: 50,
            growth: 200,
            agency: 1000
        };

        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                plan, 
                credits: creditsMap[plan],
                is_subscribed: true 
            })
            .eq('id', user.id)
            .select()
            .single();
        
        if (error) throw error;
        return data as UserProfile;
    },

    // Save Report
    saveReport: async (record: Omit<SavedRecord, 'id' | 'user_id'>): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('saved_reports')
            .insert({ 
                user_id: user.id, 
                ...record 
            });
        
        return !error;
    },

    // Get History
    getHistory: async (): Promise<SavedRecord[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('saved_reports')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error || !data) return [];
        
        return data.map((row: any) => ({
            ...row,
            date: row.created_at
        }));
    },

    // Delete Report
    deleteReport: async (reportId: string): Promise<boolean> => {
        const { error } = await supabase
            .from('saved_reports')
            .delete()
            .eq('id', reportId);
        
        return !error;
    }
};

// --- BACKWARDS COMPATIBILITY ---
// Eski kodların çalışması için
export const supabaseMock = {
    auth: authService,
    db: dbService
};