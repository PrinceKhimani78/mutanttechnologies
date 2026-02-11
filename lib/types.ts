export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string; // HTML string from Tiptap
    cover_image: string;
    category: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;

}

export interface PortfolioProject {
    id: string;
    title: string;
    description: string;
    image_url: string;
    additional_images?: string[]; // Array of additional image URLs (max 4, total 5)
    project_url: string;
    category: string;
    created_at: string;
}

export interface Service {
    id: string;
    slug: string;
    title: string;
    short_description: string;
    description: string;
    icon: string; // Stored as string name in DB
    color: string;
    bg_gradient: string;
    features: (string | { title: string; description: string; image?: string })[]; // Support both for compatibility
    content: string;
    tools: string[]; // JSONB in DB
    process: { step: string; title: string; description: string }[]; // JSONB in DB
    benefits: { title: string; description: string }[]; // JSONB in DB
    created_at: string;
    // Image fields for service detail pages
    hero_image?: string;
    benefits_image?: string;
    feature_mockup_image?: string;
    video_url?: string; // Additional field for future use
}
