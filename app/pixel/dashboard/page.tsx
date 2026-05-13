'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    Loader2, Copy, CheckCircle2, AlertCircle, Users, Activity, 
    Flame, Search, MapPin, Clock, ExternalLink, X, ChevronRight, 
    MousePointer2, Mail, UserCheck, Target
} from 'lucide-react';

export default function ClientDashboard() {
    const [client, setClient] = useState<any>(null);
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal state for visitor details
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const [visitorEvents, setVisitorEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

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

    const [activeTab, setActiveTab] = useState<'visitors' | 'integrations'>('visitors');
    const [integrationIds, setIntegrationIds] = useState({
        ga_id: '',
        meta_id: '',
        google_ads_id: '',
        tiktok_id: ''
    });
    const [savingIntegrations, setSavingIntegrations] = useState(false);

    useEffect(() => {
        if (client) {
            setIntegrationIds({
                ga_id: client.ga_id || '',
                meta_id: client.meta_id || '',
                google_ads_id: client.google_ads_id || '',
                tiktok_id: client.tiktok_id || ''
            });
        }
    }, [client]);

    const saveIntegrations = async () => {
        setSavingIntegrations(true);
        try {
            const { error } = await supabase
                .from('pixel_clients')
                .update(integrationIds)
                .eq('id', client.id);
            
            if (!error) {
                await loadData();
                alert('Integrations updated successfully!');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSavingIntegrations(false);
        }
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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-12 relative">
            {/* Header */}
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 py-4 px-6 sm:px-8 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-oswald uppercase tracking-wide leading-tight">{client.company_name}</h1>
                        <span className="text-sm text-gray-500 font-medium">Lead Intelligence Dashboard</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-full flex gap-1">
                        <button 
                            onClick={() => setActiveTab('visitors')}
                            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'visitors' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            Visitors
                        </button>
                        <button 
                            onClick={() => setActiveTab('integrations')}
                            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'integrations' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            Integrations
                        </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full px-6 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                        Sign Out
                    </Button>
                </div>
            </header>
            
            <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 mt-4">
                
                {activeTab === 'visitors' ? (
                    <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-4xl font-bold mb-2 tracking-tight">{totalVisitors}</h3>
                            <p className="text-base text-gray-500 font-medium">Companies Identified</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
                            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                                <UserCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-4xl font-bold mb-2 tracking-tight">{identifiedLeads}</h3>
                            <p className="text-base text-gray-500 font-medium">Individual Leads (Resolved)</p>
                        </div>

                        <div className="bg-gradient-to-br from-primary via-primary to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20">
                                <Flame className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-4xl font-bold mb-2 tracking-tight">{hotLeadsToday}</h3>
                            <p className="text-base text-white/90 font-medium">Active Intent Today</p>
                        </div>
                    </div>

                    {/* Lead Feed */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Lead Intelligence Feed</h2>
                                <p className="text-sm text-gray-500">Click on any visitor to see their intent and activity history.</p>
                            </div>
                            <div className="relative w-full sm:w-80">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search leads, cities, or emails..."
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
                                <p className="text-gray-500">We couldn't find any visitors matching your search.</p>
                            </div>
                        ) : (
                            filteredVisitors.map((visitor) => {
                                const isResolved = !!visitor.email;
                                return (
                                    <div 
                                        key={visitor.id} 
                                        onClick={() => fetchEvents(visitor)}
                                        className="p-6 sm:p-8 hover:bg-gray-50/80 dark:hover:bg-zinc-950/80 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group cursor-pointer border-l-4 border-transparent hover:border-primary"
                                    >
                                        <div className="flex items-start gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all shrink-0 shadow-sm ${isResolved ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:bg-primary group-hover:text-white'}`}>
                                                {isResolved ? <UserCheck className="w-7 h-7" /> : visitor.company_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-xl leading-none text-gray-900 dark:text-white">
                                                        {visitor.company_name !== 'Unknown' ? visitor.company_name : (visitor.email || 'Anonymous Visitor')}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${visitor.intent_score > 50 ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                                        {visitor.intent_score || 0} Intent
                                                    </span>
                                                    {visitor.first_utm_source && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase">
                                                            {visitor.first_utm_source}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4" />
                                                        {visitor.city !== 'Unknown' ? `${visitor.city}, ${visitor.country}` : 'Unknown Location'}
                                                    </span>
                                                    {visitor.email && (
                                                        <span className="flex items-center gap-1.5 text-primary">
                                                            <Mail className="w-4 h-4" />
                                                            {visitor.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-gray-50 sm:bg-transparent dark:bg-zinc-800/50 sm:dark:bg-transparent p-4 sm:p-0 rounded-xl">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <Clock className="w-4 h-4" />
                                                {new Date(visitor.last_visited_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 sm:mt-1 flex items-center gap-1">
                                                {new Date(visitor.last_visited_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors ml-1 hidden sm:block" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                </>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-3xl font-bold mb-2 font-oswald uppercase">Smart Container</h2>
                            <p className="text-gray-500 mb-8">Mutant Pixel can automatically load your other tracking pixels. One script, total control.</p>
                            
                            <div className="space-y-6">
                                {['ga_id', 'meta_id', 'google_ads_id', 'tiktok_id'].map((id) => (
                                    <div key={id}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold uppercase tracking-wider text-gray-400">
                                                {id === 'ga_id' ? 'Google Analytics (G-ID)' : 
                                                 id === 'meta_id' ? 'Meta Pixel ID' : 
                                                 id === 'google_ads_id' ? 'Google Ads Conversion ID' : 
                                                 'TikTok Pixel ID'}
                                            </label>
                                            {integrationIds[id as keyof typeof integrationIds] && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Installed
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
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        />
                                    </div>
                                ))}
                                
                                <Button 
                                    onClick={saveIntegrations} 
                                    disabled={savingIntegrations}
                                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 mt-4"
                                >
                                    {savingIntegrations ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                    Save Changes
                                </Button>
                                <div className="pt-8 border-t border-gray-100 dark:border-zinc-800 mt-8">
                                    <h3 className="text-xl font-bold mb-2 font-oswald uppercase text-gray-400">Email Digest</h3>
                                    <p className="text-sm text-gray-500 mb-6">Want to see your top leads in your inbox right now? Click the button below to send a manual digest.</p>
                                    
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
                                        className="w-full h-12 rounded-2xl text-sm font-bold border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Daily Digest Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

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
