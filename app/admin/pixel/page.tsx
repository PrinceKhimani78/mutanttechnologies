'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
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
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

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

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-oswald font-bold uppercase">Pixel Global Dashboard</h1>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Global View (All Clients)</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.company_name}
                            </option>
                        ))}
                    </select>
                    <Link 
                        href="/admin/pixel/clients"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shrink-0"
                    >
                        Manage Clients
                    </Link>
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
                                    <tr key={visitor.id} className="hover:bg-gray-50 dark:hover:bg-zinc-950/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{visitor.company_name}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md">
                                                {visitor.pixel_clients?.company_name || 'Unknown Client'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {visitor.city !== 'Unknown' ? `${visitor.city}, ${visitor.country}` : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(visitor.last_visited_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
