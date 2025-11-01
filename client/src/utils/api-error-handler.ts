import { toast } from '@/hooks/use-toast';

interface ApiError {
  message: string;
  status: number;
  type?: string;
  details?: any;
}

export function handleApiError(error: ApiError) {
  // Log error for debugging
  console.error('API Error:', error);

  // Handle specific error types
  switch (error.type) {
    case 'document_generation':
      toast({
        title: 'Document Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
      break;

    case 'validation':
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive'
      });
      break;

    case 'auth':
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive'
      });
      // Optionally redirect to login
      break;

    case 'rate_limit':
      toast({
        title: 'Rate Limit Exceeded',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
      break;

    default:
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
  }

  // Return standardized error response
  return {
    success: false,
    error: error.message,
    status: error.status || 500,
    details: error.details
  };
}