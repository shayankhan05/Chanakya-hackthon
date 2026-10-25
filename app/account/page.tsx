import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {authOptions} from '@/lib/auth';
import AccountSettings from '@/components/account-settings';
export default async function Page(){const s=await getServerSession(authOptions);if(!s?.user)redirect('/login');return <AccountSettings name={s.user.name||''} email={s.user.email||''}/>}
