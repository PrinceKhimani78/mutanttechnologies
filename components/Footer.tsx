'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FooterClient } from './FooterClient';
import { Service } from '@/lib/types';
import { getSiteSettings } from '@/lib/cms';

/**
 * Footer Component (Client)
 * 
 * Fetches service data from Supabase on the client side.
 */
export const Footer = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [globalSettings, setGlobalSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch services for footer links
                const { data: servicesData } = await supabase
                    .from('services')
                    .select('*')
                    .order('id')
                    .limit(5);

                setServices((servicesData || []) as Service[]);

                // Fetch Global Settings
                const { data: settings } = await getSiteSettings();
                setGlobalSettings(settings);
            } catch (error) {
                console.error('Error fetching footer data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="bg-background py-4"></div>;
    }

    return <FooterClient services={services} settings={globalSettings} />;
};
