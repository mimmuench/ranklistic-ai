import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Target, TrendingUp, Award, ArrowRight, X } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [tourStep, setTourStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  // ✅ Dashboard'daki ID'leri hedefleyen yeni adımlar
  const tourSteps = [
    {
      icon: Sparkles,
      title: "Ranklistic'e Hoşgeldin!",
      subtitle: "Başarının Komuta Merkezi",
      description: "Satışlarını 10 katına çıkaracak yapay zeka araçlarını keşfetmeye hazır mısın? Hızlı bir tur atalım.",
      highlight: null,
      primaryAction: "Turu Başlat",
    },
    {
      icon: Target,
      title: "Görselden Listing Yazarı",
      description: "Ürün fotoğrafını yükle, yapay zeka ürünü tanısın ve SEO uyumlu başlık, açıklama ve etiketleri saniyeler içinde yazsın.",
      tip: "Fotoğrafın net olması analizi güçlendirir!",
      highlight: "tour-visual-writer", // Dashboard'daki ID
    },
    {
      icon: Zap,
      title: "ReelGen Video Stüdyosu",
      description: "Tek bir fotoğraftan viral olmaya hazır Instagram Reels ve TikTok videoları oluştur. Video montajıyla uğraşma.",
      tip: "Videoları doğrudan telefonuna indirip paylaşabilirsin.",
      highlight: "tour-reel-gen", // Dashboard'daki ID
    },
    {
      icon: TrendingUp,
      title: "TrendRadar",
      description: "Rakiplerin uyanmadan 48 saat önce patlayacak nişleri yakala. Reddit ve TikTok sinyallerini tarar.",
      tip: "Her gün 6 yeni trend önerisi alırsın.",
      highlight: "tour-trend-radar", // Dashboard'daki ID
    },
    {
      icon: Award,
      title: "Hazırsın!",
      description: "Artık araçların nerede olduğunu biliyorsun. İlk denetimini veya listelemeni yaparak hemen başla!",
      stats: [
        { label: "Tahmini Artış", value: "%300+" },
        { label: "Tasarruf", value: "15 Saat" }
      ],
      highlight: null,
      primaryAction: "Keşfetmeye Başla",
    }
  ];

  const currentStep = tourSteps[tourStep];
  const Icon = currentStep.icon;

  useEffect(() => {
    const update = () => {
      if (currentStep.highlight) {
        const el = document.getElementById(currentStep.highlight);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setSpotlightRect(rect);
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
             setSpotlightRect(null);
          }
        } else {
          console.warn(`Tur hedefi bulunamadı: ${currentStep.highlight}`);
          setSpotlightRect(null);
        }
      } else {
        setSpotlightRect(null);
      }
    };
    
    const timer = setTimeout(update, 100);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);
    
    return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update);
        clearTimeout(timer);
    };
  }, [tourStep]);

  const getCardPosition = () => {
    if (!spotlightRect) {
      return { 
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10002
      };
    }

    const cardWidth = 340;
    const padding = 20;
    
    let style: any = {
      position: 'fixed' as const,
      zIndex: 10002
    };

    // Mobilde her zaman alta koy, Desktop'ta yana veya alta
    if (window.innerWidth < 768) {
        style.bottom = 20;
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        style.width = '90%';
    } else {
        // Desktop mantığı
        if (spotlightRect.top > 300) {
            // Element aşağıdaysa kartı üste koy
            style.bottom = window.innerHeight - spotlightRect.top + padding;
            style.left = spotlightRect.left + (spotlightRect.width / 2) - (cardWidth / 2);
        } else {
            // Element yukarıdaysa kartı alta koy
            style.top = spotlightRect.bottom + padding;
            style.left = spotlightRect.left + (spotlightRect.width / 2) - (cardWidth / 2);
        }
        
        // Ekran dışına taşmayı önle
        if (style.left < 20) style.left = 20;
    }

    return style;
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none font-sans">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-500" />

      {/* Spotlight Çerçevesi */}
      {spotlightRect && (
        <div 
          className="absolute z-[10001] border-2 border-orange-500 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-500 ease-out"
          style={{
            top: spotlightRect.top - 8,
            left: spotlightRect.left - 8,
            width: spotlightRect.width + 16,
            height: spotlightRect.height + 16,
          }}
        />
      )}

      {/* Bilgi Kartı */}
      <div 
        className="w-full max-w-[340px] bg-[#161B22] border border-orange-500/30 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-500"
        style={getCardPosition()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg">
                <Icon size={20} />
                </div>
                <h3 className="text-white font-black text-sm uppercase tracking-tight italic">
                {currentStep.title}
                </h3>
            </div>
            <button onClick={onComplete} className="text-gray-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Pro Tip */}
          {currentStep.tip && (
            <div className="mb-4 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-[11px] text-orange-200 animate-pulse">
              <span className="font-bold text-orange-500 uppercase mr-1 italic">Pro İpucu:</span> 
              {currentStep.tip}
            </div>
          )}

          {/* Stats */}
          {currentStep.stats && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {currentStep.stats.map((s, i) => (
                <div key={i} className="bg-gray-900/50 p-2 rounded-lg border border-gray-800 text-center">
                  <div className="text-orange-500 font-black text-sm">{s.value}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-tighter">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div className="flex gap-1">
              {tourSteps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tourStep ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-700'}`} />
              ))}
            </div>
            <div className="flex gap-2">
                {tourStep > 0 && (
                    <button
                    onClick={() => setTourStep(tourStep - 1)}
                    className="px-3 py-2 text-gray-400 hover:text-white text-[10px] font-bold uppercase transition-colors"
                    >
                    Geri
                    </button>
                )}
                <button
                onClick={() => tourStep < tourSteps.length - 1 ? setTourStep(tourStep + 1) : onComplete()}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] rounded-lg uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-orange-900/20"
                >
                {currentStep.primaryAction || "İleri"} <ArrowRight size={12} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;