import { Check, CheckCircle2 } from 'lucide-react';

export default function ValueStack() {
    const stackItems = [
        {
            title: "Custom Agency Snapshot Installation",
            value: "$2,997",
            description: "Complete setup of pipelines, calendars, and opportunity stages tailored to your niche."
        },
        {
            title: "The 'Nurture King' Email Sequences",
            value: "$1,497",
            description: "12-month database reactivation & new lead nurture campaigns written by pro copywriters."
        },
        {
            title: "SaaS Mode Configurator",
            value: "$997",
            description: "We set up your rebilling, Twilio/Mailgun, and sub-account pricing structures."
        },
        {
            title: "Zapier/Make Integration Library",
            value: "$497",
            description: "Connect GHL to Slack, Google Sheets, and your payment gateways seamlessly."
        },
        {
            title: "90-Day VIP Tech Support",
            value: "$2,500",
            description: "Direct Slack access to our engineering team for any bugs or tweaks."
        },
        {
            title: "BONUS: Sales Script Playbook",
            value: "$497",
            description: "The exact scripts we use to close high-ticket retainer clients."
        }
    ];

    return (
        <section id="value-stack" className="py-24 px-4 bg-gradient-to-b from-black to-zinc-900 border-t border-white/5">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
                        Here's What You Get When You <br />
                        <span className="text-[#704df4] underline decoration-4 decoration-white/20 underline-offset-8">Join Today</span>
                    </h2>
                    <p className="text-xl text-gray-400">Total Value vs Real World Results</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm relative">
                    {/* Dashed Border Effect */}
                    <div className="absolute inset-0 border-2 border-dashed border-[#704df4]/30 rounded-3xl pointer-events-none z-20"></div>

                    <div className="p-8 md:p-12">
                        <div className="space-y-6">
                            {stackItems.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-white/5 last:border-0 group hover:bg-white/5 transition-colors rounded-lg px-4 -mx-4">
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-[#704df4]/20 flex items-center justify-center text-[#704df4]">
                                                <Check strokeWidth={3} size={25} /> {/* FIXED: Added size prop */}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-[#a38cff] transition-colors">{item.title}</h3>
                                            <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 pl-12 md:pl-0 text-right">
                                        <span className="text-2xl font-black text-gray-500 font-mono decoration-red-500/50 line-through decoration-2">
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#704df4] p-8 md:p-12 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-white/80 font-bold text-xl uppercase tracking-widest mb-2">Total Value</div>
                            <div className="text-4xl md:text-6xl font-black text-white/50 line-through mb-2 decorations-white">$8,985</div>
                            <div className="text-white font-bold text-2xl mb-8">Get it all today for just...</div>

                            <div className="flex flex-col items-center gap-6">
                                <div className="text-white text-7xl md:text-8xl font-black tracking-tighter drop-shadow-2xl">
                                    $2,997
                                </div>
                                <a
                                    href="#book-call"
                                    className="bg-white text-[#704df4] hover:bg-gray-100 px-12 py-6 rounded-full font-black text-2xl uppercase tracking-wide transition-all transform hover:scale-105 shadow-xl w-full md:w-auto"
                                >
                                    Start My Transformation
                                </a>
                                <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                                    <CheckCircle2 size={16} /> 100% Satisfaction Guarantee
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
