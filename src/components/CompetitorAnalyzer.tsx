
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScaleIcon, CheckCircleIcon, StarIcon, SearchIcon, ChatBubbleIcon, SparklesIcon, CloseIcon, PaperClipIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';
import { runCompetitorAnalysis, getCompetitorChatResponse } from '../services/geminiService';
import type { CompetitorAnalysisResult, ChatMessage } from '../types';

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

const CompetitorChat: React.FC<{
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
                <ChatBubbleIcon className="w-7 h-7 text-orange-400" />
                <span>Discuss Strategy & Constraints</span>
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
                Is the advice not quite right? Tell AI about your specific situation (e.g., "I ship from Turkey," "I use different materials") to get a tailored strategy adjustment.
            </p>
            <div className="h-64 overflow-y-auto p-4 space-y-4 bg-gray-900/50 rounded-lg mb-4">
                 {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
                      <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-300 rounded-bl-none'}`}>
                        {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="User upload" className="rounded-lg mb-2 max-h-40" />}
                        {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
                       <div className="max-w-md p-3 rounded-2xl bg-gray-700 text-gray-300 rounded-bl-none">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
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
                            placeholder="e.g., I actually ship from Turkey, does that change things?"
                            className="w-full pl-12 pr-24 py-3 bg-gray-900 border border-gray-600 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-white placeholder-gray-500"
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
                            className="absolute left-3 text-gray-400 hover:text-orange-400 transition-colors"
                            aria-label="Attach image"
                        >
                            <PaperClipIcon className="w-6 h-6" />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const CompetitorAnalyzer: React.FC = () => {
  const [myShopUrl, setMyShopUrl] = useState('');
  const [competitorShopUrl, setCompetitorShopUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompetitorAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShopUrl || !competitorShopUrl) {
      setError("Please enter both shop URLs.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setChatHistory([]); // Reset chat history on new analysis

    try {
      const resultJsonString = await runCompetitorAnalysis(myShopUrl, competitorShopUrl);
      const parsedResult = JSON.parse(resultJsonString);
      setResult(parsedResult);
      // Initialize chat with a welcome message
      setChatHistory([{ sender: 'ai', text: "I've analyzed the gap. If you have specific constraints (like location, materials, or costs) that differ from my assumptions, tell me below and I'll adjust the strategy." }]);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze competitors. Please check the URLs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(async (message: string, image: string | null = null) => {
        if (!result) return;
    
        const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: message, image: image || undefined }];
        setChatHistory(newHistory);
        setIsChatLoading(true);
    
        try {
            const aiResponse = await getCompetitorChatResponse(
                { myShopUrl, competitorShopUrl },
                result,
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
    }, [chatHistory, result, myShopUrl, competitorShopUrl]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 no-print">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Find the "Gap" in Your Strategy</h2>
            <p className="text-gray-400">Why is that other shop selling more? Paste the URLs below, and AI will spot the differences in strategy, pricing, and visuals.</p>
        </div>

        <form onSubmit={handleAnalysis} className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Shop URL</label>
            <div className="relative">
              <input
                type="text"
                value={myShopUrl}
                onChange={(e) => setMyShopUrl(e.target.value)}
                placeholder="https://etsy.com/shop/MyShop"
                className="w-full pl-4 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-600"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Competitor Shop URL</label>
            <div className="relative">
              <input
                type="text"
                value={competitorShopUrl}
                onChange={(e) => setCompetitorShopUrl(e.target.value)}
                placeholder="https://etsy.com/shop/WinningCompetitor"
                className="w-full pl-4 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-600"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-center mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-900/20"
            >
              {isLoading ? (
                <span>Analyzing Differences...</span>
              ) : (
                <>
                  <ScaleIcon className="w-6 h-6" />
                  <span>Compare Shops</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg no-print">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-8">
          
          {/* 1. Sales Gap Analysis (The "Why") */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <SearchIcon className="w-6 h-6 text-orange-400 mr-2" />
                The "Sales Gap" Verdict
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed border-l-4 border-orange-500 pl-4">
                {result.salesGapAnalysis}
            </p>
          </div>

          {/* 2. Side-by-Side Comparison */}
          <div className="grid gap-6">
             <h3 className="text-xl font-bold text-white px-2">Head-to-Head Comparison</h3>
             {result.comparisonPoints.map((point, index) => (
                 <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full">
                        <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">{point.area}</div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className={`p-3 rounded-lg border ${point.winner === 'Me' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/10 border-red-500/20'}`}>
                                <span className="text-xs text-gray-400 block mb-1">You</span>
                                <p className="text-sm text-gray-200">{point.myShopObservation}</p>
                            </div>
                            <div className={`p-3 rounded-lg border ${point.winner === 'Competitor' ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-700/30 border-gray-600'}`}>
                                <span className="text-xs text-gray-400 block mb-1">Competitor</span>
                                <p className="text-sm text-gray-200">{point.competitorObservation}</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/3 w-full flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6">
                        <div className="flex items-center mb-2">
                            <span className="text-gray-400 text-sm mr-2">Winner:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-sm ${
                                point.winner === 'Me' ? 'bg-green-500 text-black' : 
                                point.winner === 'Competitor' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                            }`}>{point.winner}</span>
                        </div>
                        <p className="text-orange-300 text-sm italic">"{point.insight}"</p>
                    </div>
                 </div>
             ))}
          </div>

          {/* 3. Action Plan */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 text-green-400">Strategies to Steal</h3>
                <ul className="space-y-3">
                    {result.keyStrategiesToSteal.map((strategy, i) => (
                        <li key={i} className="flex items-start">
                            <StarIcon className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{strategy}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 text-orange-400">Immediate Action Plan</h3>
                <ul className="space-y-3">
                    {result.immediateActionPlan.map((action, i) => (
                        <li key={i} className="flex items-start">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{action}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
          
          {/* 4. Interactive Strategy Chat */}
          <CompetitorChat 
            history={chatHistory}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
          />

        </div>
      )}
    </div>
  );
};
