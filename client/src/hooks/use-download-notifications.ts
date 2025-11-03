
import { useEffect } from 'react';
import { useToast } from './use-toast';

export function useDownloadNotifications() {
  const { toast } = useToast();

  useEffect(() => {
    const handleDownloadSuccess = (event: CustomEvent) => {
      const { filename, documentType } = event.detail;
      
      toast({
        title: "✅ Document Generated Successfully",
        description: (
          <div className="space-y-2">
            <p><strong>{filename}</strong></p>
            <p className="text-sm">Check your Downloads folder or notification bar</p>
            <p className="text-xs text-muted-foreground">Document type: {documentType}</p>
          </div>
        ),
        duration: 8000,
      });
    };

    const handleDownloadError = (event: CustomEvent) => {
      const { error, documentType } = event.detail;
      
      toast({
        title: "❌ Document Generation Failed",
        description: (
          <div className="space-y-2">
            <p className="text-sm">{error}</p>
            <p className="text-xs text-muted-foreground">Document type: {documentType}</p>
            <p className="text-xs">Please try again or contact support if the issue persists</p>
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
    };

    window.addEventListener('pdf-download-success', handleDownloadSuccess as EventListener);
    window.addEventListener('pdf-download-error', handleDownloadError as EventListener);

    return () => {
      window.removeEventListener('pdf-download-success', handleDownloadSuccess as EventListener);
      window.removeEventListener('pdf-download-error', handleDownloadError as EventListener);
    };
  }, [toast]);
}
