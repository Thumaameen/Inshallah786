export enum DHADocumentType {
  // Identity Documents
  ID_CARD = 'id_card',
  SMART_ID = 'smart_id',
  PASSPORT = 'passport',
  DIPLOMATIC_PASSPORT = 'diplomatic_passport',
  OFFICIAL_PASSPORT = 'official_passport',
  EMERGENCY_PASSPORT = 'emergency_passport',
  CHILD_PASSPORT = 'child_passport',
  
  // Birth Records
  BIRTH_CERTIFICATE = 'birth_certificate',
  BIRTH_CERTIFICATE_UNABRIDGED = 'birth_certificate_unabridged',
  FOREIGN_BIRTH_REGISTRATION = 'foreign_birth_registration',
  
  // Death Records
  DEATH_CERTIFICATE = 'death_certificate',
  DEATH_CERTIFICATE_UNABRIDGED = 'death_certificate_unabridged',
  
  // Marriage Records
  MARRIAGE_CERTIFICATE = 'marriage_certificate',
  MARRIAGE_CERTIFICATE_UNABRIDGED = 'marriage_certificate_unabridged',
  CIVIL_UNION_CERTIFICATE = 'civil_union_certificate',
  
  // Immigration & Visas
  TEMPORARY_RESIDENCE_VISA = 'temporary_residence_visa',
  PERMANENT_RESIDENCE_PERMIT = 'permanent_residence_permit',
  WORK_VISA = 'work_visa',
  STUDY_VISA = 'study_visa',
  BUSINESS_VISA = 'business_visa',
  RETIRED_PERSON_VISA = 'retired_person_visa',
  RELATIVE_VISA = 'relative_visa',
  MEDICAL_VISA = 'medical_visa',
  EXCHANGE_VISA = 'exchange_visa',
  ASYLUM_SEEKER_PERMIT = 'asylum_seeker_permit',
  REFUGEE_ID = 'refugee_id',
  
  // Citizenship
  NATURALIZATION_CERTIFICATE = 'naturalization_certificate',
  CITIZENSHIP_CERTIFICATE = 'citizenship_certificate',
  RETENTION_CITIZENSHIP = 'retention_citizenship',
  RENUNCIATION_CITIZENSHIP = 'renunciation_citizenship',
  
  // Verification Documents
  POLICE_CLEARANCE = 'police_clearance',
  VERIFICATION_CERTIFICATE = 'verification_certificate',
  APOSTILLE_CERTIFICATE = 'apostille_certificate',
  
  // Special Permits
  CORPORATE_VISA = 'corporate_visa',
  CRITICAL_SKILLS_VISA = 'critical_skills_visa',
  DIPLOMATIC_PERMIT = 'diplomatic_permit',
  OFFICIAL_PERMIT = 'official_permit',
  
  // Travel Documents
  EMERGENCY_TRAVEL_CERTIFICATE = 'emergency_travel_certificate',
  TRAVEL_DOCUMENT_REFUGEE = 'travel_document_refugee',
  
  // Other Certificates
  NAME_CHANGE_CERTIFICATE = 'name_change_certificate',
  GENDER_CHANGE_CERTIFICATE = 'gender_change_certificate'
}