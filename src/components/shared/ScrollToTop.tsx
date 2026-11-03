import { useEffect } from 'react';
import { useLocation } from '../../lib/navigation';

/**
 * Component that scrolls to the top of the page when the route changes
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default ScrollToTop;
