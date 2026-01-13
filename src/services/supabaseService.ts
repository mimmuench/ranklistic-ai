
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
const getEnv = (key: string) => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) {
        // Ignore errors
    }

    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            // @ts-ignore
            return process.env[key];
        }
    } catch (e) {
        // Ignore errors
    }
    
    return '';
};

// --- MANUAL KEYS FOR LOCAL DEV (OPTIONAL) ---
const MANUAL_SUPABASE_URL = "";
const MANUAL_SUPABASE_KEY = "";

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || MANUAL_SUPABASE_URL;
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || MANUAL_SUPABASE_KEY;

// Check if keys exist and are valid URL
const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http');

export const isDemoMode = !isConfigured;

let supabase: SupabaseClient | null = null;

if (isConfigured) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error("Supabase Client Init Error:", e);
    }
} else {
    console.log("Running in TEST MODE (No DB Connection)");
}

// --- MOCK STORAGE FOR TEST MODE ---
const LOCAL_STORAGE_KEY = 'ranklistic_mock_user';
const MOCK_DB_KEY = 'ranklistic_mock_db';

const getMockUser = (): UserProfile | null => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return null;
        
        const parsed = JSON.parse(stored);
        
        // Validation: Ensure it has required fields to prevent crash
        if (parsed && typeof parsed === 'object' && 'email' in parsed) {
             // Migration defaults
             if (!parsed.plan) parsed.plan = 'free';
             if (typeof parsed.credits !== 'number') parsed.credits = 0;
             return parsed as UserProfile;
        }
        return null;
    } catch (e) {
        console.warn("Detected corrupted user data in local storage. Clearing to prevent crash.");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return null;
    }
};

const setMockUser = (user: UserProfile | null) => {
    if (user) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(LOCAL_STORAGE_KEY);
};

