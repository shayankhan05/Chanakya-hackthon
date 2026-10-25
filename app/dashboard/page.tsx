import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {ownWorkspace,refreshWorkspace} from '@/lib/repository';
import Dashboard from '@/components/dashboard';
export const dynamic='force-dynamic';
export default async function Page(){const session=await getServerSession(authOptions);if(!session?.user?.id)redirect('/login');const w=await ownWorkspace(session.user.id);if(!w)redirect('/onboarding');return <Dashboard initialWorkspace={{...await refreshWorkspace(session.user.id,w.id),ownerName:session.user.name||w.ownerName}}/>}

