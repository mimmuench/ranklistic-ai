
import React, { useState } from 'react';
import { LightbulbIcon, SparklesIcon, CheckCircleIcon, CloseCircleIcon, ScaleIcon } from './icons';
import { generateShopNames, analyzeBusinessIdea } from '../services/geminiService';
import type { ShopNameResult, BusinessIdeaAnalysis } from '../types';

interface NewShopStarterProps {
  lang: 'en' | 'tr';
}

const translations = {
  en: {
    title: "Shop Incubator",
    subtitle: "Validate your idea before you spend a penny. Especially purely regarding shipping logistics.",
    btnIdea: "Feasibility & Logistics Check",
    btnName: "Brand Name Generator",
    
    // Name Generator
    lblSelling: "What are you selling?",
    phSelling: "e.g. Soy Wax Candles, Metal Wall Art",
    lblVibe: "Brand Vibe?",
    btnGenName: "Generate Names",
    btnGenNameLoading: "Inventing...",
    suggTitle: "AI Suggestions:",
    
    // Idea Validator
    lblIdea: "Product Idea",
    phIdea: "e.g. Handmade Ceramic Coffee Mugs",
    lblOrigin: "Shipping From",
    hintLogistics: "AI will check volumetric weight risks, customs thresholds, and competitive pricing for shipping from",
    toGlobal: "to USA/Global.",
    btnAnalyze: "Analyze Feasibility",
    btnAnalyzeLoading: "Calculating Logistics...",
    
    // Results
    score: "Success Score",
    difficulty: "Difficulty",
    verdict: "The Verdict",
    pros: "Pros",
    cons: "Cons & Risks",
    logisticsTitle: "Logistics Reality Check",
  },
  tr: {
    title: "Mağaza Kuluçka Merkezi",
    subtitle: "Tek kuruş harcamadan önce fikrini doğrula. Özellikle kargo ve lojistik risklerini erkenden gör.",
    btnIdea: "Fizibilite & Lojistik Kontrolü",
    btnName: "Marka İsmi Oluşturucu",
    
    // Name Generator
    lblSelling: "Ne satacaksın?",
    phSelling: "Örn: Soya Mumu, Metal Tablo, Örgü Çorap",
    lblVibe: "Marka Havası?",
    btnGenName: "İsim Üret",
    btnGenNameLoading: "Düşünülüyor...",
    suggTitle: "Yapay Zeka Önerileri:",
    
    // Idea Validator
    lblIdea: "Ürün Fikri",
    phIdea: "Örn: El Yapımı Seramik Kupa",
    lblOrigin: "Gönderim Yeri",
    hintLogistics: "Yapay zeka, seçtiğin ülkeden (Örn: Türkiye) ABD'ye gönderim için desi (hacim) risklerini, gümrük sınırlarını ve kar marjını hesaplar.",
    toGlobal: "",
    btnAnalyze: "Fizibiliteyi Analiz Et",
    btnAnalyzeLoading: "Lojistik Hesaplanıyor...",
    
    // Results
    score: "Başarı Skoru",
    difficulty: "Zorluk",
    verdict: "Sonuç Kararı",
    pros: "Avantajlar",
    cons: "Riskler & Dezavantajlar",
    logisticsTitle: "Lojistik Gerçeklik Kontrolü",
  }
};

