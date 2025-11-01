import { z } from 'zod';
import { handleApiError } from './api-error-handler';

// Define schemas for document validation
const documentBaseSchema = z.object({
  documentType: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  idNumber: z.string().min(13, "13-digit ID number is required"),
});

export const documentSchemas = {
  smart_id_card: documentBaseSchema.extend({
    issuingOffice: z.string().optional(),
  }),
  identity_document_book: documentBaseSchema.extend({
    issuingOffice: z.string().optional(),
  }),
  south_african_passport: documentBaseSchema.extend({
    passportNumber: z.string().min(1, "Passport number is required"),
    passportType: z.enum(["ordinary", "diplomatic", "official"]),
    dateOfIssue: z.string().min(1, "Date of issue is required"),
    dateOfExpiry: z.string().min(1, "Date of expiry is required"),
    placeOfIssue: z.string().optional(),
  }),
  birth_certificate: z.object({
    childFullName: z.string().min(1, "Child's full name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    placeOfBirth: z.string().min(1, "Place of birth is required"),
    motherFullName: z.string().min(1, "Mother's full name is required"),
    fatherFullName: z.string().min(1, "Father's full name is required"),
    registrationNumber: z.string().optional(),
    registrationDate: z.string().optional(),
  }),
};

export async function generateDocument(documentType: string, documentData: any, isDownload = false) {
  try {
    // Validate the data
    const schema = documentSchemas[documentType as keyof typeof documentSchemas];
    if (schema) {
      const validation = schema.safeParse(documentData);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }
    }

    // Call the API endpoint
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
      throw new Error(errorData.message || 'Failed to generate document');
    }

    // Handle different response types
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

      return {
        success: true,
        message: 'Document downloaded successfully'
      };
    }

    const result = await response.json();
    return {
      success: true,
      ...result
    };

  } catch (error) {
    if (error instanceof Error) {
      handleApiError({
        message: error.message,
        status: 400,
        type: 'document_generation'
      });
    } else {
      handleApiError({
        message: 'An unexpected error occurred',
        status: 500,
        type: 'document_generation'
      });
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate document'
    };
  }
}