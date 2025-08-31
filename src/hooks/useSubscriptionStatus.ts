import { useState, useEffect } from 'react';
import { Get } from '../config/apiMethods';

export const useSubscriptionStatus = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (!user._id) {
                    setIsSubscribed(false);
                    setLoading(false);
                    return;
                }

                const response = await Get('/payment/user-subscription-status', null, null);
                setIsSubscribed(response?.data?.isSubscribed || false);
            } catch (error) {
                console.error('Error checking subscription:', error);
                setIsSubscribed(false);
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, []);

    return { isSubscribed, loading };
};
