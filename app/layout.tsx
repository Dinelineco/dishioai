import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
    title: 'Dishio AI — Your Restaurant’s AI Growth Engine',
    description: 'AI-powered growth engine for modern restaurant marketing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-[#050505] antialiased">
                <AppProvider>{children}</AppProvider>
            </body>
        </html>
    );
}
