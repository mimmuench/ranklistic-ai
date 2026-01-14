
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SparklesIcon, SaveIcon, ChatBubbleIcon, PaperClipIcon, CloseIcon, NicheIcon, BrandIcon, LaserIcon, CheckCircleIcon, GeneratorIcon, PinterestIcon, PrinterIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';
import { generateListingContent, getOptimizerChatResponse } from '../services/geminiService';
import type { ListingOptimizerResult, ChatMessage, OptimizerTransferData } from '../types';

const DEFAULT_TEMPLATE = `✨ [Insert Strong Keywords Here] ✨

🌟 Overview
[Direct Product Definition - What is it exactly?]. [Key Feature 1]. [Key Feature 2].
📦 ENJOY FREE SHIPPING ON ALL ORDERS!

💫 Why you’ll love this [Product Type]
*   **[Feature 1 Title]** – [Fact-based Benefit]
*   **[Feature 2 Title]** – [Fact-based Benefit]
*   **[Feature 3 Title]** – [Fact-based Benefit]
*   **[Feature 4 Title]** – [Fact-based Benefit]
*   **[Feature 5 Title]** – [Fact-based Benefit]

🎁 Perfect for
*   **[Target Audience 1]**
*   **[Target Audience 2]**
*   [Target Audience 3]
*   [Target Audience 4]
*   **[Target Audience 5]**

📏 Available sizes
15.7"x23.6"/40x60cm
19.7"x29.5"/50x75cm
23.6"x35.4"/60x90cm
27.6"x41.3"/70x105cm
31.5"x47.2"/80x120cm
[Or Custom Sizes]

🎨 Color options
⚫ Matte Black
🤍 White
✨ Gold
✨ Silver
🟤 Bronze

🛠️ Material & craftsmanship
*   Laser-cut from premium quality steel for intricate detail and durability
*   Powder-coated for superior rust and UV resistance, ensuring lasting beauty
*   Smooth edges and an outdoor-safe finish for versatile display

📦 Shipping & guarantee
*   FREE SHIPPING ON ALL ORDERS!
*   Worldwide shipping in secure protective packaging to ensure safe arrival
*   Fast delivery: 3–5 business days to North America & Europe
*   100% satisfaction guarantee: We offer a full refund or replacement if your item arrives damaged

🏁 Final touch
[Direct Call to Action - e.g. "Order now to upgrade your wall."].

** Looking for a custom fit? Special sizes are available upon request and will be priced individually. Please contact us for details.`;

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

interface ListingOptimizerProps {
    initialData?: OptimizerTransferData | null;
}

