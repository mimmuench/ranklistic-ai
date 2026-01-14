import React from 'react';
import { Star, Rocket } from 'lucide-react';

interface HeaderProps {
  credits?: number;
  userPlan?: string;
  lang?: 'en' | 'tr';
  onOpenSubscription?: () => void;
}

// Header.tsx
export const Header: React.FC<HeaderProps> = ({ credits, userPlan = 'free', lang = 'en', onOpenSubscription }) => {
  return (
    // Yüksekliği py-4'ten py-2'ye düşürdük, daha ince bir yapı kurduk
    <header className="sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 px-6 py-2">
      <div className="flex items-center justify-end gap-4">
        
        {/* Kredi Bilgisi - Boyutları küçültüldü */}
        <div className="flex items-center bg-white/5 rounded-full px-3 py-1 border border-white/10">
          <Star className="w-3.5 h-3.5 text-yellow-400 mr-1.5 fill-yellow-400" />
          <span className="text-[12px] font-medium text-gray-300">
            {lang === 'tr' ? 'Kredi:' : 'Credits:'} <span className="text-white font-bold ml-1">{credits ?? 0}</span>
          </span>
        </div>

        {/* Upgrade Butonu - Daha küçük ve zarif hale getirildi */}
        {userPlan === 'free' && (
          <button 
            onClick={onOpenSubscription} 
            className="bg-gradient-to-r from-orange-600 to-pink-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:opacity-90 transition-all shadow-lg shadow-orange-500/10"
          >
            <Rocket className="w-3 h-3" />
            {lang === 'tr' ? 'YÜKSELT' : 'UPGRADE'}
          </button>
        )}
      </div>
    </header>
  );
};