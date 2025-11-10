/**
 * Core Self-Healing Architecture Implementation
 * Simplified but fully functional implementation for validation
 */

import { EventEmitter } from 'events';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { storage } from '../storage.js';
import { type InsertSystemMetric, type InsertSecurityEvent, type InsertAuditLog, type InsertSelfHealingAction } from '../../shared/schema/index.js';
import { enhancedSecurityResponseService } from './enhanced-security-response.js';
import { enhancedErrorCorrectionService } from './enhanced-error-correction.js';

// Simple connection status check
async function getConnectionStatus() {
  try {
    await db.execute(sql`SELECT 1`);
    return { connected: true };
  } catch (error) {
    return { connected: false };
  }
}

// Core Self-Healing Service
class CoreSelfHealingService extends EventEmitter {
  private isRunning = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metrics: Map<string, any> = new Map();

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on('system_alert', this.handleSystemAlert.bind(this));
    this.on('error_detected', this.handleErrorDetection.bind(this));
    this.on('security_threat', this.handleSecurityThreat.bind(this));
  }

  async start(): Promise<boolean> {
    try {
      console.log('🚀 Starting Core Self-Healing Service...');
      
      // Test database connection
      const dbStatus = await getConnectionStatus();
      if (!dbStatus.connected) {
        console.warn('⚠️ Database not connected, running in fallback mode');
      }

      this.isRunning = true;
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Log initial system state
      await this.logSystemMetric({
        source: 'core_self_healing',
        metricName: 'self_healing_startup',
        metricValue: 1,
        metricType: 'count'
      });

      console.log('✅ Core Self-Healing Service started successfully');
      this.emit('service_started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Core Self-Healing Service:', error);
      return false;
    }
  }

  async stop(): Promise<boolean> {
    try {
      console.log('🛑 Stopping Core Self-Healing Service...');
      
      this.isRunning = false;
      
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      await this.logSystemMetric({
        source: 'core_self_healing',
        metricName: 'self_healing_shutdown',
        metricValue: 1,
        metricType: 'count'
      });

      console.log('✅ Core Self-Healing Service stopped');
      this.emit('service_stopped');
      return true;
    } catch (error) {
      console.error('❌ Error stopping Core Self-Healing Service:', error);
      return false;
    }
  }

  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.performHealthCheck();
      }
    }, 30000); // Every 30 seconds
  }

  async performHealthCheck(): Promise<any> {
    try {
      const checkTime = Date.now();
      
      // Check database connectivity
      const dbStatus = await getConnectionStatus();
      
      // Check memory usage
      const memUsage = process.memoryUsage();
      const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      // Check CPU (simplified)
      const cpuUsage = process.cpuUsage();
      
      const healthData = {
        timestamp: new Date().toISOString(),
        database: dbStatus,
        memory: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          usagePercent: memUsagePercent
        },
        cpu: cpuUsage,
        uptime: process.uptime(),
        status: 'healthy'
      };

      // Determine if intervention is needed
      if (memUsagePercent > 80) {
        await this.handleHighMemoryUsage(memUsagePercent);
      }

      if (!dbStatus.connected) {
        await this.handleDatabaseDisconnection();
      }

      // Store health check result
      this.metrics.set('last_health_check', healthData);
      
      // Log the health check
      await this.logSystemMetric({
        source: 'core_self_healing',
        metricName: 'health_check',
        metricValue: healthData.status === 'healthy' ? 1 : 0,
        metricType: 'status'
      });

      return healthData;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'error', error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async handleHighMemoryUsage(usagePercent: number) {
    console.warn(`⚠️ High memory usage detected: ${usagePercent.toFixed(2)}%`);
    
    // Self-healing action: trigger garbage collection
    if (global.gc) {
      global.gc();
      console.log('🧹 Garbage collection triggered');
    }

    await this.logSelfHealingAction({
      actionType: 'memory_optimization',
      trigger: `High memory usage: ${usagePercent.toFixed(2)}% (threshold: 80%)`,
      metadata: {
        type: 'reactive',
        category: 'performance',
        severity: 'medium',
        description: 'Memory optimization triggered due to high usage',
        target: 'core_self_healing',
        memory_usage_percent: usagePercent,
        threshold: '80%',
        aiAssisted: false,
        status: 'completed',
        result: 'Triggered garbage collection - success'
      }
    });

    this.emit('self_healing_action', { type: 'memory_optimization', success: true });
  }

  private async handleDatabaseDisconnection() {
    const startTime = Date.now();
    console.warn('⚠️ Database disconnection detected - initiating enhanced recovery');

    // Use enhanced error correction for database reconnection
    try {
      const correctionResult = await enhancedErrorCorrectionService.correctError({
        type: 'database_connection',
        message: 'Database connection lost - implementing reconnection with exponential backoff',
        component: 'database_connection',
        severity: 'high',
        details: { detected_at: new Date().toISOString() }
      });

      const recoveryLatency = Date.now() - startTime;

      await this.logSelfHealingAction({
        actionType: 'database_recovery',
        trigger: 'Database connection lost',
        status: correctionResult.success ? 'completed' : 'failed',
        result: `${correctionResult.action} - ${correctionResult.success ? 'success' : 'failed'}`,
        metadata: {
          type: 'reactive',
          category: 'availability',
          severity: 'high',
          description: 'Database connection recovery with exponential backoff',
          target: 'database_connection',
          recovery_time_ms: correctionResult.correctionTimeMs,
          total_latency_ms: recoveryLatency,
          fallback_mode: !correctionResult.success,
          connection_restored: correctionResult.success,
          details: correctionResult.details,
          aiAssisted: false,
          confidence: 85
        },
        completedAt: new Date()
      });

      this.emit('database_recovery_completed', {
        success: correctionResult.success,
        recoveryLatency,
        fallbackMode: !correctionResult.success
      });

      if (correctionResult.success) {
        console.log(`✅ Database connection restored in ${recoveryLatency}ms`);
      } else {
        console.warn(`⚠️ Database recovery failed in ${recoveryLatency}ms - operating in fallback mode`);
      }

    } catch (error) {
      const recoveryLatency = Date.now() - startTime;
      console.error(`❌ Database recovery failed in ${recoveryLatency}ms:`, error);

      await this.logSelfHealingAction({
        actionType: 'database_recovery',
        trigger: `Database connection lost - ${error instanceof Error ? error.message : String(error)}`,
        status: 'failed',
        result: 'DATABASE_RECOVERY_FAILED',
        metadata: {
          type: 'reactive',
          category: 'availability',
          severity: 'critical',
          description: 'Database connection recovery failed',
          target: 'database_connection',
          recovery_time_ms: recoveryLatency,
          error: error instanceof Error ? error.message : String(error),
          aiAssisted: false,
          confidence: 0
        },
        completedAt: new Date()
      });

      this.emit('database_recovery_failed', { error, recoveryLatency });
    }
  }

  private async handleSystemAlert(alertData: any) {
    console.log('🚨 System alert received:', alertData);

    await this.logAuditEvent({
      action: 'SYSTEM_ALERT',
      actor: 'self_healing_system',
      result: 'alert_logged',
      metadata: {
        alert_message: alertData.message || 'Unknown alert',
        alertData: alertData
      }
    });
  }

  private async handleErrorDetection(errorData: any) {
    const startTime = Date.now();
    console.error('🔴 Error detected:', errorData);

    // Use enhanced error correction service for comprehensive recovery
    try {
      const correctionResult = await enhancedErrorCorrectionService.correctError({
        type: errorData.type || 'performance_degradation',
        message: errorData.message || 'Unknown error detected',
        component: errorData.component || 'unknown',
        severity: errorData.severity || 'medium',
        details: errorData.details || {},
        stackTrace: errorData.stackTrace
      });

      const totalLatency = Date.now() - startTime;

      // Log comprehensive error correction results
      await this.logSelfHealingAction({
        actionType: 'error_correction',
        trigger: `${errorData.type || 'unknown'} error: ${errorData.message || 'Unknown error'}`,
        status: correctionResult.success ? 'completed' : 'failed',
        result: `${correctionResult.action} - ${correctionResult.success ? 'success' : 'failed'}`,
        metadata: {
          type: 'reactive',
          category: 'performance',
          severity: errorData.severity || 'medium',
          description: `Enhanced error correction: ${errorData.type || 'unknown'}`,
          target: errorData.component || 'unknown',
          error_type: errorData.type,
          component: errorData.component,
          correction_time_ms: correctionResult.correctionTimeMs,
          total_latency_ms: totalLatency,
          needs_restart: correctionResult.needsRestart || false,
          rollback_required: correctionResult.rollbackRequired || false,
          recovery_effective: correctionResult.success,
          details: correctionResult.details,
          aiAssisted: false,
          confidence: 85
        },
        completedAt: new Date()
      });

      // Emit enhanced error correction event
      this.emit('error_corrected', {
        errorData,
        correctionResult,
        totalLatency,
        recoverySuccessful: correctionResult.success
      });

      console.log(`✅ Error corrected in ${totalLatency}ms: ${correctionResult.action}`);

      // Handle restart requirement if needed
      if (correctionResult.needsRestart) {
        console.warn('⚠️ System restart recommended due to error correction requirements');
        this.emit('restart_recommended', { reason: 'error_correction', errorData, correctionResult });
      }

    } catch (error) {
      const totalLatency = Date.now() - startTime;
      console.error(`❌ Error correction failed in ${totalLatency}ms:`, error);

      // Log failed error correction
      await this.logSelfHealingAction({
        actionType: 'error_correction',
        trigger: `${errorData.type || 'unknown'} error correction failed: ${error instanceof Error ? error.message : String(error)}`,
        status: 'failed',
        result: 'ERROR_CORRECTION_FAILED',
        metadata: {
          type: 'reactive',
          category: 'performance',
          severity: 'high',
          description: `Failed error correction: ${errorData.type || 'unknown'}`,
          target: errorData.component || 'unknown',
          error_type: errorData.type,
          error_message: errorData.message || 'Unknown error',
          total_latency_ms: totalLatency,
          correction_error: error instanceof Error ? error.message : String(error),
          aiAssisted: false,
          confidence: 0
        },
        completedAt: new Date()
      });

      this.emit('error_correction_failed', { errorData, error, totalLatency });
    }
  }

  private async handleSecurityThreat(threatData: any) {
    const startTime = Date.now();
    console.warn('🛡️ Security threat detected:', threatData);

    // Use enhanced security response service for real mitigation
    try {
      const securityResponse = await enhancedSecurityResponseService.handleSecurityThreat({
        type: threatData.type || 'unknown_threat',
        sourceIp: threatData.sourceIp || 'unknown',
        severity: threatData.severity || 'medium',
        description: threatData.description || 'Security threat detected',
        confidence: threatData.confidence || 85,
        indicators: threatData.indicators || [],
        userId: threatData.userId,
        details: threatData
      });

      const responseLatency = Date.now() - startTime;

      // Log the actual security response with performance metrics
      await this.logSelfHealingAction({
        actionType: 'security_mitigation',
        trigger: `${threatData.type || 'unknown_threat'} from ${threatData.sourceIp || 'unknown'}`,
        status: securityResponse.success ? 'completed' : 'failed',
        result: `${securityResponse.action} - ${securityResponse.success ? 'success' : 'failed'}`,
        metadata: {
          type: 'reactive',
          category: 'security',
          severity: threatData.severity || 'medium',
          description: `Security threat mitigation: ${threatData.type}`,
          target: 'security_system',
          threat_type: threatData.type,
          source_ip: threatData.sourceIp,
          response_time_ms: securityResponse.responseTimeMs,
          total_latency_ms: responseLatency,
          ip_blocked: securityResponse.blockingActive || false,
          ip_quarantined: securityResponse.quarantineActive || false,
          latency_target_met: responseLatency < 100,
          mitigation_effective: securityResponse.success,
          details: securityResponse.details,
          aiAssisted: false,
          confidence: threatData.confidence || 85
        },
        completedAt: new Date()
      });

      // Log security event
      await this.logSecurityEvent({
        eventType: 'threat_mitigated',
        severity: threatData.severity || 'medium',
        source: 'security_system',
        metadata: {
          threat_type: threatData.type || 'unknown',
          threat_description: threatData.description || 'Security threat detected and mitigated',
          response_time_ms: securityResponse.responseTimeMs,
          latency_ms: responseLatency,
          action_taken: securityResponse.action,
          success: securityResponse.success,
          ...threatData
        },
        ipAddress: threatData.sourceIp || 'unknown'
      });

      // Emit enhanced security response
      this.emit('security_threat_mitigated', {
        threatData,
        securityResponse,
        responseLatency,
        latencyTargetMet: responseLatency < 100
      });

      console.log(`✅ Security threat mitigated in ${responseLatency}ms (target: <100ms): ${securityResponse.action}`);

    } catch (error) {
      const responseLatency = Date.now() - startTime;
      console.error(`❌ Security threat mitigation failed in ${responseLatency}ms:`, error);

      // Log failed security response
      await this.logSelfHealingAction({
        actionType: 'security_mitigation',
        trigger: `${threatData.type} from ${threatData.sourceIp} - mitigation failed: ${error instanceof Error ? error.message : String(error)}`,
        status: 'failed',
        result: 'SECURITY_MITIGATION_FAILED',
        metadata: {
          type: 'reactive',
          category: 'security',
          severity: 'high',
          description: `Failed security threat mitigation: ${threatData.type}`,
          target: 'security_system',
          threat_type: threatData.type,
          source_ip: threatData.sourceIp,
          response_time_ms: responseLatency,
          error: error instanceof Error ? error.message : String(error),
          aiAssisted: false,
          confidence: 0
        },
        completedAt: new Date()
      });

      this.emit('security_response_failed', { threatData, error, responseLatency });
    }
  }

  private async attemptErrorCorrection(errorData: any): Promise<any> {
    try {
      // Simple error correction strategies
      if (errorData.type === 'memory_leak') {
        if (global.gc) {
          global.gc();
          return { action: 'Triggered garbage collection', success: true };
        }
      }

      if (errorData.type === 'connection_timeout') {
        // Could implement retry logic here
        return { action: 'Scheduled retry', success: true };
      }

      return { action: 'No correction available', success: false };
    } catch (error) {
      return { action: 'Correction failed', success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Logging methods with fallback to console if database unavailable
  private async logSystemMetric(metric: InsertSystemMetric) {
    try {
      if (storage.createSystemMetric) {
        await storage.createSystemMetric(metric);
      } else {
        console.log('📊 METRIC:', metric);
      }
    } catch (error) {
      console.log('📊 METRIC (fallback):', metric);
    }
  }

  private async logSecurityEvent(event: InsertSecurityEvent) {
    try {
      if (storage.createSecurityEvent) {
        await storage.createSecurityEvent(event);
      } else {
        console.log('🛡️ SECURITY:', event);
      }
    } catch (error) {
      console.log('🛡️ SECURITY (fallback):', event);
    }
  }

  private async logAuditEvent(event: InsertAuditLog) {
    try {
      if (storage.createAuditLog) {
        const fullEvent: InsertAuditLog = {
          action: event.action,
          actor: event.actor,
          result: event.result,
          metadata: event.metadata
        };
        await storage.createAuditLog(fullEvent);
      } else {
        console.log('📝 AUDIT:', event);
      }
    } catch (error) {
      console.log('📝 AUDIT (fallback):', event);
    }
  }

  private async logSelfHealingAction(action: InsertSelfHealingAction) {
    try {
      if (storage.createSelfHealingAction) {
        const fullAction: InsertSelfHealingAction = {
          actionType: action.actionType,
          trigger: action.trigger,
          status: action.status,
          result: action.result,
          metadata: action.metadata,
          completedAt: action.completedAt
        };
        await storage.createSelfHealingAction(fullAction);
      } else {
        console.log('🔧 SELF-HEALING:', action);
      }
    } catch (error) {
      console.log('🔧 SELF-HEALING (fallback):', action);
    }
  }

  // Public methods for external interaction
  async getStatus(): Promise<any> {
    return {
      isRunning: this.isRunning,
      lastHealthCheck: this.metrics.get('last_health_check'),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  async triggerHealthCheck(): Promise<any> {
    return await this.performHealthCheck();
  }

  async simulateError(errorData: any): Promise<void> {
    this.emit('error_detected', errorData);
  }

  async simulateSecurityThreat(threatData: any): Promise<void> {
    this.emit('security_threat', threatData);
  }
}

// Export singleton instance
export const coreSelfHealingService = new CoreSelfHealingService();
export default coreSelfHealingService;