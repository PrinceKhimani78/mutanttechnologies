'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setStatus('idle');
        setMessage('');

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.from('subscribers').insert([{ email }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    setStatus('success'); // Treat duplicate as success to not leak info
                    setMessage("You're already subscribed!");
                } else {
                    throw error;
                }
            } else {
                setStatus('success');
                setMessage("Thanks for subscribing! You're on the list.");

                const { trackEvent } = await import('@/lib/gtm');
                trackEvent('sign_up', { method: "footer_newsletter" });

                setEmail('');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-primary/5 dark:bg-zinc-900 rounded-2xl p-8 md:p-12 my-16 border border-primary/10 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 text-primary">
                    <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-oswald font-bold uppercase mb-4">
                    Join the Mutation
                </h3>
                <p className="text-gray-600 dark:text-zinc-400 mb-8 font-light">
                    Get the latest insights on digital innovation delivered straight to your inbox. No spam, ever.
                </p>

                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-500 animate-in fade-in duration-300">
                        <CheckCircle className="w-12 h-12 mb-4" />
                        <p className="font-bold text-lg">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4">
                        <input
                            suppressHydrationWarning
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-6 py-4 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-primary text-white font-bold uppercase tracking-wider rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
                        </button>
                    </form>
                )}

                {status === 'error' && (
                    <p className="mt-4 text-red-500 text-sm">{message}</p>
                )}
            </div>
        </div>
    );
}
