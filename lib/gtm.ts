import { sendGTMEvent } from '@next/third-parties/google';

type GTMEvent = {
    event: string;
    [key: string]: any;
};

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
    const eventData: GTMEvent = {
        event: eventName,
        ...params,
    };
    console.log('GTM Manual Event:', eventData); // Debug log
    sendGTMEvent(eventData);
};
