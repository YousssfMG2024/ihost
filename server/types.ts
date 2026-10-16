export type Role = 'owner' | 'admin' | 'user';
export type PlanTier = 'free' | 'plus';
export type ServerKind = 'minecraft' | 'discord';
export type ServerStatus = 'installing' | 'offline' | 'online' | 'error' | 'deleted';

export interface User { id:string; username:string; passwordHash:string; role:Role; planTier:PlanTier; passwordVersion:number; createdAt:string; }
export interface NodeRecord { id:string; name:string; address:string; agentUrl:string; agentSecret:string; ramMB:number; diskGB:number; cpuPercent:number; portStart:number; portEnd:number; enabled:boolean; createdAt:string; }
export interface ServerRecord {
  id:string; name:string; ownerUserId:string; kind:ServerKind; planTier:PlanTier;
  ramMB:number; diskGB:number; cpuPercent:number; nodeId:string; port:number; address:string;
  version:string; image?:string; containerId?:string|null; status:ServerStatus; createdAt:string;
  lastActivityAt:string; lastKeepAliveAt:string; stoppedAt?:string|null; keepAliveUntil:string;
  startupCommand?:string; error?:string|null;
}
export interface Store { users:User[]; nodes:NodeRecord[]; servers:ServerRecord[]; settings:{panelName:string; language:'ar'|'en'}; auditLogs:{id:string;actorId:string;action:string;targetId?:string;createdAt:string;meta?:any}[]; }
