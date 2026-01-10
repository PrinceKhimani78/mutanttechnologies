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
