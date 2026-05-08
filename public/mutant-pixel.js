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

    // 4. Gather the tracking payload
    const payload = {
        client_id: clientId,
        anonymous_id: anonymousId,
        url: window.location.href,
        referrer: document.referrer || '',
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
    };

    // 5. Send the payload to the ingestion API
    // We use sendBeacon if available, as it's reliable for tracking even if the page unloads
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
        navigator.sendBeacon(backendUrl, blob);
    } else {
        // Fallback to fetch
        fetch(backendUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            },
            keepalive: true
        }).catch(err => console.error('Mutant Pixel Error:', err));
    }
})();
