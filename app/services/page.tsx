'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Service } from "@/lib/types";
import { getPageContent } from "@/lib/cms";

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [header, setHeader] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: servicesData } = await supabase
                    .from('services')
                    .select('*')
                    .order('id');

                setServices((servicesData || []) as Service[]);

                const pageContent = await getPageContent('services');
                setHeader(pageContent?.header || {});
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-6 py-32 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-20">
                <Services services={services} header={header} />
            </div>
            <Footer />
        </main>
    );
}
