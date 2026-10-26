'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function WhatsAppButton() {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    // Don't show the WhatsApp floating button on internal admin or analytics dashboard routes
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/pixel')) {
        return null;
    }

    const phoneNumber = '919879846695'; // +91 9879846695
    const message = encodeURIComponent('Hello Mutant Technologies, I would like to inquire about your services.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <aside
            aria-label="Contact options"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none"
        >
            {/* Tooltip / Prompt Label */}
            <div
                className={`hidden sm:flex items-center bg-zinc-900/90 dark:bg-zinc-800/90 backdrop-blur-md text-white text-xs font-medium px-3.5 py-2 rounded-full border border-zinc-700/60 shadow-xl transition-all duration-300 pointer-events-none ${
                    isHovered
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-2'
                }`}
            >
                <span>Chat with us on WhatsApp</span>
            </div>

            {/* WhatsApp Floating Button */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Mutant Technologies on WhatsApp (+91 9879846695)"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
            >
                {/* Subtle attention-grabbing pulse ring */}
                <span
                    className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping group-hover:opacity-0 pointer-events-none"
                    aria-hidden="true"
                />

                {/* WhatsApp SVG Icon */}
                <svg
                    className="w-7 h-7 fill-current relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.004.577 1.764.793 2.806.793 3.18 0 5.767-2.586 5.767-5.766.001-3.182-2.585-5.766-5.767-5.766zm9.969 5.766c0 5.505-4.479 9.984-9.969 9.984-1.756 0-3.401-.458-4.832-1.258l-5.199 1.364 1.391-5.074c-.876-1.491-1.379-3.23-1.379-5.016 0-5.505 4.479-9.984 9.988-9.984 5.522 0 10.019 4.479 10.019 9.984z" />
                </svg>
            </a>
        </aside>
    );
}
