import React, { useState, useEffect } from 'react';
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

// --- SUPABASE BAĞLANTISI ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

type ActiveTab = 'dashboard' | 'audit' | 'optimizer' | 'competitor' | 'launchpad' | 'newShop' | 'market' | 'keywords' | 'trendRadar' | 'reelGen';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Modals & Data
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

  // --- AUTH KONTROLÜ ---
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // İlk session kontrolü
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAuthError(sessionError.message);
        }
        
        if (mounted && session?.user) {
          setUser(session.user);
          
          // Profile bilgilerini çek
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && !profileError) {
            setUserProfile(profile);
          }
          
          setLoading(false);
          
          // Eğer URL'de #access_token varsa (magic link'ten döndüyse)
          if (window.location.hash.includes('access_token')) {
            console.log('Auth token detected, cleaning URL...');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          if (mounted) {
            setUser(null);
            setUserProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Init auth error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          
          // Profile bilgilerini çek
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
        
        // Başarılı giriş sonrası
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in successfully!');
          setAuthError(null);
          
          // Last login zamanını güncelle
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id);
        }
        
        // Magic link ile giriş
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- EMAIL/PASSWORD İLE GİRİŞ ---
  const handleEmailPasswordLogin = async (email: string, password: string, isSignUp: boolean = false) => {
    setLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        // Yeni hesap oluştur
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (error) {
          console.error('Sign up error:', error);
          setAuthError(error.message);
          return { success: false, message: error.message };
        }

        console.log('Sign up successful!', data);
        return { success: true, message: 'Account created! You can now sign in.' };
      } else {
        // Giriş yap
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          console.error('Sign in error:', error);
          setAuthError(error.message);
          return { success: false, message: error.message };
        }

        console.log('Sign in successful!', data);
        setUser(data.user);
        return { success: true, message: 'Welcome back!' };
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE İLE GİRİŞ ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google login error:', error);
        setAuthError(error.message);
        alert(`Error: ${error.message}`);
        setLoading(false);
      }
      // OAuth redirect olacağı için loading state'i değiştirmiyoruz
    } catch (error: any) {
      console.error('Google login error:', error);
      setAuthError(error.message);
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  // --- ÇIKIŞ ---
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuditResult(null);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // --- YARDIMCI FONKSİYONLAR ---
  const useCredit = async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Supabase function'ı çağır
      const { data, error } = await supabase.rpc('deduct_credits', {
        user_uuid: user.id,
        credit_amount: amount,
        transaction_reason: 'feature_usage'
      });
      
      if (error) {
        console.error('Credit deduction error:', error);
        alert('Insufficient credits. Please upgrade your plan.');
        return false;
      }
      
      if (data === false) {
        alert('Insufficient credits. Please upgrade your plan.');
        return false;
      }
      
      // Profile'ı yeniden yükle
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserProfile(profile);
      }
      
      return true;
    } catch (error) {
      console.error('Credit error:', error);
      return false;
    }
  };

  const handleAudit = async (url: string, manualStats?: any) => {
    if (!await useCredit(1)) return;
    setIsLoading(true);
    try {
      const resStr = await runEtsyAudit(url, manualStats);
      const res = JSON.parse(resStr);
      setAuditResult(res);
      setActiveTab('audit');
    } catch (e) {
      console.error(e);
      alert("Audit failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizerTransfer = (data: OptimizerTransferData) => {
    setOptimizerData(data);
    setActiveTab('optimizer');
  };

  const startAuditChat = (item: AuditItem) => {
    setSelectedAuditItem(item);
    setChatHistory([{ sender: 'ai', text: `Hi! I see you need help with **${item.category}**. ${item.recommendations[0]}` }]);
    setShowChatModal(true);
  };

  const handleChatSendMessage = async (message: string, image: string | null) => {
    if (!selectedAuditItem) return;
    const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: message, image: image || undefined }];
    setChatHistory(newHistory);
    setIsChatLoading(true);
    try {
      const aiResponse = await getChatResponse(selectedAuditItem, newHistory, message, image);
      setChatHistory([...newHistory, { sender: 'ai', text: aiResponse }]);
    } catch (e) {
      console.error(e);
      setChatHistory([...newHistory, { sender: 'ai', text: "Sorry, error." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const isVisible = (id: string) => activeTab === id ? 'block' : 'hidden';

  // --- GÖRÜNÜM MANTĞI ---
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
          {authError && (
            <p className="text-red-400 text-sm mt-2">Error: {authError}</p>
          )}
        </div>
      </div>
    );
  }

  // KULLANICI YOKSA -> LANDING PAGE
  if (!user) {
    return (
      <LandingPage 
        onGetStarted={handleGoogleLogin}
        onEmailPasswordLogin={handleEmailPasswordLogin}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  // KULLANICI VARSA -> PANEL
  return (
    <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => setActiveTab(t)} 
        lang={lang} 
        credits={userProfile?.credits || 0} 
        userPlan={userProfile?.plan || 'free'}
        userEmail={user.email}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onSignOut={handleSignOut}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          credits={userProfile?.credits || 0} 
          lang={lang} 
          onOpenSubscription={() => setShowSubscriptionModal(true)}
          userPlan={userProfile?.plan || 'free'}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            
            {activeTab === 'dashboard' && (
              <Dashboard 
                lang={lang}
                userCredits={userProfile?.credits || 0}
                userPlan={userProfile?.plan || 'free'}
                onNewAudit={() => setActiveTab('audit')}
                onNewListing={() => setActiveTab('optimizer')}
                onNewMarket={() => setActiveTab('market')}
                onGoToLaunchpad={() => setActiveTab('launchpad')}
                onGoToReelGen={() => setActiveTab('reelGen')}
                onGoToTrendRadar={() => setActiveTab('trendRadar')}
                onLoadReport={(record) => {
                  if (record.type === 'audit') {
                    setAuditResult(record.data);
                    setActiveTab('audit');
                  }
                }}
                onOpenSubscription={() => setShowSubscriptionModal(true)}
              />
            )}

            <div className={isVisible('audit')}>
              {!auditResult ? (
                <>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {lang === 'tr' ? 'Mağaza Denetimi' : 'Shop Audit'}
                    </h2>
                    <p className="text-gray-400">
                      {lang === 'tr' ? 'Mağazanızı analiz edin.' : 'Deep dive analysis of your shop.'}
                    </p>
                  </div>
                  <AuditForm onAudit={handleAudit} isLoading={isLoading} lang={lang} />
                </>
              ) : (
                <div>
                  <button 
                    onClick={() => setAuditResult(null)} 
                    className="mb-4 text-sm text-gray-400 hover:text-white"
                  >
                    &larr; Back to Audit Form
                  </button>
                  <AuditResult 
                    result={auditResult} 
                    onStartChat={startAuditChat} 
                    shopUrl={auditResult.shopName || "Your Shop"}
                    userPlan={userProfile?.plan || 'free'}
                    brandSettings={userSettings}
                  />
                </div>
              )}
            </div>

            <div className={isVisible('optimizer')}>
              <ListingOptimizer initialData={optimizerData} />
            </div>
            <div className={isVisible('competitor')}>
              <CompetitorAnalyzer />
            </div>
            <div className={isVisible('market')}>
              <GlobalMarketAnalyzer lang={lang} />
            </div>
            <div className={isVisible('keywords')}>
              <KeywordResearch lang={lang} />
            </div>
            <div className={isVisible('launchpad')}>
              <ProductLaunchpad 
                auditResult={auditResult} 
                onUseForListing={handleOptimizerTransfer} 
              />
            </div>
            <div className={isVisible('trendRadar')}>
              <TrendRadar lang={lang} onUseTrend={handleOptimizerTransfer} />
            </div>
            <div className={isVisible('newShop')}>
              <NewShopStarter lang={lang} />
            </div>
            <div className={isVisible('reelGen')}>
              <ReelGen 
                lang={lang} 
                userCredits={userProfile?.credits || 0} 
                userPlan={userProfile?.plan || 'free'} 
                onDeductCredit={useCredit} 
                onOpenSubscription={() => setShowSubscriptionModal(true)} 
              />
            </div>

          </div>
        </main>
      </div>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        lang={lang} 
        onSuccess={() => {}} 
      />
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        user={user} 
        settings={userSettings} 
        onSaveSettings={setUserSettings} 
        onOpenSubscription={() => { 
          setShowSettingsModal(false); 
          setShowSubscriptionModal(true); 
        }} 
        lang={lang} 
      />
      {selectedAuditItem && (
        <ChatModal 
          isOpen={showChatModal} 
          onClose={() => setShowChatModal(false)} 
          auditItem={selectedAuditItem} 
          history={chatHistory} 
          onSendMessage={handleChatSendMessage} 
          isLoading={isChatLoading} 
        />
      )}
    </div>
  );
}