/** Business data must never fall back to a serverless filesystem. */
export function usesPostgres(env:Record<string,string|undefined>=process.env){
 const postgres=!!env.DATABASE_URL?.trim()&&env.STORAGE_DRIVER!=='sqlite';
 if(env.VERCEL==='1'&&(!postgres||env.STORAGE_DRIVER!=='postgres'))throw Error('Vercel requires STORAGE_DRIVER=postgres and a persistent DATABASE_URL. Local business storage is disabled.');
 return postgres;
}
