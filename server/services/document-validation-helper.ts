import { ErrorCode } from '../types/errors';

export class DocumentValidationHelper {
  // Maximum retry attempts
  private static readonly MAX_RETRIES = 3;
  // Retry delay in milliseconds
  private static readonly RETRY_DELAY = 2000;

  // Advanced validation functions
  static async validatePassport(passportData: any): Promise<boolean> {
    // Add passport-specific validation logic
    const isValid = true; // Implement actual validation
    return isValid;
  }

  static async validatePermit(permitData: any): Promise<boolean> {
    // Add permit-specific validation logic
    const isValid = true; // Implement actual validation
    return isValid;
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = DocumentValidationHelper.MAX_RETRIES,
    delay: number = DocumentValidationHelper.RETRY_DELAY
  ): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    throw lastError;
  }

  static async validateDocument(doc: any): Promise<{ 
    isValid: boolean; 
    errors: string[]; 
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validate document structure
    if (!doc.metadata) {
      errors.push('Invalid document structure');
      suggestions.push('Ensure document was generated properly');
    }

    // Validate expiry date
    if (doc.metadata?.expiryDate) {
      const expiryDate = new Date(doc.metadata.expiryDate);
      if (expiryDate < new Date()) {
        errors.push('Document has expired');
        suggestions.push('Please renew your document');
      }
    }

    // Validate security features
    if (!doc.verificationData?.securityFeatures) {
      errors.push('Missing security features');
      suggestions.push('Document may be compromised');
    }

    // Validate digital signatures
    if (!doc.verificationData?.digitalSignatures) {
      errors.push('Missing digital signatures');
      suggestions.push('Document integrity cannot be verified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  static getErrorDetails(error: any): {
    code: ErrorCode;
    message: string;
    suggestion: string;
    retryable: boolean;
  } {
    const errorDetails = {
      code: ErrorCode.INVALID_DOCUMENT,
      message: 'Unknown error occurred',
      suggestion: 'Please try again',
      retryable: true
    };

    if (error.code === 'DECRYPTION_FAILED') {
      errorDetails.code = ErrorCode.DECRYPTION_FAILED;
      errorDetails.message = 'Failed to decrypt document';
      errorDetails.suggestion = 'Please ensure you have the correct encryption keys';
      errorDetails.retryable = true;
    } else if (error.code === 'INVALID_SIGNATURE') {
      errorDetails.code = ErrorCode.INVALID_SIGNATURE;
      errorDetails.message = 'Document signature is invalid';
      errorDetails.suggestion = 'Document may be tampered, please obtain a new copy';
      errorDetails.retryable = false;
    } else if (error.code === 'BLOCKCHAIN_VERIFICATION_FAILED') {
      errorDetails.code = ErrorCode.BLOCKCHAIN_VERIFICATION_FAILED;
      errorDetails.message = 'Failed to verify document on blockchain';
      errorDetails.suggestion = 'Temporary blockchain network issue, please retry';
      errorDetails.retryable = true;
    } else if (error.code === 'DHA_VERIFICATION_FAILED') {
      errorDetails.code = ErrorCode.DHA_VERIFICATION_FAILED;
      errorDetails.message = 'DHA verification failed';
      errorDetails.suggestion = 'Please verify your document details with DHA';
      errorDetails.retryable = true;
    }

    return errorDetails;
  }

  static async enhancedValidation(doc: any): Promise<{
    valid: boolean;
    verifications: any;
    error?: string;
    suggestion?: string;
  }> {
    const verifications = {
      structure: false,
      expiry: false,
      security: false,
      blockchain: false,
      biometric: false
    };

    try {
      // Structural validation
      verifications.structure = await this.retryOperation(async () => {
        const { isValid } = await this.validateDocument(doc);
        return isValid;
      });

      // Expiry validation
      verifications.expiry = new Date(doc.metadata?.expiryDate) > new Date();

      // Security features validation
      verifications.security = await this.retryOperation(async () => {
        return doc.verificationData?.securityFeatures && 
               Object.values(doc.verificationData.securityFeatures).every(feature => feature);
      });

      // Blockchain validation
      verifications.blockchain = await this.retryOperation(async () => {
        return doc.verificationData?.blockchainReference && 
               doc.verificationData?.blockchainVerification?.verified;
      });

      // Biometric validation
      verifications.biometric = await this.retryOperation(async () => {
        return doc.verificationData?.biometricEncryption && 
               doc.verificationData?.biometricVerification?.verified;
      });

      const allValid = Object.values(verifications).every(v => v);

      return {
        valid: allValid,
        verifications,
        ...(allValid ? {} : {
          error: 'Document validation failed',
          suggestion: 'Please check individual verification results'
        })
      };
    } catch (error) {
      const errorDetails = this.getErrorDetails(error);
      return {
        valid: false,
        verifications,
        error: errorDetails.message,
        suggestion: errorDetails.suggestion
      };
    }
  }
}