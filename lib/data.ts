import { Monitor, Search, BarChart, Shield, Layout } from 'lucide-react';

export const services = [
    {
        slug: "web-development",
        id: "01",
        title: "Web Development",
        shortDescription: "Custom, high-performance websites built with modern technologies like Next.js and React.",
        description: "We build scalable, high-performance websites using the latest technologies like Next.js, React, and Node.js. Our solutions are designed to grow with your business.",
        icon: Monitor,
        color: "bg-blue-600",
        features: ["Custom Web Apps", "E-commerce Solutions", "CMS Integration", "API Development"],
        bgGradient: "from-blue-600/20 to-purple-600/20",
        content: "Your website is your digital storefront. We don't just write code; we engineer experiences. Our web development team focuses on performance, accessibility, and scalability to ensure your business creates a lasting impression.",
        tools: ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
        faqs: [
            { question: "How long does it take to build a website?", answer: "It depends on the complexity. A standard business site takes 2-4 weeks, while a custom web app can take 8-12 weeks." },
            { question: "Do you provide hosting?", answer: "Yes, we can set up hosting for you on platforms like Vercel, AWS, or your preferred provider." },
            { question: "Is the site mobile-friendly?", answer: "Absolutely. We follow a mobile-first approach to ensure your site looks great on all devices." }
        ],
        benefits: [
            { title: "Blazing Fast Speed", description: "Optimized for core web vitals and instant load times." },
            { title: "SEO Ready", description: "Built with search engines in mind structure from day one." },
            { title: "Scalable Architecture", description: "Code that grows with your user base without breaking." }
        ]
    },
    {
        slug: "seo-optimization",
        id: "02",
        title: "SEO Optimization",
        shortDescription: "Data-driven strategies to boost your search rankings and drive organic traffic.",
        description: "Rank higher on search engines and drive organic traffic with our data-driven SEO strategies.",
        icon: Search,
        color: "bg-orange-600",
        features: ["Keyword Research", "On-Page Optimization", "Technical SEO Audits", "Link Building"],
        bgGradient: "from-orange-600/20 to-red-600/20",
        content: "Visibility is key in the digital age. Our SEO experts analyze search trends and algorithms to put your brand in front of the right audience at the right time.",
        tools: ["SEMRush", "Ahrefs", "Google Analytics", "Search Console", "Screaming Frog"],
        faqs: [
            { question: "How soon can I see results?", answer: "SEO is a long-term strategy. Typically, noticeable improvements happen within 3-6 months." },
            { question: "Do you guarantee #1 ranking?", answer: "No one can guarantee #1 rankings, but we guarantee best practices that maximize your chances." }
        ],
        benefits: [
            { title: "Higher Visibility", description: "Get found by customers who are actively looking for you." },
            { title: "Quality Traffic", description: "Attract visitors who are actually interested in your services." },
            { title: "Long-term ROI", description: "Organic traffic continues to pay off long after the initial work." }
        ]
    },
    {
        slug: "digital-marketing",
        id: "03",
        title: "Digital Marketing",
        shortDescription: "Comprehensive marketing campaigns that convert visitors into loyal customers.",
        description: "Comprehensive marketing campaigns that convert visitors into loyal customers. From social media to PPC, we handle it all.",
        icon: BarChart,
        color: "bg-purple-600",
        features: ["Social Media Marketing", "PPC Campaigns", "Email Marketing", "Content Strategy"],
        bgGradient: "from-purple-600/20 to-pink-600/20",
        content: "Marketing is more than just ads; it's about storytelling. We help you craft a compelling narrative that resonates with your audience.",
        tools: ["Meta Ads", "Google Ads", "Mailchimp", "HubSpot", "Canva"],
        faqs: [
            { question: "Which platform is best for my business?", answer: "It depends on your audience. B2B often works best on LinkedIn, while B2C shines on Instagram/TikTok." },
            { question: "What is your minimum budget?", answer: "We work with various budgets, but generally recommend starting with at least $1000/mo for ad spend." }
        ],
        benefits: [
            { title: "Targeted Reach", description: "Show your message only to the people most likely to buy." },
            { title: "Brand Authority", description: "Establish your business as a leader in your industry." },
            { title: "Measurable Results", description: "Track every click and conversion to know your exact ROI." }
        ]
    },
    {
        slug: "cyber-security",
        id: "04",
        title: "Cyber Security",
        shortDescription: "Protect your digital assets with our robust security audits and solutions.",
        description: "Protect your digital assets with our robust security audits and solutions. We ensure your business is safe from threats.",
        icon: Shield,
        color: "bg-red-600",
        features: ["Vulnerability Assessment", "Penetration Testing", "Security Audits", "Compliance"],
        bgGradient: "from-red-600/20 to-orange-600/20",
        content: "In an interconnected world, security is non-negotiable. We identify vulnerabilities before they can be exploited.",
        tools: ["Burp Suite", "Nmap", "Metasploit", "Wireshark", "Kali Linux"],
        faqs: [
            { question: "How often should we audit?", answer: "We recommend a comprehensive audit at least once a year, or after major system updates." },
            { question: "What if we get hacked?", answer: "We implement incident response plans to minimize damage and recover data quickly." }
        ],
        benefits: [
            { title: "Data Protection", description: "Keep your sensitive customer and business data safe." },
            { title: "Compliance", description: "Meet industry standards like GDPR, HIPAA, and PCI-DSS." },
            { title: "Peace of Mind", description: "Focus on your business knowing your digital back is covered." }
        ]
    },
    {
        slug: "ui-ux-design",
        id: "05",
        title: "UI/UX Design",
        shortDescription: "User-centric designs that provide intuitive and engaging digital experiences.",
        description: "User-centric designs that provide intuitive and engaging digital experiences. We craft interfaces that users love.",
        icon: Layout,
        color: "bg-emerald-600",
        features: ["User Research", "Wireframing", "Prototyping", "Visual Design"],
        bgGradient: "from-emerald-600/20 to-teal-600/20",
        content: "Design is how it works, not just how it looks. We apply design thinking to solve complex problems.",
        tools: ["Figma", "Adobe XD", "Sketch", "Illustrator", "Photoshop"],
        faqs: [
            { question: "Do you design for mobile apps?", answer: "Yes, we design for iOS, Android, and cross-platform mobile applications." },
            { question: "Can you redesign my existing app?", answer: "We specialize in modernizing legacy interfaces to improve usability and aesthetics." }
        ],
        benefits: [
            { title: "User Retention", description: "Great experience keeps users coming back." },
            { title: "Conversion Rate", description: "Intuitive flows lead to higher sign-ups and sales." },
            { title: "Brand Image", description: "Look professional, trustworthy, and modern." }
        ]
    },
];
