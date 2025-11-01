import { DocumentGenerationRequest, DocumentGenerationResult } from '@/types/documents';

class DocumentGenerationService {
  private async validateDocument(documentData: DocumentGenerationRequest): Promise<boolean> {
    // Add validation logic here
    return true;
  }

  private async applySecurityFeatures(documentData: DocumentGenerationRequest): Promise<void> {
    // Add security features logic here
  }

  async generateDocument(
    documentData: DocumentGenerationRequest, 
    downloadMode: boolean = false
  ): Promise<DocumentGenerationResult> {
    try {
      // Validate document data
      const isValid = await this.validateDocument(documentData);
      if (!isValid) {
        throw new Error('Invalid document data');
      }

      // Apply security features
      await this.applySecurityFeatures(documentData);

      // Generate document
      const endpoint = `/api/documents/generate${downloadMode ? '?download=true' : ''}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate document');
      }

      if (downloadMode) {
        const blob = await response.blob();
        return {
          success: true,
          documentUrl: URL.createObjectURL(blob)
        };
      }

      const result = await response.json();
      return {
        ...result,
        success: true
      };
    } catch (error) {
      console.error('Document generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate document'
      };
    }
  }
}

export const documentGenerationService = new DocumentGenerationService();