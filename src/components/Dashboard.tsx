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
        setHistory(prev => prev.filter(h => h.id !== id));
        const success = await supabaseMock.db.deleteReport(id);
        if (!success) alert("Failed to delete report.");
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
        f1Title: lang === 'tr' ? 'Görselden Listing' : 'Visual to Listing',
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
        spy: lang === 'tr' ? 'Rakip Casusu' : 'Competitor Spy',
        history: lang === 'tr' ? 'Son İşlemler' : 'Recent Activity',
        loading: lang === 'tr' ? 'Veriler yükleniyor...' : 'Loading data...'
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12 no-print">
            
            {/* KILLER FEATURES - Daha küçük ve kompakt */}
            <div className="grid lg:grid-cols-3 gap-4">
                
                {/* CARD 1: VISUAL LISTING */}
                <div 
                    onClick={onNewListing}
                    className="group relative h-56 bg-[#0F172A] border border-gray-800 hover:border-pink-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-600/10 rounded-full blur-2xl group-hover:bg-pink-600/20 transition-colors"></div>
                        <div className="absolute top-10 left-6 right-6 bottom-16 flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-16 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center relative overflow-hidden">
                                <CameraIcon className="w-6 h-6 text-gray-500" />
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,1)] animate-scan"></div>
                            </div>
                            <div className="text-gray-600 text-sm">→</div>
                            <div className="w-16 h-16 bg-gray-900 rounded-lg border border-gray-700 p-2 space-y-1.5">
                                <div className="h-1.5 bg-gray-700 rounded w-full animate-pulse"></div>
                                <div className="h-1.5 bg-gray-700 rounded w-3/4 animate-pulse delay-75"></div>
                                <div className="h-1.5 bg-gray-700 rounded w-1/2 animate-pulse delay-100"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="p-1.5 bg-pink-500/20 rounded-lg">
                                <SparklesIcon className="w-4 h-4 text-pink-500" />
                            </div>
                            <span className="text-[9px] font-extrabold bg-pink-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-pink-900/50">
                                {t.f1Badge}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-0.5">{t.f1Title}</h3>
                        <p className="text-xs text-gray-400 leading-tight line-clamp-2">{t.f1Desc}</p>
                    </div>
                </div>

                {/* CARD 2: REELGEN */}
                <div 
                    onClick={onGoToReelGen}
                    className="group relative h-56 bg-[#0F172A] border border-gray-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-colors"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full border-2 border-purple-500/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-black/30 backdrop-blur-sm">
                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-purple-500 border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                            <div className="w-32 h-6 flex items-end gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="w-2 bg-purple-500/30 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                <VideoIcon className="w-4 h-4 text-purple-500" />
                            </div>
                            <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-purple-900/50">
                                {t.f2Badge}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-0.5">{t.f2Title}</h3>
                        <p className="text-xs text-gray-400 leading-tight line-clamp-2">{t.f2Desc}</p>
                    </div>
                </div>

                {/* CARD 3: TREND RADAR */}
                <div 
                    onClick={onGoToTrendRadar}
                    className="group relative h-56 bg-[#0F172A] border border-gray-800 hover:border-green-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-green-900/20 cursor-pointer"
                >
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-600/10 rounded-full blur-2xl group-hover:bg-green-600/20 transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center pb-8">
                            <div className="relative w-28 h-28 rounded-full border border-green-500/20 flex items-center justify-center">
                                <div className="absolute w-full h-full border border-green-500/10 rounded-full scale-75"></div>
                                <div className="absolute w-full h-full border border-green-500/10 rounded-full scale-50"></div>
                                <div className="w-1/2 h-1/2 bg-gradient-to-r from-transparent to-green-500/20 absolute top-0 right-0 rounded-tr-full origin-bottom-left animate-spin" style={{ animationDuration: '3s' }}></div>
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full absolute top-6 right-8 animate-ping"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent z-10">
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="p-1.5 bg-green-500/20 rounded-lg">
                                <FireIcon className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="text-[9px] font-extrabold bg-gray-800 border border-gray-600 text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {t.f3Badge}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-0.5">{t.f3Title}</h3>
                        <p className="text-xs text-gray-400 leading-tight line-clamp-2">{t.f3Desc}</p>
                    </div>
                </div>
            </div>

            {/* CORE TOOLS - Daha küçük */}
            <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-1.5">
                    {t.coreTitle}
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                    <button 
                        onClick={onNewAudit}
                        className="flex items-center gap-3 p-3 bg-[#161b28] border border-gray-700/50 hover:border-blue-500 rounded-xl transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <SearchIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{t.audit}</h4>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300">Find & fix traffic leaks.</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => handleLockedAction(() => {}, 'starter')} 
                        className="flex items-center gap-3 p-3 bg-[#161b28] border border-gray-700/50 hover:border-red-500 rounded-xl transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-red-900/20 rounded-lg flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <ScaleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{t.spy}</h4>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300">Reverse-engineer top sellers.</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* RECENT ACTIVITY - Daha kompakt */}
            <div className="pt-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <HistoryIcon className="w-3.5 h-3.5" /> {t.history}
                </h2>
                
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500 text-sm animate-pulse">{t.loading}</div>
                ) : history.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-gray-800 rounded-xl text-gray-500 text-sm">
                        No activity yet. Start with the tools above.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {history.slice(0, 5).map((record) => (
                            <div 
                                key={record.id}
                                onClick={() => onLoadReport(record)}
                                className="group bg-[#161b28] hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-lg p-3 flex items-center justify-between cursor-pointer transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center
                                        ${record.type === 'audit' ? 'bg-blue-500/10 text-blue-400' : 
                                          record.type === 'trend' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}
                                    `}>
                                        {record.type === 'audit' ? <SearchIcon className="w-4 h-4" /> : 
                                         record.type === 'trend' ? <FireIcon className="w-4 h-4" /> :
                                         <GeneratorIcon className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm group-hover:text-white">{record.title || "Untitled Project"}</h4>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                            <span className="uppercase tracking-wider">{record.type}</span>
                                            <span>•</span>
                                            <span>{new Date(record.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(record.id, e)}
                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
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