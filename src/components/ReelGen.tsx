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

    // --- LAUNCH MODE: FORCE LOCKED ---
    // Herkes için kilitli (Waitlist Modu)
    const isLocked = true;

    // --- TEXT CONTENT (HEPSİ BURADA) ---
    const t = {
        title: lang === 'tr' ? 'ReelGen Video Stüdyosu' : 'ReelGen Video Studio',
        subtitle: lang === 'tr' 
            ? 'Statik ürün fotoğraflarını viral Etsy/TikTok videolarına dönüştürün.' 
            : 'Transform static product photos into viral-ready Etsy/TikTok videos.',
        upload: lang === 'tr' ? 'Fotoğraf Yükle' : 'Upload Photo',
        promptPh: lang === 'tr' ? 'Vibe tanımla (örn: Sinematik, Yavaş Çekim Pan...)' : 'Describe the vibe (e.g. Cinematic, Slow Pan, Sparkles...)',
        generate: lang === 'tr' ? `Video Üret (${VIDEO_COST} Kredi)` : `Generate Video (${VIDEO_COST} Credits)`,
        generating: lang === 'tr' ? 'Yönetmen Koltuğunda...' : 'Directing Scene...',
        
        // GÜNCELLENMİŞ LANSMAN MESAJLARI:
        upgrade: lang === 'tr' ? 'Bekleme Listesine Katıl' : 'Join Waitlist',
        lockedMsg: lang === 'tr' 
            ? 'Gemini 2.5 Video Motorumuz şu an son yük testlerinde. Lansman yoğunluğu nedeniyle şu an sadece bekleme listesi alıyoruz.' 
            : '🚀 Our Gemini 2.5 Video Engine is currently in final load testing. Due to high launch traffic, we are accepting waitlist only.',
    };

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
            // alert("Video generation failed."); // Kullanıcıyı rahatsız etmemek için kapalı kalabilir
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in relative">
            
            {/* FEATURE LOCK OVERLAY (LAUNCH MODE) */}
            {isLocked && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-8 border border-gray-800">
                    <div className="bg-purple-600/20 p-6 rounded-full mb-6 shadow-lg shadow-purple-500/20 animate-pulse">
                        <RocketIcon className="w-12 h-12 text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
                        {lang === 'tr' ? 'Çok Yakında Geliyor' : 'Coming Very Soon'}
                    </h3>
                    <p className="text-gray-400 max-w-md mb-8 text-lg leading-relaxed">{t.lockedMsg}</p>
                    <button 
                        onClick={() => window.open('https://twitter.com/ranklistic', '_blank')}
                        className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                    >
                        <StarIcon className="w-5 h-5" />
                        {t.upgrade}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden opacity-50 blur-[2px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>
                
                <VideoIcon className="w-12 h-12 text-pink-500 mx-auto mb-4 relative z-10" />
                <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10 tracking-tight">
                    {t.title} <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded ml-2 align-middle">BETA</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto relative z-10 text-lg">
                    {t.subtitle}
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 opacity-40 pointer-events-none select-none">
                {/* Controls (Disabled Visuals) */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 h-fit">
                    <div className="mb-6">
                        <div className="border-2 border-dashed border-gray-600 rounded-2xl h-64 flex flex-col items-center justify-center">
                            <div className="text-center text-gray-400">
                                <PaperClipIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p className="font-bold">{t.upload}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Area (Disabled Visuals) */}
                <div className="bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative min-h-[500px] flex items-center justify-center">
                     <div className="text-center text-gray-600">
                        <div className="w-20 h-20 border-2 border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RocketIcon className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm uppercase tracking-widest font-bold">Preview Screen</p>
                    </div>
                </div>
            </div>
        </div>
    );
};