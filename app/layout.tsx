import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Book a test | Vandlovu Group', description: 'Request an LDV or HMV brake or lux test with Vandlovu Group. Choose your test, date and submit your booking for approval.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en-ZA"><body>{children}</body></html>; }
