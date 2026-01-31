// src/components/DigitalProductGenerator.tsx (yeni dosya)

import React, { useState } from 'react';
import { generateDigitalProductListing, DigitalProductType } from '../services/digitalProductService';

export const DigitalProductGenerator: React.FC = () => {
  const [productType, setProductType] = useState<DigitalProductType>('printable-art');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const json = await generateDigitalProductListing(
        productType,
        title,
        description,
        null, // imageBase64 (opsiyonel)
        'boho', // niche
        'friendly' // tone
      );
      setResult(JSON.parse(json));
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Digital Product Listing Generator</h2>
      
      <select 
        value={productType} 
        onChange={(e) => setProductType(e.target.value as DigitalProductType)}
        className="w-full p-3 bg-gray-800 rounded"
      >
        <option value="printable-art">Printable Art</option>
        <option value="planner">Planner/Organizer</option>
        <option value="templates">Templates (Resume, Invoice, etc.)</option>
        <option value="clipart">Clipart/Graphics</option>
        <option value="svg-files">SVG Files (Cricut/Silhouette)</option>
        <option value="patterns">Patterns (Sewing, Crochet)</option>
        <option value="ebook">eBook/Guide</option>
        <option value="fonts">Fonts</option>
      </select>

      <input 
        type="text"
        placeholder="Product Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 bg-gray-800 rounded"
      />

      <textarea
        placeholder="Product Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 bg-gray-800 rounded min-h-[120px]"
      />

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded font-semibold"
      >
        {isLoading ? 'Generating...' : 'Generate Digital Listing'}
      </button>

      {result && (
        <div className="space-y-4 mt-6">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-orange-500 font-bold mb-2">TITLE</h3>
            <p className="text-white">{result.newTitle}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-orange-500 font-bold mb-2">DESCRIPTION</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{result.newDescription}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-orange-500 font-bold mb-2">TAGS (13)</h3>
            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((tag: string, i: number) => (
                <span key={i} className="bg-gray-700 px-2 py-1 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-orange-500 font-bold mb-2">FILE FORMATS</h3>
            <p className="text-gray-300">{result.fileFormats.join(', ')}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-orange-500 font-bold mb-2">PINTEREST</h3>
            <p className="text-sm text-gray-400 mb-1">Title:</p>
            <p className="text-white mb-3">{result.socialMedia.pinterestTitle}</p>
            
            <p className="text-sm text-gray-400 mb-1">Description:</p>
            <p className="text-gray-300 mb-3">{result.socialMedia.pinterestDescription}</p>
            
            <p className="text-sm text-gray-400 mb-1">Hashtags:</p>
            <p className="text-blue-400">{result.socialMedia.pinterestHashtags}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-orange-500 font-bold mb-2">INSTAGRAM</h3>
            <p className="text-sm text-gray-400 mb-1">Caption:</p>
            <p className="text-gray-300 mb-3 whitespace-pre-wrap">{result.socialMedia.instagramCaption}</p>
            
            <p className="text-sm text-gray-400 mb-1">Hashtags (25-30):</p>
            <p className="text-blue-400 text-sm">{result.socialMedia.instagramHashtags}</p>
          </div>
        </div>
      )}
    </div>
  );
};