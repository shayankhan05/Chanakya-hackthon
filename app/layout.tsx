import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'SME Compliance Copilot',description:'Your business. Compliant, confident, and in control.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
