import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Safe area padding for mobile */}
      <div className="flex-1 px-4 py-safe">
        {children}
      </div>
    </div>
  );
};

export const MobileContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      {children}
    </div>
  );
};

// Add to global.css:
// @supports(padding: max(0px)) {
//   .py-safe {
//     padding-top: max(env(safe-area-inset-top), 1rem);
//     padding-bottom: max(env(safe-area-inset-bottom), 1rem);
//   }
// }