import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RouteName } from '../routes/RouteNames';
import { UseStateContext } from '../context/ContextProvider';
import { Get } from '../config/apiMethods';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
    const { role } = UseStateContext();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Routes that don't require subscription
    const publicRoutes = [
        RouteName.AUTH_SCREEN,
        RouteName.SUBSCRIPTION,
        RouteName.COUPON,
        RouteName.CREATE_COUPON,
        RouteName.GET_COUPON,
        RouteName.DELETE_COUPON,
        RouteName.USE_COUPON
    ];

    // Check if current route is public
    const isPublicRoute = publicRoutes.includes(location.pathname as any);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!user || isPublicRoute) {
                setIsLoading(false);
                return;
            }

            try {

                const response = await Get('/payment/user-subscription-status', null, null);

                if (response && response.data && response.data.isSubscribed) {
                    setIsSubscribed(true);
                } else {
                    setIsSubscribed(false);
                    // Redirect to subscription page if not subscribed
                    if (!isPublicRoute) {
                        navigate(RouteName.SUBSCRIPTION);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking subscription:', error);
                setIsSubscribed(false);
                // Redirect to subscription page on error
                if (!isPublicRoute) {
                    navigate(RouteName.SUBSCRIPTION);
                    return;
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkSubscription();
    }, [user, location.pathname, navigate, isPublicRoute]);

    // Show loading spinner while checking subscription
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Allow access if:
    // 1. User is subscribed, OR
    // 2. Current route is public, OR
    // 3. User is a student (students don't need subscription)
    if (isSubscribed || isPublicRoute || role === 'Student') {
        return <>{children}</>;
    }

    // Redirect to subscription page
    navigate(RouteName.SUBSCRIPTION);
    return null;
};

export default SubscriptionGuard;
