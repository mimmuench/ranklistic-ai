
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, RocketIcon } from './icons';

export interface TourStep {
    targetId: string; // The ID of the HTML element to highlight
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface ProductTourProps {
    steps: TourStep[];
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({ steps, isOpen, onClose, onComplete }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isCalculated, setIsCalculated] = useState(false);

    const currentStep = steps[currentStepIndex];

    const updateTargetPosition = useCallback(() => {
        if (!isOpen) return;
        
        // If position is 'center', we don't need a target element
        if (currentStep.position === 'center') {
            setTargetRect(null);
            setIsCalculated(true);
            return;
        }

        const element = document.getElementById(currentStep.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            setIsCalculated(true);
            
            // Auto scroll to element if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Fallback if element not found: show in center
            setTargetRect(null);
            setIsCalculated(true);
        }
    }, [currentStep, isOpen]);

    useEffect(() => {
        // Recalculate position on step change or resize
        updateTargetPosition();
        window.addEventListener('resize', updateTargetPosition);
        return () => window.removeEventListener('resize', updateTargetPosition);
    }, [currentStepIndex, updateTargetPosition]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setIsCalculated(false); // Reset calculation for animation
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onClose();
    };

    if (!isOpen) return null;

    // Calculate Tooltip Position
    const getTooltipStyle = () => {
        if (!targetRect || currentStep.position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed' as 'fixed'
            };
        }

        const gap = 12;
        let top = 0;
        let left = 0;

        // Simple positioning logic
        if (currentStep.position === 'right') {
            top = targetRect.top + (targetRect.height / 2) - 100; // rough centering
            left = targetRect.right + gap;
        } else if (currentStep.position === 'bottom') {
            top = targetRect.bottom + gap;
            left = targetRect.left;
        } else if (currentStep.position === 'top') {
            top = targetRect.top - gap - 150; // approximate height
            left = targetRect.left;
        }
        
        // Safety bounds (prevent overflow)
        if (left < 10) left = 10;
        if (top < 10) top = 10;

        return {
            top: `${top}px`,
            left: `${left}px`,
            position: 'fixed' as 'fixed'
        };
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            
            {/* 1. SPOTLIGHT OVERLAY (The dark background with a hole) */}
            {targetRect && (
                <div 
                    className="absolute transition-all duration-500 ease-in-out pointer-events-none"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                        borderRadius: '12px',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 15px rgba(255, 165, 0, 0.5)' // Orange glow + Dark overlay
                    }}
                ></div>
            )}
            
            {/* Full screen dark overlay fallback if no target (Center mode) */}
            {!targetRect && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-500"></div>
            )}

            {/* 2. TOOLTIP CARD */}
            <div 
                className={`
                    bg-white text-slate-900 rounded-2xl shadow-2xl p-6 w-[320px] max-w-[90vw] z-[101] transition-all duration-300
                    ${isCalculated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                style={getTooltipStyle()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-100 p-1.5 rounded-lg">
                            <RocketIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Step {currentStepIndex + 1}/{steps.length}
                        </span>
                    </div>
                    <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2 text-slate-800">{currentStep.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {currentStep.content}
                </p>

                {/* Footer Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-2 h-2 rounded-full transition-colors ${i === currentStepIndex ? 'bg-orange-500' : 'bg-slate-200'}`}
                            ></div>
                        ))}
                    </div>
                    <button 
                        onClick={handleNext}
                        className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-lg text-sm font-bold transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
                    >
                        {currentStepIndex === steps.length - 1 ? "Get Started!" : "Next"}
                    </button>
                </div>
                
                {/* Arrow (Visual decoration only for non-center) */}
                {targetRect && (
                    <div className="absolute w-4 h-4 bg-white transform rotate-45 -z-10 -left-2 top-10"></div>
                )}
            </div>
        </div>
    );
};
