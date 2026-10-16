import axios from 'axios';
import { readStore, transact } from './store.js';
import type {NodeRecord,ServerRecord} from './types.js';
import { MAIN_NODE, isoNow } from './config.js';

export async function ensureMainNode(){
  await transact(db=>{ if(!db.nodes.some(n=>n.id===MAIN_NODE.id)){ db.nodes.push({...MAIN_NODE,createdAt:isoNow()}); } });
}
export function used(node:NodeRecord, servers:ServerRecord[]){
  const active=servers.filter(s=>s.nodeId===node.id && s.status!=='deleted');
  return {ramMB:active.reduce((a,s)=>a+s.ramMB,0),diskGB:active.reduce((a,s)=>a+s.diskGB,0),cpuPercent:active.reduce((a,s)=>a+s.cpuPercent,0),ports:new Set(active.map(s=>s.port))};
}
export function pickNode(nodes:NodeRecord[], servers:ServerRecord[], plan:any){
  return nodes.filter(n=>n.enabled).map(n=>({n,u:used(n,servers)})).filter(x=>x.u.ramMB+plan.ramMB<=x.n.ramMB && x.u.diskGB+plan.diskGB<=x.n.diskGB && x.u.cpuPercent+plan.cpuPercent<=x.n.cpuPercent).sort((a,b)=>(a.u.ramMB/a.n.ramMB)-(b.u.ramMB/b.n.ramMB))[0]?.n || null;
}
export function allocatePort(node:NodeRecord,servers:ServerRecord){
  const usedPorts=used(node,servers).ports;
  for(let p=node.portStart;p<=node.portEnd;p++) if(!usedPorts.has(p)) return p;
  throw new Error(`No free port on node ${node.name}`);
}
export async function agent(node:NodeRecord,path:string,body?:any){
  const url=node.agentUrl.replace(/\/$/,'')+path;
  const r=await axios({method:body?'POST':'GET',url,data:body,timeout:30000,headers:{'x-ihost-agent-secret':node.agentSecret}});
  return r.data;
}
