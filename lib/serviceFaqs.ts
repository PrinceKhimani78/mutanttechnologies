import { Service } from './types';

export interface FAQItem {
    question: string;
    answer: string;
}

export const serviceHeroHeadlines: Record<string, { headline: string; highlight: string; subtitle?: string }> = {
    "web-development": {
        headline: "Website Development Company",
        highlight: "in Rajkot",
        subtitle: "High-Performance Websites Engineered to Convert — Fast, responsive, conversion-focused websites built with Next.js, WordPress, and Shopify.",
    },
    seo: {
        headline: "SEO Company",
        highlight: "in Rajkot",
        subtitle: "Dominant Search Rankings That Drive Revenue — Data-backed organic search optimization for local Rajkot and global ecommerce search.",
    },
    "ai-automations": {
        headline: "AI Automation Agency",
        highlight: "in India",
        subtitle: "Intelligent Workflows That Save 20+ Hours Weekly — End-to-end WhatsApp, CRM, and internal operations automation.",
    },
    "app-development": {
        headline: "Mobile App Development Company",
        highlight: "in Rajkot",
        subtitle: "Next-Gen iOS & Android Apps Built to Scale — High-performance mobile applications engineered for seamless user experiences.",
    },
    "brand-identity": {
        headline: "Branding Agency",
        highlight: "in Rajkot",
        subtitle: "Iconic Visual Identities That Command Attention — Comprehensive brand guidelines, logo systems, and visual narratives.",
    },
    "graphic-design": {
        headline: "Graphic Design Company",
        highlight: "in Rajkot",
        subtitle: "Stunning Visual Design That Communicates Value — High-impact marketing collateral, digital assets, and print media.",
    },
    "cyber-security": {
        headline: "VAPT & Cyber Security Services",
        highlight: "in Rajkot",
        subtitle: "Enterprise-Grade Threat Defense & Compliance — Penetration testing, vulnerability assessments, and infrastructure hardening.",
    },
    "digital-marketing": {
        headline: "Digital Marketing Agency",
        highlight: "in Rajkot",
        subtitle: "Performance Marketing That Multiplies ROI — Targeted Google Ads, Meta campaigns, and conversion rate optimization.",
    },
    geo: {
        headline: "Generative Engine Optimization (GEO)",
        highlight: "Agency in India",
        subtitle: "Get Recommended by ChatGPT, Perplexity & AI Search Engines — Optimize your brand authority for AI-powered answer engines.",
    },
    "white-label-gohighlevel": {
        headline: "White Label GoHighLevel Agency",
        highlight: "Partner for Developers",
        subtitle: "Deliver GHL Funnels, Automations & Snapshots at Scale — 100% white-label fulfillment under your agency's brand.",
    },
};

