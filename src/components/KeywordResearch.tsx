
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KeyIcon, SearchIcon, ChatBubbleIcon, SparklesIcon, CloseIcon, CheckCircleIcon, RocketIcon, FireIcon, TrendingUpIcon, PinterestIcon, BrandIcon, SaveIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';
import { runKeywordAnalysis } from '../services/geminiService';
import type { KeywordAnalysisResult, ChatMessage } from '../types';

interface KeywordResearchProps {
    lang: 'en' | 'tr';
}

// Simple Visual Component for Trend Lines
const TrendSparkline: React.FC<{ direction: 'Up' | 'Stable' | 'Down' }> = ({ direction }) => {
    let path = "";
    let color = "";
    
    if (direction === 'Up') {
        path = "M0 20 Q 10 20, 20 15 T 40 5 L 50 0";
        color = "stroke-green-500";
    } else if (direction === 'Down') {
        path = "M0 5 Q 10 5, 20 10 T 40 20 L 50 25";
        color = "stroke-red-500";
    } else {
        path = "M0 15 Q 10 10, 20 15 T 40 15 L 50 15";
        color = "stroke-gray-500";
    }

    return (
        <svg width="50" height="25" fill="none" className={color} strokeWidth="2">
            <path d={path} />
        </svg>
    );
};

