import React from 'react';
import { useApi } from '@/hooks/use-api';
import { ButtonLoader } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';

interface Document {
  id: string;
  title: string;
  status: string;
}

export const DocumentProcessor: React.FC = () => {
  const api = useApi<Document>({
    useGlobalLoader: true,
    loadingMessage: 'Processing document...',
    showSuccessToast: true,
    successMessage: 'Document processed successfully',
  });

  const handleProcessDocument = async () => {
    try {
      const result = await api.post('/api/process-document', {
        // your document data
      });
      console.log('Processed document:', result);
    } catch (error) {
      console.error('Failed to process document:', error);
    }
  };

  const handleBackgroundTask = async () => {
    // Example using local loading state instead of global
    const localApi = useApi<Document>({
      useGlobalLoader: false,
      showSuccessToast: true,
    });

    try {
      await localApi.post('/api/background-task', {
        // your task data
      });
    } catch (error) {
      console.error('Background task failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleProcessDocument}
        disabled={api.isLoading}
      >
        {api.isLoading ? <ButtonLoader /> : 'Process Document'}
      </Button>

      <Button
        onClick={handleBackgroundTask}
        variant="secondary"
        disabled={api.isLoading}
      >
        Run Background Task
      </Button>

      {api.error && (
        <div className="text-red-500">
          Error: {api.error.message}
        </div>
      )}

      {api.data && (
        <div className="p-4 bg-green-50 rounded">
          <h3 className="font-bold">Document Status</h3>
          <p>ID: {api.data.id}</p>
          <p>Title: {api.data.title}</p>
          <p>Status: {api.data.status}</p>
        </div>
      )}
    </div>
  );
};