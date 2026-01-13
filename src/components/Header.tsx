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
        
        {/* Logo Bölümü */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Ranklistic
          </span>
        </Link>

        {/* Sağ Taraf Menü */}
        <div className="flex items-center gap-4">
          {!user ? (
            /* GİRİŞ YAPMAMIŞ KULLANICI */
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                {lang === 'tr' ? 'Giriş Yap' : 'Login'}
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg transition-all transform hover:scale-105">
                {lang === 'tr' ? 'ÜCRETSİZ BAŞLA' : 'GET STARTED'}
              </Link>
            </div>
          ) : (
            /* GİRİŞ YAPMIŞ KULLANICI */
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-[#151b2b] rounded-full px-4 py-1.5 border border-white/10">
                {/* Yıldız İkonu (SVG) */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span className="text-sm font-medium text-gray-300">
                  {lang === 'tr' ? 'Kredi:' : 'Credits:'} <span className="text-white font-bold">{credits ?? 0}</span>
                </span>
              </div>

              {userPlan === 'free' && (
                <button onClick={onOpenSubscription} className="bg-gradient-to-r from-orange-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 animate-pulse hover:scale-105 transition-transform">
                  {/* Roket İkonu (SVG) */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.5-1 1-4c2 1 3 1 4 4Z"></path><path d="M12 15v5s1 .5 4 1c-3-1-4-2-4-4Z"></path></svg>
                  {lang === 'tr' ? 'YÜKSELT' : 'UPGRADE'}
                </button>
              )}
              
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                {/* Dashboard İkonu (SVG) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="15" rx="1"></rect></svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};