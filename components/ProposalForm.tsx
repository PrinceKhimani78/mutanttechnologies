'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';

/**
 * ProposalForm Component
 * 
 * Handles client project requests. 
 * Fetches available services dynamically from Supabase to populate the dropdown.
 */
export const ProposalForm = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [services, setServices] = useState<Service[]>([]);

    // Fetch services on mount for the dropdown
    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase.from('services').select('id, title');
            if (data) setServices(data as Service[]);
        };
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target as HTMLFormElement;
        const nameInput = form.querySelector('input[type="text"]') as HTMLInputElement;
        const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
        const serviceSelect = form.querySelector('select') as HTMLSelectElement;
        const messageInput = form.querySelector('textarea') as HTMLTextAreaElement;

        try {
            // Send data to PHP mailer handler
            const { sendEmail } = await import('@/app/actions/email');
            const result = await sendEmail({
                name: nameInput.value,
                email: emailInput.value,
                service: serviceSelect.value,
                message: messageInput.value,
                type: 'proposal'
            });

            if (result.success) {
                setStatus('success');

                // Track Google Tag Manager Event
                const { trackEvent } = await import('@/lib/gtm');
                trackEvent('generate_lead', {
                    form_id: "proposal_form",
                    service_interest: serviceSelect.value
                });
            } else {
                console.error("Proposal form error:", result.error);
                setStatus('error');
            }
        } catch (err) {
            console.error("Form submission error:", err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="w-full max-w-lg mx-auto p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-oswald font-bold text-white mb-2">Request Received!</h3>
                <p className="text-zinc-400">We'll get back to you within 24 hours with a custom proposal.</p>
                <Button
                    variant="outline"
                    className="mt-6 border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={() => setStatus('idle')}
                >
                    Send Another Request
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto bg-zinc-950 p-8 md:p-10 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <h3 className="text-3xl font-oswald font-bold uppercase mb-2 text-white">Let's Build It</h3>
            <p className="text-zinc-400 mb-8">Tell us about your project and we'll craft the perfect solution.</p>

            <form id="proposal-form" onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2" suppressHydrationWarning>
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Name</label>
                        <input
                            suppressHydrationWarning
                            required
                            type="text"
                            placeholder="John Doe"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-700"
                        />
                    </div>
                    <div className="space-y-2" suppressHydrationWarning>
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email</label>
                        <input
                            suppressHydrationWarning
                            required
                            type="email"
                            placeholder="john@company.com"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-700"
                        />
                    </div>
                </div>

                <div className="space-y-2" suppressHydrationWarning>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Service Interest</label>
                    <select suppressHydrationWarning className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                        {services.map((service) => (
                            <option key={service.id} value={service.title} className="bg-zinc-900 text-white">
                                {service.title}
                            </option>
                        ))}
                        <option value="Other" className="bg-zinc-900 text-white">Other</option>
                    </select>
                </div>

                <div className="space-y-2" suppressHydrationWarning>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Project Details</label>
                    <textarea
                        suppressHydrationWarning
                        required
                        rows={4}
                        placeholder="Tell us about your goals, budget, and timeline..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-700 resize-none"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-lg font-bold uppercase tracking-wide rounded-xl bg-white text-black hover:bg-zinc-200 transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...
                        </>
                    ) : (
                        "Send Request"
                    )}
                </Button>
            </form>
        </div>
    );
};
