
import React, { useState } from 'react';
import type { AuditReport, AuditItem, SavedRecord, UserSettings } from '../types';
import { SeoIcon, CameraIcon, BrandIcon, DescriptionIcon, PriceIcon, StarIcon, CheckCircleIcon, ChatBubbleIcon, PrinterIcon, SaveIcon, RocketIcon, CloseCircleIcon, CloseIcon } from './icons';
import { RadarChart, GaugeChart } from './Charts';
import { supabaseMock } from '../services/supabaseService';

interface AuditResultProps {
  result: AuditReport;
  onStartChat: (item: AuditItem) => void;
  shopUrl: string;
  userPlan?: string;
  brandSettings?: UserSettings; 
}

const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('seo')) return <SeoIcon className="w-6 h-6" />;
  if (lowerCategory.includes('photo')) return <CameraIcon className="w-6 h-6" />;
  if (lowerCategory.includes('brand')) return <BrandIcon className="w-6 h-6" />;
  if (lowerCategory.includes('desc') || lowerCategory.includes('story')) return <DescriptionIcon className="w-6 h-6" />;
  if (lowerCategory.includes('pric') || lowerCategory.includes('ship')) return <PriceIcon className="w-6 h-6" />;
  return <CheckCircleIcon className="w-6 h-6" />;
};

const getCategoryStyle = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('seo')) return 'from-blue-600 to-cyan-500';
    if (lower.includes('photo')) return 'from-purple-600 to-pink-500';
    if (lower.includes('brand')) return 'from-pink-600 to-rose-500';
    if (lower.includes('trust')) return 'from-emerald-600 to-teal-500';
    return 'from-gray-700 to-gray-600';
};

