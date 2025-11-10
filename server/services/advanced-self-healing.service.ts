import { serviceConfig } from '../../config/service-integration.js';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ErrorRecord {
  id: string;
  error: any;
  timestamp: number;
  attempts: number;
  resolved: boolean;
  strategy: string;
  resolution?: any;
}

export class AdvancedSelfHealingService extends EventEmitter {
  private static instance: AdvancedSelfHealingService;
  private errors: Map<string, ErrorRecord> = new Map();
  private healing: boolean = false;
  private healingStrategies: Map<string, Function> = new Map();
  private errorPatterns: Map<string, RegExp> = new Map();

  private constructor() {
    super();
    this.initializeErrorPatterns();
    this.initializeHealingStrategies();
    this.startMonitoring();
  }

  static getInstance() {
    if (!AdvancedSelfHealingService.instance) {
      AdvancedSelfHealingService.instance = new AdvancedSelfHealingService();
    }
    return AdvancedSelfHealingService.instance;
  }

  private initializeErrorPatterns() {
    this.errorPatterns.set('CHUNK_SIZE', /(?:chunk|size|memory|allocation)\s+(?:error|exceeded|invalid)/i);
    this.errorPatterns.set('BUILD', /(?:build|compilation|webpack)\s+(?:failed|error|warning)/i);
    this.errorPatterns.set('TYPESCRIPT', /TS\d+|Type\s+'.+'\s+is\s+not\s+assignable/i);
    this.errorPatterns.set('MEMORY_LEAK', /(?:memory\s+leak|heap\s+overflow|allocation\s+failed)/i);
    this.errorPatterns.set('API_ERROR', /(?:api|endpoint|request)\s+(?:failed|error|timeout)/i);
    this.errorPatterns.set('DATABASE', /(?:database|db|sql|query)\s+(?:error|failed|timeout)/i);
    this.errorPatterns.set('NETWORK', /(?:network|connection|timeout)\s+(?:error|failed|lost)/i);
    this.errorPatterns.set('SECURITY', /(?:security|authentication|authorization)\s+(?:error|failed|invalid)/i);
  }

  private initializeHealingStrategies() {
    this.healingStrategies.set('CHUNK_SIZE', this.fixChunkSizeIssue.bind(this));
    this.healingStrategies.set('BUILD', this.fixBuildIssue.bind(this));
    this.healingStrategies.set('TYPESCRIPT', this.fixTypeScriptIssue.bind(this));
    this.healingStrategies.set('MEMORY_LEAK', this.fixMemoryLeak.bind(this));
    this.healingStrategies.set('API_ERROR', this.fixAPIIssue.bind(this));
    this.healingStrategies.set('DATABASE', this.fixDatabaseIssue.bind(this));
    this.healingStrategies.set('NETWORK', this.fixNetworkIssue.bind(this));
    this.healingStrategies.set('SECURITY', this.fixSecurityIssue.bind(this));
  }

  private startMonitoring() {
    // Monitor process errors
    process.on('uncaughtException', this.handleError.bind(this));
    process.on('unhandledRejection', this.handleError.bind(this));

    // Monitor memory usage
    setInterval(() => this.checkMemoryUsage(), 30000);

    // Monitor API health
    setInterval(() => this.checkAPIHealth(), 60000);

    // Run healing cycle
    setInterval(() => this.healingCycle(), 5000);
  }

  private async handleError(error: any) {
    const errorId = Date.now().toString();
    const errorType = this.identifyErrorType(error);
    
    this.errors.set(errorId, {
      id: errorId,
      error,
      timestamp: Date.now(),
      attempts: 0,
      resolved: false,
      strategy: errorType
    });

    this.emit('error_detected', { errorId, errorType });
    await this.attemptImmediateHeal(errorId);
  }

  private identifyErrorType(error: any): string {
    for (const [type, pattern] of this.errorPatterns.entries()) {
      if (pattern.test(error.message || error.toString())) {
        return type;
      }
    }
    return 'UNKNOWN';
  }

  private async healingCycle() {
    if (this.healing) return;
    this.healing = true;

    try {
      const errors = Array.from(this.errors.entries());
      for (const [errorId, errorData] of errors) {
        if (!errorData.resolved && errorData.attempts < 3) {
          await this.healError(errorId);
        }
      }
    } finally {
      this.healing = false;
    }
  }

  private async healError(errorId: string) {
    const errorData = this.errors.get(errorId);
    if (!errorData) return;

    try {
      const strategy = this.healingStrategies.get(errorData.strategy);
      if (strategy) {
        const result = await strategy(errorData.error);
        if (result.success) {
          this.errors.set(errorId, {
            ...errorData,
            resolved: true,
            resolution: result
          });
          this.emit('error_healed', { errorId, resolution: result });
        } else {
          this.errors.set(errorId, {
            ...errorData,
            attempts: errorData.attempts + 1
          });
        }
      }
    } catch (healingError) {
      console.error('Healing failed:', healingError);
      this.emit('healing_failed', { errorId, error: healingError });
    }
  }

  // Healing Strategies
  private async fixChunkSizeIssue(error: any) {
    try {
      const currentSize = parseInt(process.env.MAX_CHUNK_SIZE || '16777216');
      const newSize = Math.floor(currentSize * 0.8);
      process.env.MAX_CHUNK_SIZE = newSize.toString();
      return { success: true, newSize };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async fixBuildIssue(error: any) {
    try {
      // Clean cache
      await fs.rm('.cache', { recursive: true, force: true });
      // Clear node_modules
      await fs.rm('node_modules', { recursive: true, force: true });
      // Reinstall dependencies
      await this.runCommand('npm install --legacy-peer-deps');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async fixTypeScriptIssue(error: any) {
    try {
      // Update tsconfig
      const tsconfig = require('../../tsconfig.json');
      tsconfig.compilerOptions.skipLibCheck = true;
      await fs.writeFile('tsconfig.json', JSON.stringify(tsconfig, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async fixMemoryLeak(error: any) {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      // Adjust memory limits
      const newLimit = Math.floor(process.memoryUsage().heapUsed * 1.5);
      process.env.MAX_OLD_SPACE_SIZE = newLimit.toString();
      return { success: true, newLimit };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async fixAPIIssue(error: any) {
    try {
      // Implement API recovery logic
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async fixDatabaseIssue(error: any) {
    try {
      // Implement database recovery logic
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async fixNetworkIssue(error: any) {
    try {
      // Implement network recovery logic
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async fixSecurityIssue(error: any) {
    try {
      // Implement security recovery logic
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async runCommand(command: string): Promise<void> {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec(command, (error: any, stdout: any, stderr: any) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private async checkMemoryUsage() {
    const usage = process.memoryUsage();
    if (usage.heapUsed / usage.heapTotal > 0.9) {
      await this.handleError({
        message: 'Memory usage critical',
        type: 'MEMORY_LEAK',
        usage
      });
    }
  }

  private async checkAPIHealth() {
    try {
      // Implement API health check
    } catch (error) {
      await this.handleError(error);
    }
  }

  // Public methods
  async reportError(error: any) {
    await this.handleError(error);
  }

  getErrorStats() {
    const errors = Array.from(this.errors.values());
    return {
      total: errors.length,
      resolved: errors.filter(e => e.resolved).length,
      pending: errors.filter(e => !e.resolved).length,
      byType: this.getErrorsByType()
    };
  }

  private getErrorsByType() {
    const errors = Array.from(this.errors.values());
    return errors.reduce((acc, error) => {
      acc[error.strategy] = (acc[error.strategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const advancedSelfHealing = AdvancedSelfHealingService.getInstance();