const bespokeServiceFaqs: Record<string, FAQItem[]> = {
    "web-development": [
        {
            question: "Which frameworks and platforms do you use for website development?",
            answer: "We specialize in modern, high-performance tech stacks including Next.js, React, Node.js, and TypeScript for custom web applications, alongside WordPress and Shopify for headless or traditional CMS needs.",
        },
        {
            question: "How do you ensure our website loads fast and performs well on mobile?",
            answer: "Every site is built mobile-first with optimized Core Web Vitals (LCP, FID, CLS), automated image compression, minimal script payloads, and server-side rendering to ensure sub-second page load times.",
        },
        {
            question: "Can our internal team easily edit and publish content after launch?",
            answer: "Yes. We integrate intuitive CMS workflows (such as Supabase, Strapi, or WordPress) with modular component blocks so your marketing team can publish pages, blogs, and case studies without touching code.",
        },
        {
            question: "Do you handle domain configuration, SSL, and hosting setups?",
            answer: "Yes. We configure your DNS records, SSL encryption, CDN edge routing (via Vercel or Cloudflare), and production environments as part of our full-service deployment.",
        },
    ],
    "app-development": [
        {
            question: "Do you build native mobile apps or cross-platform applications?",
            answer: "We develop cross-platform mobile apps using React Native and Flutter, which allows a single codebase to deploy seamlessly on both iOS and Android with native performance and lower development costs.",
        },
        {
            question: "Do you handle the Apple App Store and Google Play Store submission process?",
            answer: "Yes. We manage end-to-end store provisioning, including developer certificates, app metadata, privacy policy disclosures, screenshots, and review compliance until your app is live.",
        },
        {
            question: "Can your mobile apps work offline and support real-time push notifications?",
            answer: "Yes. We implement local caching architectures (like SQLite/WatermelonDB) for offline resilience and integrate Firebase Cloud Messaging (FCM) or OneSignal for targeted push notifications.",
        },
        {
            question: "How do you secure user data and authentication in mobile apps?",
            answer: "We implement industry-standard OAuth2/JWT authentication, biometrics (Face ID / Fingerprint), encrypted local storage, and secure HTTPS API endpoints to safeguard sensitive user information.",
        },
    ],
    seo: [
        {
            question: "How long does it take to see tangible ranking improvements from SEO?",
            answer: "While technical fixes and on-page optimization show initial crawl improvements within 3 to 6 weeks, competitive organic keyword ranking gains and sustained traffic growth typically compound over 3 to 6 months.",
        },
        {
            question: "What is the difference between your local SEO and national/ecommerce SEO?",
            answer: "Local SEO focuses on Google Business Profile optimization, local Rajkot/regional citations, and geo-targeted keywords. Ecommerce and national SEO prioritize deep site architecture, schema markup, product page optimization, and high-authority link acquisition.",
        },
        {
            question: "Do you perform technical SEO audits and fix Core Web Vitals issues?",
            answer: "Yes. We audit and resolve indexation bottlenecks, crawl errors, canonical mismatches, slow server response times, JavaScript rendering issues, and structured data errors.",
        },
        {
            question: "What kind of monthly SEO reporting will we receive?",
            answer: "You receive transparent monthly reports detailing organic impression trends, keyword position shifts, organic conversion tracking, backlink acquisition, and actionable priorities for the upcoming sprint.",
        },
    ],
    "digital-marketing": [
        {
            question: "Which advertising platforms deliver the highest ROI for our business?",
            answer: "For high-intent, immediate demand capture, Google Search Ads excel. For brand discovery, visual product demonstration, and audience remarketing, Meta (Instagram/Facebook) and LinkedIn Ads yield superior returns.",
        },
        {
            question: "How do you optimize ad spend to ensure positive return on ad spend (ROAS)?",
            answer: "We deploy structured A/B testing on ad creatives, compelling value hooks, precise demographic targeting, and negative keyword filtering to eliminate wasted budget and maximize conversion efficiency.",
        },
        {
            question: "Do you install and configure conversion tracking pixels and Server-Side GTM?",
            answer: "Yes. We configure Google Tag Manager (GTM), Meta Conversions API (CAPI), and GA4 event tracking to ensure accurate, privacy-compliant attribution despite browser ad-blockers and iOS privacy changes.",
        },
        {
            question: "Who creates the ad creatives, copywriting, and landing pages?",
            answer: "Mutant Technologies provides full-funnel creative execution: high-converting direct-response copywriting, visual ad graphics/video edits, and dedicated conversion-optimized landing pages.",
        },
    ],
    "brand-identity": [
        {
            question: "What deliverables are included in a comprehensive brand identity package?",
            answer: "Our package includes primary and secondary logos, brand style guidelines, typography hierarchy, curated color systems, iconography, social media kit templates, and business stationery designs.",
        },
        {
            question: "What file formats do you deliver for our logo and visual assets?",
            answer: "You receive scalable vector files (AI, EPS, SVG, PDF) for professional print and signage, alongside optimized high-resolution raster files (PNG with transparency, JPG, WebP) for digital and web use.",
        },
        {
            question: "How do you ensure the brand identity aligns with our target market?",
            answer: "We begin with a brand discovery session examining your industry landscape, core value proposition, and competitor positioning to craft an identity that resonates specifically with your ideal buyers.",
        },
        {
            question: "How many design directions and revision rounds are provided?",
            answer: "We deliver multiple distinct initial concept directions. Once you select your preferred visual direction, we refine it through collaborative revision rounds to achieve perfection.",
        },
    ],
    "graphic-design": [
        {
            question: "What types of graphic design projects do you handle?",
            answer: "We design social media graphics, corporate brochures, investor pitch decks, product packaging, exhibition banners, infographics, email newsletter templates, and digital advertising collateral.",
        },
        {
            question: "What is your standard turnaround time for design requests?",
            answer: "Standard graphics are typically delivered within 24 to 48 business hours. Multi-page projects like company brochures or custom pitch decks usually require 3 to 5 business days.",
        },
        {
            question: "Do we get full access to editable source files?",
            answer: "Yes. You receive organized, fully editable source files (Adobe Illustrator, Photoshop, Figma, or InDesign) with every completed project.",
        },
        {
            question: "Can you design for both digital displays and high-resolution print?",
            answer: "Yes. We adhere strictly to color profile standards — CMYK with bleed and trim marks for commercial offset printing, and sRGB/WebP for high-density digital displays.",
        },
    ],
    geo: [
        {
            question: "What is Generative Engine Optimization (GEO) and how does it differ from SEO?",
            answer: "Traditional SEO optimizes for blue links on Google search result pages. GEO optimizes your brand's presence, authority, and citations so large language models (ChatGPT, Claude, Perplexity, Gemini) recommend your company as the top answer.",
        },
        {
            question: "How do AI search engines decide which companies to recommend?",
            answer: "AI engines synthesize consensus from authoritative industry databases, entity knowledge graphs, structured JSON-LD schemas, digital PR mentions, and comprehensive semantic content coverage.",
        },
        {
            question: "How do you optimize our website for AI answer engines?",
            answer: "We structure your web content with dense factual data, quotation-friendly expert insights, comprehensive schema graphs (Organization, LocalBusiness, Service, FAQ), and high-authority entity citations.",
        },
        {
            question: "Can we measure and track our brand visibility in AI-generated answers?",
            answer: "Yes. We run proprietary prompt benchmarking across major AI platforms to measure recommendation frequency, citation placement, and brand sentiment compared to key competitors.",
        },
    ],
    "ai-automations": [
        {
            question: "What business processes can be automated with AI and custom workflows?",
            answer: "Common workflows include automated lead qualification on WhatsApp, CRM pipeline progression, appointment booking and reminder sequences, invoice parsing, customer support triage, and cross-platform data syncing.",
        },
        {
            question: "Which tools and APIs do you use to build automation workflows?",
            answer: "We utilize the WhatsApp Business Cloud API, OpenAI/Anthropic APIs, Make.com, Zapier, n8n, and custom Node.js/Python serverless webhooks connected directly into your database or CRM.",
        },
        {
            question: "How much time can our team realistically save with AI automations?",
            answer: "Most client organizations eliminate between 15 and 25 hours of repetitive manual administrative work per team member every single week, allowing staff to focus on high-value client interactions.",
        },
        {
            question: "What happens if a third-party API goes down or changes?",
            answer: "We engineer all automations with exception handling, retry logic, and instant alert channels (such as Slack or email notifications) so workflow hiccups are intercepted and resolved without data loss.",
        },
    ],
    "cyber-security": [
        {
            question: "What is the difference between Vulnerability Assessment and Penetration Testing (VAPT)?",
            answer: "A Vulnerability Assessment uses automated tools to identify potential weaknesses in your network or application. Penetration Testing involves ethical hackers actively attempting to exploit those weaknesses to demonstrate real-world impact.",
        },
        {
            question: "Will security testing disrupt our live website, application, or business operations?",
            answer: "No. We schedule penetration tests during low-traffic windows or conduct them against designated staging environments with controlled attack payloads to prevent any downtime or data corruption.",
        },
        {
            question: "Which industry compliance frameworks do your audits align with?",
            answer: "Our security assessments adhere to OWASP Top 10, SANS Top 25, ISO 27001, CERT-IN guidelines, GDPR, and HIPAA compliance requirements.",
        },
        {
            question: "Do you help our engineering team fix the discovered vulnerabilities?",
            answer: "Yes. We deliver a detailed remediation report with severity scoring (CVSS), proof-of-concept exploits, and step-by-step code/configuration recommendations, followed by complimentary re-testing to verify fixes.",
        },
    ],
    "white-label-gohighlevel": [
        {
            question: "How does the white-label fulfillment process work for agency partners?",
            answer: "We operate 100% behind the scenes under your agency's brand name. You manage client relationships, while our dedicated GHL developers build funnels, workflows, pipelines, and integrations directly inside your agency's sub-accounts.",
        },
        {
            question: "Do you sign a Non-Disclosure Agreement (NDA) and non-compete?",
            answer: "Yes, unconditionally. We execute binding NDAs and non-compete agreements before reviewing any project details. We will never contact, solicit, or disclose your agency's clients.",
        },
        {
            question: "How quickly can you deliver a custom GoHighLevel build or snapshot?",
            answer: "Standard sub-account setups, pipeline automations, and custom landing pages launch within 48 to 72 hours. Complex multi-tier custom funnels, API integrations, and SaaS mode configurations take 5 to 10 business days.",
        },
        {
            question: "How do we communicate and track tasks with your developers?",
            answer: "You can invite our team into your agency's Slack, ClickUp, Asana, or Monday board, or manage requests via our dedicated agency partner portal with daily progress updates.",
        },
    ],
};

export const getServiceFaqs = (service: Service | null | undefined): FAQItem[] => {
    if (!service) return [];

    // 1. Database-saved FAQs win if present (enables night-shift/CMS overrides)
    if (
        service.custom_data?.faqs &&
        Array.isArray(service.custom_data.faqs) &&
        service.custom_data.faqs.length > 0
    ) {
        return service.custom_data.faqs;
    }

    if (
        (service as any).faqs &&
        Array.isArray((service as any).faqs) &&
        (service as any).faqs.length > 0
    ) {
        return (service as any).faqs;
    }

    // 2. Return bespoke, service-specific questions
    if (service.slug && bespokeServiceFaqs[service.slug]) {
        return bespokeServiceFaqs[service.slug];
    }

    const title = service.title || "Service";
    return [
        {
            question: `What is the typical timeline for ${title} delivery?`,
            answer: `Project timelines range from 2 to 6 weeks depending on defined technical deliverables and scope milestones.`,
        },
        {
            question: `Who manages quality assurance and delivery for ${title}?`,
            answer: `Dedicated senior specialists conduct technical reviews, QA audits, and testing before final project presentation.`,
        },
    ];
};
