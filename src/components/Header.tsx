import React from 'react';
import { StarIcon, RocketIcon, LayoutDashboardIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  credits?: number;
  userPlan?: string;
  lang?: 'en' | 'tr';
  onOpenSubscription?: () => void;
  user?: any; // Supabase'den gelen kullanıcı objesi
}

export const Header: React.FC<HeaderProps> = ({ 
  credits, 
  userPlan = 'free', 
  lang = 'en', 
  onOpenSubscription,
  user
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Ranklistic
          </span>
        </Link>

        {/* Sağ Taraf: Login/Get Started veya Kredi Bilgisi */}
        <div className="flex items-center gap-4">
          {!user ? (
            // DURUM 1: Kullanıcı Giriş Yapmamışsa
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {lang === 'tr' ? 'Giriş Yap' : 'Login'}
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg shadow-orange-500/20 transition-all transform hover:scale-105"
              >
                {lang === 'tr' ? 'ÜCRETSİZ BAŞLA' : 'GET STARTED'}
              </Link>
            </div>
          ) : (
            // DURUM 2: Kullanıcı Giriş Yapmışsa
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-[#151b2b] rounded-full px-4 py-1.5 border border-white/10">
                <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">
                  {lang === 'tr' ? 'Kredi:' : 'Credits:'} <span className="text-white font-bold">{credits ?? 0}</span>
                </span>
              </div>

              {userPlan === 'free' && (
                <button 
                  onClick={onOpenSubscription}
                  className="bg-gradient-to-r from-orange-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 animate-pulse hover:scale-105 transition-transform"
                >
                  <RocketIcon className="w-3 h-3" />
                  {lang === 'tr' ? 'YÜKSELT' : 'UPGRADE'}
                </button>
              )}
              
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                <LayoutDashboardIcon className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};