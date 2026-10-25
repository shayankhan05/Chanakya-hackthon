import {z} from 'zod';
export const password=z.string().min(12,'Use at least 12 characters.').max(128).regex(/[A-Za-z]/,'Include a letter.').regex(/[0-9]/,'Include a number.');
export const signupSchema=z.object({name:z.string().trim().min(2).max(100),email:z.email().max(254).transform(s=>s.trim().toLowerCase()),password,confirmPassword:z.string()}).refine(d=>d.password===d.confirmPassword,{message:'Passwords do not match.',path:['confirmPassword']});
