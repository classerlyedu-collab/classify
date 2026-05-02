import React, { useEffect } from 'react';
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

    const publicRoutes = [
        RouteName.AUTH_SCREEN,
        RouteName.SUBSCRIPTION,
    ];

    const isPublicRoute = publicRoutes.includes(location.pathname as any);

    useEffect(() => {
        // Skip checks for students, public routes, or unauthenticated requests
        if (role === 'Student' || !user || isPublicRoute) return;

        let cancelled = false;
        (async () => {
            try {
                const response = await Get('/payment/user-subscription-status', null, null);
                if (cancelled) return;
                if (!response?.data?.isSubscribed) {
                    navigate(RouteName.SUBSCRIPTION);
                }
            } catch (error) {
                if (cancelled) return;
                navigate(RouteName.SUBSCRIPTION);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user, location.pathname, navigate, isPublicRoute, role]);

    return <>{children}</>;
};

export default SubscriptionGuard;
