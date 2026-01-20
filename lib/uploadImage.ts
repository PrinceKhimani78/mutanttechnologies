import { supabase } from './supabase';

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'images')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
    file: File,
    bucket: string = 'images'
): Promise<{ url: string; error: string | null }> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { url: '', error: 'Please upload an image file' };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { url: '', error: 'Image size must be less than 5MB' };
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            return { url: '', error: error.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { url: publicUrl, error: null };
    } catch (error) {
        console.error('Upload error:', error);
        return { url: '', error: 'Failed to upload image' };
    }
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name (default: 'images')
 */
export async function deleteImage(
    url: string,
    bucket: string = 'images'
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Extract filename from URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName]);

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: 'Failed to delete image' };
    }
}
