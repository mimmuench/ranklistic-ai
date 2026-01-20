import React, { useState } from 'react';
import { Upload, Zap, Package, FileText, MessageSquare, Sparkles, ChevronDown } from 'lucide-react';
import { generateAmazonListingFromImage, getAmazonChatResponse } from '../services/amazonService';
import type { AmazonListingResult, AmazonCategory } from '../types/amazon';

interface AmazonGeneratorProps {
  lang: 'en' | 'tr';
}

const categories: { value: AmazonCategory; label: string }[] = [
  { value: 'home-kitchen', label: 'Home & Kitchen' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing & Accessories' },
  { value: 'toys-games', label: 'Toys & Games' },
  { value: 'sports-outdoors', label: 'Sports & Outdoors' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'books', label: 'Books' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'pet-supplies', label: 'Pet Supplies' },
  { value: 'other', label: 'Other' },
];

export const AmazonGenerator: React.FC<AmazonGeneratorProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<AmazonCategory>('home-kitchen');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [result, setResult] = useState<AmazonListingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fullBase64 = event.target?.result as string;
      const base64Data = fullBase64.split(',')[1];
      setImageBase64(base64Data);
      setImagePreview(fullBase64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64) {
      setError('Please upload a product image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const json = await generateAmazonListingFromImage(
        imageBase64,
        selectedCategory,
        additionalContext
      );
      const parsed = JSON.parse(json);
      
      console.log('📦 Parsed Result:', parsed);
      
      // 1. SEARCH TERMS TEMİZLİĞİ (Mimar Dokunuşu & Virgül Ekleme)
      let cleanKeywords = (parsed.backendKeywords || parsed.searchTerms || "")
        .replace(/[a-z][A-Z]/g, (match: string) => match[0] + " " + match[1]) 
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') 
        .split(/\s+/) 
        .filter((v: string, i: number, a: string[]) => v.length > 1 && a.indexOf(v) === i) 
        .join(', '); // Aralara virgül eklendi

      if (!cleanKeywords || cleanKeywords === 'undefined' || cleanKeywords.length < 10) {
        cleanKeywords = 'metal wall art, steel decor, home decoration, laser cut, hanging sculpture, modern design';
      }
      
      parsed.searchTerms = cleanKeywords;
      parsed.backendKeywords = cleanKeywords;

      // 2. DESCRIPTION VE A+ CONTENT KONTROLÜ
      if (!parsed.productDescription || parsed.productDescription === 'undefined' || parsed.productDescription.length < 100) {
        parsed.productDescription = `Transform your living space with this stunning ${parsed.productIdentified || 'metal wall art'}. Crafted with precision laser-cutting technology, this piece combines durability with elegant design.`;
      }
      
      parsed.description = parsed.productDescription;

      // A+ Content Fallback (Eğer AI boş bırakırsa)
      if (!parsed.aPlusSuggestions || parsed.aPlusSuggestions === 'undefined') {
        parsed.aPlusSuggestions = "• Use high-quality lifestyle images showing the product in a modern living room or office.\n• Highlight the 1.5mm premium steel material and rust-resistant matte finish.\n• Showcase the unique 3D shadow effect created by the wall spacers.\n• Emphasize the artisan craftsmanship and reinforced protective packaging.";
      }
      
      setResult(parsed);
      
      // 3. DASHBOARD KAYDI
      if (onSave) onSave(parsed);

    } catch (e) {
      console.error('Generation error:', e);
      setError('Failed to generate listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageBase64(null);
    setImagePreview(null);
    setAdditionalContext('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-white">
            {lang === 'tr' ? 'Amazon İlan Oluşturucu' : 'Amazon Listing Generator'}
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          {lang === 'tr' 
            ? 'Ürün fotoğrafından otomatik Amazon ilanı oluşturun' 
            : 'Generate optimized Amazon listings from product images'}
        </p>
      </div>

      {!result ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {lang === 'tr' ? 'Ürün Fotoğrafı' : 'Product Image'}
              </label>
              
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-[#0B0F19] hover:bg-[#141B2B] transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <Upload className="w-12 h-12 mb-3 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-400 px-4">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative group w-full mx-auto">
                  <div className="w-full aspect-square overflow-hidden rounded-xl bg-[#0B0F19] border border-gray-700 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-contain p-4 transition-transform duration-300"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageBase64(null);
                    }}
                    className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-xl z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {lang === 'tr' ? 'Kategori' : 'Category'}
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as AmazonCategory)}
                  className="w-full bg-[#0B0F19] border border-gray-700 text-white rounded-lg px-4 py-3 pr-10 appearance-none focus:outline-none focus:border-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Additional Context */}
            <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {lang === 'tr' ? 'Ek Bilgi (Opsiyonel)' : 'Additional Context (Optional)'}
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder={lang === 'tr' 
                  ? 'Ürün hakkında ek detaylar, özellikler, hedef kitle vb.' 
                  : 'Additional product details, features, target audience, etc.'}
                className="w-full bg-[#0B0F19] border border-gray-700 text-white rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg border border-orange-500/20 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    {lang === 'tr' ? 'AI-Destekli Optimizasyon' : 'AI-Powered Optimization'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {lang === 'tr'
                      ? 'Görüntünüzden Amazon SEO kurallarına uygun, yüksek dönüşüm odaklı ürün açıklamaları oluşturuyoruz.'
                      : 'We generate Amazon SEO-compliant, conversion-focused product descriptions from your image.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                {lang === 'tr' ? 'Oluşturulacaklar' : 'What You\'ll Get'}
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{lang === 'tr' ? 'SEO-optimized ürün başlığı' : 'SEO-optimized product title'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{lang === 'tr' ? '5 bullet point özellik' : '5 bullet point features'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{lang === 'tr' ? 'Detaylı ürün açıklaması' : 'Detailed product description'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{lang === 'tr' ? 'Backend anahtar kelimeler' : 'Backend search terms'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{lang === 'tr' ? 'Amazon A+ içerik önerileri' : 'Amazon A+ content suggestions'}</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!imageBase64 || isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{lang === 'tr' ? 'Oluşturuluyor...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>{lang === 'tr' ? 'İlan Oluştur' : 'Generate Listing'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
          >
            ← {lang === 'tr' ? 'Yeni İlan Oluştur' : 'Create New Listing'}
          </button>

          <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
            <h3 className="text-orange-500 text-sm font-semibold mb-2">
              {lang === 'tr' ? 'ÜRÜN BAŞLIĞI' : 'PRODUCT TITLE'}
            </h3>
            <p className="text-white text-lg font-medium">{result.title}</p>
          </div>

          <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
            <h3 className="text-orange-500 text-sm font-semibold mb-4">
              {lang === 'tr' ? 'ÖZELLİKLER (BULLET POINTS)' : 'KEY FEATURES (BULLET POINTS)'}
            </h3>
            <ul className="space-y-3">
              {result.bulletPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
            <h3 className="text-orange-500 text-sm font-semibold mb-4">
              {lang === 'tr' ? 'ÜRÜN AÇIKLAMASI' : 'PRODUCT DESCRIPTION'}
            </h3>
            <div className="text-gray-300 whitespace-pre-wrap">{result.productDescription}</div>
          </div>

          <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
            <h3 className="text-orange-500 text-sm font-semibold mb-4">
              {lang === 'tr' ? 'BACKEND ARAMA TERİMLERİ' : 'BACKEND SEARCH TERMS'}
            </h3>
            <p className="text-gray-300">{result.backendKeywords}</p>
          </div>

          {result.aPlusSuggestions && (
            <div className="bg-[#141B2B] rounded-lg border border-gray-800 p-6">
              <h3 className="text-orange-500 text-sm font-semibold mb-4">
                {lang === 'tr' ? 'A+ İÇERİK ÖNERİLERİ' : 'A+ CONTENT SUGGESTIONS'}
              </h3>
              <div className="text-gray-300 whitespace-pre-wrap">{result.aPlusSuggestions}</div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                // Değişken isimlerini güncelledik: description ve searchTerms
                const text = `TITLE:\n${result.title}\n\nBULLET POINTS:\n${result.bulletPoints?.join('\n')}\n\nDESCRIPTION:\n${result.description}\n\nSEARCH TERMS:\n${result.searchTerms}`;
                navigator.clipboard.writeText(text);
                alert(lang === 'tr' ? 'Panoya kopyalandı!' : 'Copied to clipboard!');
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {lang === 'tr' ? 'Tümünü Kopyala' : 'Copy All'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-[#0B0F19] hover:bg-[#141B2B] text-white font-semibold py-3 rounded-lg border border-gray-800 transition-colors"
            >
              {lang === 'tr' ? 'Yeni İlan' : 'New Listing'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};