const KeywordChat: React.FC<{
    onSendMessage: (message: string) => void;
    history: ChatMessage[];
    isLoading: boolean;
}> = ({ onSendMessage, history, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mt-8 no-print">
             <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <ChatBubbleIcon className="w-7 h-7 text-purple-400" />
                <span>AI SEO Assistant</span>
            </h3>
            <div className="h-48 overflow-y-auto p-4 space-y-4 bg-gray-900/50 rounded-lg mb-4">
                 {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
                      <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-300 rounded-bl-none'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
                       <div className="max-w-md p-3 rounded-2xl bg-gray-700 text-gray-300 rounded-bl-none">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                          </div>
                       </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit}>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask specifically about these keywords..."
                        className="w-full pl-6 pr-24 py-3 bg-gray-900 border border-gray-600 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export const KeywordResearch: React.FC<KeywordResearchProps> = ({ lang }) => {
    const [seedKeyword, setSeedKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<KeywordAnalysisResult | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const translations = {
        en: {
            title: "Trend Intelligence",
            subtitle: "Decode the market. Find rising concepts, check Pinterest vibes vs. Etsy SEO, and discover high-volume gaps.",
            ph: "Enter a broad topic (e.g., 'Silver Ring', 'Digital Planner')",
            btn: "Analyze Trends",
            loading: "Scanning Trends...",
            rising: "Rising Concepts & Niches",
            keywords: "Keyword Metrics",
            platform: "Platform Intelligence",
            export: "Export CSV"
        },
        tr: {
            title: "Trend İstihbaratı",
            subtitle: "Pazarı çözümle. Yükselen kavramları bul, Pinterest havası ile Etsy SEO'sunu kıyasla.",
            ph: "Genel bir konu gir (Örn: 'Gümüş Yüzük', 'Duvar Sanatı')",
            btn: "Trendleri Analiz Et",
            loading: "Trendler Taranıyor...",
            rising: "Yükselen Kavramlar & Nişler",
            keywords: "Anahtar Kelime Metrikleri",
            platform: "Platform İstihbaratı",
            export: "CSV İndir"
        }
    };

    const t = translations[lang];

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seedKeyword) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const jsonStr = await runKeywordAnalysis(seedKeyword, lang);
            const data = JSON.parse(jsonStr);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(lang === 'tr' ? "Analiz başarısız oldu. Lütfen tekrar deneyin." : "Analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const handleDownloadCSV = () => {
        if (!result || !result.keywords) return;

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Keyword,Competition,Volume,Trend,Intent\n";

        // CSV Rows
        result.keywords.forEach((row) => {
            const rowString = `"${row.keyword}","${row.competition}","${row.volume}","${row.trendDirection}","${row.intent}"`;
            csvContent += rowString + "\n";
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ranklistic_keywords_${seedKeyword.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Header / Search Area */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="flex justify-center items-center gap-3 mb-4 relative z-10">
                    <KeyIcon className="w-8 h-8 text-purple-500" />
                    <TrendingUpIcon className="w-8 h-8 text-green-400" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2 relative z-10">{t.title}</h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-8 relative z-10">{t.subtitle}</p>

                <form onSubmit={handleAnalyze} className="max-w-xl mx-auto relative z-10">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={seedKeyword}
                            onChange={(e) => setSeedKeyword(e.target.value)}
                            placeholder={t.ph}
                            className="w-full pl-6 pr-14 py-4 bg-gray-900 border-2 border-gray-600 rounded-full text-white focus:border-purple-500 text-lg shadow-inner outline-none transition-all focus:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !seedKeyword}
                            className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <SearchIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                    {isLoading && <p className="text-purple-400 mt-4 animate-pulse font-mono text-sm">{t.loading}</p>}
                </form>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                    {error}
                </div>
            )}

            {/* Results Area */}
            {result && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* 1. RISING CONCEPTS BUBBLES */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FireIcon className="w-5 h-5 text-orange-500" />
                            {t.rising}
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {result.risingConcepts?.map((rc, i) => (
                                <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex-1 min-w-[200px] hover:border-orange-500 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{rc.concept}</h4>
                                        <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-1 rounded-full font-mono">{rc.growthFactor}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                        {rc.whyTrending}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* 2. KEYWORDS TABLE (Left Column) */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <SearchIcon className="w-5 h-5 text-blue-400" />
                                    {t.keywords}
                                </h3>
                                <button 
                                    onClick={handleDownloadCSV}
                                    className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-600 transition-all"
                                >
                                    <SaveIcon className="w-4 h-4" />
                                    {t.export}
                                </button>
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-900/50">
                                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-700">
                                                <th className="p-4">Keyword</th>
                                                <th className="p-4">Trend</th>
                                                <th className="p-4">Volume</th>
                                                <th className="p-4">Intent</th>
                                                <th className="p-4 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-gray-700">
                                            {result.keywords.map((kw, i) => (
                                                <tr key={i} className="hover:bg-gray-700/30 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="font-bold text-white text-base">{kw.keyword}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{kw.competition} Comp</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <TrendSparkline direction={kw.trendDirection} />
                                                        <div className={`text-[10px] mt-1 ${kw.trendDirection === 'Up' ? 'text-green-500' : kw.trendDirection === 'Down' ? 'text-red-500' : 'text-gray-500'}`}>{kw.trendDirection}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1 w-24">
                                                            <div className="flex justify-between text-[10px] text-gray-400">
                                                                <span>Vol</span>
                                                                <span>{kw.volume}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${kw.volume}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] text-blue-300">{kw.volumeLabel}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-400 text-xs">
                                                        {kw.intent}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button 
                                                            onClick={() => copyToClipboard(kw.keyword, i)}
                                                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                            title="Copy"
                                                        >
                                                            {copiedIndex === i ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <div className="text-[10px] font-bold border border-gray-500 rounded px-2 py-1">COPY</div>}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 3. PLATFORM INTELLIGENCE (Right Column) */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-pink-400" />
                                {t.platform}
                            </h3>
                            
                            {result.platformInsights?.map((pi, i) => (
                                <div key={i} className={`bg-gray-800 border-l-4 rounded-r-xl p-5 shadow-lg ${pi.platform === 'Pinterest' ? 'border-red-500' : 'border-orange-500'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        {pi.platform === 'Pinterest' ? <PinterestIcon className="w-6 h-6 text-red-500"/> : <BrandIcon className="w-6 h-6 text-orange-500"/>}
                                        <div>
                                            <h4 className="font-bold text-white">{pi.platform} Strategy</h4>
                                            <div className="text-[10px] text-gray-400 uppercase">{pi.focus}</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-3 italic">
                                        "{pi.advice}"
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {pi.topTags.map((tag, j) => (
                                            <span key={j} className="text-[10px] bg-gray-900 text-gray-300 px-2 py-1 rounded border border-gray-700">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
