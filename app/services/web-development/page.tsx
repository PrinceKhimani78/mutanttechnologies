
import { Metadata } from 'next';
import WebDesignClient from '@/components/WebDesignClient';

export const metadata: Metadata = {
    title: 'Web Development | Mutant Technologies',
    description: 'Premier web development services. We build high-performance, scalable, and stunning websites.',
};

export default function WebDevelopmentPage() {
    return <WebDesignClient />;
}
