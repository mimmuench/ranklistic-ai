// src/components/DigitalProductGenerator.tsx - PROFESYONEL VERSİYON

import React, { useState } from 'react';
import { generateDigitalProductListing, DigitalProductType } from '../services/digitalProductService';
import { Upload, Sparkles, Copy, Download, FileText, Tag, Image as ImageIcon, Instagram } from 'lucide-react';

interface DigitalProductGeneratorProps {
  onSave?: (data: any) => void;
  lang?: 'en' | 'tr';
}

export const DigitalProductGenerator: React.FC<DigitalProductGeneratorProps> = ({ onSave, lang = 'en' }) => {
  const [view, setView] = useState<'home' | 'form' | 'result'>('home');
  const [productType, setProductType] = useState<DigitalProductType>('svg-files');
  const [studioName, setStudioName] = useState('');
  const [productConcept, setProductConcept] = useState('');
  const [technicalInstructions, setTechnicalInstructions] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('SVG');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formats = [
    { id: 'SVG', label: 'SVG', color: 'bg-blue-500' },
    { id: 'PNG', label: 'PNG', color: 'bg-purple-500' },
    { id: 'DXF', label: 'DXF', color: 'bg-indigo-500' },
    { id: 'DWG', label: 'DWG', color: 'bg-cyan-500' },
    { id: 'PDF', label: 'PDF', color: 'bg-red-500' },
    { id: 'JPG', label: 'JPG', color: 'bg-orange-500' },
    { id: 'AI', label: 'AI', color: 'bg-yellow-500' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview && !productConcept.trim()) {
      setError('Please upload an image or provide a product concept');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Starting generation with image analysis...');

      // Extract base64 from image preview
      const base64Data = imagePreview ? imagePreview.split(',')[1] : null;

      const json = await generateDigitalProductListing(
        'svg-files', // Always SVG for this template
        productConcept || 'Digital SVG Cut File',
        technicalInstructions || '',
        base64Data,
        'technical', // niche
        'professional' // tone
      );

      const parsedData = JSON.parse(json);
      setResult(parsedData);
      setView('result');

      if (typeof onSave === 'function') {
        onSave(parsedData);
      }

    } catch (err: any) {
      console.error('❌ Generation failed:', err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard! ✓`);
  };

  // HOME SCREEN
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 pt-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              DIGITAL LISTING GENERATOR
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Generate professional, technical-first descriptions for SVG, CNC, and Laser Cutters.
            </p>
          </div>

          {/* Feature Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Ready for Etsy</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Single description with technical sections included.
                </p>
              </div>
              <button
                onClick={() => setView('form')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all text-sm"
              >
                NEW LISTING
              </button>
            </div>

            {/* Example Output Preview */}
            <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                  Optimized Listing Title
                </h4>
                <button className="text-xs text-slate-500 hover:text-white transition-colors">
                  COPY TITLE
                </button>
              </div>
              <p className="text-white text-base leading-relaxed mb-6">
                Alpine Skier Silhouette SVG Skiing Cut File Sports Winter Decal Vector for Cricut Silhouette Glowforge CNC Laser Cuttora
              </p>

              <div className="border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                    Full Description (Ready to Paste)
                  </h4>
                  <button className="text-xs text-slate-500 hover:text-white transition-colors">
                    COPY ALL DESCRIPTION
                  </button>
                </div>
                <div className="text-slate-400 text-sm space-y-3 leading-relaxed">
                  <p className="font-semibold text-white">🎯 QUICK OVERVIEW:</p>
                  <p>
                    High-precision digital silhouette of an alpine skier in a professional aerodynamic racing tuck. 
                    This Cuttora design is engineered specifically for clean cutting, engraving, and scaling without loss of detail.
                  </p>
                  
                  <p className="font-semibold text-white mt-4">🛠️ COMPATIBILITY & USAGE:</p>
                  <p>
                    Fully compatible with Cricut Design Space, Silhouette Studio, Glowforge, CNC Plasma, and other laser cutters. 
                    Our files feature clean, smooth paths tested for technical precision to ensure minimal node count and efficient cutting times.
                  </p>

                  <p className="font-semibold text-white mt-4">📦 WHAT YOU RECEIVE:</p>
                  <p>You will receive a ZIP archive containing the following formats:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>SVG: Professional-grade vector for scaling and cutting.</li>
                    <li>PNG: High-resolution (300 DPI) with a transparent background.</li>
                    <li>EPS: Master vector file for advanced editing software.</li>
                    <li>DXF: Technical format for AutoCAD and basic CNC software.</li>
                    <li>PDF: Versatile format for printing and vector viewing.</li>
                  </ul>
                  <p className="mt-2 text-xs italic">Note: This is a single-path design optimized for easy weeding and material efficiency.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Tags Preview */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-4">13 SEARCH TAGS</h4>
            <div className="flex flex-wrap gap-2">
              {['svg cut file', 'skiing svg', 'alpine skier', 'winter sports svg', 'cricut design', 
                'silhouette file', 'glowforge svg', 'laser cut file', 'cnc plasma', 'sports decal', 
                'skier silhouette', 'cuttora design', 'vector cut file'].map((tag, i) => (
                <span key={i} className="bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-lg text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* PRO TIP */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-wide">
              PRO TIP FOR DIGITAL
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              "Make sure to upload a PDF help guide with your files. It reduces 'how to open' 
              support messages by 80%."
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW
  if (view === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setView('home')}
            className="text-slate-400 hover:text-white mb-8 text-sm flex items-center gap-2"
          >
            ← Back to Overview
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              DIGITAL LISTING GENERATOR
            </h1>
            <p className="text-slate-400">
              Generate professional, technical-first descriptions for SVG, CNC, and Laser Cutters.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-red-400 mb-2">Error:</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm space-y-6">
            
            {/* Image Upload - PRIMARY INPUT */}
            <div>
              <label className="block text-slate-300 mb-3 text-base font-semibold">
                Upload Artwork Preview
                <span className="text-blue-400 ml-2">(AI will analyze this)</span>
              </label>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-950/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" className="max-w-md mx-auto rounded-lg shadow-2xl mb-4" />
                      <p className="text-slate-500 text-sm">✓ Image uploaded - AI will analyze this</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-white text-base font-medium mb-2">UPLOAD ARTWORK PREVIEW</p>
                      <p className="text-slate-500 text-sm">AI will analyze your image and generate the listing</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Product Concept - OPTIONAL OVERRIDE */}
            <div>
              <label className="block text-slate-300 mb-3 text-sm font-medium">
                Product Concept (optional - override AI analysis)
              </label>
              <input
                type="text"
                value={productConcept}
                onChange={(e) => setProductConcept(e.target.value)}
                placeholder="e.g., Mountain Biker SVG for Laser Cutting"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-slate-500 mt-2">Leave blank to let AI analyze the uploaded image</p>
            </div>

            {/* Technical Instructions - OPTIONAL */}
            <div>
              <label className="block text-slate-300 mb-3 text-sm font-medium">
                Any specific technical instructions?
              </label>
              <textarea
                value={technicalInstructions}
                onChange={(e) => setTechnicalInstructions(e.target.value)}
                placeholder="Optional: Specific dimensions, material notes, or technical requirements..."
                rows={3}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || (!imagePreview && !productConcept.trim())}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Analyzing Image & Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  BUILD FULL DIGITAL LISTING
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              AI will analyze your image and generate a professional listing using the proven template format
            </p>
          </div>
        </div>
      </div>
    );
  }

  // RESULT VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setView('home')}
          className="text-slate-400 hover:text-white mb-8 text-sm flex items-center gap-2"
        >
          ← New Listing
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Your Digital Listing is Ready! 🎉
          </h1>
          <p className="text-slate-400">Copy and paste directly into your Etsy shop</p>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wide">
                    Title ({result.newTitle?.length || 0} chars)
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(result.newTitle, 'Title')}
                  className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  COPY
                </button>
              </div>
              <p className="text-white text-lg leading-relaxed">{result.newTitle}</p>
            </div>

            {/* Description */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wide">
                    Description ({result.newDescription?.length || 0} chars)
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(result.newDescription, 'Description')}
                  className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  COPY
                </button>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {result.newDescription}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wide">
                    Tags ({result.hashtags?.length || 0}/13)
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(result.hashtags?.join(', '), 'Tags')}
                  className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  COPY
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.hashtags?.map((tag: string, i: number) => (
                  <span key={i} className="bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-lg text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Pinterest */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-red-400" />
                <h3 className="text-red-400 font-bold text-sm uppercase tracking-wide">
                  Pinterest Content
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Pin Title:</p>
                  <p className="text-white text-sm">{result.socialMedia?.pinterestTitle}</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Description:</p>
                  <p className="text-slate-300 text-sm">{result.socialMedia?.pinterestDescription}</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Hashtags:</p>
                  <p className="text-blue-400 text-sm">{result.socialMedia?.pinterestHashtags}</p>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Instagram className="w-5 h-5 text-pink-400" />
                <h3 className="text-pink-400 font-bold text-sm uppercase tracking-wide">
                  Instagram Content
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Caption:</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {result.socialMedia?.instagramCaption}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Hashtags:</p>
                  <p className="text-blue-400 text-xs whitespace-pre-wrap">
                    {result.socialMedia?.instagramHashtags}
                  </p>
                </div>
              </div>
            </div>

            {/* Copy All Button */}
            <button
              onClick={() => {
                const fullText = `TITLE:\n${result.newTitle}\n\nDESCRIPTION:\n${result.newDescription}\n\nTAGS:\n${result.hashtags?.join(', ')}`;
                copyToClipboard(fullText, 'Complete listing');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              Copy Complete Listing (Title + Description + Tags)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};