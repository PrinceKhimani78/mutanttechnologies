import { Service } from './types';

export interface FAQItem {
    question: string;
    answer: string;
}

export const serviceHeroHeadlines: Record<string, { headline: string; highlight: string }> = {
    "web-development": {
        headline: "High-Performance Websites",
        highlight: "Engineered to Convert",
    },
    seo: {
        headline: "Data-Driven SEO Strategies",
        highlight: "That Drive Scalable Revenue",
    },
    "ai-automations": {
        headline: "Intelligent AI Automations",
        highlight: "That 10x Operational Speed",
    },
    "app-development": {
        headline: "Custom Mobile & Web Apps",
        highlight: "Built for Hyper-Growth",
    },
    "brand-identity": {
        headline: "Distinct Brand Identities",
        highlight: "That Command Authority",
    },
    "graphic-design": {
        headline: "High-Impact Visual Design",
        highlight: "That Captivates Audiences",
    },
    "cyber-security": {
        headline: "Proactive Cyber Defense",
        highlight: "Protecting Critical Digital Assets",
    },
    "digital-marketing": {
        headline: "Performance Marketing",
        highlight: "That Accelerates Pipeline",
    },
    geo: {
        headline: "Generative Engine Optimization",
        highlight: "Dominate Next-Gen AI Search",
    },
    "white-label-gohighlevel": {
        headline: "Scale Your Agency With",
        highlight: "White-Label GoHighLevel",
    },
};

export const getServiceFaqs = (service: Service | null | undefined): FAQItem[] => {
    if (!service) return [];

    if (
        service.custom_data?.faqs &&
        Array.isArray(service.custom_data.faqs) &&
        service.custom_data.faqs.length > 0
    ) {
        return service.custom_data.faqs;
    }

    const title = service.title || "Service";

    if (service.slug === 'white-label-gohighlevel') {
        return [
            {
                question: "How does the white-label fulfillment process work?",
                answer: "We operate completely behind the scenes under your agency's brand. You communicate with your client, or invite our PM into your private agency Slack with your domain email. All funnels, snapshots, and automations are transferred directly into your client's sub-account.",
            },
            {
                question: "Do you sign a Non-Disclosure Agreement (NDA) and non-compete?",
                answer: "Yes, always. We sign strict NDAs and non-compete agreements before any work begins. We will never contact, solicit, or reveal your clients.",
            },
            {
                question: "What happens if a client requests revisions?",
                answer: "Every deliverable includes standard revision rounds to ensure 100% alignment with your client's requirements before final sign-off.",
            },
            {
                question: "How fast can you deliver a custom GoHighLevel build?",
                answer: "Full sub-account setups and pipeline automations typically launch within 48 to 72 hours. Complex multi-tier custom funnels and API integrations are usually delivered in 5 to 10 business days.",
            },
        ];
    }

    return [
        {
            question: `How does Mutant Technologies approach ${title}?`,
            answer: `Our approach to ${title} blends deep technical expertise, user analytics, and conversion-focused architecture. We develop bespoke, production-grade solutions tailored directly to your business goals.`,
        },
        {
            question: `How long does a typical ${title} engagement take?`,
            answer: `Most ${title.toLowerCase()} engagements range from 2 to 6 weeks depending on project scope. We provide clear sprint milestones, transparent progress reviews, and direct communication throughout.`,
        },
        {
            question: `Will we own all intellectual property, source code, and design files?`,
            answer: `Yes, 100%. Upon final project delivery and sign-off, full intellectual property, source code, production repositories, and design assets are transferred entirely to your organization with zero lock-in.`,
        },
        {
            question: `Do you provide ongoing post-launch support and optimization?`,
            answer: `Yes. We provide comprehensive post-launch warranties alongside flexible monthly retainers for ongoing feature development, performance monitoring, and conversion rate optimization.`,
        },
    ];
};
