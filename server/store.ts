import fs from 'fs-extra';
import path from 'path';
import { DATA_DIR, SERVERS_DIR, isoNow } from './config.js';
import type { Store } from './types.js';

const storePath = path.resolve(DATA_DIR, 'store.json');
let lock = Promise.resolve();
const empty:Store = { users:[], nodes:[], servers:[], settings:{panelName:'iHost',language:'ar'}, auditLogs:[] };

export async function initStore(){
  await fs.ensureDir(DATA_DIR); await fs.ensureDir(SERVERS_DIR);
  if(!(await fs.pathExists(storePath))) await fs.writeJson(storePath, empty, {spaces:2});
}
export async function readStore():Promise<Store>{ await initStore(); return fs.readJson(storePath); }
export async function writeStore(next:Store){
  const tmp = `${storePath}.tmp-${process.pid}`;
  await fs.writeJson(tmp,next,{spaces:2}); await fs.move(tmp,storePath,{overwrite:true});
}
export async function transact<T>(fn:(db:Store)=>Promise<T>|T):Promise<T>{
  const run = lock.then(async()=>{ const db=await readStore(); const result=await fn(db); await writeStore(db); return result; });
  lock=run.then(()=>undefined,()=>undefined); return run;
}
export function serverDir(id:string){ return path.join(path.resolve(SERVERS_DIR), id); }
export function addAudit(db:Store, actorId:string, action:string, targetId?:string, meta?:any){ db.auditLogs.unshift({id:cryptoRandom(),actorId,action,targetId,createdAt:isoNow(),meta}); db.auditLogs=db.auditLogs.slice(0,5000); }
function cryptoRandom(){ return `${Date.now()}-${Math.random().toString(36).slice(2,10)}`; }
