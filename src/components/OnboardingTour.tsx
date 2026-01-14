import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Target, TrendingUp, Award, ArrowRight, X } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [tourStep, setTourStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const tourSteps = [
    {
      icon: Sparkles,
      title: "Growth Command Center",
      subtitle: "Where Etsy Success Becomes Inevitable",
      description: "You're about to discover the AI toolkit helping sellers 10x their sales. Ready?",
      highlight: null,
      primaryAction: "Start Tour",
    },
    {
      icon: Target,
      title: "Your AI Arsenal",
      description: "This sidebar is mission control. Shop audits, listing optimizer, and market analyzer are designed for an unfair advantage.",
      tip: "Start with a Shop Audit to uncover hidden opportunities!",
      highlight: "sidebar-nav",
    },
    {
      icon: Zap,
      title: "Your Power Meter",
      description: "Credits are fuel for your growth. High-tier AI insights require credits that refresh monthly—use them to dominate!",
      tip: "Higher tier plans = More credits + Premium features",
      highlight: "header-credits",
    },
    {
      icon: TrendingUp,
      title: "Quick Actions",
      description: "Generate optimized listings or spot trending products in seconds. These shortcuts are your fast-pass to success.",
      tip: "Use Product Launchpad to validate ideas before you invest!",
      highlight: "dashboard-quick-actions",
    },
    {
      icon: Award,
      title: "Ready to Dominate",
      description: "Every successful seller took action. Your first audit is waiting—let's make it legendary.",
      stats: [
        { label: "Rev. Increase", value: "312%" },
        { label: "Time Saved", value: "15h" }
      ],
      highlight: null,
      primaryAction: "Launch My Success",
    }
  ];

  const currentStep = tourSteps[tourStep];
  const Icon = currentStep.icon;

  useEffect(() => {
    const update = () => {
      if (currentStep.highlight) {
        const el = document.getElementById(currentStep.highlight);
        if (el) {
          setSpotlightRect(el.getBoundingClientRect());
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setSpotlightRect(null);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [tourStep]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none font-sans">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-auto" />

      {/* Spotlight Çerçevesi - Minimalist Turuncu */}
      {spotlightRect && (
        <div 
          className="absolute z-[10001] border-2 border-orange-500 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-500"
          style={{
            top: spotlightRect.top - 6,
            left: spotlightRect.left - 6,
            width: spotlightRect.width + 12,
            height: spotlightRect.height + 12,
          }}
        />
      )}

      {/* Kompakt Bilgi Kartı */}
      <div 
        className="relative w-full max-w-[340px] bg-[#161B22] border border-orange-500/30 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-500"
        style={spotlightRect ? {
          position: 'fixed',
          top: spotlightRect.bottom + 20 > window.innerHeight ? 'auto' : spotlightRect.bottom + 20,
          bottom: spotlightRect.bottom + 20 > window.innerHeight ? 20 : 'auto',
          left: Math.min(window.innerWidth - 360, Math.max(20, spotlightRect.left))
        } : {}}
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg">
              <Icon size={20} />
            </div>
            <h3 className="text-white font-black text-sm uppercase tracking-tight italic">
              {currentStep.title}
            </h3>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Pro Tip - Sadeleştirilmiş */}
          {currentStep.tip && (
            <div className="mb-4 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-[11px] text-orange-200">
              <span className="font-bold text-orange-500 uppercase mr-1 italic">Pro Tip:</span> 
              {currentStep.tip}
            </div>
          )}

          {/* Stats - Sadece final adımında */}
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
                <div key={i} className={`h-1 rounded-full transition-all ${i === tourStep ? 'w-4 bg-orange-500' : 'w-1.5 bg-gray-800'}`} />
              ))}
            </div>
            <button
              onClick={() => tourStep < tourSteps.length - 1 ? setTourStep(tourStep + 1) : onComplete()}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] rounded-lg uppercase tracking-widest transition-all flex items-center gap-2"
            >
              {currentStep.primaryAction || "Next"} <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;