
import React, { useState } from 'react';
import { SearchIcon, StarIcon, PriceIcon, DescriptionIcon } from './icons';

interface AuditFormProps {
  onAudit: (url: string, manualStats?: { sales?: string; reviews?: string; context?: string }) => void;
  isLoading: boolean;
  lang: 'en' | 'tr';
}

const translations = {
  en: {
    labelUrl: "Etsy Shop URL",
    placeholderUrl: "https://www.etsy.com/shop/YourShopName",
    showAdvanced: "+ Improve Accuracy (Optional)",
    hideAdvanced: "Hide Advanced Options",
    helpText: "Help the AI understand your shop better to avoid generic advice.",
    labelSales: "Sales Count",
    labelReviews: "Review Count",
    labelContext: "Paste Shop Announcement or About Section",
    phContext: "e.g. 'We sell handmade leather bags using full-grain leather from Italy...'",
    contextHint: "Pasting your shop details here guarantees 100% accurate context.",
    btnLoading: "Auditing...",
    btnAudit: "Audit Shop"
  },
  tr: {
    labelUrl: "Etsy Mağaza Linki",
    placeholderUrl: "https://www.etsy.com/shop/MagazaAdiniz",
    showAdvanced: "+ Doğruluğu Artır (İsteğe Bağlı)",
    hideAdvanced: "Gelişmiş Seçenekleri Gizle",
    helpText: "Yapay zekanın mağazanızı daha iyi anlaması için detay verin.",
    labelSales: "Satış Sayısı",
    labelReviews: "Yorum Sayısı",
    labelContext: "Mağaza Duyurusu veya Hakkında Kısmı",
    phContext: "Örn: 'İtalya'dan gelen gerçek deri ile el yapımı çantalar üretiyoruz...'",
    contextHint: "Buraya detay yapıştırmak, analizin %100 doğru konu üzerine olmasını sağlar.",
    btnLoading: "Denetleniyor...",
    btnAudit: "Mağazayı Denetle"
  }
};

export const AuditForm: React.FC<AuditFormProps> = ({ onAudit, isLoading, lang }) => {
  const [url, setUrl] = useState('');
  const [salesCount, setSalesCount] = useState('');
  const [reviewCount, setReviewCount] = useState('');
  const [manualContext, setManualContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAudit(url, {
        sales: salesCount,
        reviews: reviewCount,
        context: manualContext
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl">
        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">{t.labelUrl}</label>
        <div className="relative mb-4">
            <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.placeholderUrl}
            className="w-full pl-4 pr-4 py-4 text-lg bg-gray-900 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-white placeholder-gray-500"
            disabled={isLoading}
            />
        </div>

        <div className="mb-4">
            <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium focus:outline-none"
            >
                {showAdvanced ? t.hideAdvanced : t.showAdvanced}
            </button>
            <p className="text-xs text-gray-500 mt-1">{t.helpText}</p>
        </div>

        {showAdvanced && (
            <div className="space-y-4 animate-fade-in bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1">
                            <PriceIcon className="w-3 h-3"/> {t.labelSales}
                        </label>
                        <input
                            type="number"
                            value={salesCount}
                            onChange={(e) => setSalesCount(e.target.value)}
                            placeholder="e.g. 3"
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1">
                            <StarIcon className="w-3 h-3"/> {t.labelReviews}
                        </label>
                        <input
                            type="number"
                            value={reviewCount}
                            onChange={(e) => setReviewCount(e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-orange-500"
                        />
                    </div>
                </div>

                <div>
                     <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1">
                        <DescriptionIcon className="w-3 h-3"/> {t.labelContext}
                    </label>
                    <textarea 
                        value={manualContext}
                        onChange={(e) => setManualContext(e.target.value)}
                        placeholder={t.phContext}
                        rows={3}
                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-orange-500 placeholder-gray-600"
                    />
                    <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                        <StarIcon className="w-3 h-3" /> {t.contextHint}
                    </p>
                </div>
            </div>
        )}

        <div className="flex justify-end mt-4">
             <button
            type="submit"
            disabled={isLoading || !url}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-900/20 w-full md:w-auto"
            >
            {isLoading ? (
                <span>{t.btnLoading}</span>
            ) : (
                <>
                <SearchIcon className="w-5 h-5" />
                <span>{t.btnAudit}</span>
                </>
            )}
            </button>
        </div>
      </div>
    </form>
  );
};
