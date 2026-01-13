
import React from 'react';
import { TrendingUpIcon, StarIcon, RocketIcon } from './icons';

interface HeaderProps {
    credits?: number;
    lang: 'en' | 'tr';
    onOpenSubscription?: () => void;
    userPlan?: string;
}

export const Header: React.FC<HeaderProps> = ({ credits, lang, onOpenSubscription, userPlan }) => {
  return (
    <header className="bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="relative">
             <div className="absolute inset-0 bg-orange-500 blur-lg opacity-40 group-hover:opacity-75 transition-opacity rounded-full"></div>
             <TrendingUpIcon className="w-8 h-8 text-orange-500 relative z-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ranklistic <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">AI</span>
          </h1>
        </div>
        
        {credits !== undefined && (
            <div className="flex items-center space-x-4">
                 <div 
                    onClick={onOpenSubscription}
                    className="hidden md:flex items-center bg-[#151b2b] hover:bg-[#1f2937] cursor-pointer rounded-full px-4 py-1.5 border border-white/10 transition-all shadow-sm hover:shadow-orange-500/20 hover:border-orange-500/30"
                 >
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />
                    <span className="text-sm font-medium text-gray-300">
                        {lang === 'tr' ? 'Kredi:' : 'Credits:'} <span className="text-white font-bold">{credits}</span>
                    </span>
                 </div>
                 
                 {userPlan === 'free' && (
                     <button 
                        onClick={onOpenSubscription}
                        className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 animate-pulse shadow-lg shadow-orange-900/30"
                     >
                         <RocketIcon className="w-3 h-3" />
                         {lang === 'tr' ? 'YÜKSELT' : 'UPGRADE'}
                     </button>
                 )}

                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:border-orange-500/50 transition-colors shadow-inner">
                    ME
                 </div>
            </div>
        )}
      </div>
    </header>
  );
};
