import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Target, TrendingUp, Award, ArrowRight, X, Rocket } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [tourStep, setTourStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const tourSteps = [
    {
      icon: Sparkles,
      title: "Welcome to Ranklistic!",
      description: "Your AI-powered command center for Etsy and Amazon success is ready. Let's take a quick look at your new workspace.",
      highlight: null,
      primaryAction: "Start Tour",
    },
    {
      icon: Zap,
      title: "Credit & Plan Tracking",
      description: "Keep an eye on your usage here. See your remaining credits and current plan status at a glance in the sidebar.",
      highlight: "nav-credits",
      tip: "Credits refresh monthly based on your plan level."
    },
    {
      icon: Rocket, // RocketIcon yerine Rocket
      title: "Amazon Engine",
      description: "Our crown jewel. Transform product photos into high-converting Amazon listings instantly. Specifically optimized for Amazon Handmade.",
      highlight: "nav-amazon",
      stats: [
        { label: "Efficiency", value: "10x Faster" },
        { label: "SEO Score", value: "98/100" }
      ]
    },
    {
      icon: TrendingUp,
      title: "Trend Radar",
      description: "Stay ahead of the market. We scan social signals to find winning niches 48 hours before they go viral.",
      highlight: "nav-trend-radar",
      tip: "Check this daily for fresh product ideas."
    },
    {
      icon: Award,
      title: "Need More Power?",
      description: "Unlock advanced features and higher credit limits. You can upgrade your plan anytime from the sidebar settings.",
      highlight: "nav-upgrade",
      primaryAction: "Let's Scale!",
      stats: [
        { label: "Growth Potential", value: "300%+" },
        { label: "Time Saved", value: "15+ Hours" }
      ]
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
          console.warn(`Tour target not found: ${currentStep.highlight}`);
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
  }, [tourStep, currentStep.highlight]);

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

    if (window.innerWidth < 768) {
      style.bottom = 20;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      style.width = '90%';
    } else {
      if (spotlightRect.top > 300) {
        style.bottom = window.innerHeight - spotlightRect.top + padding;
        style.left = spotlightRect.left + (spotlightRect.width / 2) - (cardWidth / 2);
      } else {
        style.top = spotlightRect.bottom + padding;
        style.left = spotlightRect.left + (spotlightRect.width / 2) - (cardWidth / 2);
      }
      
      if (style.left < 20) style.left = 20;
    }

    return style;
  };

  const handleNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none font-sans">
      {/* Professional Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="onboarding-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left - 10}
                y={spotlightRect.top - 10}
                width={spotlightRect.width + 20}
                height={spotlightRect.height + 20}
                rx="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          className="backdrop-blur-[4px] transition-all duration-500"
          mask="url(#onboarding-mask)"
        />
      </svg>

      {/* Orange Frame */}
      {spotlightRect && (
        <div 
          className="absolute z-[10001] border-2 border-orange-500 rounded-2xl shadow-[0_0_60px_rgba(249,115,22,0.5)] transition-all duration-500"
          style={{
            top: spotlightRect.top - 10,
            left: spotlightRect.left - 10,
            width: spotlightRect.width + 20,
            height: spotlightRect.height + 20,
          }}
        />
      )}

      {/* Info Card */}
      <div 
        className="w-full max-w-[340px] bg-[#161B22] border border-orange-500/30 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-500"
        style={getCardPosition()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{currentStep.title}</h3>
                <p className="text-gray-400 text-xs">
                  Step {tourStep + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Stats or Tip */}
        {currentStep.stats && (
          <div className="px-6 py-4 bg-orange-500/5 border-b border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              {currentStep.stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-orange-500 font-bold text-lg">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep.tip && (
          <div className="px-6 py-4 bg-blue-500/5 border-b border-gray-800">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-400 text-xs">{currentStep.tip}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === tourStep 
                    ? 'w-6 bg-orange-500' 
                    : 'w-1.5 bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {tourStep > 0 && (
              <button
                onClick={() => setTourStep(tourStep - 1)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2"
            >
              {tourStep === tourSteps.length - 1 ? (
                currentStep.primaryAction || 'Finish'
              ) : (
                <>
                  {currentStep.primaryAction || 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;