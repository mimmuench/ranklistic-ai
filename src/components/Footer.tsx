
import React from 'react';
import { TrendingUpIcon, StarIcon } from './icons';

interface FooterProps {
    lang: 'en' | 'tr';
    onOpenPolicy: (type: 'privacy' | 'terms' | 'refund') => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenPolicy }) => {
  const currentYear = new Date().getFullYear();

  const t = {
      tagline: lang === 'tr' 
        ? "Etsy satıcıları için Yapay Zeka destekli büyüme motoru. Veri ile değil, eylem ile kazanın." 
        : "The AI-powered growth engine for Etsy sellers. Win with action, not just data.",
      features: lang === 'tr' ? "Özellikler" : "Features",
      company: lang === 'tr' ? "Şirket" : "Company",
      legal: lang === 'tr' ? "Yasal & Güven" : "Legal & Trust",
      privacy: lang === 'tr' ? "Gizlilik Politikası" : "Privacy Policy",
      terms: lang === 'tr' ? "Kullanım Şartları" : "Terms of Service",
      refund: lang === 'tr' ? "İptal ve İade Politikası" : "Refund & Cancellation Policy",
      contact: lang === 'tr' ? "İletişim" : "Contact Us",
      blog: "Blog",
      audit: lang === 'tr' ? "Mağaza Denetimi" : "Shop Audit",
      keywords: lang === 'tr' ? "Anahtar Kelimeler" : "Keyword Tool",
      market: lang === 'tr' ? "Pazar Analizi" : "Market Analysis",
      rights: lang === 'tr' ? "Tüm hakları saklıdır." : "All rights reserved."
  };

  return (
    <footer className="bg-[#0B1120] border-t border-slate-800 mt-auto relative z-10 no-print">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="md:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                    <TrendingUpIcon className="w-6 h-6 text-orange-500" />
                    <span className="text-xl font-bold text-white tracking-tight">Ranklistic</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {t.tagline}
                </p>
                <div className="text-xs text-slate-500 mb-4 space-y-1">
                    <p className="font-bold text-slate-400">Mundo Global LLC</p>
                    <p>support@ranklistic.com</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Social Placeholders */}
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer">
                        <span className="font-bold text-xs">𝕏</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-all cursor-pointer">
                        <span className="font-bold text-xs">In</span>
                    </div>
                </div>
            </div>

            {/* Links Columns */}
            <div>
                <h4 className="text-white font-bold mb-4">{t.features}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-orange-400 transition-colors">{t.audit}</a></li>
                    <li><a href="#" className="hover:text-orange-400 transition-colors">Visual Launchpad</a></li>
                    <li><a href="#" className="hover:text-orange-400 transition-colors">{t.keywords}</a></li>
                    <li><a href="#" className="hover:text-orange-400 transition-colors">{t.market}</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-4">{t.company}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-orange-400 transition-colors">{t.blog}</a></li>
                    <li><a href="#" className="hover:text-orange-400 transition-colors">Affiliate Program</a></li>
                    <li><a href="mailto:support@ranklistic.com" className="hover:text-orange-400 transition-colors">{t.contact}</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-4">{t.legal}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li><button onClick={() => onOpenPolicy('privacy')} className="hover:text-orange-400 transition-colors text-left">{t.privacy}</button></li>
                    <li><button onClick={() => onOpenPolicy('terms')} className="hover:text-orange-400 transition-colors text-left">{t.terms}</button></li>
                    <li><button onClick={() => onOpenPolicy('refund')} className="hover:text-orange-400 transition-colors text-left">{t.refund}</button></li>
                    <li className="pt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                            System Operational
                        </span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col text-slate-600 text-xs text-center md:text-left">
                <p>&copy; {currentYear} <strong>Mundo Global LLC</strong>. {t.rights}</p>
                <p className="mt-1 opacity-70">Ranklistic AI is a registered trademark of Mundo Global LLC.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
                <StarIcon className="w-3 h-3 text-yellow-500" />
                <span>Made for Makers</span>
            </div>
        </div>
      </div>
    </footer>
  );
};
