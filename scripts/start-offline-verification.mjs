import {spawn} from 'node:child_process';
// Process-only override for verification. No credential file is edited or copied.
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3001'],{stdio:'inherit',windowsHide:true,env:{...process.env,GEMINI_API_KEY:'',OPENROUTER_API_KEY:'',NODE_ENV:'production'}});
child.on('exit',code=>process.exit(code??1));
