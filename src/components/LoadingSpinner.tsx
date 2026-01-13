
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-12">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>
        <p className="mt-4 text-lg text-gray-400 font-semibold">AI is auditing your shop...</p>
        <p className="text-sm text-gray-500">This may take a moment.</p>
    </div>
  );
};
