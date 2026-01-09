'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { services } from '@/lib/data';

export const ProposalForm = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get('name') || (e.target as any)[0].value, // Fallback for uncontrolled inputs if needed
            email: formData.get('email') || (e.target as any)[1].value,
            service: (e.target as any)[2].value, // Select input
            message: (e.target as any)[3].value, // Textarea
            type: 'proposal'
        };

        // Better way to get data from our specific form structure
        const form = e.target as HTMLFormElement;
        const nameInput = form.querySelector('input[type="text"]') as HTMLInputElement;
        const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
        const serviceSelect = form.querySelector('select') as HTMLSelectElement;
        const messageInput = form.querySelector('textarea') as HTMLTextAreaElement;

        try {
            const res = await fetch('/mail.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    email: emailInput.value,
                    service: serviceSelect.value,
                    message: messageInput.value,
                    type: 'proposal'
                }),
            });

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
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

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Name</label>
                        <input
                            required
                            type="text"
                            placeholder="John Doe"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email</label>
                        <input
                            required
                            type="email"
                            placeholder="john@company.com"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-700"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Service Interest</label>
                    <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                        {services.map((service) => (
                            <option key={service.id} value={service.title} className="bg-zinc-900 text-white">
                                {service.title}
                            </option>
                        ))}
                        <option value="Other" className="bg-zinc-900 text-white">Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Project Details</label>
                    <textarea
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
