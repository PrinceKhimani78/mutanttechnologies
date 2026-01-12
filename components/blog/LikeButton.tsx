'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
    slug: string;
}

export function LikeButton({ slug }: LikeButtonProps) {
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        fetchLikes();
        // Check local storage to see if user already liked
        const hasLiked = localStorage.getItem(`liked_${slug}`);
        if (hasLiked) setLiked(true);
    }, [slug]);

    const fetchLikes = async () => {
        const { data, error } = await supabase
            .from('post_likes')
            .select('count')
            .eq('slug', slug)
            .single();

        if (data) {
            setLikes(data.count);
        } else if (error && error.code === 'PGRST116') {
            // No row found, means 0 likes
            setLikes(0);
        }
        setLoading(false);
    };

    const handleLike = async () => {
        if (liked) return; // Prevent multiple likes from same browser

        // Optimistic update
        setLikes(prev => prev + 1);
        setLiked(true);
        localStorage.setItem(`liked_${slug}`, 'true');

        // Upsert to handle first like or increment
        // We use a custom RPC or just standard upsert logic. 
        // For simplicity with standard RLS, we might need a trigger or check.
        // But since we enabled public update/insert, let's try direct manipulation.
        // Actually, race conditions happen here. Standard Supabase way is an RPC function for atomic increment.
        // But for this MVP without creating RPC functions (user needs SQL editor access), 
        // we'll do a simple fetch-then-update or insert if missing.

        // Better approach for "Insert on Conflict" with simple table:
        // Attempt to insert with count=1. If conflict (slug exists), update count = count + 1?
        // Supabase/Postgres doesn't support "increment on conflict" easily in one generic REST call without RPC.

        // Fallback Strategy: Read -> Calculate -> Write. (Not atomic, but functional for MVP)
        // Or simpler: Just rely on the public `update` policy we made.

        try {
            // Check if row exists
            const { data: existing } = await supabase.from('post_likes').select('count').eq('slug', slug).single();

            if (existing) {
                await supabase
                    .from('post_likes')
                    .update({ count: existing.count + 1 })
                    .eq('slug', slug);
            } else {
                await supabase
                    .from('post_likes')
                    .insert([{ slug, count: 1 }]);
            }
        } catch (err) {
            console.error('Error liking post:', err);
            // Revert on error
            setLikes(prev => prev - 1);
            setLiked(false);
            localStorage.removeItem(`liked_${slug}`);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={liked || loading}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 group",
                liked
                    ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-500"
                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500"
            )}
        >
            <Heart className={cn("w-5 h-5 transition-transform", liked && "fill-current", !liked && "group-hover:scale-110")} />
            <span className="font-mono font-bold">{likes}</span>
            <span className="sr-only">Likes</span>
        </button>
    );
}
