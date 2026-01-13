import { supabase } from '@/lib/supabase';
import { FooterClient } from './FooterClient';
import { Service } from '@/lib/types';
import { getSiteSettings } from '@/lib/cms';

/**
 * Footer Component (Server)
 * 
 * Fetches service date from Supabase and renders the interactive Client Component.
 */
export const Footer = async () => {
    // Fetch services for footer links
    const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('id')
        .limit(5);

    const services = (servicesData || []) as Service[];

    // Fetch Global Settings
    const { data: globalSettings } = await getSiteSettings();

    return <FooterClient services={services} settings={globalSettings} />;
};
