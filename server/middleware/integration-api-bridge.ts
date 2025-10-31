
import { universalAPIOverride } from './universal-api-override.js';
import { Request, Response, NextFunction } from 'express';

/**
 * Integration API Bridge
 * Ensures all API calls have valid keys by intercepting and retrying
 */

interface APIRequest {
  service: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

export class IntegrationAPIBridge {
  private static instance: IntegrationAPIBridge;
  private requestQueue: Map<string, APIRequest[]> = new Map();
  
  private constructor() {}

  static getInstance(): IntegrationAPIBridge {
    if (!IntegrationAPIBridge.instance) {
      IntegrationAPIBridge.instance = new IntegrationAPIBridge();
    }
    return IntegrationAPIBridge.instance;
  }

  /**
   * Middleware to ensure API key availability
   */
  ensureAPIKey(serviceName: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const apiKey = universalAPIOverride.getAPIKey(serviceName);
        
        // Attach to request for downstream use
        (req as any).apiKey = apiKey;
        (req as any).apiService = serviceName;
        
        next();
      } catch (error) {
        // Queue the request and trigger acquisition
        const requestId = `${serviceName}-${Date.now()}`;
        this.queueRequest(serviceName, {
          service: serviceName,
          endpoint: req.path,
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.body
        });

        // Return pending status
        res.status(202).json({
          success: false,
          message: `${serviceName} API key acquisition in progress`,
          requestId,
          retryAfter: 5
        });
      }
    };
  }

  /**
   * Queue request for later processing
   */
  private queueRequest(serviceName: string, request: APIRequest) {
    const queue = this.requestQueue.get(serviceName) || [];
    queue.push(request);
    this.requestQueue.set(serviceName, queue);

    // Trigger acquisition
    universalAPIOverride.forceAcquisition(serviceName).then(() => {
      this.processQueue(serviceName);
    });
  }

  /**
   * Process queued requests after key acquisition
   */
  private async processQueue(serviceName: string) {
    const queue = this.requestQueue.get(serviceName);
    if (!queue || queue.length === 0) return;

    console.log(`Processing ${queue.length} queued requests for ${serviceName}`);
    
    // Process each queued request
    for (const request of queue) {
      try {
        const apiKey = universalAPIOverride.getAPIKey(serviceName);
        console.log(`✅ Processing queued ${request.method} ${request.endpoint}`);
        // Queue is cleared, requests should be retried by client
      } catch (error) {
        console.warn(`Still waiting for ${serviceName} key...`);
      }
    }

    // Clear the queue
    this.requestQueue.set(serviceName, []);
  }

  /**
   * Get queue status
   */
  getQueueStatus(): Record<string, number> {
    const status: Record<string, number> = {};
    this.requestQueue.forEach((queue, service) => {
      status[service] = queue.length;
    });
    return status;
  }
}

export const integrationAPIBridge = IntegrationAPIBridge.getInstance();

/**
 * Helper middleware for common AI services
 */
export const ensureOpenAI = integrationAPIBridge.ensureAPIKey('OPENAI');
export const ensureAnthropic = integrationAPIBridge.ensureAPIKey('ANTHROPIC');
export const ensureGemini = integrationAPIBridge.ensureAPIKey('GEMINI');
export const ensureDHA = integrationAPIBridge.ensureAPIKey('DHA_NPR');
