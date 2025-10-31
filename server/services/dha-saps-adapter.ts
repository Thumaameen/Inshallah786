import crypto from "crypto";
import { storage } from "../mem-storage.js";

/**
 * DHA SAPS CRC (Criminal Record Centre) Adapter - PRODUCTION READY
 * 
 * This adapter interfaces with the South African Police Service Criminal Record Centre
 * to perform background checks and criminal record verifications using REAL API calls.
 * 
 * Features:
 * - Real HTTP/HTTPS API calls to SAPS CRC endpoints
 * - Police clearance certificate verification
 * - Criminal record checks by ID number
 * - Conviction history retrieval
 * - Outstanding warrant checks
 */

export interface SAPSCriminalRecord {
  caseNumber: string;
  chargeDate: Date;
  convictionDate?: Date;
  offenseType: string;
  offenseCategory: 'violent' | 'property' | 'financial' | 'drug' | 'traffic' | 'other';
  severity: 'misdemeanor' | 'felony' | 'summary_offense';
  courtName: string;
  sentence?: string;
  sentenceCompleted: boolean;
  status: 'pending' | 'convicted' | 'acquitted' | 'dismissed';
}

export interface SAPSWarrant {
  warrantNumber: string;
  issueDate: Date;
  issuingCourt: string;
  warrantType: 'arrest' | 'search' | 'bench';
  chargesDescription: string;
  status: 'active' | 'executed' | 'cancelled';
}

export interface SAPSClearanceRequest {
  applicantId: string;
  applicationId: string;
  idNumber: string;
  fullName: string;
  dateOfBirth: Date;
  purposeOfCheck: 'employment' | 'immigration' | 'adoption' | 'firearm_license' | 'other';
  checkType: 'basic' | 'enhanced' | 'full_disclosure';
  consentGiven: boolean;
  requestedBy: string; // User ID who requested the check
}

export interface SAPSClearanceResponse {
  success: boolean;
  requestId: string;
  referenceNumber: string;
  clearanceStatus: 'clear' | 'pending' | 'record_found';
  riskAssessment: 'low' | 'medium' | 'high';

  // Clearance Details
  policyNumber?: string; // SAPS policy clearance number
  issuedDate?: Date;
  validUntil?: Date;

  // Criminal History
  hasCriminalRecord: boolean;
  criminalRecords: SAPSCriminalRecord[];

  // Outstanding Issues
  hasOutstandingWarrants: boolean;
  outstandingWarrants: SAPSWarrant[];

  // Additional Information
  lastCheckedDate: Date;
  checkCompleteness: 'complete' | 'partial' | 'limited';
  restrictionsOrConditions?: string[];

  processingTime: number;
  error?: string;
}

export class DHASAPSAdapter {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly clientCert?: string;
  private readonly privateKey?: string;
  private readonly timeout: number = 60000; // 60 seconds for criminal record checks
  private readonly retryAttempts: number = 3;
  private readonly isProduction: boolean;

  constructor() {
    // Force production mode for Render deployment
    const environment = 'production'; 
    this.isProduction = true;

    // Get configuration from environment
    this.baseUrl = process.env.SAPS_CRC_BASE_URL || process.env.SAPS_CRC_API_ENDPOINT || 'https://crc-api.saps.gov.za/v1';
    this.apiKey = process.env.SAPS_CRC_API_KEY || '';
    this.clientCert = process.env.SAPS_CLIENT_CERT;
    this.privateKey = process.env.SAPS_PRIVATE_KEY;

    console.log(`[SAPS-CRC] Initialized in PRODUCTION mode`);
    console.log(`[SAPS-CRC] Base URL: ${this.baseUrl}`);
    console.log(`[SAPS-CRC] API Key configured: ${this.apiKey ? 'Yes' : 'No'}`);
    console.log(`[SAPS-CRC] mTLS certificates configured: ${this.clientCert && this.privateKey ? 'Yes' : 'No'}`);
  }

  /**
   * Perform criminal record check - REAL API CALL
   */
  async performCriminalRecordCheck(request: SAPSClearanceRequest): Promise<SAPSClearanceResponse> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // Validate request
      this.validateRequest(request);

      // Log audit event
      await this.logAuditEvent({
        action: 'saps_crc_check_started',
        entityType: 'criminal_record_check',
        entityId: request.applicationId,
        actionDetails: {
          requestId,
          idNumber: request.idNumber,
          purposeOfCheck: request.purposeOfCheck,
          checkType: request.checkType,
          consentGiven: request.consentGiven,
          requestedBy: request.requestedBy
        }
      });

      // Check consent
      if (!request.consentGiven) {
        throw new Error('Consent is required for criminal record checks');
      }

      // Perform criminal record check via REAL API call
      const response = await this.makeSAPSApiCall(requestId, request);
      response.processingTime = Date.now() - startTime;

      // Log completion
      await this.logAuditEvent({
        action: 'saps_crc_check_completed',
        entityType: 'criminal_record_check',
        entityId: request.applicationId,
        outcome: response.success ? 'success' : 'failed',
        actionDetails: {
          requestId,
          referenceNumber: response.referenceNumber,
          clearanceStatus: response.clearanceStatus,
          riskAssessment: response.riskAssessment,
          hasCriminalRecord: response.hasCriminalRecord,
          hasOutstandingWarrants: response.hasOutstandingWarrants,
          processingTime: response.processingTime
        }
      });

      return response;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.logAuditEvent({
        action: 'saps_crc_check_failed',
        entityType: 'criminal_record_check',
        entityId: request.applicationId,
        outcome: 'failed',
        actionDetails: {
          requestId,
          error: errorMessage,
          processingTime
        }
      });

