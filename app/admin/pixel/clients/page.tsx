'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminPixelClients() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [companyName, setCompanyName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('pixel_clients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setClients(data);
        setLoading(false);
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/pixel/clients/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company_name: companyName, website_url: websiteUrl, email, password })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(`Client created successfully! Please save their password: ${password}`);
                setCompanyName('');
                setWebsiteUrl('');
                setEmail('');
                setPassword('');
                fetchClients();
            } else {
                setError(data.error || 'Failed to create client');
            }
        } catch (err) {
            setError('An error occurred while creating the client.');
        } finally {
            setCreating(false);
        }
    };

    const copyScript = (clientId: string) => {
        const domain = typeof window !== 'undefined' ? window.location.origin : 'https://www.mutanttechnologies.com';
        const script = `<script src="${domain}/mutant-pixel.js" data-client-id="${clientId}"></script>`;
        navigator.clipboard.writeText(script);
        setCopiedScriptId(clientId);
        setTimeout(() => setCopiedScriptId(null), 2000);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-oswald font-bold uppercase mb-8">Pixel Clients</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to create a new client */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 lg:col-span-1 h-fit">
                    <h2 className="text-xl font-semibold mb-6">Create New Client</h2>
                    <form onSubmit={handleCreateClient} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Company Name</label>
                            <input 
                                type="text" 
                                required 
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2"
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Website URL</label>
                            <input 
                                type="url" 
                                required 
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2"
                                placeholder="https://acmecorp.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Login Email</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2"
                                placeholder="client@acmecorp.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 flex justify-between items-center">
                                Login Password
                                <button type="button" onClick={generatePassword} className="text-xs text-primary hover:underline">Generate</button>
                            </label>
                            <input 
                                type="text" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2"
                                placeholder="password"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={creating}>
                            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Create Client Account
                        </Button>
                    </form>
                </div>

                {/* List of existing clients */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-6">Existing Clients</h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                    ) : clients.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No clients created yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {clients.map((client) => (
                                <div key={client.id} className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/50 dark:bg-zinc-950/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">{client.company_name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                client.installation_status === 'verified' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                                {client.installation_status}
                                            </span>
                                        </div>
                                        <a href={client.website_url} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            {client.website_url}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => copyScript(client.id)}
                                            className="w-full sm:w-auto"
                                        >
                                            {copiedScriptId === client.id ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                            Copy Script
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
