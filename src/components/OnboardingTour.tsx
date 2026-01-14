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
      highlight: "sidebar-nav", // Sidebar bileşenine id="sidebar-nav" eklemeyi unutma
      primaryAction: "Show Me More",
      gradient: "from-purple-500 to-pink-600",
      tip: "Pro tip: Start with a Shop Audit to uncover hidden opportunities!"
    },
    {
      icon: Zap,
      title: "Your Power Meter",
      subtitle: "Credits = Unlimited Possibilities",
      description: "Each AI analysis uses credits. Think of them as fuel for your growth engine. Your plan includes credits that refresh monthly—use them to dominate!",
      highlight: "header-credits", // Header'daki kredi div'ine id="header-credits" ekle
      primaryAction: "Got It",
      gradient: "from-orange-500 to-red-600",
      tip: "Higher tier plans = More credits + Premium features"
    },
    {
      icon: TrendingUp,
      title: "Quick Actions = Quick Wins",
      subtitle: "Start Creating Viral Listings",
      description: "These shortcuts are your fast-pass to success. Generate optimized listings, analyze competitors, or spot trending products—all in seconds.",
      highlight: "dashboard-quick-actions", // Dashboard grid div'ine id="dashboard-quick-actions" ekle
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

  // Spotlight (Vurgulama) takibi için useEffect
  useEffect(() => {
    if (currentStep.highlight) {
      const el = document.getElementById(currentStep.highlight);
      if (el) {
        setSpotlightRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setSpotlightRect(null);
    }
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
      {/* Dynamic Backdrop with Spotlight Effect */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-all duration-700"
        style={{
          clipPath: spotlightRect 
            ? `polygon(0% 0%, 0% 100%, ${spotlightRect.left - 10}px 100%, ${spotlightRect.left - 10}px ${spotlightRect.top - 10}px, ${spotlightRect.right + 10}px ${spotlightRect.top - 10}px, ${spotlightRect.right + 10}px ${spotlightRect.bottom + 10}px, ${spotlightRect.left - 10}px ${spotlightRect.bottom + 10}px, ${spotlightRect.left - 10}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />
      
      {/* Particles */}
      {currentStep.particles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      )}

      {/* Content Modal / Balon */}
      <div 
        className={`relative w-full p-4 transition-all duration-500 ease-in-out ${
          spotlightRect ? 'max-w-md' : 'max-w-2xl'
        }`}
        style={spotlightRect ? {
          position: 'fixed',
          top: spotlightRect.bottom + 40 > window.innerHeight ? 'auto' : `${spotlightRect.bottom + 20}px`,
          bottom: spotlightRect.bottom + 40 > window.innerHeight ? '20px' : 'auto',
          left: `${Math.min(window.innerWidth - 450, Math.max(20, spotlightRect.left))}px`
        } : {}}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${currentStep.gradient} opacity-20 blur-3xl rounded-3xl animate-pulse`}></div>
        
        <div className="relative bg-[#161B22] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <button onClick={handleComplete} className="absolute top-6 right-6 z-10 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className={`h-full bg-gradient-to-r ${currentStep.gradient} transition-all duration-500 ease-out`}
              style={{ width: `${((tourStep + 1) / tourSteps.length) * 100}%` }}
            ></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="relative inline-block mb-6">
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`font-black text-white mb-2 tracking-tight italic uppercase ${spotlightRect ? 'text-xl' : 'text-3xl md:text-4xl'}`}>
                {currentStep.title}
              </h2>
              <p className={`font-semibold bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent mb-4 ${spotlightRect ? 'text-sm' : 'text-lg'}`}>
                {currentStep.subtitle}
              </p>
              <p className={`text-gray-400 leading-relaxed ${spotlightRect ? 'text-sm' : 'text-base'}`}>
                {currentStep.description}
              </p>
            </div>

            {currentStep.tip && (
              <div className="mb-8 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <div className="flex items-start gap-3 text-sm">
                  <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <p className="text-gray-300"><span className="text-yellow-500 font-bold">Pro Tip:</span> {currentStep.tip}</p>
                </div>
              </div>
            )}

            {currentStep.stats && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {currentStep.stats.map((stat, idx) => (
                  <div key={idx} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className={`text-xl font-black bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {tourSteps.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? `w-8 bg-gradient-to-r ${currentStep.gradient}` : 'w-2 bg-gray-700'}`} />
                ))}
              </div>

              <button
                onClick={handleNext}
                className={`px-8 py-4 bg-gradient-to-r ${currentStep.gradient} rounded-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap`}
              >
                <span>{currentStep.primaryAction}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Marker (Vurgulanan yerin altında zıplayan ok) */}
      {spotlightRect && (
        <div 
          className="fixed z-[10001] animate-bounce pointer-events-none"
          style={{
            top: spotlightRect.top - 40,
            left: spotlightRect.left + (spotlightRect.width / 2) - 15
          }}
        >
          <ChevronRight className="w-8 h-8 text-orange-500 rotate-90" />
        </div>
      )}
    </div>
  );
};

export default OnboardingTour;