export const analytics = {
    init: (apiKey: string) => {
        console.log('Antigravity Analytics initialized with key:', apiKey);
        if (typeof window !== 'undefined') {
            (window as unknown as Record<string, string>)._antigravity_key = apiKey;
        }
    },
    track: (event: string, properties?: Record<string, unknown>) => {
        console.log('Antigravity Analytics track:', event, properties);
        // Simple mock implementation that logs to console
        if (typeof window !== 'undefined') {
            const payload = {
                event,
                properties,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                key: (window as unknown as Record<string, string>)._antigravity_key
            };
            // In a real SDK, this would send data to a server
            console.debug('[Antigravity SDK]', payload);
        }
    }
};