export const AuditResult: React.FC<AuditResultProps> = ({ result, onStartChat, shopUrl, userPlan, brandSettings }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const getShopName = (url: string) => {
      try {
          const u = new URL(url);
          const path = u.pathname;
          const segments = path.split('/').filter(Boolean);
          if (segments[0] === 'shop' && segments[1]) return segments[1];
          if (segments[0]) return segments[0];
          return "Your Shop";
      } catch {
          return "Your Shop";
      }
  };

  const shopName = getShopName(shopUrl);
  
  // Calculate Average Score
  const averageScore = Math.round((result.audit.reduce((acc, curr) => acc + curr.score, 0) / result.audit.length) * 10) / 10;

  // Prepare Radar Data (Map categories to short labels)
  const radarData = result.audit.map(item => {
      let label = item.category;
      if (label.length > 10) {
          if (label.includes('SEO')) label = 'SEO';
          else if (label.includes('Photo')) label = 'Photos';
          else if (label.includes('Brand')) label = 'Brand';
          else if (label.includes('Price')) label = 'Price';
          else if (label.includes('Trust')) label = 'Trust';
          else if (label.includes('Niche')) label = 'Niche';
          else label = label.substring(0, 8) + '..';
      }
      return { label, score: item.score };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
      setIsSaving(true);
      const newRecord = {
          type: 'audit' as const,
          title: shopName,
          date: new Date().toISOString(),
          score: averageScore,
          data: result,
          tags: ['Audit', shopName]
      };
      
      const success = await supabaseMock.db.saveReport(newRecord);

      setIsSaving(false);
      if (success) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
      } else {
          alert("Could not save to database. Check connection.");
      }
  };

  const isAgency = userPlan === 'agency';
  const hasCustomBranding = isAgency && (brandSettings?.brandName || brandSettings?.brandLogo);

  return (
    <div className="mt-10 space-y-8 relative pb-20">
      
      {/* HEADER & CONTROLS (SCREEN ONLY) */}
      <div className="flex flex-col sm:flex-row justify-between items-center no-print mb-6 gap-4">
        <div>
            <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <RocketIcon className="w-8 h-8 text-orange-500" />
                Audit Report
            </h3>
            <p className="text-gray-400 text-sm">{shopName}</p>
        </div>
        <div className="flex gap-3">
             <button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={`flex items-center space-x-2 border font-bold py-2 px-4 rounded-lg transition-all text-sm ${isSaved ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
            >
              {isSaved ? <CheckCircleIcon className="w-4 h-4"/> : <SaveIcon className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : isSaved ? 'Saved to DB' : 'Save Report'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-white text-gray-900 font-bold py-2 px-4 rounded-lg transition-all hover:bg-gray-200 shadow-lg text-sm"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>PDF {isAgency ? '(White Label)' : ''}</span>
            </button>
        </div>
      </div>

      {/* 1. VISUAL SUMMARY DASHBOARD (SCREEN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in no-print">
          {/* Main Score Card */}
          <div className="bg-[#161b28] border border-gray-700/50 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Overall Health</h4>
              <GaugeChart score={averageScore} label="Shop Score" />
              <p className="text-center text-xs text-gray-500 mt-2 px-4">
                  Based on {result.audit.length} key performance indicators.
              </p>
          </div>

          {/* Radar Analysis */}
          <div className="bg-[#161b28] border border-gray-700/50 rounded-3xl p-4 flex flex-col items-center shadow-xl md:col-span-2 relative">
               <div className="absolute top-4 left-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Performance Balance</div>
               <div className="pt-6">
                   <RadarChart data={radarData} size={280} />
               </div>
          </div>
      </div>

      {/* PRINT HEADER (HIDDEN ON SCREEN) */}
      <div className="printable-content p-8 bg-white text-black">
        <div className="mb-8 pb-6 border-b-2 border-black">
            {hasCustomBranding ? (
                <div className="flex items-center gap-4 mb-4">
                    {brandSettings.brandLogo && (
                        <img src={brandSettings.brandLogo} alt="Logo" className="h-16 object-contain" />
                    )}
                    <div>
                        <h1 className="text-4xl font-extrabold text-black">{brandSettings.brandName || 'Agency Report'}</h1>
                        <div className="text-sm text-gray-500">Comprehensive Shop Audit</div>
                    </div>
                </div>
            ) : (
                <h1 className="text-4xl font-extrabold text-black mb-2">
                    Ranklistic Audit Report
                </h1>
            )}
            
            <div className="flex justify-between items-end mt-6">
                <div>
                    <h2 className="text-2xl text-gray-700 font-bold">{shopName}</h2>
                    <div className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-bold text-black">{averageScore}/10</div>
                    <div className="text-sm font-bold uppercase text-gray-500 tracking-wider">Health Score</div>
                </div>
            </div>
        </div>

        {/* 2. DETAILED VISUAL CARDS (PRINT VERSION) */}
        <div className="grid grid-cols-1 gap-8">
            {result.audit.map((item, index) => (
                <div key={index} className="border border-gray-300 rounded-xl overflow-hidden break-inside-avoid relative mb-6">
                    <div className="p-6">
                        {/* Header Row */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-black">{item.category}</h3>
                            </div>
                            <div className="px-4 py-1 rounded border border-black font-bold text-lg">
                                {item.score}/10
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Analysis */}
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-2">AI Observations</div>
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    {item.analysis}
                                </p>
                            </div>

                            {/* Missing Elements (New for Print) */}
                            {item.missingElements && item.missingElements.length > 0 && (
                                <div className="bg-red-50 p-4 rounded border border-red-200">
                                    <div className="text-xs text-red-600 font-bold uppercase mb-2">Missing vs. Top Sellers</div>
                                    <ul className="space-y-1">
                                        {item.missingElements.map((m, k) => (
                                            <li key={k} className="text-sm text-red-800 flex items-start gap-2">
                                                <span>•</span> {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-2">Strategic Fixes</div>
                                <ul className="space-y-2">
                                    {item.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start text-sm text-gray-800">
                                            <span className="mr-2">•</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Footer Branding in Print Mode */}
        <div className="text-center mt-12 pt-6 border-t border-gray-300 text-sm text-gray-500">
            <p>{hasCustomBranding ? `${brandSettings?.brandName} | Official Audit` : 'Generated by Ranklistic AI'}</p>
        </div>
      </div>

      {/* 2. DETAILED VISUAL CARDS (SCREEN VERSION) - Duplicate logic for screen only */}
      <div className="grid grid-cols-1 gap-8 no-print">
        {result.audit.map((item, index) => (
            <div key={index} className="bg-[#161b28] border border-gray-700 rounded-2xl overflow-hidden shadow-lg break-inside-avoid relative">
                
                {/* Visual Header Background */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getCategoryStyle(item.category)}`}></div>
                
                <div className="p-6">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${getCategoryStyle(item.category)} shadow-lg`}>
                                <div className="text-white">
                                    {getCategoryIcon(item.category)}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{item.category}</h3>
                                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Audit Category</div>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-lg font-bold border bg-gray-900 ${item.score >= 7 ? 'text-green-400 border-green-500/30' : item.score >= 4 ? 'text-yellow-400 border-yellow-500/30' : 'text-red-400 border-red-500/30'}`}>
                            {item.score}/10
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Analysis Column */}
                        <div className="space-y-4">
                            <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-700/50">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> AI Observations
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {item.analysis}
                                </p>
                            </div>

                            {/* NEW: Missing Elements Block */}
                            {item.missingElements && item.missingElements.length > 0 && (
                                <div className="bg-red-900/10 p-5 rounded-2xl border border-red-500/20">
                                    <div className="text-xs text-red-400 font-bold uppercase mb-3 flex items-center gap-2">
                                        <CloseCircleIcon className="w-4 h-4" /> Missing vs Top Sellers
                                    </div>
                                    <ul className="space-y-2">
                                        {item.missingElements.map((missing, m) => (
                                            <li key={m} className="text-sm text-gray-400 flex items-start gap-2">
                                                <span className="text-red-500 font-bold mt-0.5">-</span> {missing}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Action Column */}
                        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-700/50 flex flex-col">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Strategic Fixes
                            </div>
                            <ul className="space-y-3 flex-1">
                                {item.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-300 group">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                            
                            {/* Critical Errors */}
                            {item.criticalErrors && item.criticalErrors.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-700/50">
                                    <div className="text-xs text-red-400 font-bold uppercase mb-2">Critical Errors</div>
                                    <ul className="space-y-1">
                                        {item.criticalErrors.map((err, e) => (
                                            <li key={e} className="text-xs text-red-300 flex items-center gap-2">
                                                <CloseIcon className="w-3 h-3" /> {err}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-end no-print">
                                <button
                                    onClick={() => onStartChat(item)}
                                    className="text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
                                >
                                    <ChatBubbleIcon className="w-3 h-3" />
                                    Ask AI to Fix This
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
