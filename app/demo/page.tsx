import Dashboard from '@/components/dashboard';
import {demoWorkspace} from '@/lib/workspace';
export const dynamic='force-dynamic';
export default function Demo(){return <Dashboard initialWorkspace={demoWorkspace('judge')}/>}
