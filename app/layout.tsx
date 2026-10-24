import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'TeleLite | Care beyond connectivity',description:'Low-bandwidth telemedicine platform',manifest:'/manifest.json',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
