
import React, { useState, useRef } from 'react';
import { PaperClipIcon, CloseIcon, SparklesIcon, LaserIcon, GeneratorIcon, CheckCircleIcon, PriceIcon, UserIcon, LightbulbIcon } from './icons';
import { analyzeProductImage, cleanJsonString } from '../services/geminiService';
import type { AuditReport, ProductPotentialAnalysis } from '../types';

interface AnalyzedItem {
    id: string;
    file: File;
    preview: string;
    base64: string;
    status: 'pending' | 'analyzing' | 'done' | 'error';
    result?: ProductPotentialAnalysis;
    niche: string;
}

interface ProductLaunchpadProps {
    auditResult: AuditReport | null;
    onUseForListing: (data: { imageBase64: string; analysis?: string; niche?: string }) => void;
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

export const ProductLaunchpad: React.FC<ProductLaunchpadProps> = ({ auditResult, onUseForListing }) => {
    const [items, setItems] = useState<AnalyzedItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Default to 'auto' to handle diverse products out of the box
    const [selectedNicheKey, setSelectedNicheKey] = useState<string>('auto');
    const [customNicheInput, setCustomNicheInput] = useState<string>('');

    const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            
            // DETERMINE NICHE STRING
            let finalNiche = selectedNicheKey;
            
            if (selectedNicheKey === 'auto') {
                finalNiche = "General Object (Auto Detect)";
            } else if (selectedNicheKey === 'custom') {
                if (!customNicheInput.trim()) {
                    alert("Please type your custom niche/category first!");
                    return;
                }
                finalNiche = customNicheInput.trim();
            }

            // Process ALL selected files
            const newItems: AnalyzedItem[] = [];
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const preview = URL.createObjectURL(file);
                const base64 = await blobToBase64(file);
                
                const newItem: AnalyzedItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    preview,
                    base64,
                    status: 'analyzing', // Start immediately
                    niche: finalNiche,
                };
                newItems.push(newItem);
            }
            
            // Add to state
            setItems(prev => [...newItems, ...prev]); 
            
            // Trigger analysis for each new item
            newItems.forEach(item => runAnalysis(item, finalNiche));
        }
    };

    const runAnalysis = async (item: AnalyzedItem, niche: string) => {
        try {
            // Pass niche to the image analyzer
            const resultStr = await analyzeProductImage(item.base64, "", niche);
            const cleaned = cleanJsonString(resultStr);
            const result = JSON.parse(cleaned) as ProductPotentialAnalysis;
            
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'done', result } : i));
        } catch (e) {
            console.error(e);
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i));
        }
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSendToEditor = (item: AnalyzedItem) => {
        onUseForListing({
            imageBase64: item.base64,
            analysis: item.result ? `Analyzed Price: ${item.result.estimatedPrice}. Target Audience: ${item.result.targetAudience}. Visual Context: ${item.result.titleIdea}` : "",
            niche: item.niche
        });
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
                <LaserIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Visual Commercial Analyzer</h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-6">
                    Upload product photos (Apparel, Furniture, Decor, Art, etc.). AI will detect the object, predict price, and provide visual critiques based on category standards.
                </p>

                {/* Niche Selector */}
                <div className="mb-8 max-w-3xl mx-auto bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-yellow-400" />
                        Select Evaluation Criteria
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                         {[
                            { id: 'auto', label: 'Auto Detect', icon: '🤖' },
                            { id: 'wall-art', label: 'Wall Art', icon: '🖼️' },
                            { id: 'apparel', label: 'Apparel', icon: '👕' },
                            { id: 'furniture', label: 'Furniture', icon: '🪑' }, 
                            { id: 'jewelry', label: 'Jewelry', icon: '💍' },
                            { id: 'custom', label: 'Custom', icon: '✨' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedNicheKey(cat.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                    selectedNicheKey === cat.id 
                                    ? 'bg-orange-600/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transform scale-105' 
                                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                                }`}
                            >
                                <span className="text-2xl mb-1">{cat.icon}</span>
                                <span className="text-[10px] font-bold text-center">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                     {/* CUSTOM NICHE INPUT */}
                    {selectedNicheKey === 'custom' && (
                        <div className="mt-4 animate-fade-in text-left">
                            <label className="block text-xs font-bold text-orange-400 mb-1">What are you selling?</label>
                            <input 
                                type="text"
                                value={customNicheInput}
                                onChange={(e) => setCustomNicheInput(e.target.value)}
                                placeholder="e.g. Wood Carving, Hand Knitted Beanie..."
                                className="w-full p-3 bg-gray-900 border border-orange-500 rounded-lg text-white focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    )}
                </div>
                
                <div className="relative inline-block">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFilesSelect}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        multiple // ENABLE MULTI UPLOAD
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-3 bg-white text-gray-900 hover:bg-gray-200 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-white/10"
                    >
                        <PaperClipIcon className="w-6 h-6" />
                        <span>Upload Photos (Bulk)</span>
                    </button>
                </div>
            </div>

            {/* Analysis Grid - NEW DETAILED CARDS */}
            <div className="grid lg:grid-cols-2 gap-8">
                {items.map((item) => (
                    <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl animate-fade-in flex flex-col md:flex-row">
                        
                        {/* Image Side */}
                        <div className="md:w-1/3 relative bg-black">
                            <img src={item.preview} alt="Product" className="w-full h-full object-cover opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            
                            <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>

                            {/* Verdict Badge */}
                            {item.result && (
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">AI Verdict</div>
                                    <div className={`text-3xl font-extrabold ${item.result.viabilityScore >= 7 ? 'text-green-400' : item.result.viabilityScore >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {item.result.verdict}
                                    </div>
                                    <div className="text-sm font-bold text-white">{item.result.viabilityScore}/10</div>
                                </div>
                            )}

                            {item.status === 'analyzing' && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <span className="text-orange-400 font-bold text-sm animate-pulse">Scanning Pixels...</span>
                                </div>
                            )}
                        </div>

                        {/* Details Side */}
                        <div className="md:w-2/3 p-6 flex flex-col">
                            {item.status === 'done' && item.result ? (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-4 line-clamp-1" title={item.result.titleIdea}>
                                        {item.result.titleIdea}
                                    </h3>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <PriceIcon className="w-3 h-3"/> Est. Price
                                            </div>
                                            <div className="text-sm font-bold text-white">{item.result.estimatedPrice}</div>
                                        </div>
                                        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <UserIcon className="w-3 h-3"/> Audience
                                            </div>
                                            <div className="text-sm font-bold text-white truncate" title={item.result.targetAudience}>{item.result.targetAudience}</div>
                                        </div>
                                    </div>

                                    {/* Visual Critique */}
                                    <div className="space-y-2 mb-4 text-xs">
                                        {item.result.visualCritique?.strengths?.map((s, i) => (
                                            <div key={i} className="flex gap-2 text-green-300">
                                                <CheckCircleIcon className="w-4 h-4 flex-shrink-0"/> {s}
                                            </div>
                                        ))}
                                        {item.result.visualCritique?.weaknesses?.map((w, i) => (
                                            <div key={i} className="flex gap-2 text-red-300">
                                                <CloseIcon className="w-4 h-4 flex-shrink-0"/> {w}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Keywords */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {item.result.seoKeywords?.map((kw, i) => (
                                            <span key={i} className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Tip Footer */}
                                    <div className="mt-auto pt-4 border-t border-gray-700">
                                        <div className="flex items-start gap-2 mb-4 bg-yellow-900/10 p-2 rounded border border-yellow-500/20">
                                            <LightbulbIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-yellow-200 italic">"{item.result.improvementTip}"</p>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleSendToEditor(item)}
                                            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-200 font-bold py-3 px-4 rounded-xl transition-all shadow-lg"
                                        >
                                            <GeneratorIcon className="w-4 h-4" />
                                            <span>Create Optimized Listing</span>
                                        </button>
                                    </div>
                                </>
                            ) : item.status === 'error' ? (
                                <div className="h-full flex items-center justify-center text-red-400">Analysis Failed. Try again.</div>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
