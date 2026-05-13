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

    // 4. Capture UTM Parameters
    const getUTMs = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source'),
            utm_medium: params.get('utm_medium'),
            utm_campaign: params.get('utm_campaign'),
            utm_term: params.get('utm_term'),
            utm_content: params.get('utm_content')
        };
    };

    // 5. Integration Injector
    const injectIntegrations = (config) => {
        if (!config || window.mutant_pixel_loaded) return;
        window.mutant_pixel_loaded = true;

        // Google Analytics (GTAG)
        if (config.ga_id) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga_id}`;
            document.head.appendChild(script);
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', config.ga_id);
        }

        // Meta Pixel
        if (config.meta_id) {
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', config.meta_id);
            fbq('track', 'PageView');
        }

        // TikTok Pixel
        if (config.tiktok_id) {
            !function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","trackSelf","untrackSelf"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n;var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load(config.tiktok_id);
            ttq.page();
            }(window, document, 'ttq');
        }
    };

    // 6. Track Function
    const track = async (extra = {}) => {
        const payload = {
            client_id: clientId,
            anonymous_id: anonymousId,
            url: window.location.href,
            referrer: document.referrer || '',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...getUTMs(),
            ...extra
        };

        try {
            const res = await fetch(backendUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            });
            const data = await res.json();
            if (data.success && data.config) {
                injectIntegrations(data.config);
            }
        } catch (e) {
            // Silently fail to not disrupt user experience
        }
    };

    // 7. Initialize
    track({ event_type: 'pageview' });

    // 8. Identity Resolution: Capture emails from form fields
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

    // 9. Intent Tracking: Capture button and link clicks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a');
        if (!target) return;

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
