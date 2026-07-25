'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    Loader2, Copy, CheckCircle2, AlertCircle, Users, Activity, 
    Flame, Search, MapPin, Clock, ExternalLink, X, ChevronRight, 
    MousePointer2, Mail, UserCheck, Target, BarChart2, PieChart, Settings, LayoutDashboard
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import 'rrweb-player/dist/style.css';
import rrwebPlayer from 'rrweb-player';
import { useRef } from 'react';

export default function ClientDashboard() {
    const [client, setClient] = useState<any>(null);
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [copied, setCopied] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState('overview'); // overview, realtime, audience, settings
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal state for visitor details
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const [visitorEvents, setVisitorEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    
    // Session Replay State
    const [replayMode, setReplayMode] = useState(false);
    const [loadingRecordings, setLoadingRecordings] = useState(false);
    const [hasRecordings, setHasRecordings] = useState(false);
    const [replayError, setReplayError] = useState('');
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const playerInstanceRef = useRef<any>(null);

    // Integrations State
    const [integrationIds, setIntegrationIds] = useState({ ga_id: '', meta_id: '', google_ads_id: '', tiktok_id: '' });
    const [savingIntegrations, setSavingIntegrations] = useState(false);

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

                if (clientData.integrations) {
                    setIntegrationIds({
                        ga_id: clientData.integrations.ga_id || '',
                        meta_id: clientData.integrations.meta_id || '',
                        google_ads_id: clientData.integrations.google_ads_id || '',
                        tiktok_id: clientData.integrations.tiktok_id || ''
                    });
                }
            }
        }
        setLoading(false);
    };

    const fetchEvents = async (visitor: any) => {
        setSelectedVisitor(visitor);
        setReplayMode(false);
        setHasRecordings(false);
        if (playerInstanceRef.current) {
            // Clean up old player if exists
            try { playerInstanceRef.current.pause(); } catch(e){}
            playerInstanceRef.current = null;
        }

        setLoadingEvents(true);
        setVisitorEvents([]);
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const res = await fetch(`/api/pixel/events?visitor_id=${visitor.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setVisitorEvents(data.events);
            }
        } catch (e) {
            console.error("Failed to fetch events");
        } finally {
            setLoadingEvents(false);
        }
    };

    const watchReplay = async () => {
        if (!selectedVisitor) return;
        setReplayMode(true);
        setLoadingRecordings(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const res = await fetch(`/api/pixel/recordings?visitor_id=${selectedVisitor.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.success && data.events && data.events.length > 1) {
                setHasRecordings(true);
                
                // Initialize player after a short delay so the DOM element is ready
                setTimeout(() => {
                    if (playerContainerRef.current) {
                        playerContainerRef.current.innerHTML = ''; // clear previous
                        playerInstanceRef.current = new rrwebPlayer({
                            target: playerContainerRef.current,
                            props: {
                                events: data.events,
                                autoPlay: true,
                                width: playerContainerRef.current.clientWidth,
                                height: 500,
                            },
                        });
                    }
                }, 200);

            } else {
                setHasRecordings(false);
                setReplayError(data.error || 'No recordings returned from API.');
            }
        } catch (e: any) {
            console.error("Failed to load recordings", e);
            setHasRecordings(false);
            setReplayError(e.message || String(e));
        } finally {
            setLoadingRecordings(false);
        }
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
                setVerifyError(data.error || 'Verification failed. Make sure the script is live on your site.');
            }
        } catch (e) {
            setVerifyError('An error occurred during verification.');
        } finally {
            setVerifying(false);
        }
    };

    const copyScript = () => {
        if (!client) return;
        const scriptHtml = `<script src="https://www.mutanttechnologies.com/mutant-pixel.js" data-client-id="${client.id}"></script>`;
        navigator.clipboard.writeText(scriptHtml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveIntegrations = async () => {
        setSavingIntegrations(true);
        try {
            const { error } = await supabase
                .from('pixel_clients')
                .update({ integrations: integrationIds })
                .eq('id', client.id);

            if (error) throw error;
            alert('Integrations saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save integrations.');
        } finally {
            setSavingIntegrations(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/pixel');
    };

    // --- DATA AGGREGATION FOR CHARTS --- //
    const chartData = useMemo(() => {
        if (!visitors.length) return [];
        // Group by day for the last 7 days
        const days: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days[d.toISOString().split('T')[0]] = 0;
        }

        visitors.forEach(v => {
            const date = new Date(v.last_visited_at).toISOString().split('T')[0];
            if (days[date] !== undefined) {
                days[date]++;
            }
        });

        return Object.keys(days).map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            visitors: days[date]
        }));
    }, [visitors]);

    const sourceData = useMemo(() => {
        if (!visitors.length) return [];
        const sources: Record<string, number> = {};
        visitors.forEach(v => {
            const source = v.first_utm_source || 'Direct';
            sources[source] = (sources[source] || 0) + 1;
        });
        return Object.keys(sources).map(name => ({
            name,
            value: sources[name]
        })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5
    }, [visitors]);

    const COLORS = ['#ff4a00', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b'];

    // --- RENDER HELPERS --- //
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
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-gray-100 dark:border-zinc-800 p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-orange-500"></div>
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 font-oswald uppercase tracking-wide">Install Analytics Snippet</h1>
                    <p className="text-gray-500 dark:text-zinc-400 mb-8 text-lg">Paste the tracking script into your website's <code>&lt;head&gt;</code> tag to start gathering intelligence.</p>
                    
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

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 mt-4">
                        <Button onClick={handleVerify} disabled={verifying} className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Verify Installation
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-bold">Logout</Button>
                    </div>
                </div>
            </div>
        );
    }

    // DASHBOARD STATE
    const totalVisitors = visitors.length;
    const identifiedLeads = visitors.filter(v => v.email).length;
    const today = new Date();
    today.setHours(0,0,0,0);
    const hotLeadsToday = visitors.filter(v => new Date(v.last_visited_at) >= today).length;

    const filteredVisitors = visitors.filter(v => 
        v.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-zinc-950 font-sans flex text-gray-900 dark:text-gray-100">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col hidden md:flex sticky top-0 h-screen shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-oswald uppercase tracking-widest font-bold text-lg">Mutant Pixel</span>
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Reports</div>
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" /> Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('audience')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'audience' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" /> Audience
                    </button>

                    <div className="px-3 mb-2 mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Configuration</div>
                    <button 
                        onClick={() => setActiveTab('integrations')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'integrations' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Settings className="w-5 h-5" /> Data Streams
                    </button>
                </div>
                
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-gray-500">
                            {client.company_name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{client.company_name}</p>
                            <p className="text-xs text-gray-500 truncate cursor-pointer hover:text-red-500" onClick={handleLogout}>Sign Out</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 dark:border-zinc-800 px-8 py-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">
                        {activeTab === 'overview' && 'Analytics Overview'}
                        {activeTab === 'audience' && 'Audience Data'}
                        {activeTab === 'integrations' && 'Data Streams & Integrations'}
                    </h2>
                    
                    {activeTab === 'audience' && (
                        <div className="relative w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 border-none rounded-md focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                            />
                        </div>
                    )}
                </header>

                <div className="p-8 max-w-[1600px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* GA Style Scorecards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-between">
                                    <span className="text-sm font-semibold text-gray-500">Total Users</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-3xl font-black">{totalVisitors}</span>
                                        <span className="text-xs text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-between">
                                    <span className="text-sm font-semibold text-gray-500">Identified Leads</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-3xl font-black">{identifiedLeads}</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-between">
                                    <span className="text-sm font-semibold text-gray-500">Hot Leads Today</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-orange-500">{hotLeadsToday}</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-between">
                                    <span className="text-sm font-semibold text-gray-500">Average Intent</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-3xl font-black">
                                            {visitors.length ? Math.round(visitors.reduce((a,b)=>a+(b.intent_score||0), 0) / visitors.length) : 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                                    <h3 className="text-base font-bold mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary" /> Traffic Over Time (7 Days)</h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                                                <RechartsTooltip 
                                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                                                    cursor={{stroke: '#f3f4f6', strokeWidth: 2}}
                                                />
                                                <Line type="monotone" dataKey="visitors" stroke="#ff4a00" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                                    <h3 className="text-base font-bold mb-6 flex items-center gap-2"><PieChart className="w-5 h-5 text-primary" /> Top Acquisition Sources</h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sourceData} layout="vertical" margin={{top: 0, right: 0, left: 20, bottom: 0}}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 600}} width={80} />
                                                <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                                    {sourceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                            
                            {/* GA Data Table View */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                                    <h3 className="text-base font-bold">Recent Leads Explorer</h3>
                                    <button onClick={() => setActiveTab('audience')} className="text-sm font-bold text-primary hover:underline">View All Audience</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-zinc-950/50 text-gray-500 text-xs uppercase tracking-wider">
                                                <th className="px-6 py-3 font-semibold border-b border-gray-200 dark:border-zinc-800">Company / User</th>
                                                <th className="px-6 py-3 font-semibold border-b border-gray-200 dark:border-zinc-800">Source</th>
                                                <th className="px-6 py-3 font-semibold border-b border-gray-200 dark:border-zinc-800">Location</th>
                                                <th className="px-6 py-3 font-semibold border-b border-gray-200 dark:border-zinc-800 text-right">Intent</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                            {filteredVisitors.slice(0, 5).map((visitor) => (
                                                <tr key={visitor.id} onClick={() => fetchEvents(visitor)} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${visitor.email ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-zinc-800'}`}>
                                                                {visitor.company_name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{visitor.company_name !== 'Unknown' ? visitor.company_name : 'Anonymous'}</div>
                                                                {visitor.email && <div className="text-xs text-gray-500">{visitor.email}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-semibold bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">{visitor.first_utm_source || 'Direct'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{visitor.city !== 'Unknown' ? visitor.city : 'Unknown'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`text-sm font-bold ${visitor.intent_score > 50 ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'}`}>{visitor.intent_score || 0}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audience' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-zinc-950/50 text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-semibold border-b border-gray-200 dark:border-zinc-800">User / Company</th>
                                            <th className="px-6 py-4 font-semibold border-b border-gray-200 dark:border-zinc-800">Contact</th>
                                            <th className="px-6 py-4 font-semibold border-b border-gray-200 dark:border-zinc-800">Location</th>
                                            <th className="px-6 py-4 font-semibold border-b border-gray-200 dark:border-zinc-800">First Source</th>
                                            <th className="px-6 py-4 font-semibold border-b border-gray-200 dark:border-zinc-800 text-right">Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                        {filteredVisitors.map((visitor) => (
                                            <tr key={visitor.id} onClick={() => fetchEvents(visitor)} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${visitor.email ? 'bg-gradient-to-br from-primary to-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                                            {visitor.company_name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{visitor.company_name !== 'Unknown' ? visitor.company_name : 'Anonymous User'}</div>
                                                            <div className="text-xs text-gray-500 font-medium mt-0.5">Intent Score: <span className={visitor.intent_score > 50 ? 'text-orange-500 font-bold' : ''}>{visitor.intent_score || 0}</span></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {visitor.email ? (
                                                        <span className="text-sm font-semibold text-primary">{visitor.email}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">Unidentified</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{visitor.city !== 'Unknown' ? `${visitor.city}, ${visitor.country}` : 'Unknown Location'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded uppercase tracking-wider text-gray-600 dark:text-gray-400">{visitor.first_utm_source || 'Direct'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{new Date(visitor.last_visited_at).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-500">{new Date(visitor.last_visited_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredVisitors.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    No audience members found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
                                <h2 className="text-2xl font-bold mb-2 tracking-tight">Data Streams</h2>
                                <p className="text-gray-500 mb-8 text-sm">Configure outbound integrations. Mutant Pixel acts as a Google Tag Manager alternative to fire these automatically.</p>
                                
                                <div className="space-y-6">
                                    {['ga_id', 'meta_id', 'google_ads_id', 'tiktok_id'].map((id) => (
                                        <div key={id}>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                                                    {id === 'ga_id' ? 'Google Analytics (G-ID)' : 
                                                     id === 'meta_id' ? 'Meta Pixel ID' : 
                                                     id === 'google_ads_id' ? 'Google Ads Conversion ID' : 
                                                     'TikTok Pixel ID'}
                                                </label>
                                                {integrationIds[id as keyof typeof integrationIds] && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Connected
                                                        </span>
                                                        <button 
                                                            onClick={() => setIntegrationIds({...integrationIds, [id]: ''})}
                                                            className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder={id === 'ga_id' ? 'G-XXXXXXXXXX' : id === 'meta_id' ? '1234567890' : id === 'google_ads_id' ? 'AW-123456789' : 'CXXXXXXXXXXXXXXXXXXX'}
                                                value={integrationIds[id as keyof typeof integrationIds]}
                                                onChange={(e) => setIntegrationIds({...integrationIds, [id]: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-sm transition-all"
                                            />
                                        </div>
                                    ))}
                                    
                                    <Button 
                                        onClick={saveIntegrations} 
                                        disabled={savingIntegrations}
                                        className="w-full h-12 rounded-xl text-sm font-bold shadow-sm mt-4"
                                    >
                                        {savingIntegrations ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        Save Data Streams
                                    </Button>
                                    
                                    <div className="pt-8 border-t border-gray-200 dark:border-zinc-800 mt-8">
                                        <h3 className="text-base font-bold mb-2">Email Reports</h3>
                                        <p className="text-sm text-gray-500 mb-6">Send an immediate summary of today's top identified leads directly to your inbox.</p>
                                        
                                        <Button 
                                            variant="outline"
                                            onClick={async () => {
                                                const btn = document.activeElement as HTMLButtonElement;
                                                btn.disabled = true;
                                                const originalText = btn.innerText;
                                                btn.innerText = 'Sending...';
                                                
                                                try {
                                                    const res = await fetch('/api/pixel/cron/digest');
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        alert('Digest email sent successfully!');
                                                    } else {
                                                        alert('Failed to send digest. Make sure you have visitors in the last 24 hours.');
                                                    }
                                                } catch (e) {
                                                    alert('An error occurred while sending the digest.');
                                                } finally {
                                                    btn.disabled = false;
                                                    btn.innerText = originalText;
                                                }
                                            }}
                                            className="w-full h-12 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Send Digest Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ACTIVITY MODAL */}
            {selectedVisitor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-start bg-gray-50/50 dark:bg-zinc-950/50">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${selectedVisitor.email ? 'bg-gradient-to-br from-primary to-orange-500 text-white' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'}`}>
                                    {selectedVisitor.email ? <UserCheck className="w-6 h-6" /> : selectedVisitor.company_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold leading-tight flex items-center gap-3">
                                        {selectedVisitor.company_name !== 'Unknown' ? selectedVisitor.company_name : 'Anonymous User'}
                                        {!replayMode && (
                                            <Button size="sm" onClick={watchReplay} className="rounded-full h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white shadow-sm flex items-center gap-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> Watch Replay
                                            </Button>
                                        )}
                                        {replayMode && (
                                            <Button size="sm" variant="outline" onClick={() => setReplayMode(false)} className="rounded-full h-7 px-3 text-xs flex items-center gap-1">
                                                <Activity className="w-3 h-3" /> Back to Timeline
                                            </Button>
                                        )}
                                    </h2>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedVisitor.city}, {selectedVisitor.country}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last seen {new Date(selectedVisitor.last_visited_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        {selectedVisitor.email && (
                                            <span className="text-primary font-bold text-sm flex items-center gap-1.5 mt-1">
                                                <Mail className="w-4 h-4" />
                                                {selectedVisitor.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedVisitor(null)}
                                className="p-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-full transition-colors shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-zinc-900 min-h-[400px]">
                            {replayMode ? (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-red-500">
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                                            Live Session Recording
                                        </h3>
                                    </div>
                                    
                                    {loadingRecordings ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-red-500" />
                                            <p className="font-medium text-sm">Loading visual replay data...</p>
                                        </div>
                                    ) : !hasRecordings ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                                <Target className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h4 className="text-lg font-bold mb-2">No Recordings Found</h4>
                                            <p className="text-sm text-gray-500 max-w-sm mb-4">This visitor's session was either too short to record, or they visited before the recorder was installed.</p>
                                            {replayError && <p className="text-xs text-red-500 font-mono bg-red-50 p-2 rounded max-w-lg">{replayError}</p>}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner" ref={playerContainerRef}>
                                            {/* rrweb player mounts here */}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-gray-400">
                                            <Target className="w-4 h-4 text-primary" />
                                            Intent Timeline
                                        </h3>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-700">
                                            {visitorEvents.length} Actions
                                        </span>
                                    </div>

                            {loadingEvents ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                                    <p className="font-medium text-sm">Decoding intent signals...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {visitorEvents.map((event, idx) => {
                                        const isClick = event.event_type === 'click';
                                        const isIdentity = event.event_type === 'identity';
                                        
                                        let timeSpent = null;
                                        if (idx < visitorEvents.length - 1) {
                                            const current = new Date(event.created_at).getTime();
                                            const prev = new Date(visitorEvents[idx + 1].created_at).getTime();
                                            const diff = Math.abs(current - prev);
                                            const minutes = Math.floor(diff / 60000);
                                            const seconds = Math.floor((diff % 60000) / 1000);
                                            timeSpent = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                                        }

                                        return (
                                            <div key={event.id} className="relative pl-8 pb-4 group">
                                                {/* Timeline Line */}
                                                {idx !== visitorEvents.length - 1 && (
                                                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-800 group-hover:bg-primary/30 transition-colors"></div>
                                                )}
                                                {/* Timeline Dot */}
                                                <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center z-10 shadow-sm ${isClick ? 'bg-orange-500' : isIdentity ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-700'}`}>
                                                    {isClick ? <MousePointer2 className="w-3 h-3 text-white" /> : isIdentity ? <UserCheck className="w-3 h-3 text-white" /> : <Activity className="w-3 h-3 text-white" />}
                                                </div>

                                                <div className={`rounded-xl p-4 border transition-all shadow-sm ${isClick ? 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20' : isIdentity ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800'}`}>
                                                    <div className="flex justify-between items-start gap-4 mb-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                            {isClick ? `Clicked "${event.metadata?.text || 'Element'}"` : 
                                                             isIdentity ? `Identified as ${selectedVisitor.email}` : 
                                                             `Viewed ${event.url.replace(/^https?:\/\/(www\.)?/, '').substring(0, 50)}...`}
                                                        </p>
                                                        <span className="text-xs font-medium text-gray-400 shrink-0">
                                                            {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3 mt-2">
                                                        {timeSpent && !isIdentity && (
                                                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                                                                <Clock className="w-3 h-3" /> {timeSpent}
                                                            </span>
                                                        )}
                                                        {!isIdentity && (
                                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded flex items-center gap-1 truncate max-w-[200px]">
                                                                <ExternalLink className="w-3 h-3" /> {event.url.split('/').pop() || 'Homepage'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
