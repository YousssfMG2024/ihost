import 'dotenv/config';
import crypto from 'crypto';

const required = (key: string, fallback?: string) => {
  const v = process.env[key] ?? fallback;
  if (!v) throw new Error(`Missing environment variable: ${key}`);
  return v;
};

export const isProduction = process.env.NODE_ENV === 'production';
export const PORT = Number(process.env.PORT || 6767);
export const JWT_SECRET = required('JWT_SECRET', isProduction ? undefined : 'ihost-dev-secret-change-me');
export const CLEANUP_AFTER_DAYS = Number(process.env.CLEANUP_AFTER_DAYS || 5);
export const PORT_RANGE_START = Number(process.env.PORT_RANGE_START || 25565);
export const PORT_RANGE_END = Number(process.env.PORT_RANGE_END || 26565);
export const DATA_DIR = process.env.DATA_DIR || './.data';
export const SERVERS_DIR = `${DATA_DIR}/servers`;
export const OWNER_USERNAME = process.env.OWNER_USERNAME || '';
export const OWNER_PASSWORD = process.env.OWNER_PASSWORD || '';
export const MAIN_NODE_ID = process.env.MAIN_NODE_ID || 'main';
export const MAIN_NODE = {
  id: MAIN_NODE_ID,
  name: process.env.MAIN_NODE_NAME || 'iHost Main Node',
  address: process.env.MAIN_NODE_ADDRESS || '127.0.0.1',
  agentUrl: process.env.MAIN_NODE_AGENT_URL || 'http://127.0.0.1:8787',
  agentSecret: process.env.MAIN_NODE_AGENT_SECRET || '',
  ramMB: Number(process.env.MAIN_NODE_RAM_MB || 8192),
  diskGB: Number(process.env.MAIN_NODE_DISK_GB || 100),
  cpuPercent: Number(process.env.MAIN_NODE_CPU_PERCENT || 400),
  portStart: PORT_RANGE_START,
  portEnd: PORT_RANGE_END,
  enabled: true,
};

export const now = () => new Date();
export const isoNow = () => new Date().toISOString();
export const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
