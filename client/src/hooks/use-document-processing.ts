import { useState } from 'react';
import { useToast } from './use-toast';
import { DocumentGenerationRequest, DocumentGenerationResult } from '@/types/documents';
import { documentGenerationService } from '@/services/document-generation.service';
import { documentTypeSchemas } from '@/schemas/document.schemas';

export interface UseDocumentProcessingResult {
  generateDocument: (data: DocumentGenerationRequest, download?: boolean) => Promise<DocumentGenerationResult>;
  isGenerating: boolean;
  lastResult: DocumentGenerationResult | null;
}

export function useDocumentProcessing(): UseDocumentProcessingResult {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<DocumentGenerationResult | null>(null);

  const generateDocument = async (
    documentData: DocumentGenerationRequest,
    download = false
  ): Promise<DocumentGenerationResult> => {
    try {
      setIsGenerating(true);

      // Validate using Zod schema
      const schema = documentTypeSchemas[documentData.documentType as keyof typeof documentTypeSchemas];
      if (schema) {
        const validation = schema.safeParse(documentData);
        if (!validation.success) {
          const error = {
            success: false,
            error: 'Validation failed',
            message: validation.error.errors.map(e => e.message).join(', ')
          };
          setLastResult(error);
          return error;
        }
      }

      // Generate document
      const result = await documentGenerationService.generateDocument(documentData, download);
      setLastResult(result);

      // Show success/error toast
      if (result.success) {
        toast({
          title: download ? 'Document Downloaded' : 'Document Generated',
          description: result.message || 'Operation completed successfully',
          className: 'border-green-500 bg-green-50'
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: result.error || 'Failed to generate document',
          variant: 'destructive'
        });
      }

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDocument,
    isGenerating,
    lastResult
  };
}