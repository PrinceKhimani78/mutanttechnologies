'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Button } from './ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Contact = () => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const res = await fetch('/mail.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    service: formData.get('subject'), // Map subject to service/title
                    message: formData.get('message'),
                    type: 'contact'
                }),
            });
            if (res.ok) setStatus('success');
            else setStatus('error');
        } catch (e) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    useGSAP(() => {
        gsap.from(".contact-item", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
            },
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out"
        });
    }, { scope: containerRef });

    return (
        <section id="contact" ref={containerRef} className="py-24 bg-dark-slate text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    <div className="space-y-8">
                        <h2 className="contact-item text-4xl md:text-5xl font-bold">
                            Let's Start a <span className="text-primary">Conversation</span>
                        </h2>
                        <p className="contact-item text-gray-400 text-lg">
                            Ready to transform your digital presence? Reach out to us for a free consultation.
                        </p>

                        <div className="space-y-6 pt-4">
                            <div className="contact-item flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Call Center</h4>
                                    <p className="text-gray-400">(+91) 7016228551</p>
                                </div>
                            </div>

                            <div className="contact-item flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Email Address</h4>
                                    <p className="text-gray-400">contact@mutanttechnologies.com</p>
                                </div>
                            </div>

                            <div className="contact-item flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Office Location</h4>
                                    <p className="text-gray-400">B-113 RK iconic Sheetal Park, Rajkot, Gujarat</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-item bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                <p className="text-gray-400">We'll get back to you shortly.</p>
                                <Button variant="link" className="text-primary mt-4" onClick={() => setStatus('idle')}>Send Another</Button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                            <input required name="name" type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                            <input required name="email" type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="john@example.com" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                        <input required name="subject" type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Project Inquiry" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                        <textarea required name="message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Tell us about your project..." />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                        {loading ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};
