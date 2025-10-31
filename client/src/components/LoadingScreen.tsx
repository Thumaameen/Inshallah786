import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface HealthCheckResponse {
  status: string;
  frontend: {
    connected: boolean;
    timestamp: string;
    apiBypass: boolean;
    environment: string;
  };
  api: {
    bypassEnabled: boolean;
    forceSuccess: boolean;
    validationBypass: boolean;
    timestamp: string;
  };
  features: {
    documentGeneration: boolean;
    aiAssistant: boolean;
    biometricValidation: boolean;
    governmentIntegration: boolean;
  };
  timestamp: string;
}

export function useHealthCheck() {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3
  });
}

export function LoadingScreen() {
  const { data, error, isLoading, isFetching } = useHealthCheck();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">Connection Error</div>
          <p className="text-muted-foreground">Unable to connect to server</p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-lg font-medium">Loading DHA Services...</div>
        </div>
      </div>
    );
  }

  return null;
}