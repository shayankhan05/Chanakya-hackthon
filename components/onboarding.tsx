'use client';
import {useRouter} from 'next/navigation';
import {ShieldCheck} from 'lucide-react';
import {blankProfile} from '@/lib/domain';
import ProfileForm from './profile-form';
export default function Onboarding(){const router=useRouter();return <main className="max-w-3xl mx-auto p-6 py-12"><a href="/" className="text-indigo-600 font-semibold flex gap-2 items-center"><ShieldCheck/>ComplianceCopilot</a><h1 className="text-3xl font-semibold mt-8">Let’s get to know your business</h1><p className="text-sm text-slate-500 leading-7 mt-3 mb-7">Four short steps create a private business profile. Choose Unknown whenever a condition needs professional review.</p><section className="panel p-6"><ProfileForm initial={blankProfile} submitLabel="Create my compliance workspace" onSave={async profile=>{const r=await fetch('/api/workspaces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(profile)});const d=await r.json();if(!r.ok)throw Error(d.error);router.push('/dashboard');router.refresh();}}/></section></main>}