const OptimizerChat: React.FC<{
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
                <span>Refine with AI</span>
            </h3>
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
                            placeholder="e.g., Make the title shorter or upload an image..."
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


export const ListingOptimizer: React.FC<ListingOptimizerProps> = ({ initialData }) => {
    // ListingOptimizer.tsx dosyasının içine gir ve bunu ekle:
	const lang = 'en';
	
	// Mode Selection: 'image' or 'text'
    const [generationMode, setGenerationMode] = useState<'image' | 'text'>('image');

    const [template, setTemplate] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    
    // Niche Selection State
    const [selectedNicheKey, setSelectedNicheKey] = useState<string>('wall-art');
    const [customNicheInput, setCustomNicheInput] = useState<string>('');
    
    // SaaS Inputs
    const [material, setMaterial] = useState<string>('');
    const [tone, setTone] = useState<string>('Professional');
    
    // State for image upload in the main form
    const [selectedImage, setSelectedImage] = useState<{ preview: string; data: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<ListingOptimizerResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);
    const [areTagsCopied, setAreTagsCopied] = useState<boolean>(false);

    // Social Media Tab State
    const [socialTab, setSocialTab] = useState<'pinterest' | 'instagram'>('pinterest');

    // State for the integrated chat
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    
    // Initial Data Loading (from Bulk Analyzer OR TrendRadar)
    useEffect(() => {
        if (initialData) {
            
            // Case 1: Image Mode (from Visual Launchpad)
            if (initialData.imageBase64) {
                setGenerationMode('image'); 
                setSelectedImage({
                    preview: `data:image/jpeg;base64,${initialData.imageBase64}`,
                    data: initialData.imageBase64
                });
                if (initialData.analysis) {
                    setDescription(`AI Analysis Context: ${initialData.analysis}`);
                }
            } 
            
            // Case 2: Text Mode (from TrendRadar)
            else if (initialData.mode === 'text' && initialData.trendContext) {
                setGenerationMode('text');
                setTitle(initialData.titleSuggestion || '');
                setDescription(initialData.trendContext);
            }

            // Set niche if recognized or custom
            if (initialData.niche) {
                const knownNiches = ['wall-art', 'apparel', 'jewelry', 'digital', 'general', 'mundo_admin'];
                if (knownNiches.includes(initialData.niche)) {
                    setSelectedNicheKey(initialData.niche);
                } else if (initialData.niche === 'custom') {
                    setSelectedNicheKey('custom');
                    // If coming from TrendRadar, set the custom input to the Trend Name automatically? 
                    // Let's extract it from title if possible or let user refine.
                    setCustomNicheInput(initialData.titleSuggestion ? initialData.titleSuggestion.split(' ')[0] : 'Trendy Item');
                } else {
                    setSelectedNicheKey('custom');
                    setCustomNicheInput(initialData.niche);
                }
            }
        }
    }, [initialData]);

    useEffect(() => {
        const savedTemplate = localStorage.getItem('etsyOptimizerTemplate');
        setTemplate(savedTemplate || DEFAULT_TEMPLATE);
    }, []);

    const handleSaveTemplate = () => {
        localStorage.setItem('etsyOptimizerTemplate', template);
        setShowSaveConfirm(true);
        setTimeout(() => setShowSaveConfirm(false), 2000);
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          const data = await blobToBase64(file);
          setSelectedImage({ preview, data });
        }
    };

    const handleGenerate = useCallback(async () => {
        // Validation based on Mode
        if (generationMode === 'image' && !selectedImage) {
            setError('Please upload an image to start visual generation.');
            return;
        }
        if (generationMode === 'text' && !title.trim()) {
            setError('Please provide a Product Title to start text generation.');
            return;
        }

        if (!template.trim()) {
            setError('Please ensure the template is not empty.');
            return;
        }
        
        // Determine the actual niche string to pass
        let finalNiche = selectedNicheKey;
        if (selectedNicheKey === 'custom') {
            if (!customNicheInput.trim()) {
                setError('Please type your product category (e.g. Wood Carving).');
                return;
            }
            finalNiche = customNicheInput.trim();
        }

        setIsLoading(true);
        setError(null);
        setResult(null);
        setChatHistory([]); // Reset chat on new generation
        try {
            const resultString = await generateListingContent(
                title, 
                description, 
                template, 
                selectedImage?.data || null,
                "", // shop context
                false, // personalization default
                finalNiche, // PASS THE DYNAMIC NICHE
                material,
                tone
            );
            const parsedResult = JSON.parse(resultString);
            setResult(parsedResult);
            setChatHistory([{ sender: 'ai', text: `I've optimized your listing using the **${finalNiche.toUpperCase()}** strategy. How does it look?` }]);
        } catch (e) {
            console.error(e);
            setError('Failed to generate content. The AI might be busy. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [generationMode, title, description, template, selectedImage, selectedNicheKey, customNicheInput, material, tone]);
    
    const handleSendMessage = useCallback(async (message: string, image: string | null = null) => {
        if (!result) return;
    
        const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: message, image: image || undefined }];
        setChatHistory(newHistory);
        setIsChatLoading(true);
    
        try {
            const aiResponse = await getOptimizerChatResponse(
                { title, description, template },
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
    }, [chatHistory, result, title, description, template]);


    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const copyAllTags = () => {
        if (result && result.hashtags) {
            const allTags = result.hashtags.join(', ');
            navigator.clipboard.writeText(allTags);
            setAreTagsCopied(true);
            setTimeout(() => setAreTagsCopied(false), 2000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 pb-20">
            {/* 1. HERO HEADER WITH MODE SELECTION */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl no-print">
                <GeneratorIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Etsy Listing Generator</h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-8">
                    Create professional, SEO-optimized listings in seconds. Choose your starting point:
                </p>
                
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setGenerationMode('image')}
                        className={`flex flex-col items-center justify-center w-40 h-32 rounded-xl border-2 transition-all ${
                            generationMode === 'image' 
                                ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg shadow-orange-900/20' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <PaperClipIcon className="w-8 h-8 mb-2" />
                        <span className="font-bold">Start from<br/>Image</span>
                    </button>
                    <button
                        onClick={() => setGenerationMode('text')}
                        className={`flex flex-col items-center justify-center w-40 h-32 rounded-xl border-2 transition-all ${
                            generationMode === 'text' 
                                ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg shadow-orange-900/20' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <ChatBubbleIcon className="w-8 h-8 mb-2" />
                        <span className="font-bold">Start from<br/>Title/Text</span>
                    </button>
                </div>
            </div>

            {/* 2. MAIN INPUT AREA */}
            <div className="grid md:grid-cols-3 gap-8 no-print">
                {/* Left Column: Inputs */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                         <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">1</div>
                             Configure AI Strategy
                         </h3>
                        							
						{/* NICHE SELECTOR */}
                        <div className="mb-6">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                {lang === 'tr' ? 'Ürün Kategorisi' : 'Product Category'}
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {[
                                    { id: 'wall-art', label: 'Wall Art', icon: '🖼️' },
                                    { id: 'metal-art', label: 'Metal Art', icon: '🏗️' },
                                    { id: 'apparel', label: 'Apparel', icon: '👕' },
                                    { id: 'jewelry', label: 'Jewelry', icon: '💍' },
                                    { id: 'digital', label: 'Digital', icon: '💻' },
                                    { id: 'general', label: 'General', icon: '📦' },
                                    { id: 'home-decor', label: 'Home Decor', icon: '🏠' },
                                    { id: 'custom', label: 'Custom', icon: '✨' }
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedNicheKey(cat.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                                            selectedNicheKey === cat.id 
                                            ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg shadow-orange-900/20' 
                                            : 'bg-gray-900 border-gray-700 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                                        }`}
                                    >
                                        <span className="text-xl mb-1">{cat.icon}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-tighter text-center">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        
							{/* TEXTAREA AREA */}
							<div className="space-y-2 mt-6">
								<label htmlFor="description" className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
									{lang === 'tr' ? 'Ürününüzü Tarif Edin' : 'Describe Your Product'}
								</label>
								<textarea 
									id="description" 
									value={description} 
									onChange={e => setDescription(e.target.value)} 
									rows={4} 
									className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm text-gray-300 outline-none transition-all" 
									placeholder={lang === 'tr' 
										? "Ürününüzle ilgili bir iki spesifik anahtar kelime giriniz (Örn: 'geometrik geyik', 'minimalist metal tablo'). AI bu detayları SEO stratejisine dahil eder." 
										: "Enter a few specific keywords to describe your product (e.g., 'geometric deer', 'minimalist metal art'). AI will use these for the SEO strategy."}
								/>
							</div>
							
							
							
							
							
							
							
							
							
							
							
							
							
							
							
							
							
							
							
			
							
                             {/* CUSTOM NICHE INPUT */}
                             {selectedNicheKey === 'custom' && (
                                <div className="mt-4 animate-fade-in text-left">
                                    <label className="block text-xs font-bold text-orange-400 mb-1">Specific Niche/Trend</label>
                                    <input 
                                        type="text"
                                        value={customNicheInput}
                                        onChange={(e) => setCustomNicheInput(e.target.value)}
                                        placeholder="e.g. Dark Academia Decor"
                                        className="w-full p-3 bg-gray-900 border border-orange-500 rounded-lg text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* INPUTS BASED ON MODE */}
                        <div className="space-y-4 animate-fade-in">
                            {generationMode === 'image' && (
                                <div className="p-4 bg-gray-900/50 rounded-xl border border-dashed border-gray-600 text-center">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Upload Product Photo</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        accept="image/png, image/jpeg"
                                    />
                                    {selectedImage ? (
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                                            <img src={selectedImage.preview} alt="Preview" className="w-full h-full object-contain bg-black/40" />
                                            <button
                                                onClick={() => setSelectedImage(null)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg"
                                            >
                                                <CloseIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-32 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors rounded-lg"
                                        >
                                            <PaperClipIcon className="w-8 h-8 mb-2" />
                                            <span>Click to Upload Image</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Title is optional for Image mode, Required for Text mode */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                                    {generationMode === 'image' ? 'Product Title (Optional)' : 'Product Title (Required)'}
                                </label>
                                <input 
                                    type="text" 
                                    id="title" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                    placeholder={generationMode === 'image' ? "AI will generate this if empty..." : "e.g., Handmade Wooden Bookshelf"}
                                />
                            </div>

                            {/* Description / Conversion Input */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                                    {generationMode === 'text' ? 'Context / Old Description' : 'Extra Context (Optional)'}
                                </label>
                                <textarea 
                                    id="description" 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    rows={4} 
                                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                    placeholder={generationMode === 'text' ? "Paste details about your product here. AI will structure it." : "Any specific details you want included..."}
                                />
                            </div>

                             {selectedNicheKey !== 'mundo_admin' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text"
                                        value={material}
                                        onChange={(e) => setMaterial(e.target.value)}
                                        placeholder="Material (Optional)"
                                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                                    />
                                     <select 
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                                    >
                                        <option value="Professional & Trustworthy">Professional Tone</option>
                                        <option value="Playful & Fun">Playful Tone</option>
                                        <option value="Luxury & Elegant">Luxury Tone</option>
                                    </select>
                                </div>
                             )}
                        </div>

                         <div className="mt-6 flex justify-end">
                             <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-900/20"
                                >
                                {isLoading ? (
                                    <span>Generating...</span>
                                ) : (
                                    <>
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>Generate Listing</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Template Config */}
                <div className="space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Description Template</h3>
                            <button onClick={handleSaveTemplate} className="text-orange-400 hover:text-white transition-colors">
                                <SaveIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">AI follows this structure. Edit to match your brand.</p>
                        <textarea
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            rows={15}
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors text-gray-300 font-mono text-xs"
                            placeholder="Enter description template..."
                        />
                         {showSaveConfirm && <div className="text-xs text-green-500 mt-2 text-right">Template Saved!</div>}
                    </div>
                </div>
            </div>

            {/* 3. RESULTS AREA (EDITOR) */}
            {isLoading && <LoadingSpinner />}
            
            {error && (
                <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {result && (
                <div className="mt-10 space-y-8 animate-fade-in border-t-2 border-gray-700 pt-10 no-print">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <GeneratorIcon className="w-8 h-8 text-green-500" />
                            <h2 className="text-3xl font-bold text-white">Your Listing is Ready</h2>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center space-x-2 bg-white text-gray-900 font-bold py-2 px-6 rounded-lg transition-all hover:bg-gray-200 shadow-lg"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            <span>Download PDF Report</span>
                        </button>
                    </div>

                     <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-bold text-white">Title</h3>
                             <button onClick={() => copyToClipboard(result.newTitle)} className="text-sm text-orange-400 hover:text-orange-300 font-semibold">Copy</button>
                        </div>
                        <input 
                            value={result.newTitle} 
                            readOnly // Or make editable if you add state for it
                            className="w-full p-3 bg-gray-900 rounded-lg font-mono text-md text-gray-200 border border-gray-700"
                        />
                    </div>

                     <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Tags (13)</h3>
                            <button 
                                onClick={copyAllTags}
                                className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded transition-colors ${areTagsCopied ? 'bg-green-600 text-white' : 'text-orange-400 hover:text-orange-300 border border-orange-500/50'}`}
                            >
                                {areTagsCopied ? <CheckCircleIcon className="w-4 h-4"/> : null}
                                {areTagsCopied ? 'Copied!' : 'Copy All'}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {result.hashtags.map((tag, i) => (
                                <button key={i} onClick={() => copyToClipboard(tag)} className="bg-gray-700 text-gray-300 text-sm font-mono px-3 py-1 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                                    {tag}
                                </button>
                           ))}
                        </div>
                    </div>
                     
                     <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Description</h3>
                            <button onClick={() => copyToClipboard(result.newDescription)} className="text-sm text-orange-400 hover:text-orange-300 font-semibold">Copy</button>
                        </div>
                        <textarea 
                            value={result.newDescription}
                            readOnly // Or make editable
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg font-mono text-sm text-gray-300 whitespace-pre-wrap h-96"
                        />
                    </div>

                    {/* --- SOCIAL MEDIA PACK SECTION --- */}
                    {result.socialMedia && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-700">
                                <button 
                                    onClick={() => setSocialTab('pinterest')}
                                    className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${
                                        socialTab === 'pinterest' ? 'bg-red-900/20 text-red-400 border-b-2 border-red-500' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                >
                                    <PinterestIcon className="w-5 h-5" /> Pinterest Pack
                                </button>
                                <button 
                                    onClick={() => setSocialTab('instagram')}
                                    className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${
                                        socialTab === 'instagram' ? 'bg-purple-900/20 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                >
                                    <BrandIcon className="w-5 h-5" /> Instagram Pack
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {socialTab === 'pinterest' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">Pin Title (70 chars) <button onClick={() => copyToClipboard(result.socialMedia.pinterestTitle)} className="text-red-400 hover:text-white">Copy</button></div>
                                            <input value={result.socialMedia.pinterestTitle} readOnly className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-gray-200" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">Pin Description (150 chars) <button onClick={() => copyToClipboard(result.socialMedia.pinterestDescription)} className="text-red-400 hover:text-white">Copy</button></div>
                                            <textarea value={result.socialMedia.pinterestDescription} readOnly rows={2} className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-gray-200" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">Alt Text (Accessibility) <button onClick={() => copyToClipboard(result.socialMedia.pinterestAltText || "")} className="text-red-400 hover:text-white">Copy</button></div>
                                            <input value={result.socialMedia.pinterestAltText || ""} readOnly className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-gray-200" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">Hashtags <button onClick={() => copyToClipboard(result.socialMedia.pinterestHashtags || "")} className="text-red-400 hover:text-white">Copy</button></div>
                                            <input value={result.socialMedia.pinterestHashtags || ""} readOnly className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-blue-300 font-mono" />
                                        </div>
                                    </div>
                                )}

                                {socialTab === 'instagram' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">Instagram Caption <button onClick={() => copyToClipboard(result.socialMedia.instagramCaption)} className="text-purple-400 hover:text-white">Copy</button></div>
                                            <textarea value={result.socialMedia.instagramCaption} readOnly rows={4} className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-gray-200" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">High Volume Hashtags <button onClick={() => copyToClipboard(result.socialMedia.instagramHashtags || "")} className="text-purple-400 hover:text-white">Copy</button></div>
                                            <textarea value={result.socialMedia.instagramHashtags || ""} readOnly rows={3} className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-blue-300 font-mono" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <OptimizerChat
                        history={chatHistory}
                        isLoading={isChatLoading}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            )}

            {/* --- HIDDEN PRINT TEMPLATE --- */}
            {result && (
                <div id="printable-listing-report" className="printable-content text-black p-8 bg-white">
                    <div className="border-b-2 border-black pb-4 mb-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-extrabold mb-1">Listing Strategy Report</h1>
                                <div className="text-sm text-gray-600">Generated by Ranklistic AI</div>
                            </div>
                            <div className="text-right text-sm font-bold text-gray-500">
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-2">Product Title</h2>
                        <div className="text-2xl font-bold border-l-4 border-black pl-4 py-2 bg-gray-50">
                            {result.newTitle}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-4">SEO Tags (13)</h2>
                        <div className="flex flex-wrap gap-2">
                            {result.hashtags.map((tag, i) => (
                                <span key={i} className="border border-gray-400 px-3 py-1 rounded text-sm font-semibold bg-gray-50">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8 page-break">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-4">Description</h2>
                        <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded border border-gray-200">
                            {result.newDescription}
                        </div>
                    </div>

                    {result.socialMedia && (
                        <div className="page-break">
                            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-6 border-b pb-2">Social Media Strategy</h2>
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                    <span className="text-red-600">📌</span> Pinterest
                                </h3>
                                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-500">Pin Title</div>
                                        <p className="font-medium">{result.socialMedia.pinterestTitle}</p>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-500">Pin Description</div>
                                        <p className="text-sm">{result.socialMedia.pinterestDescription}</p>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-500">Hashtags</div>
                                        <p className="text-xs text-blue-600">{result.socialMedia.pinterestHashtags}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                    <span className="text-purple-600">📸</span> Instagram
                                </h3>
                                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-500">Caption</div>
                                        <p className="text-sm whitespace-pre-wrap">{result.socialMedia.instagramCaption}</p>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-500">Hashtags</div>
                                        <p className="text-xs text-blue-600">{result.socialMedia.instagramHashtags}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="text-center text-xs text-gray-400 mt-12 pt-4 border-t">
                        Ranklistic AI - Proprietary Report
                    </div>
                </div>
            )}
        </div>
    );
};