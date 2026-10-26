import type {NextConfig} from 'next';
const config:NextConfig={poweredByHeader:false,serverExternalPackages:['unpdf'],outputFileTracingIncludes:{'/api/financial-records':['./lib/financial/pdf-worker.mjs','./node_modules/unpdf/**/*']},async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]}]}};
export default config;