// --- REAL SERVICE (WITH FALLBACKS) ---
export const supabaseMock = {
    auth: {
        // Magic Link Sign In
        signIn: async (email: string): Promise<{ user: UserProfile | null, error: any }> => {
            if (supabase) {
                try {
                    const { error } = await supabase.auth.signInWithOtp({ 
                        email,
                        options: { emailRedirectTo: window.location.origin }
                    });
                    return { user: null, error };
                } catch (err: any) {
                    return { user: null, error: err };
                }
            }
            // Mock
            const mockUser: UserProfile = {
                id: 'admin-user-123',
                email: email || 'agency@ranklistic.com',
                plan: 'agency', 
                credits: 1000,
                is_subscribed: true
            };
            setMockUser(mockUser);
            return { user: mockUser, error: null };
        },

        // Password Sign In (Matches Supabase API Structure)
        signInWithPassword: async ({ email, password }: any) => {
            if (supabase) {
                return await supabase.auth.signInWithPassword({ email, password });
            }
            // Mock Success
            const mockUser: UserProfile = {
                id: 'admin-user-123',
                email: email,
                plan: 'agency', 
                credits: 1000,
                is_subscribed: true
            };
            setMockUser(mockUser);
            return { data: { user: mockUser }, error: null };
        },

        // Sign Up (Matches Supabase API Structure)
        signUp: async ({ email, password }: any) => {
            if (supabase) {
                return await supabase.auth.signUp({ email, password });
            }
            // Mock Success
            return { data: { user: { id: 'new-user', email } }, error: null };
        },

        // OAuth
        signInWithOAuth: async (options: any) => {
            if (supabase) {
                return await supabase.auth.signInWithOAuth(options);
            }
            return { error: { message: "OAuth not available in demo mode" } };
        },

        // Reset Password
        resetPasswordForEmail: async (email: string, options: any) => {
            if (supabase) {
                return await supabase.auth.resetPasswordForEmail(email, options);
            }
            return { data: {}, error: null };
        },

        // Update User (Password etc)
        updateUser: async (attributes: any) => {
            if (supabase) {
                return await supabase.auth.updateUser(attributes);
            }
            return { data: {}, error: null };
        },

        signOut: async () => {
            if (supabase) {
                const { error } = await supabase.auth.signOut();
                return { error };
            }
            setMockUser(null);
            return { error: null };
        },

        getUser: async (): Promise<UserProfile | null> => {
            if (supabase) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return null;
                    
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    if (error) {
                        return { id: user.id, email: user.email!, plan: 'free', credits: 0 };
                    }
                    return profile as UserProfile;
                } catch (e) {
                    return null;
                }
            }
            return getMockUser();
        },

        onAuthStateChange: (callback: (event: string, session: any) => void) => {
            if (supabase) {
                return supabase.auth.onAuthStateChange(callback);
            }
            return { data: { subscription: { unsubscribe: () => {} } } };
        }
    },

    db: {
        deductCredit: async (amount: number = 1): Promise<{ success: boolean, newBalance: number }> => {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return { success: false, newBalance: 0 };

                const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
                if (!profile || profile.credits < amount) return { success: false, newBalance: profile?.credits || 0 };

                const newBalance = profile.credits - amount;
                const { error } = await supabase.from('profiles').update({ credits: newBalance }).eq('id', user.id);
                
                if (error) return { success: false, newBalance: profile.credits };
                return { success: true, newBalance };
            }

            const user = getMockUser();
            if (!user || user.credits < amount) return { success: false, newBalance: user?.credits || 0 };
            
            user.credits -= amount;
            setMockUser(user);
            return { success: true, newBalance: user.credits };
        },

        upgradePlan: async (plan: 'starter' | 'growth' | 'agency'): Promise<UserProfile> => {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("No user");
                let credits = plan === 'growth' ? 200 : plan === 'agency' ? 1000 : 50;
                const { data, error } = await supabase.from('profiles').update({ plan, credits, is_subscribed: true }).eq('id', user.id).select().single();
                if (error) throw error;
                return data as UserProfile;
            }

            const user = getMockUser();
            if (!user) throw new Error("No user");
            user.plan = plan;
            user.credits = plan === 'growth' ? 200 : plan === 'agency' ? 1000 : 50;
            user.is_subscribed = true;
            setMockUser(user);
            return user;
        },

        addCredits: async (amount: number): Promise<UserProfile> => {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("No user");
                const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
                const current = profile?.credits || 0;
                const { data, error } = await supabase.from('profiles').update({ credits: current + amount }).eq('id', user.id).select().single();
                if (error) throw error;
                return data as UserProfile;
            }

            const user = getMockUser();
            if (!user) throw new Error("No user");
            user.credits += amount;
            setMockUser(user);
            return user;
        },

        saveReport: async (record: Omit<SavedRecord, 'id' | 'user_id'>): Promise<boolean> => {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return false;
                const { error } = await supabase.from('reports').insert({ user_id: user.id, ...record });
                return !error;
            }

            const reports = JSON.parse(localStorage.getItem(MOCK_DB_KEY) || '[]');
            reports.push({ ...record, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() });
            localStorage.setItem(MOCK_DB_KEY, JSON.stringify(reports));
            return true;
        },

        getHistory: async (): Promise<SavedRecord[]> => {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];
                const { data } = await supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
                return data ? data.map((row: any) => ({ ...row, date: row.created_at })) : [];
            }
            return JSON.parse(localStorage.getItem(MOCK_DB_KEY) || '[]');
        },

        deleteReport: async (reportId: string): Promise<boolean> => {
            if (supabase) {
                const { error } = await supabase.from('reports').delete().eq('id', reportId);
                return !error;
            }
            const reports = JSON.parse(localStorage.getItem(MOCK_DB_KEY) || '[]');
            const filtered = reports.filter((r: any) => r.id !== reportId);
            localStorage.setItem(MOCK_DB_KEY, JSON.stringify(filtered));
            return true;
        }
    }
};
