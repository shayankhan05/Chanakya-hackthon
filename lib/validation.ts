import {z} from 'zod';
export const profileSchema=z.object({name:z.string().trim().min(1).max(120),industry:z.string().min(1).max(120),state:z.string().min(1).max(120),employees:z.number().int().min(0).max(1000000),turnover:z.number().min(0).max(1e14),gst:z.boolean(),branches:z.number().int().min(1).max(10000),firstExport:z.boolean(),registrations:z.array(z.string().max(100)).max(50)});
