'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2, AlertCircle, Users, Activity, Flame, Search, MapPin, Clock } from 'lucide-react';

export default function ClientDashboard() {
    const [client, setClient] = useState<any>(null);
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/pixel');
            return;
        }

        const { data: clientData } = await supabase
            .from('pixel_clients')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (clientData) {
            setClient(clientData);
            if (clientData.installation_status === 'verified') {
                const { data: visitorData } = await supabase
                    .from('pixel_visitors')
                    .select('*')
                    .order('last_visited_at', { ascending: false });
                
                setVisitors(visitorData || []);
            }
        }
        setLoading(false);
    };

    const handleVerify = async () => {
        if (!client) return;
        setVerifying(true);
        setVerifyError('');

        try {
            const res = await fetch('/api/pixel/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: client.id })
            });
            const data = await res.json();
            
            if (data.success) {
                await loadData();
            } else {
                setVerifyError(data.error || 'Verification failed. Please ensure the code is added to your homepage.');
            }
        } catch (e) {
            setVerifyError('An error occurred during verification.');
        } finally {
            setVerifying(false);
        }
    };

    const copyScript = () => {
        const domain = typeof window !== 'undefined' ? window.location.origin : 'https://www.mutanttechnologies.com';
        const script = `<script src="${domain}/mutant-pixel.js" data-client-id="${client?.id}"></script>`;
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/pixel');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!client) {
        return <div className="min-h-screen flex items-center justify-center text-red-500 bg-zinc-50 dark:bg-zinc-950">Error: Could not load client profile.</div>;
    }

    // PENDING VERIFICATION STATE
    if (client.installation_status === 'pending') {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-gray-100 dark:border-zinc-800 p-10">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 font-oswald uppercase">Connect Your Website</h1>
                    <p className="text-gray-500 dark:text-zinc-400 mb-8 text-lg">Paste the tracking script below into your website's header to start capturing B2B leads instantly.</p>
                    
                    <div className="bg-zinc-900 rounded-2xl p-6 mb-8 font-mono text-sm overflow-x-auto relative shadow-inner">
                        <code className="text-emerald-400">
                            &lt;script src="https://www.mutanttechnologies.com/mutant-pixel.js" data-client-id="{client.id}"&gt;&lt;/script&gt;
                        </code>
                        <button 
                            onClick={copyScript}
                            className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-colors"
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    {verifyError && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-900/30">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{verifyError}</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 dark:border-zinc-800 pt-8 mt-4">
                        <Button onClick={handleVerify} disabled={verifying} className="w-full sm:w-auto h-12 px-8 rounded-full text-base">
                            {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Verify Installation
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} className="w-full sm:w-auto h-12 px-8 rounded-full text-base">Logout</Button>
                    </div>
                </div>
            </div>
        );
    }

    // DASHBOARD STATE
    const totalVisitors = visitors.length;
    const returnVisitors = visitors.filter(v => v.first_visited_at !== v.last_visited_at).length;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const newLeadsToday = visitors.filter(v => new Date(v.first_visited_at) >= today).length;

    const filteredVisitors = visitors.filter(v => 
        v.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-12">
            {/* Header */}
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-zinc-800 py-4 px-6 sm:px-8 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-oswald uppercase tracking-wide leading-tight">{client.company_name}</h1>
                        <span className="text-sm text-gray-500 font-medium">Lead Intelligence Dashboard</span>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full px-6 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    Sign Out
                </Button>
            </header>
            
            <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 mt-4">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                            <Users className="w-7 h-7" />
                        </div>
                        <h3 className="text-4xl font-bold mb-2 tracking-tight">{totalVisitors}</h3>
                        <p className="text-base text-gray-500 font-medium">Total Companies Identified</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                        <div className="w-14 h-14 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                            <Activity className="w-7 h-7" />
                        </div>
                        <h3 className="text-4xl font-bold mb-2 tracking-tight">{returnVisitors}</h3>
                        <p className="text-base text-gray-500 font-medium">High Intent Returning Leads</p>
                    </div>

                    <div className="bg-gradient-to-br from-primary via-primary to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20">
                            <Flame className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-4xl font-bold mb-2 tracking-tight">{newLeadsToday}</h3>
                        <p className="text-base text-white/90 font-medium">Hot Leads Today</p>
                    </div>
                </div>

                {/* Lead Feed */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Live Intelligence Feed</h2>
                            <p className="text-sm text-gray-500">Real-time companies actively browsing your site.</p>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search companies or cities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                    
                    <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                        {filteredVisitors.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No leads found</h3>
                                <p className="text-gray-500">We couldn't find any companies matching your search.</p>
                            </div>
                        ) : (
                            filteredVisitors.map((visitor) => {
                                const isReturnVisitor = visitor.first_visited_at !== visitor.last_visited_at;
                                return (
                                    <div key={visitor.id} className="p-6 sm:p-8 hover:bg-gray-50/80 dark:hover:bg-zinc-950/80 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-sm">
                                                {visitor.company_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-xl leading-none text-gray-900 dark:text-white">{visitor.company_name}</h3>
                                                    {isReturnVisitor && (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-green-50 border border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400">
                                                            Returning Interest
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4" />
                                                        {visitor.city !== 'Unknown' ? `${visitor.city}, ${visitor.country}` : 'Unknown Location'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-gray-50 sm:bg-transparent dark:bg-zinc-800/50 sm:dark:bg-transparent p-4 sm:p-0 rounded-xl">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <Clock className="w-4 h-4" />
                                                {new Date(visitor.last_visited_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 sm:mt-1">
                                                {new Date(visitor.last_visited_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
