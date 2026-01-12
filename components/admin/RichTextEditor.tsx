'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, ImageIcon, Link as LinkIcon, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
            },
        },
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            {/* Toolbar */}
            <div className="border-b border-gray-200 dark:border-zinc-800 p-2 flex flex-wrap gap-1 bg-gray-50/50 dark:bg-zinc-900/50">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-primary/10 text-primary' : ''}>
                    <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-primary/10 text-primary' : ''}>
                    <Italic className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1 self-center" />
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : ''}>
                    <Heading1 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : ''}>
                    <Heading2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1 self-center" />
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : ''}>
                    <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : ''}>
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-primary/10 text-primary' : ''}>
                    <Quote className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1 self-center" />
                <Button variant="ghost" size="sm" onClick={setLink} className={editor.isActive('link') ? 'bg-primary/10 text-primary' : ''}>
                    <LinkIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addImage}>
                    <ImageIcon className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1 self-center" />
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor Area */}
            <div className="p-4 min-h-[300px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
