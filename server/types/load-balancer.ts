export interface LoadBalancerConfig {
  algorithm: "ai_optimized";
  healthCheckInterval: number;
  failureThreshold: number;
  recoveryThreshold: number;
  sessionAffinity: boolean;
  stickySession: boolean;
  autoScaling: boolean;
  maxNodes: number;
  minNodes: number;
  fastFailover: boolean;
  aggressiveHealing: boolean;
  gracefulDegradation: boolean;
  loadBalancingTimeout: number;
}