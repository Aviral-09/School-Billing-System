'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@antigravity/sdk';

export const AntigravityAnalytics = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        analytics.init('14745ed5-cc91-4967-81c9-7696c9b5298b');
    }, []);

    useEffect(() => {
        analytics.track('page_view');
    }, [pathname, searchParams]);

    return null;
};
