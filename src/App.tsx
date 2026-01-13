import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Router eklendi
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AuditForm } from './components/AuditForm';
import { AuditResult } from './components/AuditResult';
import { ListingOptimizer } from './components/ListingOptimizer';
import { CompetitorAnalyzer } from './components/CompetitorAnalyzer';
import { GlobalMarketAnalyzer } from './components/GlobalMarketAnalyzer';
import { KeywordResearch } from './components/KeywordResearch';
import { ProductLaunchpad } from './components/ProductLaunchpad';
import { TrendRadar } from './components/TrendRadar';
import { NewShopStarter } from './components/NewShopStarter';
import { ReelGen } from './components/ReelGen';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { ChatModal } from './components/ChatModal';
import { runEtsyAudit, getChatResponse } from './services/geminiService';
import { AuditReport, OptimizerTransferData, UserSettings, AuditItem, ChatMessage } from './types';

// --- GERÇEK SUPABASE BAĞLANTISI (MOCK KALDIRILDI) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

type ActiveTab = 'dashboard' | 'audit' | 'optimizer' | 'competitor' | 'launchpad' | 'newShop' | 'market' | 'keywords' | 'trendRadar' | 'reelGen';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Modallar
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditReport | null>(null);
  const [optimizerData, setOptimizerData] = useState<OptimizerTransferData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState<AuditItem | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({ language: 'en', notifications: true });

  // Auth Kontrolü (Gerçek Supabase)
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setUserProfile(profile);
      }
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Kredi Kullanımı (Gerçek DB rpc çağrısı)
  const useCredit = async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;
    const { data, error } = await supabase.rpc('deduct_credits', { user_uuid: user.id, credit_amount: amount });
    if (error || data === false) {
      alert('Insufficient credits.');
      return false;
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) setUserProfile(profile);
    return true;
  };

  if (loading) return <div className="h-screen bg-[#0B0F19] flex items-center justify-center text-white">Loading Ranklistic...</div>;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden font-sans">
        {user && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            lang={lang} 
            credits={userProfile?.credits || 0} 
            userPlan={userProfile?.plan || 'free'}
            userEmail={user.email}
            onOpenSubscription={() => setShowSubscriptionModal(true)}
            onSignOut={() => supabase.auth.signOut()}
            onOpenSettings={() => {}}
            isMobileOpen={false}
            setIsMobileOpen={() => {}}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {user && (
            <Header 
              credits={userProfile?.credits} 
              lang={lang} 
              onOpenSubscription={() => setShowSubscriptionModal(true)}
              userPlan={userProfile?.plan || 'free'}
            />
          )}

          <main className="flex-1 overflow-y-auto">
            {!user ? (
              <LandingPage 
                onGetStarted={() => setShowSubscriptionModal(true)}
                onLoginSuccess={(u) => { setUser(u); }}
              />
            ) : (
              <div className="p-4 md:p-8 max-w-7xl mx-auto pt-20">
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    lang={lang} 
                    userCredits={userProfile?.credits} 
                    userPlan={userProfile?.plan} 
                    onNewAudit={() => setActiveTab('audit')} 
                    onNewListing={() => setActiveTab('optimizer')} 
                    onNewMarket={() => setActiveTab('market')} 
                    onGoToLaunchpad={() => setActiveTab('launchpad')} 
                    onGoToReelGen={() => setActiveTab('reelGen')} 
                    onGoToTrendRadar={() => setActiveTab('trendRadar')} 
                    onLoadReport={() => {}} 
                    onOpenSubscription={() => setShowSubscriptionModal(true)} 
                  />
                )}
                {activeTab === 'audit' && <AuditForm lang={lang} onAuditComplete={(r) => { setAuditResult(r); setActiveTab('dashboard'); }} useCredit={useCredit} />}
                {activeTab === 'optimizer' && <ListingOptimizer lang={lang} />}
                {activeTab === 'market' && <GlobalMarketAnalyzer lang={lang} />}
                {activeTab === 'launchpad' && <ProductLaunchpad lang={lang} />}
                {activeTab === 'newShop' && <NewShopStarter lang={lang} />}
                {activeTab === 'keywords' && <KeywordResearch lang={lang} />}
                {activeTab === 'trendRadar' && <TrendRadar lang={lang} />}
                {activeTab === 'reelGen' && <ReelGen lang={lang} />}
              </div>
            )}
          </main>
        </div>
        <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} lang={lang} onSuccess={() => {}} />
      </div>
    </BrowserRouter>
  );
}