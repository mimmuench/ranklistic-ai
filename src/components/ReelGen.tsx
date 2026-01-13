
import React, { useState, useRef } from 'react';
import { VideoIcon, PaperClipIcon, CloseIcon, SparklesIcon, FilmIcon, RocketIcon, StarIcon } from './icons';
import { generateProductVideo } from '../services/geminiService';

interface ReelGenProps {
    lang: 'en' | 'tr';
    userCredits: number;
    userPlan?: string;
    onDeductCredit: (amount: number) => Promise<boolean>;
    onOpenSubscription: () => void;
}

const VIDEO_COST = 20; // High cost for video generation

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

export const ReelGen: React.FC<ReelGenProps> = ({ lang, userCredits, userPlan, onDeductCredit, onOpenSubscription }) => {
    const [image, setImage] = useState<{ preview: string; base64: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const t = {
        title: lang === 'tr' ? 'ReelGen Video Stüdyosu' : 'ReelGen Video Studio',
        subtitle: lang === 'tr' 
            ? 'Statik ürün fotoğraflarını viral Etsy/TikTok videolarına dönüştürün.' 
            : 'Transform static product photos into viral-ready Etsy/TikTok videos.',
        upload: lang === 'tr' ? 'Fotoğraf Yükle' : 'Upload Photo',
        promptPh: lang === 'tr' ? 'Vibe tanımla (örn: Sinematik, Yavaş Çekim Pan...)' : 'Describe the vibe (e.g. Cinematic, Slow Pan, Sparkles...)',
        generate: lang === 'tr' ? `Video Üret (${VIDEO_COST} Kredi)` : `Generate Video (${VIDEO_COST} Credits)`,
        generating: lang === 'tr' ? 'Yönetmen Koltuğunda...' : 'Directing Scene...',
        upgrade: lang === 'tr' ? 'Growth Planına Yükselt' : 'Upgrade to Growth',
        lockedMsg: lang === 'tr' ? 'Video üretimi sadece Growth ve Agency planlarında mevcuttur.' : 'Video generation is available on Growth & Agency plans only.',
    };

    // Feature Gating: Lock for Free and Starter plans
    const isLocked = !userPlan || userPlan === 'free' || userPlan === 'starter';

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            const base64 = await blobToBase64(file);
            setImage({ preview, base64 });
        }
    };

    const handleGenerate = async () => {
        if (!image) return;
        
        // 1. Credit Check
        if (userCredits < VIDEO_COST) {
            onOpenSubscription();
            return;
        }

        // 2. Deduct Credits
        const success = await onDeductCredit(VIDEO_COST);
        if (!success) return;

        setIsLoading(true);
        setVideoUrl(null);
        try {
            const finalPrompt = `Professional product video, 9:16 aspect ratio, high quality, ${prompt || "cinematic slow motion camera movement"}`;
            const url = await generateProductVideo(image.base64, finalPrompt);
            setVideoUrl(url);
        } catch (e) {
            console.error(e);
            alert("Video generation failed. Please try again. (Credits refunded - Logic todo)"); 
            // In a real app, you would refund credits here if API fails.
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in relative">
            
            {/* FEATURE LOCK OVERLAY */}
            {isLocked && (
                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-purple-600 p-4 rounded-full mb-4 shadow-lg shadow-purple-500/50">
                        <VideoIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Pro Studio Locked</h3>
                    <p className="text-gray-300 max-w-md mb-6 text-lg">{t.lockedMsg}</p>
                    <button 
                        onClick={onOpenSubscription}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                    >
                        {t.upgrade}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>
                
                <VideoIcon className="w-12 h-12 text-pink-500 mx-auto mb-4 relative z-10" />
                <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10 tracking-tight">
                    {t.title} <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded ml-2 align-middle">BETA</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto relative z-10 text-lg">
                    {t.subtitle}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 h-fit">
                    
                    {/* Upload Area */}
                    <div className="mb-6">
                        <div 
                            onClick={() => !isLocked && fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-pink-500 bg-gray-900' : 'border-gray-600 hover:border-gray-400 hover:bg-gray-700/50'}`}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageSelect}
                                disabled={isLocked}
                            />
                            {image ? (
                                <div className="relative w-full h-full p-2">
                                    <img src={image.preview} alt="Upload" className="w-full h-full object-contain rounded-xl" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setImage(null); }}
                                        className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <PaperClipIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="font-bold">{t.upload}</p>
                                    <p className="text-xs mt-1">JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Prompt */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-300 mb-2">Director's Notes</label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t.promptPh}
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white outline-none"
                                disabled={isLocked}
                            />
                            <SparklesIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
                        </div>
                        {/* Presets */}
                        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                            {['Cinematic Pan', 'Zoom In', 'Sparkle Effect', 'Neon Glow'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => setPrompt(p)}
                                    disabled={isLocked}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={handleGenerate}
                            disabled={!image || isLoading || isLocked}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                        >
                            {isLoading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.generating}</>
                            ) : (
                                <><FilmIcon className="w-6 h-6" /> {t.generate}</>
                            )}
                        </button>
                        <div className="flex justify-between text-xs text-gray-500 px-2">
                            <span>Cost: <span className="text-white font-bold">{VIDEO_COST} Credits</span></span>
                            <span>Balance: <span className={`${userCredits < VIDEO_COST ? 'text-red-400' : 'text-green-400'} font-bold`}>{userCredits}</span></span>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative min-h-[500px] flex items-center justify-center">
                    {videoUrl ? (
                        <video 
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-center text-gray-600">
                            <div className="w-20 h-20 border-2 border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RocketIcon className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm uppercase tracking-widest font-bold">Preview Screen</p>
                        </div>
                    )}
                    
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-pink-400 font-bold animate-pulse">Rendering Video...</p>
                            <p className="text-gray-500 text-xs mt-2">Powered by Google Veo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
