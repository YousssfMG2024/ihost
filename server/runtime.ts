import Docker from 'dockerode';
import fs from 'fs-extra';
import path from 'path';
import { serverDir } from './store.js';
import type {NodeRecord,ServerRecord} from './types.js';
import {agent} from './nodes.js';

const docker=new Docker({socketPath:process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock'});
function imageFor(s:ServerRecord){ if(s.kind==='discord') return s.image || 'node:22-alpine'; return s.image || 'itzg/minecraft-server:java21'; }
function envFor(s:ServerRecord){
  if(s.kind==='discord') return [`PORT=${s.port}`,'NODE_ENV=production'];
  return [`EULA=TRUE`,`TYPE=PAPER`,`VERSION=${s.version||'LATEST'}`,`MEMORY=${Math.floor(s.ramMB/1024)}G`,`SERVER_PORT=${s.port}`];
}
async function localCreate(s:ServerRecord){
  const dir=serverDir(s.id); await fs.ensureDir(dir);
  const c=await docker.createContainer({name:`ihost-${s.id}`,Image:imageFor(s),Tty:true,OpenStdin:true,Env:envFor(s),WorkingDir:s.kind==='discord'?'/app':'/data',ExposedPorts:{[`${s.port}/tcp`]:{}},HostConfig:{Binds:[`${dir}:${s.kind==='discord'?'/app':'/data'}`],PortBindings:{[`${s.port}/tcp`]:[{HostPort:String(s.port)}]},Memory:s.ramMB*1024*1024,NanoCpus:Math.round(s.cpuPercent*1e7)}});
  return c.id;
}
async function localStart(id:string){ await docker.getContainer(id).start(); }
async function localStop(id:string){ await docker.getContainer(id).stop().catch(()=>{}); }
async function localDelete(id:string){ await docker.getContainer(id).remove({force:true}).catch(()=>{}); }
async function localStatus(id:string){ try{return await docker.getContainer(id).inspect();}catch{return null;} }
async function localLogs(id:string){ try{const b=await docker.getContainer(id).logs({stdout:true,stderr:true,tail:200}); return b.toString();}catch{return '';} }
async function localCommand(id:string,cmd:string){ const c=docker.getContainer(id); const ex=await c.exec({Cmd:['/bin/sh','-lc',cmd],AttachStdout:true,AttachStderr:true}); const st=await ex.start({}); return new Promise<string>(resolve=>{let out=''; st.on('data',(d:any)=>out+=d.toString()); st.on('end',()=>resolve(out));}); }
export async function create(node:NodeRecord,s:ServerRecord){ return node.id==='main'?localCreate(s):agent(node,'/v1/servers/create',s); }
export async function start(node:NodeRecord,s:ServerRecord){ if(node.id==='main') return localStart(s.containerId!); return agent(node,`/v1/servers/${s.id}/start`,{}); }
export async function stop(node:NodeRecord,s:ServerRecord){ if(node.id==='main') return localStop(s.containerId!); return agent(node,`/v1/servers/${s.id}/stop`,{}); }
export async function restart(node:NodeRecord,s:ServerRecord){ if(node.id==='main'){await localStop(s.containerId!); await localStart(s.containerId!); return;} return agent(node,`/v1/servers/${s.id}/restart`,{}); }
export async function remove(node:NodeRecord,s:ServerRecord){ if(node.id==='main') return localDelete(s.containerId!); return agent(node,`/v1/servers/${s.id}/delete`,{}); }
export async function status(node:NodeRecord,s:ServerRecord){ if(node.id==='main') return localStatus(s.containerId!); return agent(node,`/v1/servers/${s.id}/status`); }
export async function logs(node:NodeRecord,s:ServerRecord){ if(node.id==='main') return localLogs(s.containerId!); const r=await agent(node,`/v1/servers/${s.id}/logs`); return r.logs||''; }
export async function command(node:NodeRecord,s:ServerRecord,cmd:string){ if(node.id==='main') return localCommand(s.containerId!,cmd); return agent(node,`/v1/servers/${s.id}/command`,{command:cmd}); }
