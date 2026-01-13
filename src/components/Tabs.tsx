
import React from 'react';
import { SearchIcon, GeneratorIcon, ScaleIcon, RocketIcon, LightbulbIcon, GlobeIcon, HomeIcon, KeyIcon, FireIcon, VideoIcon } from './icons';

type ActiveTab = 'dashboard' | 'audit' | 'optimizer' | 'competitor' | 'launchpad' | 'newShop' | 'market' | 'keywords' | 'trendRadar' | 'reelGen';

interface TabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: 'en' | 'tr';
}

const translations = {
  en: {
    dashboard: "Dashboard",
    optimizer: "Listing Generator", // Main Tool
    audit: "Shop Audit",
    launchpad: "Visual Analyzer",
    competitor: "Competitor Spy",
    market: "Global Market",
    keywords: "SEO Keywords",
    newShop: "Name & Idea",
    trendRadar: "Trend Radar",
    reelGen: "Video Studio"
  },
  tr: {
    dashboard: "Panel",
    optimizer: "Listing Oluşturucu", // Ana Araç
    audit: "Mağaza Denetimi",
    launchpad: "Görsel Analiz",
    competitor: "Rakip Casusu",
    market: "Pazar Analizi",
    keywords: "SEO Kelimeler",
    newShop: "İsim & Fikir",
    trendRadar: "Trend Radar",
    reelGen: "Video Studio"
  }
};

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, lang }) => {
  const t = translations[lang];

  const TabButton = ({ id, icon, label, isPrimary = false, colorClass = "text-gray-400" }: { id: ActiveTab, icon: React.ReactNode, label: string, isPrimary?: boolean, colorClass?: string }) => {
      const isActive = activeTab === id;
      
      // Primary Tab (Listing Generator) - Hero Style
      if (isPrimary) {
          return (
            <button 
                onClick={() => setActiveTab(id)}
                className={`
                    relative group flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 shadow-xl overflow-hidden
                    ${isActive 
                        ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white ring-2 ring-orange-400/50 ring-offset-2 ring-offset-[#0B0F19]' 
                        : 'bg-[#151b2b] border border-white/5 text-gray-300 hover:bg-[#1c2438] hover:text-white hover:border-white/10'}
                `}
            >
                {isActive && <div className="absolute inset-0 bg-white/20 blur-lg mix-blend-overlay"></div>}
                
                <div className={`relative z-10 ${isActive ? 'text-white' : 'text-orange-500 group-hover:text-orange-400'} transition-colors transform group-hover:scale-110 duration-200`}>
                    {icon}
                </div>
                <div className="flex flex-col items-start relative z-10">
                    <span className={`text-sm md:text-base font-bold uppercase tracking-wide ${isActive ? 'text-white' : 'text-gray-200'}`}>
                        {label}
                    </span>
                    <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-500'} hidden md:block`}>
                        {isActive ? 'Active Tool' : 'Core Feature'}
                    </span>
                </div>
            </button>
          );
      }

      // Standard Tabs - Modern Pill Style
      return (
        <button 
            onClick={() => setActiveTab(id)}
            className={`
                group relative flex flex-col md:flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 border
                ${isActive 
                    ? 'bg-[#1c2438] border-blue-500/50 text-white shadow-lg shadow-blue-900/20 transform -translate-y-1' 
                    : 'bg-transparent border-transparent text-gray-500 hover:bg-[#151b2b] hover:text-gray-300 hover:border-white/5'}
            `}
        >
            <div className={`transition-colors duration-300 ${isActive ? colorClass : 'text-gray-600 group-hover:text-gray-400'}`}>
                {icon}
            </div>
            <span className="text-xs md:text-sm font-semibold text-center whitespace-nowrap">{label}</span>
            
            {/* Active Indicator Dot */}
            {isActive && (
                <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
            )}
        </button>
      );
  };

  return (
    <div className="w-full mb-10">
        {/* Main Navigation Container */}
        <div className="flex flex-col gap-6">
            
            {/* Row 1: High Level Navigation */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#151b2b]/60 backdrop-blur-sm p-2 rounded-3xl border border-white/5 shadow-2xl">
                
                {/* Dashboard Button */}
                <div className="flex-shrink-0">
                     <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all h-full ${activeTab === 'dashboard' ? 'bg-[#1c2438] text-white border border-blue-500/30 shadow-inner' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <HomeIcon className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-blue-400' : ''}`} />
                        <span className="font-bold tracking-wide">{t.dashboard}</span>
                    </button>
                </div>

                <div className="w-px h-10 bg-white/5 hidden md:block"></div>

                {/* THE BIG HERO BUTTON */}
                <div className="flex-1 flex justify-center md:justify-start">
                    <TabButton 
                        id="optimizer" 
                        icon={<GeneratorIcon className="w-7 h-7" />} 
                        label={t.optimizer} 
                        isPrimary={true} 
                    />
                </div>
            </div>

            {/* Row 2: Tool Belt */}
            <div className="bg-[#151b2b]/40 backdrop-blur-md p-4 rounded-3xl border border-white/5 overflow-x-auto no-scrollbar">
                <div className="flex flex-nowrap md:flex-wrap items-center gap-2 min-w-max md:min-w-0 md:justify-center lg:justify-start">
                     <span className="text-[10px] uppercase font-bold text-gray-600 mr-2 hidden lg:block tracking-widest">Research</span>
                     <TabButton id="trendRadar" icon={<FireIcon className="w-5 h-5" />} label={t.trendRadar} colorClass="text-green-400" />
                     <TabButton id="keywords" icon={<KeyIcon className="w-5 h-5" />} label={t.keywords} colorClass="text-purple-400" />
                     <TabButton id="market" icon={<GlobeIcon className="w-5 h-5" />} label={t.market} colorClass="text-blue-400" />
                     <TabButton id="competitor" icon={<ScaleIcon className="w-5 h-5" />} label={t.competitor} colorClass="text-red-400" />
                     
                     <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
                     
                     <span className="text-[10px] uppercase font-bold text-gray-600 mr-2 hidden lg:block tracking-widest">Optimize</span>
                     <TabButton id="reelGen" icon={<VideoIcon className="w-5 h-5" />} label={t.reelGen} colorClass="text-pink-500" />
                     <TabButton id="audit" icon={<SearchIcon className="w-5 h-5" />} label={t.audit} colorClass="text-orange-400" />
                     <TabButton id="launchpad" icon={<RocketIcon className="w-5 h-5" />} label={t.launchpad} colorClass="text-pink-400" />
                     
                     <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
                     
                     <span className="text-[10px] uppercase font-bold text-gray-600 mr-2 hidden lg:block tracking-widest">Start</span>
                     <TabButton id="newShop" icon={<LightbulbIcon className="w-5 h-5" />} label={t.newShop} colorClass="text-yellow-400" />
                </div>
            </div>
        </div>
    </div>
  );
};
