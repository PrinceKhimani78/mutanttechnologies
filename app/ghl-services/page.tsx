import FunnelHero from '@/components/ghl-funnel/FunnelHero';
import ValueStack from '@/components/ghl-funnel/ValueStack';
import GHLBlogGrid from '@/components/ghl-funnel/GHLBlogGrid'; // Assuming this component is created
import { CheckCircle2, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';

export default function GHLServicesPage() {
    return (
        <div className="min-h-screen bg-black">

            {/* 1. HERO SECTION (High Energy) */}
            <FunnelHero />

            {/* 2. LOGIC / FEATURES SECTION */}
            <section id="how-it-works" className="py-24 px-4 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                                Stop Building. <br /><span className="text-[#704df4]">Start Selling.</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Most agencies fail because they spend 80% of their time on tech fulfillment and 20% on sales. We flip that ratio. Our "Agency-in-a-Box" snapshots give you a 7-figure infrastructure overnight.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Automated Onboarding", desc: "Contracts, payments, and welcome emails in 1 click." },
                                    { title: "24/7 Lead Reactivation", desc: "AI bots that wake up your dead leads while you sleep." },
                                    { title: "White-Label Support", desc: "We fix your clients' issues under your brand name." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 bg-[#704df4]/10 p-2 rounded-lg text-[#704df4]">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            {/* Abstract Visual representation of chaos vs order */}
                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 p-2 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity group-hover:opacity-30 transition-opacity"></div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent"></div>

                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <div className="text-sm font-mono text-green-400">System Core Online</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                                            <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. VALUE STACK (The "Offer") */}
            <ValueStack />

            {/* 4. BOOKING / CTA SECTION */}
            <section id="book-call" className="py-24 px-4 bg-white text-black text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Ready To Scale?
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                        Book your free discovery call below. We'll audit your current setup and show you exactly where you're losing money.
                    </p>

                    <div className="w-full h-[800px] border border-gray-200 rounded-2xl shadow-2xl overflow-hidden bg-white">
                        {/* REPLACE THIS WITH REAL GHL EMBED */}
                        <iframe
                            src="https://calendly.com/prince-mutanttechnologies/30min"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            scrolling="yes"
                            title="Booking Calendar"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* 5. GHL SPECIFIC BLOG POSTS (SEO SILO) */}
            <GHLBlogGrid />

        </div>
    );
}
