import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mutant Technologies | GHL Automation Experts',
    description: 'Scale your agency with expert GoHighLevel setup, snapshots, and automation workflows.',
};

export default function GHLLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#704df4] selection:text-white">
            {/* Simplified Header - Logo Only */}
            <header className="absolute top-0 left-0 right-0 z-50 py-6 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <a href="/" className="text-2xl font-bold tracking-tighter">
                        MUTANT<span className="text-[#704df4]">.</span>
                    </a>
                    <a
                        href="#book-call"
                        className="hidden md:block bg-white/10 hover:bg-white/20 backdrop-blur-sm text-sm font-medium py-2 px-4 rounded-full border border-white/10 transition-all"
                    >
                        Book Strategy Call
                    </a>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10">
                {children}
            </main>

            {/* Simplified Footer */}
            <footer className="border-t border-white/10 bg-black py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Mutant Technologies. All rights reserved.</p>
                    <div className="mt-4 space-x-4">
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
