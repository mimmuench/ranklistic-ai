import React from 'react';
import { Star, Rocket } from 'lucide-react';

interface HeaderProps {
  credits?: number;
  userPlan?: string;
  lang?: 'en' | 'tr';
  onOpenSubscription?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  credits, 
  userPlan = 'free', 
  lang = 'en', 
  onOpenSubscription
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
      <div className="flex items-center justify-end gap-6">
        
        {/* Kredi Bilgisi - Sadece Dashboard için temiz görünüm */}
        <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10">
          <Star className="w-4 h-4 text-yellow-400 mr-2 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-300">
            {lang === 'tr' ? 'Kredi:' : 'Credits:'} <span className="text-white font-bold ml-1">{credits ?? 0}</span>
          </span>
        </div>

        {/* Upgrade Butonu - Sadece Gerektiğinde Görünür */}
        {userPlan === 'free' && (
          <button 
            onClick={onOpenSubscription} 
            className="bg-gradient-to-r from-orange-600 to-pink-600 text-white text-xs font-bold px-5 py-2 rounded-full flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-orange-500/10"
          >
            <Rocket className="w-3 h-3" />
            {lang === 'tr' ? 'YÜKSELT' : 'UPGRADE'}
          </button>
        )}
        
      </div>
    </header>
  );
};