import 'dotenv/config';
import express from 'express';
import Docker from 'dockerode';
import fs from 'fs-extra';
import path from 'path';

const app=express();app.use(express.json({limit:'2mb'}));
const PORT=Number(process.env.AGENT_PORT||8787),SECRET=process.env.AGENT_SECRET||'',ROOT=path.resolve(process.env.NODE_DATA_DIR||'/opt/ihost-node/servers');
const docker=new Docker({socketPath:process.env.DOCKER_SOCKET_PATH||'/var/run/docker.sock'});app.use((req,res,next)=>{if(req.path==='/v1/health')return next();if(!SECRET||req.headers['x-ihost-agent-secret']!==SECRET)return res.status(401).json({error:'Unauthorized'});next();});
function image(s:any){return s.kind==='discord'?(s.image||'node:22-alpine'):(s.image||'itzg/minecraft-server:java21');}
function env(s:any){return s.kind==='discord'?[`PORT=${s.port}`,'NODE_ENV=production']:[`EULA=TRUE`,`TYPE=PAPER`,`VERSION=${s.version||'LATEST'}`,`MEMORY=${Math.floor(s.ramMB/1024)}G`,`SERVER_PORT=${s.port}`];}
async function ensure(s:any){const dir=path.join(ROOT,s.id);await fs.ensureDir(dir);try{await docker.getContainer(`ihost-${s.id}`).inspect();return docker.getContainer(`ihost-${s.id}`);}catch{}const c=await docker.createContainer({name:`ihost-${s.id}`,Image:image(s),Tty:true,OpenStdin:true,Env:env(s),WorkingDir:s.kind==='discord'?'/app':'/data',ExposedPorts:{[`${s.port}/tcp`]:{}},HostConfig:{Binds:[`${dir}:${s.kind==='discord'?'/app':'/data'}`],PortBindings:{[`${s.port}/tcp`]:[{HostPort:String(s.port)}]},Memory:Number(s.ramMB)*1024*1024,NanoCpus:Math.round(Number(s.cpuPercent)*1e7),RestartPolicy:{Name:'unless-stopped'}}});return c;}
app.get('/v1/health',async(_,res)=>{try{await docker.ping();res.json({ok:true,nodeId:process.env.NODE_ID||'unknown',name:process.env.NODE_NAME||'iHost Node'});}catch(e:any){res.status(503).json({ok:false,error:e.message});}});
app.post('/v1/servers/create',async(req,res)=>{try{const c=await ensure(req.body);res.json({containerId:c.id});}catch(e:any){res.status(500).json({error:e.message});}});
app.post('/v1/servers/:id/start',async(req,res)=>{try{await docker.getContainer(`ihost-${req.params.id}`).start();res.json({success:true});}catch(e:any){res.status(500).json({error:e.message});}});
app.post('/v1/servers/:id/stop',async(req,res)=>{try{await docker.getContainer(`ihost-${req.params.id}`).stop().catch(()=>{});res.json({success:true});}catch(e:any){res.status(500).json({error:e.message});}});
app.post('/v1/servers/:id/restart',async(req,res)=>{try{await docker.getContainer(`ihost-${req.params.id}`).restart();res.json({success:true});}catch(e:any){res.status(500).json({error:e.message});}});
app.post('/v1/servers/:id/delete',async(req,res)=>{try{await docker.getContainer(`ihost-${req.params.id}`).remove({force:true}).catch(()=>{});await fs.remove(path.join(ROOT,req.params.id));res.json({success:true});}catch(e:any){res.status(500).json({error:e.message});}});
app.get('/v1/servers/:id/status',async(req,res)=>{try{res.json(await docker.getContainer(`ihost-${req.params.id}`).inspect());}catch(e:any){res.status(404).json({error:'Not found'});}});
app.get('/v1/servers/:id/logs',async(req,res)=>{try{const b=await docker.getContainer(`ihost-${req.params.id}`).logs({stdout:true,stderr:true,tail:200});res.json({logs:b.toString()});}catch(e:any){res.status(404).json({error:'Not found'});}});
app.post('/v1/servers/:id/command',async(req,res)=>{try{const c=docker.getContainer(`ihost-${req.params.id}`),ex=await c.exec({Cmd:['/bin/sh','-lc',String(req.body.command||'')],AttachStdout:true,AttachStderr:true});const st=await ex.start({});let out='';st.on('data',(d:any)=>out+=d.toString());st.on('end',()=>res.json({output:out}));}catch(e:any){res.status(500).json({error:e.message});}});
app.listen(PORT,'0.0.0.0',()=>console.log(`iHost node agent listening on ${PORT}`));
