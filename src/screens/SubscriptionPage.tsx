import React from 'react';
import { SubscriptionPackages } from '../components';
import { RouteName } from '../routes/RouteNames';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        // Redirect to appropriate dashboard based on user role
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        switch (user.userType) {
            case "Parent":
                navigate(RouteName.DASHBOARD_SCREEN);
                break;
            case "Student":
                navigate(RouteName.DASHBOARD_SCREEN_STUDENT);
                break;
            case "Teacher":
                navigate(RouteName.DASHBOARD_SCREEN_TEACHER);
                break;
            default:
                navigate(RouteName.DASHBOARD_SCREEN);
                break;
        }
    };

    const handleError = () => {
        // Redirect to auth screen on error
        navigate(RouteName.AUTH_SCREEN);
    };

    return (
        <div className="min-h-screen bg-mainBg">
            <SubscriptionPackages onSuccess={handleSuccess} onError={handleError} />
        </div>
    );
};

export default SubscriptionPage;
