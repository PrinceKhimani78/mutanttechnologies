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

    // 3.5 Session Recording Buffer
    let rrwebEvents = [];
    const recordUrl = `${scriptUrl.origin}/api/pixel/record`;

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
            if (data.success) {
                if (data.config) injectIntegrations(data.config);
                if (data.popup) renderPopup(data.popup);
            }
        } catch (e) {
            // Silently fail to not disrupt user experience
        }
    };

    // 6.5 Smart Popup Renderer
    const renderPopup = (popupConfig) => {
        if (document.getElementById('mutant-pixel-popup')) return; // Already showing
        
        const overlay = document.createElement('div');
        overlay.id = 'mutant-pixel-popup';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '999999',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: '0', transition: 'opacity 0.3s ease'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#fff', padding: '32px', borderRadius: '16px',
            maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative',
            transform: 'translateY(20px)', transition: 'transform 0.3s ease'
        });

        let contentHtml = '';
        if (popupConfig.type === 'form') {
            contentHtml = `
                <form id="mutant-pixel-form" style="display:flex; flex-direction:column; gap:12px;">
                    <input type="text" name="name" placeholder="Your Name" required style="padding:10px; border:1px solid #ccc; border-radius:6px; font-size:14px; width:100%; box-sizing:border-box;">
                    <input type="email" name="email" placeholder="Your Email" required style="padding:10px; border:1px solid #ccc; border-radius:6px; font-size:14px; width:100%; box-sizing:border-box;">
                    <input type="tel" name="phone" placeholder="Your Phone Number" required style="padding:10px; border:1px solid #ccc; border-radius:6px; font-size:14px; width:100%; box-sizing:border-box;">
                    <input type="url" name="website" placeholder="Your Website URL" required style="padding:10px; border:1px solid #ccc; border-radius:6px; font-size:14px; width:100%; box-sizing:border-box;">
                    <button type="submit" style="padding:12px; background:#ff4a00; color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer; margin-top:8px;">${popupConfig.submit_text || 'Submit'}</button>
                    <p id="mutant-pixel-form-msg" style="display:none; color:green; font-size:14px; margin:0; text-align:center;"></p>
                </form>
            `;
        } else {
            contentHtml = `<a href="${popupConfig.cta_link || '#'}" style="display:block; width:100%; padding:12px; background:#ff4a00; color:#fff; text-align:center; text-decoration:none; border-radius:8px; font-weight:600; box-sizing:border-box;">${popupConfig.cta_text || 'Learn More'}</a>`;
        }

        modal.innerHTML = `
            <button id="mutant-popup-close" style="position:absolute; top:16px; right:16px; background:none; border:none; font-size:24px; cursor:pointer; color:#666;">&times;</button>
            <h2 style="margin:0 0 16px 0; font-size:24px; color:#111; font-weight:700;">${popupConfig.title || 'Special Offer'}</h2>
            <p style="margin:0 0 24px 0; font-size:16px; color:#444; line-height:1.5;">${popupConfig.body || ''}</p>
            ${contentHtml}
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        });

        // Close logic
        const closeBtn = modal.querySelector('#mutant-popup-close');
        closeBtn.onclick = () => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(20px)';
            setTimeout(() => overlay.remove(), 300);
            track({ event_type: 'popup_dismissed', metadata: { popup_title: popupConfig.title } });
        };

        // Handle form submission
        const form = modal.querySelector('#mutant-pixel-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                btn.innerText = 'Submitting...';
                btn.disabled = true;

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                try {
                    await fetch(`${scriptUrl.origin}/api/pixel/submit-popup`, {
                        method: 'POST',
                        body: JSON.stringify({ ...data, client_id: clientId, url: window.location.href }),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const msg = modal.querySelector('#mutant-pixel-form-msg');
                    msg.style.display = 'block';
                    msg.innerText = 'Thanks! We will be in touch shortly.';
                    btn.style.display = 'none';
                    setTimeout(() => closeBtn.click(), 3000);
                } catch (err) {
                    btn.innerText = 'Error. Try Again.';
                    btn.disabled = false;
                }
            };
        }

        // Track view
        track({ event_type: 'popup_viewed', metadata: { popup_title: popupConfig.title } });
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

    // 10. Start Session Recording (rrweb)
    const startRecording = () => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.11/dist/rrweb.min.js';
        script.onload = () => {
            if (window.rrweb) {
                // Wait for the DOM to be fully loaded and React to hydrate before taking the first snapshot
                const initRecord = () => {
                    window.rrweb.record({
                        emit(event) {
                            rrwebEvents.push(event);
                        },
                        recordCanvas: true,
                        collectFonts: true
                    });

                    // Flush events to server every 10 seconds
                    setInterval(flushRecording, 10000);
                    
                    // Flush on exit
                    window.addEventListener('beforeunload', flushRecording);
                };

                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    setTimeout(initRecord, 1000); // Give Next.js a second to hydrate
                } else {
                    window.addEventListener('DOMContentLoaded', () => setTimeout(initRecord, 1000));
                }
            }
        };
        document.head.appendChild(script);
    };

    const flushRecording = () => {
        if (rrwebEvents.length === 0) return;
        const eventsToSend = [...rrwebEvents];
        rrwebEvents = []; // clear buffer

        const payload = {
            client_id: clientId,
            anonymous_id: anonymousId,
            url: window.location.href,
            events: eventsToSend
        };

        // Use keepalive or sendBeacon to ensure it fires on page exit
        fetch(recordUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true
        }).catch(() => {});
    };

    startRecording();

})();
