import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-foreground/80">{message}</p>
      </div>
    </div>
  );
};

export const FullPageLoader: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="min-h-screen">
      <LoadingScreen message={message} />
    </div>
  );
};

export const InlineLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

export const ButtonLoader: React.FC = () => {
  return (
    <div className="w-4 h-4 relative">
      <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
      <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
    </div>
  );
};