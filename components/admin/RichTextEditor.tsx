'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { DOMParser } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, ImageIcon, Link as LinkIcon, Undo, Redo } from 'lucide-react';
import { marked } from 'marked';

// Matches Markdown syntax (#, ##, **bold**, - item, 1. item, > quote) so text
// pasted from ChatGPT/Claude/etc. - which often lands as plain-text Markdown
// rather than rich HTML - still becomes real headings/bold/lists instead of
// literal "## " characters sitting in a paragraph.
const MARKDOWN_PATTERN = /(^|\n) {0,3}#{1,6}\s|\*\*[^*\n]+\*\*|(^|\n) {0,3}[-*]\s|(^|\n) {0,3}\d+\.\s|(^|\n) {0,3}>\s/;

// Whether pasted HTML already carries real semantic structure (from copying
// directly out of a rendered chat UI). If so, Tiptap's default HTML paste
// handling already does the right thing and we should stay out of the way.
const HTML_HAS_STRUCTURE = /<(h[1-6]|strong|b|ul|ol|blockquote)[\s>]/i;

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
            handlePaste: (view, event) => {
                const clipboardData = event.clipboardData;
                if (!clipboardData) return false;

                const html = clipboardData.getData('text/html');
                const text = clipboardData.getData('text/plain');

                const shouldConvertMarkdown =
                    !!text &&
                    MARKDOWN_PATTERN.test(text) &&
                    !HTML_HAS_STRUCTURE.test(html || '');

                if (!shouldConvertMarkdown) return false; // let Tiptap's default HTML/plain-text paste handle it

                event.preventDefault();
                const parsedHtml = marked.parse(text, { async: false, breaks: true }) as string;

                const dom = document.createElement('div');
                dom.innerHTML = parsedHtml;

                // The post title already renders as the page's one <h1> above the
                // editor content, so any H1 in pasted Markdown (AI tools love
                // opening with "# <Same Title Again>") gets demoted to H2 instead
                // of creating a duplicate, SEO-unfriendly second H1.
                dom.querySelectorAll('h1').forEach((h1) => {
                    const h2 = document.createElement('h2');
                    h2.innerHTML = h1.innerHTML;
                    h1.replaceWith(h2);
                });

                const slice = DOMParser.fromSchema(view.state.schema).parseSlice(dom);
                view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());

                return true;
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
