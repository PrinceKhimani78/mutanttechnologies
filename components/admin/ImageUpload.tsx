'use client';

import { useState, useRef } from 'react';
import { uploadImage } from '@/lib/uploadImage';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    required?: boolean;
}

export function ImageUpload({ value, onChange, label = 'Image', required = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploading(true);

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        const { url, error: uploadError } = await uploadImage(file);

        if (uploadError) {
            setError(uploadError);
            setPreview(value || null);
            setUploading(false);
            return;
        }

        onChange(url);
        setUploading(false);
    };

    const handleRemove = () => {
        setPreview(null);
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {preview ? (
                <div className="relative group">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-zinc-700">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    className="relative w-full h-64 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-primary dark:hover:border-primary transition-colors cursor-pointer group"
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
                        {uploading ? (
                            <>
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <p className="text-sm font-medium">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <Upload className="w-8 h-8 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Click to upload image</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
            />

            {error && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {error}
                </p>
            )}

            {/* Fallback URL input */}
            <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Or paste image URL
                </label>
                <input
                    type="url"
                    value={value || ''}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setPreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
        </div>
    );
}
