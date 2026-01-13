import { supabase } from '@/lib/supabase';

export async function getSiteSettings() {
    const { data } = await supabase
        .from('site_settings')
        .select('key, value');

    // Transform array to object for easier access
    // e.g. { contact_email: "...", phone_number: "..." }
    const settings: Record<string, string> = {};
    data?.forEach(item => {
        settings[item.key] = item.value;
    });

    return { data: settings };
}

export async function getPageContent(slug: string) {
    const { data } = await supabase
        .from('page_sections')
        .select('section_key, content')
        .eq('page_slug', slug);

    const content: Record<string, any> = {};
    data?.forEach(item => {
        content[item.section_key] = item.content;
    });

    return content;
}
