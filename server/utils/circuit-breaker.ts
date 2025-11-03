/**
 * Circuit Breaker Pattern Implementation
 * Provides fault tolerance and graceful degradation for external service calls
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitor?: boolean;
  onStateChange?: (state: CircuitState) => void;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private nextAttempt: number = Date.now();
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttempt) {
        this.setState(CircuitState.HALF_OPEN);
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state !== CircuitState.CLOSED) {
      this.setState(CircuitState.CLOSED);
    }
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.config.failureThreshold) {
      this.setState(CircuitState.OPEN);
      this.nextAttempt = Date.now() + this.config.resetTimeout;
    }
  }

  private setState(state: CircuitState): void {
    this.state = state;
    if (this.config.monitor) {
      this.config.onStateChange?.(state);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}