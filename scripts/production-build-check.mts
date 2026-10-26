// Local builds never inspect or migrate the owner's SQLite database.
if(process.env.VERCEL==='1')await import('./production-readiness.mts');
else console.log('Local build: production database gate not run.');
