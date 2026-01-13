
import React, { useState, useEffect } from 'react';
import { SearchIcon, GlobeIcon, RocketIcon, TrashIcon, HistoryIcon, GeneratorIcon, ScaleIcon, CheckCircleIcon, FireIcon, VideoIcon, SparklesIcon, CameraIcon } from './icons';
import { supabaseMock } from '../services/supabaseService';
import type { SavedRecord } from '../types';

interface DashboardProps {
    lang: 'en' | 'tr';
    onLoadReport: (record: SavedRecord) => void;
    onNewAudit: () => void;
    onNewMarket: () => void;
    onNewListing: () => void;
    userCredits: number;
    userPlan?: string;
    onOpenSubscription?: () => void;
    // New handlers for specific tools
    onGoToLaunchpad?: () => void;
    onGoToReelGen?: () => void;
    onGoToTrendRadar?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    lang, onLoadReport, onNewAudit, onNewMarket, onNewListing, userCredits, userPlan, onOpenSubscription,
    onGoToLaunchpad, onGoToReelGen, onGoToTrendRadar
}) => {
    const [history, setHistory] = useState<SavedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch history from Supabase on mount
    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            const data = await supabaseMock.db.getHistory();
            setHistory(data);
            setIsLoading(false);
        };
        fetchHistory();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Optimistic update
        setHistory(prev => prev.filter(h => h.id !== id));
        
        // DB call
        const success = await supabaseMock.db.deleteReport(id);
        if (!success) {
            // Revert if failed (optional, or just alert)
            alert("Failed to delete report.");
        }
    };

    // Helper to gate features
    const handleLockedAction = (action: () => void, requiredPlan: 'starter' | 'growth') => {
        if (!userPlan || userPlan === 'free') {
             if (onOpenSubscription) onOpenSubscription();
             return;
        }
        if (requiredPlan === 'growth' && userPlan === 'starter') {
             if (onOpenSubscription) onOpenSubscription();
             return;
        }
        action();
    };

    // --- TRANSLATIONS ---
    const t = {
        greeting: lang === 'tr' ? 'Yapay Zeka Komuta Merkezi' : 'AI Command Center',
        subtitle: lang === 'tr' 
            ? 'Sıradan satıcılar analiz eder. Liderler üretir. Hangi süper gücü kullanacaksın?' 
            : 'Average sellers analyze. Leaders generate. Which superpower will you use today?',
        
        // Killer Feature 1: Visual Launchpad -> NOW MAPPED TO LISTING GENERATOR
        f1Title: lang === 'tr' ? 'Görselden Listing Yazarı' : 'Visual to Listing',
        f1Badge: lang === 'tr' ? 'SEKTÖRDE İLK' : 'INDUSTRY FIRST',
        f1Desc: lang === 'tr' ? 'Fotoğrafı yükle, AI ürünü tanısın ve SEO uyumlu başlığı, etiketi saniyeler içinde yazsın.' : 'Upload a photo. AI recognizes the product and writes SEO titles & tags instantly.',
        
        // Killer Feature 2: ReelGen
        f2Title: lang === 'tr' ? 'ReelGen Video Stüdyosu' : 'ReelGen Video Studio',
        f2Badge: lang === 'tr' ? 'YENİ & POPÜLER' : 'VIRAL MAKER',
        f2Desc: lang === 'tr' ? 'Tek bir fotoğraftan, sosyal medya için viral olmaya hazır videolar üret.' : 'Turn a single static photo into a viral-ready video for TikTok & Etsy.',
        
        // Killer Feature 3: TrendRadar
        f3Title: lang === 'tr' ? 'TrendRadar (Geleceği Gör)' : 'TrendRadar (Predict)',
        f3Badge: lang === 'tr' ? 'AJANS ÖZEL' : 'AGENCY ONLY',
        f3Desc: lang === 'tr' ? 'Reddit ve TikTok sinyallerini tarayarak patlamak üzere olan nişleri 48 saat önceden yakala.' : 'Scan Reddit & TikTok signals to catch exploding niches 48h before everyone else.',

        // Core Tools
        coreTitle: lang === 'tr' ? 'Temel Araçlar' : 'Core Essentials',
        audit: lang === 'tr' ? 'Mağaza Denetimi' : 'Shop Audit',
        spy: lang === 'tr' ? 'Rakip Casusu' : 'Competitor Spy',
        history: lang === 'tr' ? 'Son İşlemler' : 'Recent Activity',
        loading: lang === 'tr' ? 'Veriler yükleniyor...' : 'Loading data...'
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 no-print">
            
            {/* 1. HERO HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                        {t.greeting}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                        {t.subtitle}
                    </p>
                </div>
                {/* Credit Display */}
                <div className="hidden md:flex items-center gap-4 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-xl">
                    <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Credits</div>
                        <div className="text-2xl font-black text-white">{userCredits}</div>
                    </div>
                    <button onClick={onOpenSubscription} className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
                        <span className="text-white font-bold text-xl">+</span>
                    </button>
                </div>
            </div>

            {/* 2. KILLER FEATURES (The "Wow" Factor) */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* CARD 1: VISUAL LISTING WRITER (Mapped to Optimizer) */}
                <div 
                    onClick={onNewListing}
                    className="group relative h-80 bg-[#0F172A] border border-gray-800 hover:border-pink-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-pink-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl group-hover:bg-pink-600/20 transition-colors"></div>
                        <div className="absolute top-16 left-8 right-8 bottom-24 flex items-center justify-center gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-20 h-24 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center relative overflow-hidden">
                                <CameraIcon className="w-8 h-8 text-gray-500" />
                                <div className="absolute top-0 left-0 w-full h-1 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)] animate-scan"></div>
                            </div>
                            <div className="text-gray-600">➔</div>
                            <div className="w-24 h-24 bg-gray-900 rounded-lg border border-gray-700 p-2 space-y-2">
                                <div className="h-2 bg-gray-700 rounded w-full animate-pulse"></div>
                                <div className="h-2 bg-gray-700 rounded w-3/4 animate-pulse delay-75"></div>
                                <div className="h-2 bg-gray-700 rounded w-1/2 animate-pulse delay-100"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-2 bg-pink-500/20 rounded-lg">
                                <SparklesIcon className="w-6 h-6 text-pink-500" />
                            </div>
                            <span className="text-[10px] font-extrabold bg-pink-600 text-white px-2 py-1 rounded uppercase tracking-wider shadow-lg shadow-pink-900/50">
                                {t.f1Badge}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{t.f1Title}</h3>
                        <p className="text-sm text-gray-400 leading-snug">{t.f1Desc}</p>
                    </div>
                </div>

                {/* CARD 2: REELGEN (Video Studio) */}
                <div 
                    onClick={onGoToReelGen}
                    className="group relative h-80 bg-[#0F172A] border border-gray-800 hover:border-purple-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pb-12 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full border-2 border-purple-500/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-black/30 backdrop-blur-sm">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-purple-500 border-b-[10px] border-b-transparent ml-1"></div>
                            </div>
                            <div className="w-48 h-8 flex items-end gap-1">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-3 bg-purple-500/30 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <VideoIcon className="w-6 h-6 text-purple-500" />
                            </div>
                            <span className="text-[10px] font-extrabold bg-purple-600 text-white px-2 py-1 rounded uppercase tracking-wider shadow-lg shadow-purple-900/50">
                                {t.f2Badge}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{t.f2Title}</h3>
                        <p className="text-sm text-gray-400 leading-snug">{t.f2Desc}</p>
                    </div>
                </div>

                {/* CARD 3: TREND RADAR */}
                <div 
                    onClick={onGoToTrendRadar}
                    className="group relative h-80 bg-[#0F172A] border border-gray-800 hover:border-green-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-green-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-600/10 rounded-full blur-3xl group-hover:bg-green-600/20 transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center pb-12">
                            <div className="relative w-40 h-40 rounded-full border border-green-500/20 flex items-center justify-center">
                                <div className="absolute w-full h-full border border-green-500/10 rounded-full scale-75"></div>
                                <div className="absolute w-full h-full border border-green-500/10 rounded-full scale-50"></div>
                                <div className="w-1/2 h-1/2 bg-gradient-to-r from-transparent to-green-500/20 absolute top-0 right-0 rounded-tr-full origin-bottom-left animate-spin" style={{ animationDuration: '3s' }}></div>
                                <div className="w-2 h-2 bg-green-400 rounded-full absolute top-8 right-10 animate-ping"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <FireIcon className="w-6 h-6 text-green-500" />
                            </div>
                            <span className="text-[10px] font-extrabold bg-gray-800 border border-gray-600 text-gray-300 px-2 py-1 rounded uppercase tracking-wider">
                                {t.f3Badge}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{t.f3Title}</h3>
                        <p className="text-sm text-gray-400 leading-snug">{t.f3Desc}</p>
                    </div>
                </div>
            </div>

            {/* 3. CORE TOOLS (Smaller Grid) */}
            <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">
                    {t.coreTitle}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Shop Audit */}
                    <button 
                        onClick={onNewAudit}
                        className="flex items-center gap-4 p-4 bg-[#161b28] border border-gray-700/50 hover:border-blue-500 rounded-2xl transition-all group text-left"
                    >
                        <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <SearchIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">{t.audit}</h4>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300">Find & fix traffic leaks.</p>
                        </div>
                    </button>

                    {/* Competitor Spy */}
                    <button 
                        onClick={() => handleLockedAction(() => {}, 'starter')} 
                        className="flex items-center gap-4 p-4 bg-[#161b28] border border-gray-700/50 hover:border-red-500 rounded-2xl transition-all group text-left"
                    >
                        <div className="w-12 h-12 bg-red-900/20 rounded-xl flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <ScaleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">{t.spy}</h4>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300">Reverse-engineer top sellers.</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* 4. RECENT ACTIVITY TABLE (Simplified) */}
            <div className="pt-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4" /> {t.history}
                </h2>
                
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 animate-pulse">{t.loading}</div>
                ) : history.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-800 rounded-2xl text-gray-500">
                        No activity yet. Start with the tools above.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.slice(0, 5).map((record) => (
                            <div 
                                key={record.id}
                                onClick={() => onLoadReport(record)}
                                className="group bg-[#161b28] hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center
                                        ${record.type === 'audit' ? 'bg-blue-500/10 text-blue-400' : 
                                          record.type === 'trend' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}
                                    `}>
                                        {record.type === 'audit' ? <SearchIcon className="w-5 h-5" /> : 
                                         record.type === 'trend' ? <FireIcon className="w-5 h-5" /> :
                                         <GeneratorIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm group-hover:text-white">{record.title || "Untitled Project"}</h4>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                            <span className="uppercase tracking-wider">{record.type}</span>
                                            <span>•</span>
                                            <span>{new Date(record.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(record.id, e)}
                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
