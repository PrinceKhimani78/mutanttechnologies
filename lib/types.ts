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
    project_url: string;
    category: string;
    created_at: string;
}
