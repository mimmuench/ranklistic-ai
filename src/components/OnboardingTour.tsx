import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Target, TrendingUp, Award, ArrowRight, X, ChevronRight } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [tourStep, setTourStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const tourSteps = [
    {
      icon: Sparkles,
      title: "Welcome to Your Growth Command Center",
      subtitle: "Where Etsy Success Becomes Inevitable",
      description: "You're about to discover the AI-powered toolkit that's helping sellers like you 10x their sales. Let's show you how everything works.",
      highlight: null,
      primaryAction: "Start Tour",
      gradient: "from-blue-500 to-purple-600",
      particles: true
    },
    {
      icon: Target,
      title: "Your AI Arsenal",
      subtitle: "Every Tool You Need, One Click Away",
      description: "This sidebar is your mission control. Shop audits, listing optimizer, market analyzer—each tool is designed to give you an unfair advantage.",
      highlight: "sidebar-nav",
      primaryAction: "Show Me More",
      gradient: "from-purple-500 to-pink-600",
      tip: "Pro tip: Start with a Shop Audit to uncover hidden opportunities!"
    },
    {
      icon: Zap,
      title: "Your Power Meter",
      subtitle: "Credits = Unlimited Possibilities",
      description: "Each AI analysis uses credits. Think of them as fuel for your growth engine. Your plan includes credits that refresh monthly—use them to dominate!",
      highlight: "header-credits",
      primaryAction: "Got It",
      gradient: "from-orange-500 to-red-600",
      tip: "Higher tier plans = More credits + Premium features"
    },
    {
      icon: TrendingUp,
      title: "Quick Actions = Quick Wins",
      subtitle: "Start Creating Viral Listings",
      description: "These shortcuts are your fast-pass to success. Generate optimized listings, analyze competitors, or spot trending products—all in seconds.",
      highlight: "dashboard-quick-actions",
      primaryAction: "Almost There",
      gradient: "from-green-500 to-teal-600",
      tip: "Use Product Launchpad to validate ideas before you invest!"
    },
    {
      icon: Award,
      title: "You're Ready to Dominate",
      subtitle: "Your Etsy Empire Starts Now",
      description: "Every successful seller started exactly where you are. The difference? They took action. Your first audit is waiting—let's make it legendary.",
      highlight: null,
      primaryAction: "Launch My Success",
      gradient: "from-yellow-500 to-orange-600",
      stats: [
        { label: "Avg. Revenue Increase", value: "312%" },
        { label: "Time Saved Per Week", value: "15h" },
        { label: "Success Rate", value: "94%" }
      ]
    }
  ];

  const currentStep = tourSteps[tourStep];
  const Icon = currentStep.icon;

  // ÖNEMLİ: Hedef elementin yerini hesaplar ve spotlight oluşturur
  useEffect(() => {
    const updateSpotlight = () => {
      if (currentStep.highlight) {
        const el = document.getElementById(currentStep.highlight);
        if (el) {
          const rect = el.getBoundingClientRect();
          setSpotlightRect(rect);
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setSpotlightRect(null);
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [tourStep, currentStep.highlight]);

  const handleNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden">
      {/* 1. DİNAMİK BACKDROP (Sadece hedefi parlatır) */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-all duration-700 ease-in-out"
        style={{
          clipPath: spotlightRect 
            ? `polygon(0% 0%, 0% 100%, ${spotlightRect.left - 10}px 100%, ${spotlightRect.left - 10}px ${spotlightRect.top - 10}px, ${spotlightRect.right + 10}px ${spotlightRect.top - 10}px, ${spotlightRect.right + 10}px ${spotlightRect.bottom + 10}px, ${spotlightRect.left - 10}px ${spotlightRect.bottom + 10}px, ${spotlightRect.left - 10}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />
      
      {/* 2. DİNAMİK MODAL KONUMLANDIRMA */}
      <div 
        className={`relative w-full p-4 transition-all duration-500 ease-in-out ${
          spotlightRect ? 'max-w-md' : 'max-w-2xl'
        }`}
        style={spotlightRect ? {
          position: 'fixed',
          top: spotlightRect.bottom + 100 > window.innerHeight ? 'auto' : `${spotlightRect.bottom + 25}px`,
          bottom: spotlightRect.bottom + 100 > window.innerHeight ? '30px' : 'auto',
          left: `${Math.min(window.innerWidth - 450, Math.max(20, spotlightRect.left))}px`,
          zIndex: 10001
        } : {}}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${currentStep.gradient} opacity-20 blur-3xl rounded-3xl animate-pulse`}></div>
        
        <div className="relative bg-[#161B22] border border-gray-700 rounded-3xl shadow-2xl overflow-hidden border-t-4" style={{ borderColor: 'rgba(249, 115, 22, 0.5)' }}>
          <button onClick={handleComplete} className="absolute top-6 right-6 z-10 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter italic">
                  {currentStep.title}
                </h2>
                <p className={`text-sm font-bold bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent`}>
                  {currentStep.subtitle}
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {currentStep.description}
            </p>

            {currentStep.tip && (
              <div className="mb-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-300 italic"><span className="text-orange-500 font-bold not-italic">PRO TIP:</span> {currentStep.tip}</p>
              </div>
            )}

            {currentStep.stats && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {currentStep.stats.map((stat, idx) => (
                  <div key={idx} className="text-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                    <div className={`text-xl font-black bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-black">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                {tourSteps.map((_, idx) => (
                  <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === tourStep ? `w-8 bg-gradient-to-r ${currentStep.gradient}` : 'w-2 bg-gray-700'}`} />
                ))}
              </div>

              <button
                onClick={handleNext}
                className={`px-8 py-3 bg-gradient-to-r ${currentStep.gradient} rounded-xl font-black text-white text-xs uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2`}
              >
                <span>{currentStep.primaryAction}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ZIPLAYAN OK GÖSTERGESİ */}
      {spotlightRect && (
        <div 
          className="fixed z-[10002] animate-bounce pointer-events-none"
          style={{
            top: spotlightRect.top - 50,
            left: spotlightRect.left + (spotlightRect.width / 2) - 15
          }}
        >
          <ChevronRight className="w-10 h-10 text-orange-500 rotate-90 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
        </div>
      )}
    </div>
  );
};

export default OnboardingTour;