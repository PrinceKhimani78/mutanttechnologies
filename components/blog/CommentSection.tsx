'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, MessageSquare, User, Send } from 'lucide-react';

interface Comment {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
}

interface CommentSectionProps {
    slug: string;
}

export function CommentSection({ slug }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [authorName, setAuthorName] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (slug) fetchComments();
    }, [slug]);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_slug', slug)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setComments(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !authorName.trim()) return;

        setSubmitting(true);
        const { error } = await supabase
            .from('comments')
            .insert([{ post_slug: slug, author_name: authorName, content }]);

        if (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment');
        } else {
            // Refresh comments
            await fetchComments();
            setContent('');
            // Keep author name for convenience
        }
        setSubmitting(false);
    };

    return (
        <section className="mt-16 pt-16 border-t border-gray-200 dark:border-zinc-800">
            <h3 className="text-2xl font-oswald font-bold uppercase mb-8 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" /> Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 mb-12">
                <div className="mb-4">
                    <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-primary transition-colors"
                            placeholder="Your Name"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Comment</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-primary transition-colors resize-none h-32"
                        placeholder="Share your thoughts..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-primary text-white font-bold uppercase tracking-wider rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Post Comment</>}
                </button>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800/50">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                {comment.author_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-baseline gap-3 mb-1">
                                    <h4 className="font-bold font-oswald text-lg">{comment.author_name}</h4>
                                    <span className="text-xs text-gray-400 font-mono">
                                        {new Date(comment.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-zinc-400 leading-relaxed font-light">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
