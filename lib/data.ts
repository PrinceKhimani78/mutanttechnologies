import { Monitor, Search, BarChart, Shield, Layout } from 'lucide-react';

export const services = [
    {
        slug: "web-development",
        id: "01",
        title: "Web Development",
        shortDescription: "Custom, high-performance websites built with modern technologies like Next.js and React. We build scalable solutions that grow with your business.",
        description: "We build scalable, high-performance websites using the latest technologies like Next.js, React, and Node.js.",
        icon: Monitor,
        color: "bg-blue-600",
        features: ["Custom Web Apps", "E-commerce Solutions", "CMS Integration", "API Development"],
        bgGradient: "from-blue-600/20 to-purple-600/20",
        content: "Your website is your digital storefront. We don't just write code; we engineer experiences. Our web development team focuses on performance, accessibility, and scalability to ensure your business creates a lasting impression."
    },
    {
        slug: "seo-optimization",
        id: "02",
        title: "SEO Optimization",
        shortDescription: "Data-driven strategies to boost your search rankings and drive organic traffic. We analyze, optimize, and dominate the SERPs.",
        description: "Rank higher on search engines and drive organic traffic with our data-driven SEO strategies.",
        icon: Search,
        color: "bg-orange-600",
        features: ["Keyword Research", "On-Page Optimization", "Technical SEO Audits", "Link Building"],
        bgGradient: "from-orange-600/20 to-red-600/20",
        content: "Visibility is key in the digital age. Our SEO experts analyze search trends and algorithms to put your brand in front of the right audience at the right time. We focus on sustainable, long-term growth."
    },
    {
        slug: "digital-marketing",
        id: "03",
        title: "Digital Marketing",
        shortDescription: "Comprehensive marketing campaigns that convert visitors into loyal customers. From social media to PPC, we handle it all.",
        description: "Comprehensive marketing campaigns that convert visitors into loyal customers.",
        icon: BarChart,
        color: "bg-purple-600",
        features: ["Social Media Marketing", "PPC Campaigns", "Email Marketing", "Content Strategy"],
        bgGradient: "from-purple-600/20 to-pink-600/20",
        content: "Marketing is more than just ads; it's about storytelling. We help you craft a compelling narrative that resonates with your audience and drives conversions across all digital channels."
    },
    {
        slug: "cyber-security",
        id: "04",
        title: "Cyber Security",
        shortDescription: "Protect your digital assets with our robust security audits and solutions. We ensure your business is safe from threats.",
        description: "Protect your digital assets with our robust security audits and solutions.",
        icon: Shield,
        color: "bg-red-600",
        features: ["Vulnerability Assessment", "Penetration Testing", "Security Audits", "Compliance"],
        bgGradient: "from-red-600/20 to-orange-600/20",
        content: "In an interconnected world, security is non-negotiable. We identify vulnerabilities before they can be exploited, ensuring your data and your customers' trust remain intact."
    },
    {
        slug: "ui-ux-design",
        id: "05",
        title: "UI/UX Design",
        shortDescription: "User-centric designs that provide intuitive and engaging digital experiences. We craft interfaces that users love.",
        description: "User-centric designs that provide intuitive and engaging digital experiences.",
        icon: Layout,
        color: "bg-emerald-600",
        features: ["User Research", "Wireframing", "Prototyping", "Visual Design"],
        bgGradient: "from-emerald-600/20 to-teal-600/20",
        content: "Design is how it works, not just how it looks. We apply design thinking to solve complex problems, creating interfaces that are intuitive, accessible, and delightful to use."
    },
];
