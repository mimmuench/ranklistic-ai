
import React, { useState, useEffect, useCallback } from 'react';
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
import { supabaseMock, UserProfile } from './services/supabaseService';
import { runEtsyAudit, getChatResponse } from './services/geminiService';
import { AuditReport, OptimizerTransferData, UserSettings, AuditItem, ChatMessage } from './types';

type ActiveTab = 'dashboard' | 'audit' | 'optimizer' | 'competitor' | 'launchpad' | 'newShop' | 'market' | 'keywords' | 'trendRadar' | 'reelGen';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Modals
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  
  // Data State
  const [auditResult, setAuditResult] = useState<AuditReport | null>(null);
  const [optimizerData, setOptimizerData] = useState<OptimizerTransferData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat State
  const [selectedAuditItem, setSelectedAuditItem] = useState<AuditItem | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Settings
  const [userSettings, setUserSettings] = useState<UserSettings>({
      language: 'en',
      notifications: true
  });

  // Auth Check
  useEffect(() => {
      const checkUser = async () => {
          const u = await supabaseMock.auth.getUser();
          setUser(u);
      };
      checkUser();
      
      const { data } = supabaseMock.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN') setUser(session?.user);
          if (event === 'SIGNED_OUT') setUser(null);
      });
      // return () => data.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
      await supabaseMock.auth.signOut();
      setUser(null);
  };

  const useCredit = async (amount: number = 1): Promise<boolean> => {
      if (!user) return false;
      const { success, newBalance } = await supabaseMock.db.deductCredit(amount);
      if (success) {
          setUser({ ...user, credits: newBalance });
          return true;
      } else {
          setShowSubscriptionModal(true);
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
          setActiveTab('audit'); // Force switch to view result
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
            const aiResponse = await getChatResponse(
                selectedAuditItem,
                newHistory,
                message,
                image
            );
            setChatHistory([...newHistory, { sender: 'ai', text: aiResponse }]);
        } catch (e) {
            console.error(e);
            setChatHistory([...newHistory, { sender: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
  };

  const isVisible = (id: string) => activeTab === id ? 'block' : 'hidden';

  if (!user) {
      return (
        <LandingPage 
            onGetStarted={(l) => setLang(l)} 
            onLoginSuccess={(u) => setUser(u)} 
        />
      );
  }

  return (
    <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden font-sans">
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(t) => setActiveTab(t)} 
            lang={lang} 
            credits={user.credits}
            userPlan={user.plan}
            userEmail={user.email}
            onOpenSubscription={() => setShowSubscriptionModal(true)}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            onSignOut={handleSignOut}
            onOpenSettings={() => setShowSettingsModal(true)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <Header 
                credits={user.credits} 
                lang={lang} 
                onOpenSubscription={() => setShowSubscriptionModal(true)}
                userPlan={user.plan}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-7xl mx-auto">
                    
                    {activeTab === 'dashboard' && (
                        <Dashboard 
                            lang={lang}
                            userCredits={user.credits}
                            userPlan={user.plan}
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
                                // Other types can be handled here if history structure supports it
                            }}
                            onOpenSubscription={() => setShowSubscriptionModal(true)}
                        />
                    )}

                    <div className={isVisible('audit')}>
                        {!auditResult ? (
                            <>
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold text-white mb-2">{lang === 'tr' ? 'Mağaza Denetimi' : 'Shop Audit'}</h2>
                                    <p className="text-gray-400">{lang === 'tr' ? 'Mağazanızı analiz edin.' : 'Deep dive analysis of your shop.'}</p>
                                </div>
                                <AuditForm onAudit={handleAudit} isLoading={isLoading} lang={lang} />
                            </>
                        ) : (
                            <div>
                                <button onClick={() => setAuditResult(null)} className="mb-4 text-sm text-gray-400 hover:text-white">&larr; Back to Audit Form</button>
                                <AuditResult 
                                    result={auditResult} 
                                    onStartChat={startAuditChat} 
                                    shopUrl={auditResult.shopName || "Your Shop"}
                                    userPlan={user.plan}
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
                            userCredits={user?.credits || 0}
                            userPlan={user?.plan}
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
            onSuccess={() => {
                supabaseMock.auth.getUser().then(u => setUser(u));
            }}
        />

        <SettingsModal 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)} 
            user={user}
            settings={userSettings}
            onSaveSettings={setUserSettings}
            onOpenSubscription={() => { setShowSettingsModal(false); setShowSubscriptionModal(true); }}
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
