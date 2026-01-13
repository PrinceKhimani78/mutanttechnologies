import { supabase } from '@/lib/supabase';
import { FooterClient } from './FooterClient';
import { Service } from '@/lib/types';

/**
 * Footer Component (Server)
 * 
 * Fetches service date from Supabase and renders the interactive Client Component.
 */
export const Footer = async () => {
    // Fetch services for footer links
    const { data } = await supabase
        .from('services')
        .select('*')
        .order('id')
        .limit(5);

    const services = (data || []) as Service[];

    return <FooterClient services={services} />;
};
