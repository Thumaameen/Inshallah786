import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(undefined);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      {isLoading && <LoadingScreen message={message} />}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a LoadingProvider');
  }
  return context;
};