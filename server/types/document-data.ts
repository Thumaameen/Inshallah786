/**
 * Document data type definitions for all DHA document types
 */

export interface BaseDocumentData {
  idNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality?: string;
  gender?: 'M' | 'F' | 'X';
  placeOfBirth?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  [key: string]: any;
}

export interface IdentityDocumentBookData extends BaseDocumentData {
  idNumber: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface TemporaryIdCertificateData extends BaseDocumentData {
  idNumber: string;
  issueDate?: string;
  reason?: string;
}

export interface SouthAfricanPassportData extends BaseDocumentData {
  passportNumber: string;
  issueDate?: string;
  expiryDate?: string;
  placeOfIssue?: string;
}

export interface EmergencyTravelCertificateData extends BaseDocumentData {
  certificateNumber: string;
  issueDate?: string;
  expiryDate?: string;
  destination?: string;
  reason?: string;
}

export interface RefugeeTravelDocumentData extends BaseDocumentData {
  documentNumber: string;
  refugeeStatus?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface BirthCertificateData {
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  childPlaceOfBirth: string;
  childGender?: 'M' | 'F' | 'X';
  motherFirstName?: string;
  motherLastName?: string;
  motherIdNumber?: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  fatherIdNumber?: string;
  registrationNumber?: string;
  issueDate?: string;
  [key: string]: any;
}

export interface DeathCertificateData {
  deceasedFirstName: string;
  deceasedLastName: string;
  deceasedIdNumber?: string;
  dateOfDeath: string;
  placeOfDeath?: string;
  causeOfDeath?: string;
  registrationNumber?: string;
  issueDate?: string;
  [key: string]: any;
}

export interface MarriageCertificateData {
  spouse1FirstName: string;
  spouse1LastName: string;
  spouse1IdNumber?: string;
  spouse2FirstName: string;
  spouse2LastName: string;
  spouse2IdNumber?: string;
  marriageDate: string;
  marriagePlace?: string;
  registrationNumber?: string;
  issueDate?: string;
  [key: string]: any;
}

export interface DivorceCertificateData extends MarriageCertificateData {
  divorceDate: string;
  divorcePlace?: string;
  caseNumber?: string;
}

export interface GeneralWorkVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  employer?: string;
  occupation?: string;
  workPermitConditions?: string;
}

export interface CriticalSkillsWorkVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  criticalSkill?: string;
  qualification?: string;
}

export interface IntraCompanyTransferWorkVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  companyName?: string;
  position?: string;
}

export interface BusinessVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  businessType?: string;
  investmentAmount?: string;
}

export interface StudyVisaPermitData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  institution?: string;
  courseOfStudy?: string;
}

export interface VisitorVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  purposeOfVisit?: string;
  duration?: string;
}

export interface MedicalTreatmentVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  medicalFacility?: string;
  treatmentType?: string;
}

export interface RetiredPersonVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  pensionAmount?: string;
  sourceOfIncome?: string;
}

export interface ExchangeVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  exchangeProgram?: string;
  hostOrganization?: string;
}

export interface RelativesVisaData extends BaseDocumentData {
  visaNumber: string;
  issueDate?: string;
  expiryDate?: string;
  relativeName?: string;
  relativeIdNumber?: string;
  relationship?: string;
}

export interface PermanentResidencePermitData extends BaseDocumentData {
  permitNumber: string;
  issueDate?: string;
  category?: string;
}

export interface CertificateOfExemptionData extends BaseDocumentData {
  certificateNumber: string;
  issueDate?: string;
  expiryDate?: string;
  exemptionType?: string;
}

export interface CertificateOfSouthAfricanCitizenshipData extends BaseDocumentData {
  certificateNumber: string;
  issueDate?: string;
  acquisitionMethod?: string;
}
