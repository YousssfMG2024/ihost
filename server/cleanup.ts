import { CLEANUP_AFTER_DAYS, isoNow } from './config.js';
import { readStore, transact } from './store.js';
import { remove } from './runtime.js';

const cutoff=()=>Date.now()-CLEANUP_AFTER_DAYS*86400000;
export async function runCleanup(){
  const db=await readStore(); const doomed=db.servers.filter(s=>s.status!=='deleted' && (new Date(s.lastKeepAliveAt).getTime()<cutoff() || (!!s.stoppedAt && new Date(s.stoppedAt).getTime()<cutoff())));
  for(const s of doomed){
    const node=db.nodes.find(n=>n.id===s.nodeId); if(node){ try{await remove(node,s);}catch(e){console.error('[cleanup]',s.id,e);} }
    await transact(d=>{ const i=d.servers.findIndex(x=>x.id===s.id); if(i>=0){d.servers.splice(i,1); d.auditLogs.unshift({id:`cleanup-${Date.now()}-${s.id}`,actorId:'system',action:'auto_delete_server',targetId:s.id,createdAt:isoNow()});} });
  }
  return doomed.length;
}
export function startCleanupLoop(){ setInterval(()=>runCleanup().catch(console.error),60*60*1000); runCleanup().catch(console.error); }
