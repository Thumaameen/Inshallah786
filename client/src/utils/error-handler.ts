import { toast } from '@/hooks/use-toast';

interface ErrorResponse {
  success: boolean;
  error: string;
  details?: string;
}

export const handleDocumentError = (error: any) => {
  console.error('Document generation error:', error);
  
  let errorMessage = 'An error occurred while generating the document.';
  
  if (error.response?.data) {
    const response = error.response.data as ErrorResponse;
    errorMessage = response.details || response.error || errorMessage;
  } else if (error.message) {
    errorMessage = error.message;
  }

  toast({
    title: 'Document Generation Failed',
    description: errorMessage,
    variant: 'destructive',
  });

  // Return standardized error for component handling
  return {
    success: false,
    error: errorMessage,
    status: error.response?.status || 500
  };
};

export const validateDocumentData = (data: any, documentType: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('No document data provided');
    return { isValid: false, errors };
  }

  if (!documentType) {
    errors.push('Document type is required');
    return { isValid: false, errors };
  }

  // Validate required fields based on document type
  const requiredFields = getRequiredFields(documentType);
  
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

function getRequiredFields(documentType: string): string[] {
  const commonFields = ['fullName', 'idNumber'];
  
  const fieldsByType: Record<string, string[]> = {
    birth_certificate: [...commonFields, 'dateOfBirth', 'placeOfBirth', 'parentDetails'],
    death_certificate: [...commonFields, 'dateOfDeath', 'causeOfDeath'],
    marriage_certificate: [...commonFields, 'spouseDetails', 'dateOfMarriage'],
    passport: [...commonFields, 'nationality', 'dateOfBirth', 'gender'],
    visa: [...commonFields, 'passportNumber', 'nationality', 'visaType'],
    permit: [...commonFields, 'permitType', 'validityPeriod', 'purpose']
  };

  return fieldsByType[documentType] || commonFields;
}

export const isProductionError = (error: any): boolean => {
  // Check if this is a known production error
  return (
    error?.name === 'DocumentGenerationError' ||
    error?.code === 'DOCUMENT_GENERATION_FAILED' ||
    error?.response?.status === 503
  );
};