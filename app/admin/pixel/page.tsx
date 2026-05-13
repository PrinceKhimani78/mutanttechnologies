'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Loader2, ExternalLink, Filter, LogOut, Search, MapPin, Clock, 
    ChevronRight, X, MousePointer2, Mail, UserCheck, Target, Activity 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPixelDashboard() {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalVisitors: 0,
        activeClients: 0
    });
    const [recentTraffic, setRecentTraffic] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // Modal state for visitor details
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const [visitorEvents, setVisitorEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Strict admin check
            const adminEmails = ['admin@mutant.tech', 'prince@mutant.tech', 'princekhimani@gmail.com', 'princekhimani186@gmail.com', 'princekhimani78@gmail.com', 'prince@mutanttechnologies.com'];
            
            if (!session) {
                router.push('/admin?redirect=/admin/pixel');
                return;
            }
            
            if (!session.user.email || !adminEmails.includes(session.user.email)) {
                router.push('/admin/dashboard'); // Prevent infinite loop if authenticated but not admin
                return;
            }
            fetchDashboardData();
        };
        checkSession();
    }, [router, selectedClientId]);

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!user || !token) {
                console.error("No valid user or token found");
                return;
            }

            const res = await fetch(`/api/pixel/admin/dashboard?client_id=${selectedClientId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.success) {
                setStats(data.stats);
                setClients(data.clients);
                setRecentTraffic(data.recentTraffic);
            } else {
                console.error("API Error fetching dashboard data:", data.error);
            }
        } catch (error) {
            console.error("Error fetching global pixel data:", error);
        }

        setLoading(false);
    };

    const fetchEvents = async (visitor: any) => {
        setSelectedVisitor(visitor);
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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/admin');
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] dark:bg-black text-black dark:text-white p-4 md:p-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-oswald font-bold uppercase tracking-tighter">Pixel Global Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time leads and traffic intelligence across all clients.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select 
                            value={selectedClientId} 
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium min-w-[200px]"
                        >
                            <option value="all">Global View (All Clients)</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.company_name}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <button 
                        onClick={() => router.push('/admin/pixel/clients')}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        Manage Clients
                    </button>

                    <button 
                        onClick={handleSignOut}
                        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total SaaS Clients</h3>
                    <p className="text-4xl font-bold">{stats.totalClients}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Verified Installations</h3>
                    <p className="text-4xl font-bold">{stats.activeClients}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                        {selectedClientId === 'all' ? 'Total Visitors Tracked' : 'Client Visitors'}
                    </h3>
                    <p className="text-4xl font-bold">{stats.totalVisitors}</p>
                </div>
            </div>

            {/* Recent Global Traffic */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold">
                        {selectedClientId === 'all' ? 'Live Network Traffic (All Clients)' : 'Live Network Traffic (Filtered)'}
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-950/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {recentTraffic.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No traffic detected on the network yet.
                                    </td>
                                </tr>
                            ) : (
                                recentTraffic.map((visitor) => (
                                    <tr 
                                        key={visitor.id} 
                                        onClick={() => fetchEvents(visitor)}
                                        className="hover:bg-gray-50 dark:hover:bg-zinc-950/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span>{visitor.company_name}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${visitor.intent_score > 50 ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                                        {visitor.intent_score || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {visitor.email && <span className="text-[10px] text-primary">{visitor.email}</span>}
                                                    {visitor.first_utm_source && (
                                                        <span className="text-[8px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1 rounded font-bold uppercase">
                                                            {visitor.first_utm_source}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md">
                                                {visitor.pixel_clients?.company_name || 'Unknown Client'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {visitor.city !== 'Unknown' ? `${visitor.city}, ${visitor.country}` : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span>{new Date(visitor.last_visited_at).toLocaleString()}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors ml-2" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ACTIVITY MODAL */}
            {selectedVisitor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-start">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20 ${selectedVisitor.email ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                                    {selectedVisitor.email ? <UserCheck className="w-8 h-8" /> : selectedVisitor.company_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold leading-tight">{selectedVisitor.company_name !== 'Unknown' ? selectedVisitor.company_name : 'Anonymous Visitor'}</h2>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedVisitor.city}, {selectedVisitor.country}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last seen {new Date(selectedVisitor.last_visited_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        {selectedVisitor.email && (
                                            <span className="text-primary font-bold text-sm flex items-center gap-1.5">
                                                <Mail className="w-4 h-4" />
                                                {selectedVisitor.email}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Target Client: {selectedVisitor.pixel_clients?.company_name}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedVisitor(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Intent Timeline
                                </h3>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                                    {visitorEvents.length} Actions Tracked
                                </span>
                            </div>

                            {loadingEvents ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                                    <p className="font-medium">Decoding intent...</p>
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
                                                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100 dark:bg-zinc-800 group-hover:bg-primary/20 transition-colors"></div>
                                                )}
                                                {/* Timeline Dot */}
                                                <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center z-10 ${isClick ? 'bg-orange-500' : isIdentity ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                                                    {isClick ? <MousePointer2 className="w-3 h-3 text-white" /> : isIdentity ? <UserCheck className="w-3 h-3 text-white" /> : <Activity className="w-3 h-3 text-gray-400" />}
                                                </div>

                                                <div className={`rounded-2xl p-4 border transition-all ${isClick ? 'bg-orange-50/30 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20' : isIdentity ? 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20' : 'bg-gray-50/50 dark:bg-zinc-950/50 border-gray-100/50 dark:border-zinc-800/50'}`}>
                                                    <div className="flex justify-between items-start gap-4 mb-1">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                            {isClick ? `Clicked "${event.metadata?.text || 'Element'}"` : 
                                                             isIdentity ? `Identified as ${selectedVisitor.email}` : 
                                                             `Viewed ${event.url.replace(/^https?:\/\/(www\.)?/, '').substring(0, 50)}...`}
                                                        </p>
                                                        <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                                            {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3 mt-2">
                                                        {timeSpent && !isIdentity && (
                                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Clock className="w-2.5 h-2.5" /> Spent {timeSpent}
                                                            </span>
                                                        )}
                                                        {!isIdentity && (
                                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                                <ExternalLink className="w-2.5 h-2.5" /> {event.url.split('/').pop() || 'Homepage'}
                                                            </span>
                                                        )}
                                                        {isClick && (
                                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded">
                                                                Interaction
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
                        
                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50/50 dark:bg-zinc-950/50 border-t border-gray-100 dark:border-zinc-800 text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Behavioral intelligence active</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
