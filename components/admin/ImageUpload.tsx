'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Upload, X, Link as LinkIcon, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    bucket?: string;
    folder?: string;
}

export function ImageUpload({
    value,
    onChange,
    label,
    bucket = 'assets',
    folder = 'services'
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState<'url' | 'file'>('file');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onChange(publicUrl);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Error uploading image: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const clearImage = () => {
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                {label && <label className="block text-sm font-bold">{label}</label>}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={mode === 'file' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setMode('file')}
                    >
                        <Upload className="w-4 h-4 mr-2" /> File
                    </Button>
                    <Button
                        type="button"
                        variant={mode === 'url' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setMode('url')}
                    >
                        <LinkIcon className="w-4 h-4 mr-2" /> URL
                    </Button>
                </div>
            </div>

            {mode === 'url' ? (
                <input
                    className="w-full p-3 border rounded-lg bg-transparent"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                />
            ) : (
                <div className="space-y-4">
                    {value ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-gray-50 dark:bg-zinc-800">
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full h-8 w-8"
                                onClick={clearImage}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {uploading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-500">Click to upload file</span>
                                </>
                            )}
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </div>
            )}
        </div>
    );
}
