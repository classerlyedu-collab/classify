import { useState, useEffect } from 'react';
import { Get } from '../config/apiMethods';

const readCachedSubscribed = (): boolean | null => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (typeof user?.isSubscribed === "boolean") return user.isSubscribed;
        if (typeof user?.profile?.isSubscribed === "boolean") return user.profile.isSubscribed;
        return null;
    } catch {
        return null;
    }
};

export const useSubscriptionStatus = () => {
    const initial = readCachedSubscribed();
    // If we have a cached value, treat it as "ready" so the UI doesn't flash.
    const [isSubscribed, setIsSubscribed] = useState<boolean>(initial ?? false);
    const [loading, setLoading] = useState<boolean>(initial === null);

    useEffect(() => {
        let cancelled = false;
        const checkSubscription = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (!user._id) {
                    if (!cancelled) {
                        setIsSubscribed(false);
                        setLoading(false);
                    }
                    return;
                }

                const response = await Get('/payment/user-subscription-status', null, null);
                if (cancelled) return;
                const next = response?.data?.isSubscribed || false;
                setIsSubscribed(next);

                // Refresh cache so the next mount has correct state immediately.
                try {
                    const cached = JSON.parse(localStorage.getItem("user") || "{}");
                    if (cached && typeof cached === "object") {
                        cached.isSubscribed = next;
                        localStorage.setItem("user", JSON.stringify(cached));
                    }
                } catch {
                    /* ignore */
                }
            } catch (error) {
                if (!cancelled) setIsSubscribed(initial ?? false);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        checkSubscription();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { isSubscribed, loading };
};