      return {
        success: false,
        requestId,
        referenceNumber: `ERROR-${requestId}`,
        clearanceStatus: 'pending',
        riskAssessment: 'high',
        hasCriminalRecord: false,
        criminalRecords: [],
        hasOutstandingWarrants: false,
        outstandingWarrants: [],
        lastCheckedDate: new Date(),
        checkCompleteness: 'limited',
        processingTime,
        error: errorMessage
      };
    }
  }

  /**
   * Make REAL SAPS API call using fetch
   */
  private async makeSAPSApiCall(requestId: string, request: SAPSClearanceRequest): Promise<SAPSClearanceResponse> {
    try {
      // Prepare request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Client-ID': 'dha-digital-services',
        'X-Purpose-Of-Check': request.purposeOfCheck,
        'User-Agent': 'DHA-Digital-Services/1.0'
      };

      // Add API key if available
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        headers['X-API-Key'] = this.apiKey;
      }

      const endpoint = `${this.baseUrl}/clearance/check`;
      console.log(`[SAPS-CRC] Making API call to: ${endpoint}`);

      // Make HTTP request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requestId,
          idNumber: request.idNumber,
          fullName: request.fullName,
          dateOfBirth: request.dateOfBirth instanceof Date 
            ? request.dateOfBirth.toISOString() 
            : request.dateOfBirth,
          purposeOfCheck: request.purposeOfCheck,
          checkType: request.checkType,
          consentGiven: request.consentGiven,
          requestedBy: request.requestedBy,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error(`[SAPS-CRC] API error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`SAPS CRC API returned error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`[SAPS-CRC] API call successful`);

      // Parse and return response
      return {
        success: true,
        requestId,
        referenceNumber: data.reference_number || data.referenceNumber || `SAPS-${requestId}`,
        clearanceStatus: data.clearance_status || data.clearanceStatus || 'clear',
        riskAssessment: data.risk_assessment || data.riskAssessment || 'low',
        policyNumber: data.policy_number || data.policyNumber,
        issuedDate: data.issued_date ? new Date(data.issued_date) : new Date(),
        validUntil: data.valid_until ? new Date(data.valid_until) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        hasCriminalRecord: data.has_criminal_record || data.hasCriminalRecord || false,
        criminalRecords: (data.criminal_records || data.criminalRecords || []).map((r: any) => this.parseCriminalRecord(r)),
        hasOutstandingWarrants: data.has_outstanding_warrants || data.hasOutstandingWarrants || false,
        outstandingWarrants: (data.outstanding_warrants || data.outstandingWarrants || []).map((w: any) => this.parseWarrant(w)),
        lastCheckedDate: new Date(),
        checkCompleteness: data.check_completeness || data.checkCompleteness || 'complete',
        restrictionsOrConditions: data.restrictions || data.restrictionsOrConditions || [],
        processingTime: 0
      };

    } catch (error) {
      console.error(`[SAPS-CRC] API call failed:`, error);

      // Remove fallback response for production
      throw error;
    }
  }

  /**
   * Parse criminal record from API response
   */
  private parseCriminalRecord(data: any): SAPSCriminalRecord {
    return {
      caseNumber: data.case_number || data.caseNumber || '',
      chargeDate: new Date(data.charge_date || data.chargeDate),
      convictionDate: data.conviction_date ? new Date(data.conviction_date) : undefined,
      offenseType: data.offense_type || data.offenseType || '',
      offenseCategory: data.offense_category || data.offenseCategory || 'other',
      severity: data.severity || 'misdemeanor',
      courtName: data.court_name || data.courtName || '',
      sentence: data.sentence,
      sentenceCompleted: data.sentence_completed || data.sentenceCompleted || false,
      status: data.status || 'pending'
    };
  }

  /**
   * Parse warrant from API response
   */
  private parseWarrant(data: any): SAPSWarrant {
    return {
      warrantNumber: data.warrant_number || data.warrantNumber || '',
      issueDate: new Date(data.issue_date || data.issueDate),
      issuingCourt: data.issuing_court || data.issuingCourt || '',
      warrantType: data.warrant_type || data.warrantType || 'arrest',
      chargesDescription: data.charges_description || data.chargesDescription || '',
      status: data.status || 'active'
    };
  }

  /**
   * Validate clearance request
   */
  private validateRequest(request: SAPSClearanceRequest): void {
    if (!request.idNumber) {
      throw new Error('ID number is required for criminal record check');
    }

    if (!/^\d{13}$/.test(request.idNumber)) {
      throw new Error('Invalid ID number format (must be 13 digits)');
    }

    if (!request.consentGiven) {
      throw new Error('Consent is required for criminal record checks');
    }

    if (!request.purposeOfCheck) {
      throw new Error('Purpose of check is required');
    }
  }

  /**
   * Log audit event using available storage
   */
  private async logAuditEvent(log: {
    action: string;
    entityType?: string;
    entityId?: string;
    outcome?: string;
    actionDetails?: any;
  }): Promise<void> {
    try {
      await storage.createAuditLog({
        userId: 'system',
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        outcome: log.outcome,
        actionDetails: log.actionDetails,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[SAPS-CRC] Failed to log audit event:', error);
    }
  }

  /**
   * Health check for SAPS CRC service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy', message: string, responseTime?: number }> {
    const startTime = Date.now();

    try {
      if (!this.apiKey) {
        return {
          status: 'unhealthy',
          message: 'SAPS CRC API key not configured',
          responseTime: Date.now() - startTime
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        message: response.ok ? 'SAPS CRC service is operational' : `SAPS CRC service returned ${response.status}`,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }
}

export const dhaSAPSAdapter = new DHASAPSAdapter();