'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';

interface SiteSetting {
    key: string;
    value: string;
    label: string;
    description: string;
    input_type: 'text' | 'textarea' | 'image' | 'url';
}

export default function AdminSettings() {
    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/admin');
            return;
        }

        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .order('key');

        if (error) {
            console.error('Error fetching settings:', error);
        } else {
            setSettings(data || []);
        }
        setLoading(false);
    };

    const handleChange = (key: string, newValue: string) => {
        setSettings(settings.map(s => s.key === key ? { ...s, value: newValue } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        // Bulk update or individual updates
        const updates = settings.map(s =>
            supabase.from('site_settings').update({ value: s.value }).eq('key', s.key)
        );

        await Promise.all(updates);
        setSaving(false);
        alert('Settings saved successfully!');
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/admin');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Global Settings</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm">
                    <div className="space-y-8">
                        {settings.map((setting) => (
                            <div key={setting.key} className="space-y-2">
                                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500">
                                    {setting.label}
                                </label>
                                <p className="text-xs text-gray-400 mb-2">{setting.description}</p>

                                {setting.input_type === 'textarea' ? (
                                    <textarea
                                        value={setting.value || ''}
                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                    />
                                ) : (
                                    <input
                                        type={setting.input_type === 'url' ? 'url' : 'text'}
                                        value={setting.value || ''}
                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
