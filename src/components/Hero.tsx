
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center mb-10">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
        Unlock Your Etsy Shop's <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Full Potential</span>
      </h2>
      <p className="max-w-2xl mx-auto text-lg text-gray-400">
        Get an instant, AI-powered audit of your Etsy shop. Discover actionable insights on SEO, photography, branding, and more to attract buyers and boost your sales.
      </p>
    </div>
  );
};
