'use client';

import { useState } from 'react';
import { Rocket, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PublishButtonProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function PublishButton({ onSuccess, onError }: PublishButtonProps) {
    const [isPublishing, setIsPublishing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handlePublish = async () => {
        setIsPublishing(true);
        setStatus('idle');
        setMessage('');

        try {
            // Call the webhook on your cPanel server
            const response = await fetch('https://www.mutanttechnologies.com/api/deploy-webhook.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Deploy-Secret': 'mutant-deploy-secret-2024', // Must match webhook secret
                },
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage('Deployment started! Your changes will be live in 2-3 minutes.');
                onSuccess?.();
            } else {
                throw new Error(data.error || 'Deployment failed');
            }
        } catch (error) {
            setStatus('error');
            const errorMessage = error instanceof Error ? error.message : 'Failed to trigger deployment';
            setMessage(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPublishing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publishing...
                    </>
                ) : (
                    <>
                        <Rocket className="w-5 h-5" />
                        Publish Changes to Live Site
                    </>
                )}
            </button>

            {status === 'success' && (
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Deployment Started!</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">{message}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            Check status: <a href="https://github.com/PrinceKhimani78/mutanttechnologies/actions" target="_blank" rel="noopener noreferrer" className="underline">GitHub Actions</a>
                        </p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-900 dark:text-red-100">Deployment Failed</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{message}</p>
                    </div>
                </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Click the button above</li>
                    <li>GitHub Actions rebuilds your site with latest data</li>
                    <li>New files are uploaded to your server</li>
                    <li>Changes appear on live site in 2-3 minutes</li>
                </ol>
            </div>
        </div>
    );
}
