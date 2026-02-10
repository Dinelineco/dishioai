'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FacebookPixel() {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        import('react-facebook-pixel')
            .then((x) => x.default)
            .then((ReactPixel) => {
                ReactPixel.init('634504209468076'); // Rebellion Pixel ID
                ReactPixel.pageView();
                setLoaded(true);
            });
    }, []);

    useEffect(() => {
        if (!loaded) return;
        import('react-facebook-pixel')
            .then((x) => x.default)
            .then((ReactPixel) => {
                ReactPixel.pageView();
            });
    }, [pathname, loaded]);

    return null;
}
