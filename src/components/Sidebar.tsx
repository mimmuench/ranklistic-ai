
import React, { useState, useRef, useEffect } from 'react';
import { 
    HomeIcon, SearchIcon, GeneratorIcon, ScaleIcon, 
    RocketIcon, LightbulbIcon, GlobeIcon, KeyIcon, 
    CloseIcon, TrendingUpIcon, StarIcon, CloseCircleIcon, 
    UserIcon, CreditCardIcon, InfoIcon, SettingsIcon, FireIcon, VideoIcon
} from './icons';

type ActiveTab = 'dashboard' | 'audit' | 'optimizer' | 'competitor' | 'launchpad' | 'newShop' | 'market' | 'keywords' | 'trendRadar' | 'reelGen';

// Define the Lock Icon locally for the sidebar
const LockIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

interface SidebarProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    lang: 'en' | 'tr';
    credits?: number;
    userPlan?: string;
    userEmail?: string; // Added userEmail prop
    onOpenSubscription?: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    onSignOut?: () => void;
    onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeTab, setActiveTab, lang, credits, userPlan, userEmail, onOpenSubscription, isMobileOpen, setIsMobileOpen, onSignOut, onOpenSettings
}) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Feature Gating Logic - EXCLUSIVE LOCKS
    const isFeatureLocked = (id: string) => {
        // 1. Free Plan Locks
        if (!userPlan || userPlan === 'free') {
            return ['keywords', 'market', 'competitor', 'audit', 'optimizer', 'launchpad', 'trendRadar', 'reelGen'].includes(id); 
        }
        // 2. Starter Plan Locks
        if (userPlan === 'starter') {
            return ['market', 'competitor', 'launchpad', 'trendRadar', 'reelGen'].includes(id);
        }
        // 3. Growth Plan Locks
        if (userPlan === 'growth') {
            return ['trendRadar', 'reelGen'].includes(id);
        }
        
        return false; // Agency has access to everything
    };

    const handleTabClick = (id: string) => {
        if (isFeatureLocked(id)) {
            if (onOpenSubscription) onOpenSubscription();
        } else {
            setActiveTab(id as ActiveTab);
            setIsMobileOpen(false);
        }
    };

    const menuGroups = [
        {
            title: lang === 'tr' ? 'GENEL BAKIŞ' : 'OVERVIEW',
            items: [
                { id: 'dashboard', label: lang === 'tr' ? 'Panel' : 'Dashboard', icon: HomeIcon, tourId: 'nav-dashboard' }
            ]
        },
        {
            title: lang === 'tr' ? 'ARAŞTIRMA & ANALİZ' : 'RESEARCH & ANALYZE',
            items: [
                { id: 'trendRadar', label: lang === 'tr' ? 'Trend Radar' : 'Trend Radar', icon: FireIcon, highlight: true }, 
                { id: 'keywords', label: lang === 'tr' ? 'Kelime Avcısı' : 'Keyword Hunter', icon: KeyIcon, tourId: 'nav-research' },
                { id: 'market', label: lang === 'tr' ? 'Global Pazar' : 'Global Market', icon: GlobeIcon },
                { id: 'competitor', label: lang === 'tr' ? 'Rakip Casusu' : 'Competitor Spy', icon: ScaleIcon },
                { id: 'audit', label: lang === 'tr' ? 'Mağaza Denetimi' : 'Shop Audit', icon: SearchIcon },
            ]
        },
        {
            title: lang === 'tr' ? 'ÜRETİM & OPTİMİZASYON' : 'CREATE & OPTIMIZE',
            items: [
                { id: 'optimizer', label: lang === 'tr' ? 'Listing Yazarı' : 'Listing Generator', icon: GeneratorIcon, tourId: 'nav-optimizer' },
                { id: 'reelGen', label: lang === 'tr' ? 'Video Studio' : 'Video Studio', icon: VideoIcon, highlight: true }, // NEW
                { id: 'launchpad', label: lang === 'tr' ? 'Görsel Test' : 'Visual Tester', icon: RocketIcon },
                { id: 'newShop', label: lang === 'tr' ? 'İsim & Fikir' : 'Name & Idea', icon: LightbulbIcon },
            ]
        }
    ];

    const NavItem: React.FC<{ item: any }> = ({ item }) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        const isLocked = isFeatureLocked(item.id);
        
        return (
            <button
                id={item.tourId}
                onClick={() => handleTabClick(item.id)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }
                    ${item.highlight && !isActive ? 'border border-green-500/30 bg-green-500/5 text-green-400 hover:bg-green-500/10' : ''}
                    ${isLocked ? 'opacity-70 hover:opacity-100' : ''}
                `}
            >
                <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.highlight ? 'text-green-500' : 'text-slate-500 group-hover:text-white'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                </div>
                
                {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
                
                {isLocked && (
                    <div className="flex items-center gap-1">
                        {(item.id === 'trendRadar' || item.id === 'reelGen') && <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Pro</span>}
                        <LockIcon className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                )}
            </button>
        );
    };

    // Determine Display Name
    const displayName = userPlan === 'agency' ? 'Agency Admin' : userPlan === 'growth' ? 'Pro Seller' : 'Free User';

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside id="sidebar-nav" className={`
				fixed top-0 left-0 z-50 h-full w-72 bg-[#0F172A] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
				lg:translate-x-0 lg:static
				${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
			`}>
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500 blur opacity-40 rounded-full"></div>
                            <TrendingUpIcon className="w-8 h-8 text-orange-500 relative z-10" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            Ranklistic
                        </h1>
                    </div>
                    <button 
                        onClick={() => setIsMobileOpen(false)} 
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Scroll Area */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 no-scrollbar">
                    {menuGroups.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <NavItem key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
                    {credits !== undefined && (
                        <div id="nav-credits-container" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs text-slate-400 font-medium capitalize">
                                    {userPlan} Plan
                                </span>
                                <span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {credits} {lang === 'tr' ? 'Kredi' : 'Cr'}
                                </span>
                            </div>
                            
                            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-4 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-orange-500 to-pink-500 h-full rounded-full" 
                                    style={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
                                ></div>
                            </div>

                            <button 
                                onClick={onOpenSubscription}
                                className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <StarIcon className="w-3 h-3 text-orange-600" />
                                {lang === 'tr' ? 'Yükselt' : 'Upgrade Plan'}
                            </button>
                        </div>
                    )}
                    
                    {/* User Menu Trigger */}
                    <div ref={menuRef} className="relative">
                        {isUserMenuOpen && (
                            <div className="absolute bottom-full left-0 w-full mb-3 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up z-20">
                                <div className="p-3 border-b border-slate-700">
                                    <p className="text-xs text-slate-400">Signed in as</p>
                                    <p className="text-sm font-bold text-white truncate">{userEmail}</p>
                                </div>
                                <div className="p-1 space-y-1">
                                    <button 
                                        onClick={() => { onOpenSettings?.(); setIsUserMenuOpen(false); }}
                                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <SettingsIcon className="w-4 h-4" />
                                        {lang === 'tr' ? 'Ayarlar' : 'Settings'}
                                    </button>
                                    <button 
                                        onClick={() => { onOpenSubscription?.(); setIsUserMenuOpen(false); }}
                                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <CreditCardIcon className="w-4 h-4" />
                                        {lang === 'tr' ? 'Fatura & Plan' : 'Billing & Plan'}
                                    </button>
                                    <button 
                                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <InfoIcon className="w-4 h-4" />
                                        {lang === 'tr' ? 'Yardım' : 'Help'}
                                    </button>
                                    <div className="h-px bg-slate-700 my-1"></div>
                                    <button 
										onClick={(e) => {
											e.preventDefault(); // Sayfa yenileme riskini önler
											e.stopPropagation(); // Tıklamanın menüdeki diğer elementleri tetiklemesini durdurur
											console.log("Sign out initiative..."); 
											if (onSignOut) {
												onSignOut(); // App.tsx'teki temizleyici fonksiyonu çağırır
											} else {
												console.error("onSignOut function is missing!");
											}
										}}
										className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
									>
										<CloseCircleIcon className="w-4 h-4" />
										{lang === 'tr' ? 'Çıkış Yap' : 'Sign Out'}
									</button>
                                </div>
                            </div>
                        )}

                        <div 
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-3 px-2 py-1 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent hover:ring-white/20 transition-all">
                                {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'ME'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-sm font-medium text-white truncate">{displayName}</div>
                                <div className="text-xs text-slate-500 truncate">{userEmail}</div>
                            </div>
                            <div className="text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
