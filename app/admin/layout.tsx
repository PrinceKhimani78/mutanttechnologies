'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/adminEmails';
import { Loader2 } from 'lucide-react';

/**
 * Guards every /admin/* route. Most individual admin pages had their own
 * (inconsistent, easy-to-forget) auth check - several had none at all, so
 * e.g. /admin/seo or /admin/services/create rendered with no login required.
 * This applies the same check once, here, so nothing new under /admin can
 * ship unprotected by accident.
 *
 * /admin itself is the login page and is intentionally left unguarded -
 * it has its own already-logged-in redirect.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === '/admin';
    const [authorized, setAuthorized] = useState(isLoginPage);

    useEffect(() => {
        if (isLoginPage) {
            setAuthorized(true);
            return;
        }

        let active = true;

        const evaluate = (email: string | null | undefined) => {
            if (!active) return;
            if (email && ADMIN_EMAILS.includes(email)) {
                setAuthorized(true);
            } else if (email) {
                // Logged in, but not an admin (e.g. a /pixel client account) - send them there instead.
                router.replace('/pixel/dashboard');
            } else {
                router.replace(`/admin?redirect=${encodeURIComponent(pathname)}`);
            }
        };

        setAuthorized(false); // re-check on every path change instead of trusting a previous page's result
        supabase.auth.getSession().then(({ data: { session } }) => evaluate(session?.user?.email));

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            evaluate(session?.user?.email);
        });

        return () => {
            active = false;
            sub.subscription.unsubscribe();
        };
    }, [pathname, isLoginPage, router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
