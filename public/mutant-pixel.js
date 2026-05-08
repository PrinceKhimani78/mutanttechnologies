(function () {
    // 1. Identify the script tag and extract the client ID
    const currentScript = document.currentScript || document.querySelector('script[src*="mutant-pixel.js"]');
    if (!currentScript) return;

    const clientId = currentScript.getAttribute('data-client-id');
    if (!clientId) {
        console.error('Mutant Pixel Error: Missing data-client-id attribute.');
        return;
    }

    // 2. Identify the backend API URL dynamically based on where the script is hosted
    const scriptUrl = new URL(currentScript.src);
    const backendUrl = `${scriptUrl.origin}/api/pixel/track`;

    // 3. Generate or retrieve an anonymous ID for the visitor
    let anonymousId = localStorage.getItem('mutant_pixel_anon_id');
    if (!anonymousId) {
        anonymousId = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('mutant_pixel_anon_id', anonymousId);
    }

    // 4. Track Function
    const track = (extra = {}) => {
        const payload = {
            client_id: clientId,
            anonymous_id: anonymousId,
            url: window.location.href,
            referrer: document.referrer || '',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...extra
        };

        const body = JSON.stringify(payload);
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon(backendUrl, body);
        } else {
            fetch(backendUrl, {
                method: 'POST',
                body,
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            }).catch(() => {});
        }
    };

    // 5. Track Initial Pageview
    track({ event_type: 'pageview' });

    // 6. Identity Resolution: Capture emails from form fields
    document.addEventListener('blur', (e) => {
        if (e.target && (e.target.type === 'email' || e.target.name?.includes('email'))) {
            const val = e.target.value?.trim();
            if (val && val.includes('@')) {
                track({
                    event_type: 'identity',
                    email: val.toLowerCase()
                });
            }
        }
    }, true);

    // 7. Intent Tracking: Capture button and link clicks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a');
        if (!target) return;

        // Skip internal dashboard links or obvious nav items if needed, but for now we track all
        const text = (target.innerText || target.value || target.getAttribute('aria-label') || 'unnamed').trim().substring(0, 50);
        
        track({
            event_type: 'click',
            metadata: {
                text: text,
                tag: target.tagName.toLowerCase(),
                id: target.id || undefined,
                href: target.href || undefined
            }
        });
    }, true);

})();
