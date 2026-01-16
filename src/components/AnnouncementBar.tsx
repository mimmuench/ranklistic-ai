import React from 'react';
import { SparklesIcon, RocketIcon } from './icons';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-orange-600 to-pink-600 text-white text-xs font-bold py-2 overflow-hidden z-20 no-print border-b border-orange-700">
      {/* Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-orange-600 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-pink-600 to-transparent z-10"></div>

      <div className="flex animate-marquee whitespace-nowrap">
        {/* Content duplicated for seamless loop */}
        <div className="flex items-center gap-12 px-4">
            <span className="flex items-center gap-2"><RocketIcon className="w-3 h-3"/> WE ARE LIVE ON PRODUCT HUNT! 🚀</span>
            <span>💎 Use code PH20 for 20% OFF</span>
            <span className="flex items-center gap-2"><SparklesIcon className="w-3 h-3"/> TrendRadar: Now available for Agency Plans</span>
            <span>⚡ Powered by Google Gemini</span>
        </div>
        <div className="flex items-center gap-12 px-4">
            <span className="flex items-center gap-2"><RocketIcon className="w-3 h-3"/> WE ARE LIVE ON PRODUCT HUNT! 🚀</span>
            <span>💎 Use code PH20 for 20% OFF</span>
            <span className="flex items-center gap-2"><SparklesIcon className="w-3 h-3"/> TrendRadar: Now available for Agency Plans</span>
            <span>⚡ Powered by Google Gemini</span>
        </div>
        <div className="flex items-center gap-12 px-4">
            <span className="flex items-center gap-2"><RocketIcon className="w-3 h-3"/> WE ARE LIVE ON PRODUCT HUNT! 🚀</span>
            <span>💎 Use code PH20 for 20% OFF</span>
            <span className="flex items-center gap-2"><SparklesIcon className="w-3 h-3"/> TrendRadar: Now available for Agency Plans</span>
            <span>⚡ Powered by Google Gemini</span>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
            animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};