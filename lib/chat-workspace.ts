import type {Workspace} from './domain';
export type WorkspaceCheck={kind:'ready'|'changed';workspace:Workspace}|{kind:'sign-in'}|{kind:'onboarding'};
// Always resolve through the authenticated endpoint. Never trust an old tab's business ID.
export async function checkChatWorkspace(current:Workspace,request:typeof fetch=fetch):Promise<WorkspaceCheck>{
 if(current.demo)return {kind:'ready',workspace:current};
 const response=await request('/api/workspaces',{cache:'no-store'});
 if(response.status===401)return {kind:'sign-in'};
 const data=await response.json();if(!response.ok)throw Error(data.error||'Could not verify your current business.');
 const workspace=data.workspace as Workspace|null;
 if(!workspace)return {kind:'onboarding'};
 return {kind:workspace.id!==current.id||(workspace.conversationId||'legacy')!==(current.conversationId||'legacy')?'changed':'ready',workspace};
}
