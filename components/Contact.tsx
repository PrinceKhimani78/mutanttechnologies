'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Button } from './ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Contact = () => {
    const containerRef = useRef(null);

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
        <section ref={containerRef} className="py-24 bg-dark-slate text-white relative overflow-hidden">
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
                        <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="john@example.com" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Project Inquiry" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Tell us about your project..." />
                            </div>

                            <Button type="submit" size="lg" className="w-full">Send Message</Button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
};
