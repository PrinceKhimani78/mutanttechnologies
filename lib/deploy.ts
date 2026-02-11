export async function triggerDeploy() {
    try {
        const response = await fetch('https://www.mutanttechnologies.com/api/deploy-webhook.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Deploy-Secret': 'mutant-deploy-secret-2024',
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Deployment trigger failed:', error);
        return { success: false, error: 'Failed to reach deployment server' };
    }
}