export const NewShopStarter: React.FC<NewShopStarterProps> = ({ lang }) => {
  const t = translations[lang];
  const [activeTool, setActiveTool] = useState<'names' | 'idea'>('idea'); 
  
  // Name Generator State
  const [niche, setNiche] = useState('');
  const [vibe, setVibe] = useState('Minimalist');
  const [nameResult, setNameResult] = useState<ShopNameResult | null>(null);
  const [isNameLoading, setIsNameLoading] = useState(false);

  // Idea Validator State
  const [idea, setIdea] = useState('');
  const [origin, setOrigin] = useState('Turkey'); 
  const [ideaResult, setIdeaResult] = useState<BusinessIdeaAnalysis | null>(null);
  const [isIdeaLoading, setIsIdeaLoading] = useState(false);

  const handleNameGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche) return;
    setIsNameLoading(true);
    setNameResult(null);
    try {
      const resString = await generateShopNames(niche, vibe, lang);
      const res = JSON.parse(resString);
      setNameResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsNameLoading(false);
    }
  };

  const handleIdeaAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;
    setIsIdeaLoading(true);
    setIdeaResult(null);
    try {
      const resString = await analyzeBusinessIdea(idea, origin, lang);
      const res = JSON.parse(resString);
      setIdeaResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsIdeaLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in no-print">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-400">{t.subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-8">
        <button 
          onClick={() => setActiveTool('idea')}
          className={`px-6 py-2 rounded-full font-bold transition-all ${activeTool === 'idea' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {t.btnIdea}
        </button>
        <button 
          onClick={() => setActiveTool('names')}
          className={`px-6 py-2 rounded-full font-bold transition-all ${activeTool === 'names' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {t.btnName}
        </button>
      </div>

      {activeTool === 'names' && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 max-w-2xl mx-auto">
          <form onSubmit={handleNameGenerate} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-1">{t.lblSelling}</label>
               <input 
                 type="text" 
                 value={niche}
                 onChange={(e) => setNiche(e.target.value)}
                 placeholder={t.phSelling}
                 className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-orange-500"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-1">{t.lblVibe}</label>
               <select 
                 value={vibe}
                 onChange={(e) => setVibe(e.target.value)}
                 className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-orange-500"
               >
                 <option value="Minimalist & Modern">Minimalist & Modern</option>
                 <option value="Rustic & Handmade">Rustic & Handmade</option>
                 <option value="Luxurious & Expensive">Luxurious & Expensive</option>
                 <option value="Quirky & Fun">Quirky & Fun</option>
                 <option value="Mystical & Dark">Mystical & Dark</option>
               </select>
             </div>
             <button 
               type="submit" 
               disabled={isNameLoading || !niche}
               className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold text-white transition-colors disabled:opacity-50"
             >
               {isNameLoading ? t.btnGenNameLoading : t.btnGenName}
             </button>
          </form>

          {nameResult && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-orange-400" /> {t.suggTitle}
              </h3>
              <div className="grid gap-3">
                {nameResult.names.map((item, i) => (
                  <div key={i} className="bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-orange-500 transition-colors">
                    <div className="text-lg font-bold text-orange-400">{item.name}</div>
                    <p className="text-sm text-gray-400 mt-1">{item.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTool === 'idea' && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 max-w-3xl mx-auto">
           <form onSubmit={handleIdeaAnalyze} className="space-y-4">
             <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-300 mb-1">{t.lblIdea}</label>
                   <input 
                     type="text"
                     value={idea}
                     onChange={(e) => setIdea(e.target.value)}
                     placeholder={t.phIdea}
                     className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-pink-500"
                   />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.lblOrigin}</label>
                    <select 
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-pink-500"
                    >
                        <option value="Turkey">Turkey (Türkiye)</option>
                        <option value="USA">USA</option>
                        <option value="Europe">Europe</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                    </select>
                </div>
             </div>
             
             <p className="text-xs text-gray-500">
                {t.hintLogistics} <span className="text-orange-400 font-bold">{origin}</span> {t.toGlobal}
             </p>

             <button 
               type="submit" 
               disabled={isIdeaLoading || !idea}
               className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
             >
               {isIdeaLoading ? t.btnAnalyzeLoading : (
                   <>
                    <ScaleIcon className="w-5 h-5" />
                    {t.btnAnalyze}
                   </>
               )}
             </button>
          </form>

          {ideaResult && (
            <div className="mt-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-900 rounded-xl border border-gray-700">
                 <div>
                   <div className="text-gray-400 text-xs uppercase font-bold">{t.score}</div>
                   <div className={`text-3xl font-bold ${ideaResult.score > 7 ? 'text-green-500' : ideaResult.score > 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                     {ideaResult.score}/10
                   </div>
                 </div>
                 <div className="text-right">
                    <div className="text-gray-400 text-xs uppercase font-bold">{t.difficulty}</div>
                    <div className="text-xl font-bold text-white">{ideaResult.difficultyLevel}</div>
                 </div>
              </div>

              <div className="mb-6">
                 <h4 className="font-bold text-white mb-2">{t.verdict}</h4>
                 <p className="text-gray-300 italic border-l-4 border-pink-500 pl-4">{ideaResult.verdict}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                 <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                    <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4"/> {t.pros}</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      {ideaResult.pros.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                 </div>
                 <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                    <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2"><CloseCircleIcon className="w-4 h-4"/> {t.cons}</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      {ideaResult.cons.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                 </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                 <h4 className="font-bold text-blue-400 mb-2">{t.logisticsTitle} ({origin} &rarr; Global)</h4>
                 <p className="text-sm text-gray-300 whitespace-pre-line">{ideaResult.shippingAdvice}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
