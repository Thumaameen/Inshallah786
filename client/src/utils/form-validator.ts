export function validateDocumentForm(documentType: string, formData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData) {
    errors.push('No document data provided');
    return { isValid: false, errors };
  }

  // Validate base fields
  if (!documentType) {
    errors.push('Document type is required');
    return { isValid: false, errors };
  }

  // Common validations
  if (formData.fullName && formData.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (formData.dateOfBirth) {
    const dob = new Date(formData.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth');
    }
    // Add age validation if needed
  }

  // Document-specific validations
  switch (documentType) {
    case 'smart_id_card':
    case 'identity_document_book':
      if (!formData.idNumber || !/^\d{13}$/.test(formData.idNumber)) {
        errors.push('Valid 13-digit ID number is required');
      }
      break;

    case 'south_african_passport':
      if (!formData.passportNumber) {
        errors.push('Passport number is required');
      }
      if (!formData.nationality) {
        errors.push('Nationality is required');
      }
      if (formData.dateOfExpiry) {
        const expiry = new Date(formData.dateOfExpiry);
        if (isNaN(expiry.getTime())) {
          errors.push('Invalid expiry date');
        } else if (expiry < new Date()) {
          errors.push('Expiry date cannot be in the past');
        }
      }
      break;

    case 'birth_certificate':
      if (!formData.childFullName) {
        errors.push('Child\'s full name is required');
      }
      if (!formData.placeOfBirth) {
        errors.push('Place of birth is required');
      }
      if (!formData.motherFullName) {
        errors.push('Mother\'s full name is required');
      }
      if (!formData.fatherFullName) {
        errors.push('Father\'s full name is required');
      }
      break;

    case 'marriage_certificate':
      if (!formData.marriageDate) {
        errors.push('Marriage date is required');
      }
      if (!formData.marriagePlace) {
        errors.push('Marriage place is required');
      }
      if (!formData.partner1FullName) {
        errors.push('Partner 1 full name is required');
      }
      if (!formData.partner2FullName) {
        errors.push('Partner 2 full name is required');
      }
      if (!formData.officiantName) {
        errors.push('Marriage officer name is required');
      }
      break;

    case 'general_work_visa':
    case 'critical_skills_work_visa':
      if (!formData.validFrom) {
        errors.push('Valid from date is required');
      }
      if (!formData.validUntil) {
        errors.push('Valid until date is required');
      }
      if (!formData.nationality) {
        errors.push('Nationality is required');
      }
      if (!formData.occupation) {
        errors.push('Occupation is required');
      }
      if (documentType === 'critical_skills_work_visa' && !formData.criticalSkillArea) {
        errors.push('Critical skill area is required');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}