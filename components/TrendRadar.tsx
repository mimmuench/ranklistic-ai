
import React, { useState } from 'react';
import { TrendingUpIcon, SparklesIcon, FireIcon, CheckCircleIcon, SearchIcon, RocketIcon, LightbulbIcon, BrandIcon, GeneratorIcon, PaperClipIcon } from './icons';
import { runTrendRadarAnalysis } from '../services/geminiService';
import type { TrendRadarResult, TrendItem, OptimizerTransferData } from '../types';

interface TrendRadarProps {
    lang: 'en' | 'tr';
    onUseTrend: (data: OptimizerTransferData) => void;
}

const TrendCard: React.FC<{ trend: TrendItem; lang: 'en' | 'tr'; index: number; onUseTrend: (data: OptimizerTransferData) => void }> = ({ trend, lang, index, onUseTrend }) => {
    // Styling based on status/rank
    let accentColor = "from-purple-500 to-indigo-600";
    let borderColor = "border-purple-500/30";
    let bgGlow = "bg-purple-500/5";
    
    if (index === 0) { // Top trend
        accentColor = "from-orange-500 to-pink-600";
        borderColor = "border-orange-500/50";
        bgGlow = "bg-orange-500/10";
    } else if (index === 1) {
        accentColor = "from-blue-500 to-cyan-500";
        borderColor = "border-blue-500/30";
        bgGlow = "bg-blue-500/5";
    }

    const t = {
        products: lang === 'tr' ? 'Üretilecekler' : 'Make These',
        vibe: lang === 'tr' ? 'Mağaza Havası' : 'Shop Vibe',
        audience: lang === 'tr' ? 'Hedef Kitle' : 'Target Audience',
        btnCreate: lang === 'tr' ? 'Bu Trendi Listele' : 'Create This Listing',
        btnVisual: lang === 'tr' ? 'AI Görsel İstemi' : 'Copy Visual Prompt',
        copied: lang === 'tr' ? 'Kopyalandı!' : 'Copied!',
    };

    const [copied, setCopied] = useState(false);

    const handleCopyPrompt = () => {
        // Construct a prompt if not provided by AI, or use AI's suggestions if available
        const prompt = `Hyper-realistic product photography of a ${trend.actionPlan.productsToMake[0]} in the style of ${trend.actionPlan.shopVibe}, ${trend.name} aesthetic, studio lighting, high resolution, 8k --ar 4:5`;
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateListing = () => {
        onUseTrend({
            mode: 'text',
            titleSuggestion: `${trend.name} Aesthetic ${trend.actionPlan.productsToMake[0]} - ${trend.actionPlan.shopVibe}`,
            niche: 'custom',
            trendContext: `
                **TREND:** ${trend.name}
                **VIBE:** ${trend.actionPlan.shopVibe}
                **TARGET AUDIENCE:** ${trend.actionPlan.targetAudience}
                **KEY PRODUCT:** ${trend.actionPlan.productsToMake[0]}
                **MARKETING HOOK:** ${trend.actionPlan.marketingHook}
            `
        });
    };

    return (
        <div className={`relative bg-[#111827] border ${borderColor} rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-2xl flex flex-col h-full`}>
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${accentColor} opacity-10 blur-[80px] rounded-full pointer-events-none group-hover:opacity-20 transition-opacity`}></div>
            
            {/* Header */}
            <div className={`p-6 border-b border-gray-800 relative z-10 bg-gradient-to-r ${index === 0 ? 'from-orange-900/20' : 'from-gray-900'} to-transparent`}>
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-black/40 border ${borderColor} text-white`}>
                        Rank #{index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                        <FireIcon className={`w-4 h-4 ${index === 0 ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`} />
                        <span className="font-bold text-white">{trend.viralityScore}</span>
                    </div>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">{trend.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-3">{trend.description}</p>
            </div>

            {/* Signals */}
            <div className="px-6 py-3 bg-black/20 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-800/50">
                {trend.signals.map((sig, i) => (
                    <span key={i} className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <SearchIcon className="w-3 h-3 opacity-50" /> {sig}
                    </span>
                ))}
            </div>

            {/* Action Plan Body */}
            <div className="p-6 space-y-6 relative z-10 flex-1 flex flex-col">
                {/* 1. Products to Make */}
                <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-3 flex items-center gap-2">
                        <RocketIcon className="w-3 h-3 text-white" /> {t.products}
                    </div>
                    <ul className="space-y-2">
                        {trend.actionPlan.productsToMake.map((prod, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                                <CheckCircleIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${index === 0 ? 'text-orange-500' : 'text-blue-500'}`} />
                                <span className="border-b border-gray-700/50 pb-1 w-full">{prod}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 2. Vibe & Audience Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                            <BrandIcon className="w-3 h-3" /> {t.vibe}
                        </div>
                        <div className="text-xs text-white font-medium">{trend.actionPlan.shopVibe}</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                            <LightbulbIcon className="w-3 h-3" /> {t.audience}
                        </div>
                        <div className="text-xs text-white font-medium">{trend.actionPlan.targetAudience}</div>
                    </div>
                </div>

                {/* 3. Marketing Hook - Push to bottom */}
                <div className={`mt-auto p-4 rounded-xl border border-dashed border-gray-600 bg-gradient-to-r ${bgGlow} to-transparent`}>
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Marketing Hook</div>
                    <p className="text-xs text-white italic">"{trend.actionPlan.marketingHook}"</p>
                </div>
            </div>

            {/* ACTION FOOTER - The Bridge to Execution */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 grid grid-cols-2 gap-3">
                <button 
                    onClick={handleCopyPrompt}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                >
                    {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <PaperClipIcon className="w-4 h-4"/>}
                    {copied ? t.copied : t.btnVisual}
                </button>
                <button 
                    onClick={handleCreateListing}
                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${index === 0 ? 'from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500' : 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'} shadow-lg transition-all`}
                >
                    <GeneratorIcon className="w-4 h-4" />
                    {t.btnCreate}
                </button>
            </div>
        </div>
    );
};

export const TrendRadar: React.FC<TrendRadarProps> = ({ lang, onUseTrend }) => {
    const [niche, setNiche] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TrendRadarResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const t = {
        title: lang === 'tr' ? "TrendRadar: Geleceği Tahmin Et" : "TrendRadar: Predictive Viral Tool",
        subtitle: lang === 'tr' ? "Reddit, Twitter ve TikTok'taki gizli sinyalleri tarayarak patlamak üzere olan mikro trendleri 48 saat önceden yakala." : "Scan Reddit, Twitter, and TikTok signals to catch micro-trends 48 hours before they explode.",
        inputPlaceholder: lang === 'tr' ? "Niş gir veya boş bırak (Keşif Modu)" : "Enter niche or leave empty for Discovery Mode",
        btnAnalyze: lang === 'tr' ? "Nişi Tara" : "Scan Niche",
        btnDiscover: lang === 'tr' ? "Yeni Fikir Bul" : "Discover New",
        btnScanning: lang === 'tr' ? "Sinyaller Taranıyor..." : "Scanning Signals...",
        agencyBadge: "AGENCY EXCLUSIVE",
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const jsonStr = await runTrendRadarAnalysis(niche, lang);
            const data = JSON.parse(jsonStr);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(lang === 'tr' ? "Radar sinyal alamadı. Tekrar deneyin." : "Radar failed to acquire signal. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            
            {/* Agency Header Section */}
            <div className="text-center relative">
                <div className="inline-block bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-4 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    {t.agencyBadge}
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                    {t.title}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
                    {t.subtitle}
                </p>

                {/* Input Form */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-2 max-w-xl mx-auto flex shadow-2xl relative z-10">
                    <input 
                        type="text" 
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder={t.inputPlaceholder}
                        className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none placeholder-gray-600"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleScan}
                        disabled={isLoading}
                        className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <RocketIcon className="w-4 h-4" />
                        )}
                        {niche ? t.btnAnalyze : t.btnDiscover}
                    </button>
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-purple-500/10 to-transparent blur-[100px] -z-10 rounded-full"></div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl text-center max-w-md mx-auto backdrop-blur-sm">
                    {error}
                </div>
            )}

            {/* Results Grid */}
            {result && (
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 items-stretch">
                    {result.trends.map((trend, i) => (
                        <div key={i} className="animate-fade-in-up h-full" style={{ animationDelay: `${i * 150}ms` }}>
                            <TrendCard trend={trend} lang={lang} index={i} onUseTrend={onUseTrend} />
                        </div>
                    ))}
                </div>
            )}
            
            {/* Loading State Skeleton */}
            {isLoading && (
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#111827] border border-gray-800 rounded-3xl h-[500px] animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full animate-scan"></div>
                            <div className="p-6 border-b border-gray-800">
                                <div className="h-8 w-3/4 bg-gray-800 rounded mb-2"></div>
                                <div className="h-4 w-full bg-gray-800 rounded"></div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="h-4 w-1/2 bg-gray-800 rounded"></div>
                                <div className="h-4 w-2/3 bg-gray-800 rounded"></div>
                                <div className="h-20 bg-gray-800 rounded mt-8"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};