import React, { useEffect, useState } from 'react';
// import { Post } from '../config/apiMethods';
import { displayMessage } from '../config';
import { UseStateContext } from '../context/ContextProvider';

interface SubscriptionRedirectProps {
    onSuccess?: () => void;
    onError?: () => void;
}

const SubscriptionRedirect: React.FC<SubscriptionRedirectProps> = ({
    onSuccess,
    onError
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const { role } = UseStateContext();

    useEffect(() => {
        const redirectToSubscription = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/create-checkout-session`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({}) // Empty body - no package selection needed
                });
                const data = await response.json();

                if (data.success) {
                    window.location.href = data.data.url; // Redirect to Stripe with all packages
                } else {
                    displayMessage(data.message || "Failed to create checkout session", "error");
                    onError?.();
                }
            } catch (error: any) {
                displayMessage(error.response?.data?.message || error.message || "Error accessing subscription portal", "error");
                onError?.();
            } finally {
                setIsLoading(false);
            }
        };

        // Only redirect if user is not a student (students don't pay)
        if (role !== "Student") {
            redirectToSubscription();
        } else {
            setIsLoading(false);
            onSuccess?.();
        }
    }, [role, onSuccess, onError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to subscription...</p>
                </div>
            </div>
        );
    }

    if (role === "Student") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Students don't need to subscribe. You're linked to your parent or teacher account.</p>
                </div>
            </div>
        );
    }

    return null;
};

export default SubscriptionRedirect;
