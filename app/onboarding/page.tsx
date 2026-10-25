import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {authOptions} from '@/lib/auth';
import {ownWorkspace} from '@/lib/repository';
import Onboarding from '@/components/onboarding';
export default async function Page(){const s=await getServerSession(authOptions);if(!s?.user?.id)redirect('/login');if(await ownWorkspace(s.user.id))redirect('/dashboard');return <Onboarding/>}
