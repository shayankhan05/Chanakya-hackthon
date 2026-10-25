import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64) as Buffer;return `scrypt:${salt}:${key.toString('hex')}`;}
export async function verifyPassword(password:string,stored:string){const [kind,salt,hex]=stored.split(':');if(kind!=='scrypt'||!salt||!hex||hex.length!==128)return false;const key=await scrypt(password,salt,64) as Buffer;return timingSafeEqual(key,Buffer.from(hex,'hex'));}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
