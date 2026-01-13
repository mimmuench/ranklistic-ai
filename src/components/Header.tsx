import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  credits?: number;
  userPlan?: string;
  lang?: 'en' | 'tr';
  onOpenSubscription?: () => void;
  user?: any;
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

        {/* Sağ Taraf */}
        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {lang === 'tr' ? 'Giriş Yap' : 'Login'}
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg transition-all transform hover:scale-105">
                {lang === 'tr' ? 'ÜCRETSİZ BAŞLA' : 'GET STARTED'}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-[#151b2b] rounded-full px-4 py-1.5 border border-white/10">
                {/* Star SVG */}
                <svg className="w-4 h-4 text-yellow-400 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-sm font-medium text-gray-300">
                  {lang === 'tr' ? 'Kredi:' : 'Credits:'} <span className="text-white font-bold">{credits ?? 0}</span>
                </span>
              </div>

              {userPlan === 'free' && (
                <button onClick={onOpenSubscription} className="bg-gradient-to-r from-orange-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 animate-pulse transition-transform hover:scale-105">
                  {/* Rocket SVG */}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3m0 0l-3 3m3-3V21m12-12c0 2.12-2.12 4.24-4.24 4.24-1.59 0-3.18-.53-4.24-1.59L12 10.5M21 3s-9.5 0-13.5 4c-1.5 1.5-2.5 3.5-2.5 5.5s1 4 2.5 5.5l1.5-1.5"/></svg>
                  {lang === 'tr' ? 'YÜKSELT' : 'UPGRADE'}
                </button>
              )}
              
              <Link to="/dashboard" className="text-gray-400 hover:text-white">
                {/* Dashboard SVG */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z"/></svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};