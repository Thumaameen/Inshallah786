import { z } from 'zod';

// Base schema for common fields
const baseDocumentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.string(),
  nationality: z.string()
});

// Smart ID Card schema
export const smartIdCardSchema = baseDocumentSchema.extend({
  idNumber: z.string().length(13, '13-digit ID number required'),
  issuingOffice: z.string().optional()
});

// South African Passport schema
export const passportSchema = baseDocumentSchema.extend({
  passportNumber: z.string().min(1, 'Passport number is required'),
  passportType: z.enum(['ordinary', 'diplomatic', 'official']),
  dateOfIssue: z.string(),
  dateOfExpiry: z.string(),
  placeOfIssue: z.string().optional()
});

// Birth Certificate schema
export const birthCertificateSchema = z.object({
  childFullName: z.string().min(2, 'Child full name must be at least 2 characters'),
  sex: z.enum(['male', 'female']),
  dateOfBirth: z.string(),
  placeOfBirth: z.string(),
  motherFullName: z.string().min(2, 'Mother full name must be at least 2 characters'),
  fatherFullName: z.string().min(2, 'Father full name must be at least 2 characters'),
  registrationNumber: z.string().optional()
});

// Marriage Certificate schema
export const marriageCertificateSchema = z.object({
  marriageDate: z.string(),
  marriagePlace: z.string(),
  marriageType: z.enum(['civil', 'religious', 'customary']),
  partner1FullName: z.string().min(2),
  partner1Age: z.number().min(18),
  partner2FullName: z.string().min(2),
  partner2Age: z.number().min(18),
  officiantName: z.string().min(2)
});

// Work Visa schema
const baseWorkVisaSchema = baseDocumentSchema.extend({
  validFrom: z.string(),
  validUntil: z.string(),
  occupation: z.string(),
  employer: z.string().optional()
});

export const generalWorkVisaSchema = baseWorkVisaSchema;

export const criticalSkillsWorkVisaSchema = baseWorkVisaSchema.extend({
  criticalSkillArea: z.enum([
    'engineering',
    'information_technology',
    'healthcare',
    'finance',
    'education',
    'agriculture'
  ])
});

// Document type schemas mapping
export const documentTypeSchemas = {
  smart_id_card: smartIdCardSchema,
  identity_document_book: smartIdCardSchema,
  south_african_passport: passportSchema,
  birth_certificate: birthCertificateSchema,
  marriage_certificate: marriageCertificateSchema,
  general_work_visa: generalWorkVisaSchema,
  critical_skills_work_visa: criticalSkillsWorkVisaSchema
} as const;