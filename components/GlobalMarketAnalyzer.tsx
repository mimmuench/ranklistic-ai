
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GlobeIcon, SearchIcon, ChatBubbleIcon, SparklesIcon, CloseIcon, PaperClipIcon, TrendingUpIcon } from './icons';
import { runGlobalMarketAnalysis, getMarketAnalysisChatResponse } from '../services/geminiService';
import type { MarketAnalysisResult, ChatMessage } from '../types';
import { SimpleBar } from './Charts';

interface GlobalMarketAnalyzerProps {
    lang: 'en' | 'tr';
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
};

const MarketChat: React.FC<{
    onSendMessage: (message: string, image: string | null) => void;
    history: ChatMessage[];
    isLoading: boolean;
}> = ({ onSendMessage, history, isLoading }) => {
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<{ preview: string; data: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);
    
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          const data = await blobToBase64(file);
          setSelectedImage({ preview, data });
        }
      };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((input.trim() || selectedImage) && !isLoading) {
            onSendMessage(input.trim(), selectedImage?.data || null);
            setInput('');
            setSelectedImage(null);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mt-8 no-print">
             <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <ChatBubbleIcon className="w-7 h-7 text-green-400" />
                <span>Discuss Market Strategy</span>
            </h3>
            <div className="h-64 overflow-y-auto p-4 space-y-4 bg-gray-900/50 rounded-lg mb-4">
                 {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
                      <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-300 rounded-bl-none'}`}>
                        {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="User upload" className="rounded-lg mb-2 max-h-40" />}
                        {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
                       <div className="max-w-md p-3 rounded-2xl bg-gray-700 text-gray-300 rounded-bl-none">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                          </div>
                       </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
            </div>
             <div className="relative">
                {selectedImage && (
                    <div className="relative w-20 h-20 mb-2 p-1 border border-gray-600 rounded-lg">
                        <img src={selectedImage.preview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about Australia, UK VAT, or shipping costs..."
                            className="w-full pl-12 pr-24 py-3 bg-gray-900 border border-gray-600 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-white placeholder-gray-500"
                            disabled={isLoading}
                        />
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            className="hidden"
                            accept="image/png, image/jpeg"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute left-3 text-gray-400 hover:text-green-400 transition-colors"
                            aria-label="Attach image"
                        >
                            <PaperClipIcon className="w-6 h-6" />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const GlobalMarketAnalyzer: React.FC<GlobalMarketAnalyzerProps> = ({ lang }) => {
    // Shared State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Region Scan State
    const [productName, setProductName] = useState('');
    const [marketResult, setMarketResult] = useState<MarketAnalysisResult | null>(null);
    
     // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

    const translations = {
        en: {
            title: "Global Region Scanner",
            subtitle: "Analyze market demand, cultural keywords, and rising aesthetics across 5 key countries.",
            labelProduct: "What do you want to sell?",
            phProduct: "e.g. Handmade Leather Wallet",
            btnRegion: "Scan Global Markets",
            btnLoadingRegion: "Scanning 5 Regions...",
            verdict: "Strategic Verdict",
            seasonal: "Seasonal & Trend Alerts"
        },
        tr: {
            title: "Global Bölge Tarayıcı",
            subtitle: "5 ana ülkede pazar talebini, kültürel kelimeleri ve yükselen estetik trendleri analiz et.",
            labelProduct: "Ne satmak istiyorsun?",
            phProduct: "Örn: El Yapımı Deri Cüzdan",
            btnRegion: "Global Pazarları Tara",
            btnLoadingRegion: "5 Bölge Taranıyor...",
            verdict: "Stratejik Karar",
            seasonal: "Mevsimsel & Trend Uyarıları"
        }
    };

    const t = translations[lang];

    const handleAnalyzeRegion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName) return;

        setIsLoading(true);
        setError(null);
        setMarketResult(null);
        setChatHistory([]);

        try {
            const jsonStr = await runGlobalMarketAnalysis(productName, lang);
            const data = JSON.parse(jsonStr);
            setMarketResult(data);
             setChatHistory([{ sender: 'ai', text: lang === 'tr' ? "Analiz tamamlandı. Belirli bir ülke hakkında detaylı soru sorabilirsiniz." : "Analysis complete. Feel free to ask deep-dive questions about specific regions." }]);
        } catch (err) {
            console.error(err);
            setError(lang === 'tr' ? "Analiz başarısız oldu." : "Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleSendMessage = useCallback(async (message: string, image: string | null = null) => {
            if (!marketResult) return;
        
            const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: message, image: image || undefined }];
            setChatHistory(newHistory);
            setIsChatLoading(true);
        
            try {
                const aiResponse = await getMarketAnalysisChatResponse(
                    marketResult,
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
        }, [chatHistory, marketResult]);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            
            {/* Header Area */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl no-print relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
                
                <GlobeIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 relative z-10" />
                <h2 className="text-3xl font-bold text-white mb-2 relative z-10">{t.title}</h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-8 relative z-10">{t.subtitle}</p>

                {/* REGION FORM */}
                <form onSubmit={handleAnalyzeRegion} className="max-w-xl mx-auto relative z-10 animate-fade-in">
                    <input 
                        type="text" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder={t.phProduct}
                        className="w-full pl-6 pr-14 py-4 bg-gray-900 border-2 border-gray-600 rounded-full text-white focus:border-blue-500 text-lg shadow-inner outline-none transition-all focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !productName}
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <SearchIcon className="w-6 h-6" />
                        )}
                    </button>
                    {isLoading && <p className="text-blue-400 mt-4 animate-pulse font-mono text-sm">{t.btnLoadingRegion}</p>}
                </form>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                    {error}
                </div>
            )}

            {/* --- REGION RESULTS --- */}
            {marketResult && (
                <div className="space-y-8 animate-fade-in">
                    {/* Verdict Banner */}
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                            <GlobeIcon className="w-48 h-48 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                            <SparklesIcon className="w-6 h-6 text-yellow-400" /> {t.verdict}
                        </h3>
                        <p className="text-blue-100 text-lg leading-relaxed relative z-10">{marketResult.globalVerdict}</p>
                    </div>

                    {/* Region Cards Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {marketResult.regions.map((r, i) => (
                            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-300 group hover:-translate-y-1 shadow-lg flex flex-col">
                                {/* Card Header */}
                                <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center group-hover:bg-gray-900/80 transition-colors">
                                    <div className="text-4xl filter drop-shadow-md">{r.flag}</div>
                                    <div className="text-right">
                                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{r.region} Opp</div>
                                        <div className={`text-2xl font-bold ${r.opportunityScore >= 7 ? 'text-green-500' : r.opportunityScore >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {r.opportunityScore}/10
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="p-5 space-y-5 flex-1 flex flex-col">
                                    {/* Charts */}
                                    <div className="space-y-3">
                                        <SimpleBar value={r.demandLevel} label="Search Demand" type="demand" />
                                        <SimpleBar value={r.competitionLevel} label="Competition" type="competition" />
                                    </div>
                                    
                                    {/* GeoTrend AI & Cultural Mapping Section */}
                                    <div className="space-y-3 pt-3 border-t border-gray-700 flex-1">
                                        
                                        {/* CulturalSEO Mapper Visual */}
                                        <div className="bg-blue-900/10 p-2.5 rounded border border-blue-500/20">
                                            <div className="text-[10px] text-blue-400 font-bold uppercase mb-1 flex items-center gap-1">
                                                <GlobeIcon className="w-3 h-3"/> CulturalSEO Mapper
                                            </div>
                                            <div className="text-sm text-white font-mono bg-black/20 p-1.5 rounded border border-blue-500/10 text-center">
                                                {r.keywordNuance}
                                            </div>
                                        </div>

                                        {/* GeoTrend AI Visual */}
                                        <div className="bg-purple-900/10 p-2.5 rounded border border-purple-500/20">
                                            <div className="text-[10px] text-purple-400 font-bold uppercase mb-1 flex items-center gap-1">
                                                <TrendingUpIcon className="w-3 h-3"/> GeoTrend Aesthetic
                                            </div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                                {r.risingTrend || "Processing..."}
                                            </div>
                                        </div>

                                         <div className="bg-gray-700/20 p-2 rounded border border-gray-600/30">
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Local Insight</div>
                                            <div className="text-xs text-gray-300 leading-tight">{r.culturalNote}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Seasonal Alerts */}
                    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl">
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <ChatBubbleIcon className="w-5 h-5 text-pink-400" /> {t.seasonal}
                         </h3>
                         <ul className="grid md:grid-cols-2 gap-4">
                             {marketResult.seasonalAlerts.map((alert, i) => (
                                 <li key={i} className="flex gap-3 text-gray-300 text-sm bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                     <span className="text-pink-500 font-bold mt-0.5">•</span> 
                                     <span>{alert}</span>
                                 </li>
                             ))}
                         </ul>
                    </div>
                </div>
            )}
            
            {/* Shared Chat */}
            <MarketChat 
                history={chatHistory}
                isLoading={isChatLoading}
                onSendMessage={handleSendMessage}
            />

        </div>
    );
};
