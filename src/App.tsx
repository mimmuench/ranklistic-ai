import React, { useState, useEffect } from 'react';
import { supabase } from './services/client';
import { createClient } from '@supabase/supabase-js'
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
import { SubscriptionModal } from './components/SubscriptionModal';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { ChatModal } from './components/ChatModal';
import { runEtsyAudit, getChatResponse } from './services/geminiService';
import { AuditReport, OptimizerTransferData, UserSettings, AuditItem, ChatMessage } from './types';
import { BrowserRouter } from 'react-router-dom';
import OnboardingTour from './components/OnboardingTour';
import { AmazonGenerator } from './components/AmazonGenerator';

type ActiveTab = 'dashboard' | 'audit' | 'optimizer' | 'competitor' | 'launchpad' | 'market' | 'keywords' | 'trendRadar' | 'amazon';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('ranklistic_onboarded');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('ranklistic_onboarded', 'true');
  };

  // Modals & Data
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditReport | null>(null);
  const [optimizerData, setOptimizerData] = useState<OptimizerTransferData | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState<AuditItem | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({ language: 'en', notifications: true });

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (profile) setUserProfile(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- AUTH CONTROL ---
  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }

        // Auth state değişikliklerini dinle
        const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) return;

          console.log('Auth event:', event);

          if (event === 'SIGNED_IN' && newSession?.user) {
            if (!userProfile || userProfile.id !== newSession.user.id) {
              await fetchUserProfile(newSession.user.id);
            }
            setUser(newSession.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserProfile(null);
          } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
            setUser(newSession.user);
          }
          
          setLoading(false);
        });

        authSubscription = data.subscription;
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // --- EMAIL/PASSWORD LOGIN ---
  const handleEmailPasswordLogin = async (email: string, password: string, isSignUp: boolean = false) => {
    setLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
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
          setLoading(false);
          return { success: false, message: error.message };
        }

        console.log('Sign up successful!', data);
        setLoading(false);
        return { success: true, message: 'Account created! You can now sign in.' };
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          console.error('Sign in error:', error);
          setAuthError(error.message);
          setLoading(false);
          return { success: false, message: error.message };
        }

        console.log('Sign in successful!', data);
        setUser(data.user);
        setLoading(false);
        return { success: true, message: 'Welcome back!' };
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  // --- GOOGLE LOGIN ---
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
    } catch (error: any) {
      console.error('Google login error:', error);
      setAuthError(error.message);
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  // --- SIGN OUT ---
  const handleSignOut = async () => {
    try {
      setLoading(false);
      setIsActionLoading(false);
      setIsChatLoading(false);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
      setAuditResult(null);
      setChatHistory([]);
      setActiveTab('dashboard');

      localStorage.removeItem('sb-fjqbckhzkxiumdphkqyi-auth-token');
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
      setUserProfile(null);
    }
  };

  // --- USE CREDIT ---
  const useCredit = async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;
    
    try {
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
      
      await fetchUserProfile(user.id);
      
      return true;
    } catch (error) {
      console.error('Credit error:', error);
      return false;
    }
  };

  // App.tsx içine eklenecek
  const saveToHistory = async (title: string, data: any, type: ActiveTab) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_reports')
        .insert([
          {
            user_id: user.id,
            title: title,
            data: data, // Üretilen JSON içeriği
            type: type, // 'amazon', 'optimizer' vb.
            date: new Date().toISOString(),
          }
        ]);

      if (error) throw error;
    
      // Dashboard'un yenilenmesi için tetikleyici (opsiyonel)
      console.log("Geçmişe kaydedildi!");
    } catch (err) {
      console.error("Kaydedilirken hata oluştu:", err);
    }
  };

  // --- AUDIT ---
  const handleAudit = async (url: string, manualStats?: any) => {
    if (!await useCredit(1)) return;
    setIsActionLoading(true);
    try {
      const resStr = await runEtsyAudit(url, manualStats);
      const res = JSON.parse(resStr);
      setAuditResult(res);
      setActiveTab('audit');
    } catch (e) {
      console.error(e);
      alert("Audit failed. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };
    
  // --- OPTIMIZER TRANSFER ---
  const handleOptimizerTransfer = (data: OptimizerTransferData) => {
    setOptimizerData(data);
    setActiveTab('optimizer');
  };

  // --- CHAT ---
  const startAuditChat = (item: AuditItem) => {
    setSelectedAuditItem(item);
    setChatHistory([{ 
      sender: 'ai', 
      text: `Hi! I see you need help with **${item.category}**. ${item.recommendations[0]}` 
    }]);
    setShowChatModal(true);
  };

  const handleChatSendMessage = async (message: string, image: string | null) => {
    if (!selectedAuditItem) return;
    const newHistory: ChatMessage[] = [
      ...chatHistory, 
      { sender: 'user', text: message, image: image || undefined }
    ];
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

  const isVisible = (tab: ActiveTab) => activeTab === tab ? 'block' : 'hidden';

  // --- LOADING STATE ---
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

  // --- NOT LOGGED IN -> LANDING PAGE ---
  if (!user) {
    return (
      <LandingPage 
        onGetStarted={handleGoogleLogin}
        onLoginSuccess={(u) => { 
          setUser(u.user || u); 
          if (u.profile) setUserProfile(u.profile);
        }}
      />
    );
  }

  // --- LOGGED IN -> DASHBOARD ---
  return (
    <BrowserRouter>
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
	
      <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden font-sans text-[13px] antialiased">
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

          <main className="flex-1 overflow-y-auto p-2 md:p-4 scroll-smooth bg-[#0B0F19]">
            <div className="max-w-[1200px] mx-auto w-full space-y-4">
              
              {/* DASHBOARD */}
              <div className={isVisible('dashboard')}>
                <Dashboard 
                  lang={lang} 
                  userCredits={userProfile?.credits || 0} 
                  userPlan={userProfile?.plan || 'free'}
                  setActiveTab={setActiveTab}
                  onNewAudit={() => setActiveTab('audit')} 
                  onNewListing={() => setActiveTab('optimizer')} 
                  onNewMarket={() => setActiveTab('market')} 
                  onGoToLaunchpad={() => setActiveTab('launchpad')} 
                  onGoToTrendRadar={() => setActiveTab('trendRadar')} 
                  onLoadReport={(record) => {
				    if (record.type === 'audit') {
					  setAuditResult(record.data);
					  setActiveTab('audit');
				    } else if (record.type === 'amazon') { // Amazon kayıtlarını yüklemek için
					  setResult(record.data); // Amazon sonucunu state'e bas
					  setActiveTab('amazon');
				    }
				  }} 
                  onOpenSubscription={() => setShowSubscriptionModal(true)} 
                />
              </div>

              {/* AUDIT */}
              <div className={isVisible('audit')}>
                {!auditResult ? (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-white mb-1">
                        {lang === 'tr' ? 'Mağaza Denetimi' : 'Shop Audit'}
                      </h2>
                      <p className="text-gray-400 text-xs">
                        {lang === 'tr' ? 'Mağazanızı analiz edin.' : 'Deep dive analysis of your shop.'}
                      </p>
                    </div>
                    <AuditForm onAudit={handleAudit} isLoading={isLoading} lang={lang} />
                  </>
                ) : (
                  <div>
                    <button 
                      onClick={() => setAuditResult(null)} 
                      className="mb-3 text-[12px] text-gray-400 hover:text-white"
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

              {/* OPTIMIZER */}
			  <div className={isVisible('optimizer')}>
			    <ListingOptimizer 
				  initialData={optimizerData} 
				  onSave={(result) => saveToHistory(result.title || 'Etsy Listing', result, 'optimizer')}
			    />
			  </div>

              {/* COMPETITOR */}
              <div className={isVisible('competitor')}>
                <CompetitorAnalyzer />
              </div>

              {/* MARKET */}
              <div className={isVisible('market')}>
                <GlobalMarketAnalyzer lang={lang} />
              </div>

              {/* KEYWORDS */}
              <div className={isVisible('keywords')}>
                <KeywordResearch lang={lang} />
              </div>
              
              {/* LAUNCHPAD */}
              <div className={isVisible('launchpad')}>
                <ProductLaunchpad 
                  auditResult={auditResult} 
                  onUseForListing={handleOptimizerTransfer} 
                />
              </div>

              {/* TREND RADAR */}
              <div className={isVisible('trendRadar')}>
                <TrendRadar 
                  lang={lang} 
                  onUseTrend={handleOptimizerTransfer}
                  useCredit={useCredit}
                />
              </div>

              {/* AMAZON GENERATOR */}
			  <div className={isVisible('amazon')}>
			    <AmazonGenerator 
				  lang={lang} 
				  onSave={(result) => saveToHistory(result.title || 'Amazon Listing', result, 'amazon')}
			    />
			  </div>

            </div>
          </main>
        </div>
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
    </BrowserRouter>
  );
}