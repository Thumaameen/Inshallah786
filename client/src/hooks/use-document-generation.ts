import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateDocumentData, handleDocumentError } from '@/utils/error-handler';

export interface UseDocumentGenerationResult {
  isGenerating: boolean;
  generateDocument: (documentType: string, documentData: any, isDownload?: boolean) => Promise<void>;
  generationResult: any | null;
}

export function useDocumentGeneration(): UseDocumentGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any | null>(null);
  const { toast } = useToast();

  const generateDocument = async (documentType: string, documentData: any, isDownload = false) => {
    if (!documentType) {
      toast({
        title: "No Document Type",
        description: "Please select a document type first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);

      const validation = validateDocumentData(documentData, documentType);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join('\n'),
          variant: "destructive"
        });
        return;
      }

      const endpoint = isDownload ? '/api/documents/generate?download=true' : '/api/documents/generate';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentType,
          ...documentData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        handleDocumentError(errorData);
        return;
      }

      if (isDownload) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `${documentType}_${Date.now()}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(downloadUrl);

        toast({
          title: "Document Downloaded",
          description: "Your document has been downloaded successfully."
        });
      } else {
        const result = await response.json();
        setGenerationResult(result);
        
        if (result.success) {
          toast({
            title: "Document Generated",
            description: result.message || "Document generated successfully",
            className: "border-green-500 bg-green-50"
          });
        }
      }
    } catch (error) {
      console.error('Document generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate document",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateDocument,
    generationResult
  };
}