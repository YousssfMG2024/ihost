import type { PlanTier, ServerKind } from './types.js';
export const PLANS = {
  discord: { free:{cpuPercent:50,ramMB:2048,diskGB:5}, plus:{cpuPercent:75,ramMB:4096,diskGB:13} },
  minecraft: { free:{cpuPercent:100,ramMB:3072,diskGB:10}, plus:{cpuPercent:200,ramMB:6144,diskGB:15} }
} as const;
export function getPlan(kind:ServerKind,tier:PlanTier){ return PLANS[kind][tier]; }
