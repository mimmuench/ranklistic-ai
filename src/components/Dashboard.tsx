import React, { useState, useEffect } from 'react';
import { SearchIcon, GlobeIcon, RocketIcon, TrashIcon, HistoryIcon, GeneratorIcon, ScaleIcon, CheckCircleIcon, FireIcon, VideoIcon, SparklesIcon, CameraIcon, BrandIcon } from './icons';
import { supabase } from '../services/client'; // ✅ DÜZELTİLDİ: Doğru import yolu
import type { SavedRecord } from '../types';

interface DashboardProps {
    lang: 'en' | 'tr';
    onLoadReport: (record: SavedRecord) => void;
    onNewAudit: () => void;
    onNewMarket: () => void;
    onNewListing: () => void;
    onNewAmazon: () => void;
    onNewDigital: () => void;
    userCredits: number;
    userPlan?: string;
    onOpenSubscription?: () => void;
    setActiveTab: (tab: any) => void;
    onGoToLaunchpad?: () => void;
    onGoToReelGen?: () => void;
    onGoToTrendRadar?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    lang, onLoadReport, onNewAudit, onNewMarket, onNewListing, onNewAmazon, onNewDigital,
    userCredits, userPlan, onOpenSubscription,
    setActiveTab, onGoToLaunchpad, onGoToReelGen, onGoToTrendRadar
}) => {
    const [history, setHistory] = useState<SavedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch history from Supabase
    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data, error } = await supabase
                        .from('saved_reports')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (!error && data) {
                        setHistory(data);
                    } else if (error) {
                        console.error("Veri çekme hatası:", error.message);
                    }
                }
            } catch (err) {
                console.error("Dashboard yüklenirken hata oluştu:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setHistory(prev => prev.filter(h => h.id !== id));
        
        try {
            await supabase.from('saved_reports').delete().eq('id', id);
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    };

    const getRecordIcon = (type: string) => {
        switch (type) {
            case 'audit': return <SearchIcon className="w-5 h-5 text-blue-400" />;
            case 'listing': return <GeneratorIcon className="w-5 h-5 text-orange-400" />;
            case 'amazon': return <BrandIcon className="w-5 h-5 text-yellow-500" />;
            case 'digital': return <RocketIcon className="w-5 h-5 text-indigo-400" />;
            case 'trend': return <FireIcon className="w-5 h-5 text-green-400" />;
            default: return <HistoryIcon className="w-5 h-5 text-gray-400" />;
        }
    };

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

    const t = {
        greeting: lang === 'tr' ? 'Yapay Zeka Komuta Merkezi' : 'AI Command Center',
        subtitle: lang === 'tr' 
            ? 'Sıradan satıcılar analiz eder. Liderler üretir. Hangi süper gücü kullanacaksın?' 
            : 'Average sellers analyze. Leaders generate. Which superpower will you use today?',
        
        f1Title: lang === 'tr' ? 'Görselden Listing Yazarı' : 'Visual to Listing',
        f1Badge: lang === 'tr' ? 'SEKTÖRDE İLK' : 'INDUSTRY FIRST',
        f1Desc: lang === 'tr' ? 'Fotoğrafı yükle, AI ürünü tanısın ve SEO uyumlu başlığı, etiketi saniyeler içinde yazsın.' : 'Upload a photo. AI recognizes the product and writes SEO titles & tags instantly.',
        
        f2Title: lang === 'tr' ? 'ReelGen Video Stüdyosu' : 'ReelGen Video Studio',
        f2Badge: lang === 'tr' ? 'YENİ & POPÜLER' : 'VIRAL MAKER',
        f2Desc: lang === 'tr' ? 'Tek bir fotoğraftan, sosyal medya için viral olmaya hazır videolar üret.' : 'Turn a single static photo into a viral-ready video for TikTok & Etsy.',
        
        f3Title: lang === 'tr' ? 'TrendRadar (Geleceği Gör)' : 'TrendRadar (Predict)',
        f3Badge: lang === 'tr' ? 'AJANS ÖZEL' : 'AGENCY ONLY',
        f3Desc: lang === 'tr' ? 'Reddit ve TikTok sinyallerini tarayarak patlamak üzere olan nişleri 48 saat önceden yakala.' : 'Scan Reddit & TikTok signals to catch exploding niches 48h before everyone else.',

        coreTitle: lang === 'tr' ? 'Temel Araçlar' : 'Core Essentials',
        audit: lang === 'tr' ? 'Mağaza Denetimi' : 'Shop Audit',
        amazon: lang === 'tr' ? 'Amazon A9' : 'Amazon A9',
        digital: lang === 'tr' ? 'Etsy Dijital' : 'Etsy Digital',
        spy: lang === 'tr' ? 'Rakip Casusu' : 'Competitor Spy',
        history: lang === 'tr' ? 'Son İşlemler' : 'Recent Activity',
        loading: lang === 'tr' ? 'Veriler yükleniyor...' : 'Loading data...'
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 no-print">
            
            {/* HERO HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                        {t.greeting}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                        {t.subtitle}
                    </p>
                </div>
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
			
            {/* KILLER FEATURES */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* CARD 1: VISUAL LISTING WRITER */}
                <div 
                    id="tour-visual-writer" // ✅ ID EKLENDİ
                    onClick={onNewListing}
                    className="group relative h-80 bg-[#0F172A] border border-gray-800 hover:border-pink-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-pink-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl group-hover:bg-pink-600/20 transition-colors"></div>
                        <div className="absolute top-12 left-6 right-6 bottom-20 flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-20 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center relative overflow-hidden">
                                <CameraIcon className="w-6 h-6 text-gray-500" />
                                <div className="absolute top-0 left-0 w-full h-1 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)] animate-scan"></div>
                            </div>
                            <div className="text-gray-700 text-xs">➔</div>
                            <div className="w-20 h-20 bg-gray-900 rounded-lg border border-gray-700 p-1.5 space-y-1.5">
                                <div className="h-1.5 bg-gray-700 rounded w-full animate-pulse"></div>
                                <div className="h-1.5 bg-gray-700 rounded w-3/4 animate-pulse delay-75"></div>
                                <div className="h-1.5 bg-gray-700 rounded w-1/2 animate-pulse delay-100"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-2 bg-pink-500/20 rounded-lg">
                                <SparklesIcon className="w-6 h-6 text-pink-500" />
                            </div>
                            <span className="text-[10px] font-extrabold bg-pink-600 text-white px-2 py-1 rounded uppercase tracking-wider">
                                {t.f1Badge}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{t.f1Title}</h3>
                        <p className="text-sm text-gray-400 leading-snug">{t.f1Desc}</p>
                    </div>
                </div>
				
                {/* CARD 2: REELGEN VIDEO STUDIO */}
                <div 
                    onClick={onGoToReelGen}
                    className="group relative h-80 bg-[#0F172A] border border-gray-800 hover:border-purple-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pb-10 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full border-2 border-purple-500/50 flex items-center justify-center mb-3 bg-black/30 backdrop-blur-sm">
                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-purple-500 border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <VideoIcon className="w-6 h-6 text-purple-500" />
                            </div>
                            <span className="text-[10px] font-extrabold bg-purple-600 text-white px-2 py-1 rounded uppercase tracking-wider">
                                {t.f2Badge}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{t.f2Title}</h3>
                        <p className="text-sm text-gray-400 leading-snug">{t.f2Desc}</p>
                    </div>
                </div>
                
                {/* CARD 3: TREND RADAR */}
                <div 
                    id="tour-trend-radar" // ✅ ID EKLENDİ
                    onClick={onGoToTrendRadar}
                    className="group relative h-80 bg-[#0F172A] border border-gray-800 hover:border-green-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-green-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-600/10 rounded-full blur-3xl group-hover:bg-green-600/20 transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center pb-10">
                            <div className="relative w-28 h-28 rounded-full border border-green-500/20 flex items-center justify-center">
                                <div className="absolute w-full h-full border border-green-500/10 rounded-full scale-75"></div>
                                <div className="absolute w-full h-full border border-green-500/10 rounded-full scale-50"></div>
                                <div className="w-1/2 h-1/2 bg-gradient-to-r from-transparent to-green-500/20 absolute top-0 right-0 rounded-tr-full origin-bottom-left animate-spin" style={{ animationDuration: '3s' }}></div>
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full absolute top-6 right-8 animate-ping"></div>
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

            {/* CORE TOOLS */}
            <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">
                    {t.coreTitle}
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <button 
                        onClick={onNewAudit}
                        className="flex items-center gap-3 p-3 bg-[#161b28] border border-gray-700/50 hover:border-blue-500 rounded-xl transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <SearchIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{t.audit}</h4>
                            <p className="text-[9px] text-gray-400">Fix traffic leaks.</p>
                        </div>
                    </button>

                    <button 
                        onClick={onNewDigital}
                        className="flex items-center gap-3 p-3 bg-[#161b28] border border-gray-700/50 hover:border-indigo-500 rounded-xl transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <RocketIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{t.digital}</h4>
                            <p className="text-[9px] text-gray-400">Passive income mastery.</p>
                        </div>
                    </button>

                    <button 
                        onClick={onNewAmazon}
                        className="flex items-center gap-3 p-3 bg-[#161b28] border border-gray-700/50 hover:border-yellow-500 rounded-xl transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-yellow-900/20 rounded-lg flex items-center justify-center text-yellow-500 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                            <BrandIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{t.amazon}</h4>
                            <p className="text-[9px] text-gray-400">A9 algorithm ready.</p>
                        </div>
                    </button>

                    <button 
                        onClick={onNewMarket}
                        className="flex items-center gap-3 p-3 bg-[#161b28] border border-gray-700/50 hover:border-green-500 rounded-xl transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-green-900/20 rounded-lg flex items-center justify-center text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <GlobeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Market Scan</h4>
                            <p className="text-[9px] text-gray-400">Find global blue oceans.</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* RECENT ACTIVITY */}
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
                        {history.map((record) => (
                            <div 
                                key={record.id}
                                onClick={() => onLoadReport(record)}
                                className="group bg-[#161b28] hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900 border border-white/5">
                                        {getRecordIcon(record.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm group-hover:text-white">{record.title || "Untitled Project"}</h4>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                            <span className="uppercase tracking-wider font-black text-orange-500/80">{record.type}</span>
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