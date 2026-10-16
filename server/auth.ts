import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type {Request,Response,NextFunction} from 'express';
import { JWT_SECRET } from './config.js';
import { readStore } from './store.js';
import type {Role} from './types.js';

export async function hashPassword(p:string){ return bcrypt.hash(p,12); }
export async function verifyPassword(p:string,h:string){ return bcrypt.compare(p,h); }
export function signToken(u:any){ return jwt.sign({id:u.id,username:u.username,role:u.role,planTier:u.planTier,passwordVersion:u.passwordVersion},JWT_SECRET,{expiresIn:'7d'}); }
export async function auth(req:Request,res:Response,next:NextFunction){
  try{
    const h=req.headers.authorization; if(!h?.startsWith('Bearer ')) return res.status(401).json({error:'Unauthorized'});
    const payload:any=jwt.verify(h.slice(7),JWT_SECRET); const db=await readStore(); const u=db.users.find(x=>x.id===payload.id);
    if(!u || u.passwordVersion!==payload.passwordVersion) return res.status(401).json({error:'Session expired'});
    (req as any).user=u; next();
  }catch{ return res.status(401).json({error:'Invalid session'}); }
}
export function roleAtLeast(role:Role, wanted:'admin'|'owner'){ if(wanted==='owner') return role==='owner'; return role==='owner'||role==='admin'; }
export function requireAdmin(req:Request,res:Response,next:NextFunction){ const u=(req as any).user; if(!u||!roleAtLeast(u.role,'admin')) return res.status(403).json({error:'Admin access required'}); next(); }
export function requireOwner(req:Request,res:Response,next:NextFunction){ const u=(req as any).user; if(!u||u.role!=='owner') return res.status(403).json({error:'Owner access required'}); next(); }
