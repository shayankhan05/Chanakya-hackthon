import type {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import {accountById,createAccount,findAccount,rateLimit} from './repository';
import {verifyPassword} from './passwords';
export const authOptions:NextAuthOptions={
 providers:[CredentialsProvider({name:'Email and password',credentials:{email:{label:'Email',type:'email'},password:{label:'Password',type:'password'}},async authorize(credentials){const email=credentials?.email?.trim().toLowerCase();if(!email||!credentials?.password||credentials.password.length>128)return null;await rateLimit('login:'+email,15);const user=await findAccount(email);if(!user?.passwordHash||!await verifyPassword(credentials.password,user.passwordHash))return null;return {id:user.id,email:user.email,name:user.name};}}),...(process.env.GITHUB_ID&&process.env.GITHUB_SECRET?[GitHubProvider({clientId:process.env.GITHUB_ID,clientSecret:process.env.GITHUB_SECRET})]:[])],
 session:{strategy:'jwt',maxAge:60*60*24*7},secret:process.env.NEXTAUTH_SECRET,
 pages:{signIn:'/login'},callbacks:{async jwt({token,user,account}){if(user){let stored=await findAccount(user.email!.toLowerCase());if(account?.provider==='github'&&!stored)stored=await createAccount(user.email!.toLowerCase(),user.name||'Business owner',null);if(!stored)return token;token.sub=stored.id;token.authVersion=stored.authVersion;token.name=stored.name;}return token;},async session({session,token}){if(session.user&&token.sub){const account=await accountById(token.sub);if(!account||account.authVersion!==token.authVersion)return {...session,user:undefined};session.user={...session.user,name:account.name,email:account.email,id:account.id};}return session;}}
};
