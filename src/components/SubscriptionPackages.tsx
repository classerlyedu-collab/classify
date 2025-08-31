import React, { useEffect, useState } from 'react';
import { displayMessage } from '../config';
import { UseStateContext } from '../context/ContextProvider';
import { SideDrawer, Navbar } from './index';

interface Package {
    name: string;
    price: number;
    description: string;
    features: string[];
    stripe_price_id: string;
}

interface Packages {
    monthly: Package[];
    yearly: Package[];
}

interface SubscriptionDetails {
    id: string;
    stripeSubscriptionId: string;
    packagePrice: number;
    subscriptionDate: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    isActive: boolean;
    billingReason: string;
    // Trial information
    isTrialing: boolean;
    trialEnd: string | null;
    trialDaysRemaining: number;
}

interface SubscriptionStatus {
    isSubscribed: boolean;
    subscriptionDetails: SubscriptionDetails | null;
}

interface SubscriptionPackagesProps {
    onSuccess?: () => void;
    onError?: () => void;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({
    onSuccess,
    onError
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const { role } = UseStateContext();

    // Frontend package definitions
    const getPackagesByRole = (userRole: string): Packages => {
        if (userRole === 'Teacher') {
            return {
                monthly: [
                    {
                        name: "Teacher Monthly Plan",
                        price: 27.99,
                        description: "Perfect for individual teachers",
                        features: [
                            "Access to all teaching materials",
                            "Student management tools",
                            "Quiz creation and management",
                            "Progress tracking",
                            "Email support"
                        ],
                        stripe_price_id: process.env.REACT_APP_STRIPE_TEACHER_MONTHLY_PRICE_ID || "price_1S1li7L7arBVYmE8TAfDtR3U"
                    }
                ],
                yearly: [
                    {
                        name: "Teacher Yearly Plan",
                        price: 299.99,
                        description: "Best value for teachers with annual commitment",
                        features: [
                            "All monthly features",
                            "Priority support",
                            "Advanced analytics",
                            "Custom branding",
                            "Yearly discount",
                            "24/7 phone support"
                        ],
                        stripe_price_id: process.env.REACT_APP_STRIPE_TEACHER_YEARLY_PRICE_ID || "price_1S1li6L7arBVYmE8db5yq0RD"
                    }
                ]
            };
        } else if (userRole === 'Parent') {
            return {
                monthly: [
                    {
                        name: "1 Student Plan",
                        price: 9.99,
                        description: "Perfect for 1 student",
                        features: ["Access to basic content", "Email support", "Basic analytics"],
                        stripe_price_id: process.env.REACT_APP_STRIPE_1_STUDENT_PRICE_ID || "price_1S1li5L7arBVYmE8TgNHRXnl"
                    },
                    {
                        name: "2 Students Plan",
                        price: 14.99,
                        description: "Most popular choice for 2 students",
                        features: ["All basic features", "Priority support", "Advanced analytics", "Custom branding"],
                        stripe_price_id: process.env.REACT_APP_STRIPE_2_STUDENTS_PRICE_ID || "price_1S1li6L7arBVYmE8xND43Gqk"
                    },
                    {
                        name: "3+ Students Plan",
                        price: 19.99,
                        description: "For families with 3 or more students",
                        features: ["All pro features", "24/7 phone support", "Custom integrations", "Dedicated account manager"],
                        stripe_price_id: process.env.REACT_APP_STRIPE_3_PLUS_STUDENTS_PRICE_ID || "price_1S1li6L7arBVYmE8uIKLCqut"
                    }
                ],
                yearly: [
                    {
                        name: "All Students Yearly Plan",
                        price: 79.99,
                        description: "Best value for all students",
                        features: ["Access to all content", "Priority support", "Advanced analytics", "Custom branding", "Yearly discount"],
                        stripe_price_id: process.env.REACT_APP_STRIPE_ALL_STUDENTS_YEARLY_PRICE_ID || "price_1S1li6L7arBVYmE8gC99xfNZ"
                    }
                ]
            };
        } else {
            // Default/Student packages (though students shouldn't see this)
            return {
                monthly: [],
                yearly: []
            };
        }
    };

    const packages = getPackagesByRole(role || 'Student');

    useEffect(() => {
        // Fetch user's subscription status
        fetchSubscriptionStatus();
        setIsLoading(false);
    }, []);



    const fetchSubscriptionStatus = async () => {
        try {
            const token = localStorage.getItem('token');

            // Use the new subscription details endpoint that includes trial information
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/subscription-details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptionStatus(data.data);
            } else {
                console.error('Failed to fetch subscription status:', response.status, response.statusText);
                // Fallback to old endpoint if new one fails
                try {
                    const fallbackResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/user-subscription-status`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        setSubscriptionStatus(fallbackData.data);
                    }
                } catch (fallbackError) {
                    console.error('Fallback endpoint also failed:', fallbackError);
                }
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        }
    };

    const isPackageSubscribed = (pkg: Package, cycle: 'monthly' | 'yearly'): boolean => {
        if (!subscriptionStatus?.isSubscribed || !subscriptionStatus.subscriptionDetails) {
            return false;
        }

        const details = subscriptionStatus.subscriptionDetails;


        // Check if the package price matches the subscription
        const priceMatch = Math.abs(details.packagePrice - pkg.price) < 0.01; // Allow 1 cent difference

        // For trial subscriptions, we need to check if the user is in trial period
        // and if the package matches what they subscribed to
        if (details.isTrialing) {
            // If user is in trial, check if this is the package they're trialing
            // We'll use price matching for now since the backend doesn't store package name
            return priceMatch;
        }

        // For regular subscriptions, check price and active status
        const statusMatch = details.isActive;
        return priceMatch && statusMatch;
    };

    const handleCancelSubscription = async () => {
        try {
            setIsCancelling(true);
            const token = localStorage.getItem('token');

            // Create customer portal session for subscription management
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/create-customer-portal-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                window.location.href = data.data.url; // Redirect to Stripe Customer Portal
            } else {
                displayMessage(data.message || "Failed to create customer portal session", "error");
            }
        } catch (error: any) {
            displayMessage(error.message || "Error creating customer portal session", "error");
        } finally {
            setIsCancelling(false);
        }
    };

    const createSubscription = async (selectedPackage: Package, selectedBillingCycle: 'monthly' | 'yearly') => {
        try {
            setIsCreatingCheckout(true);
            const token = localStorage.getItem('token');

            // Create checkout session with frontend package data
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/create-checkout-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        billingCycle: selectedBillingCycle,
                        packageName: selectedPackage.name,
                        packagePrice: selectedPackage.price,
                        stripePriceId: selectedPackage.stripe_price_id
                    })
                });

                const data = await response.json();
                if (data.success) {
                    window.location.href = data.data.url; // Redirect to Stripe
                    return;
                } else {
                    displayMessage(data.message || "Failed to create checkout session", "error");
                }
            } catch (backendError) {
                console.log('Backend error:', backendError);
                displayMessage("Error creating checkout session", "error");
            }

        } catch (error: any) {
            displayMessage(error.message || "Error creating checkout session", "error");
        } finally {
            setIsCreatingCheckout(false);
        }
    };

    const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
        setBillingCycle(cycle);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading subscription packages...</p>
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

    const currentPackages = Array.isArray(packages[billingCycle]) ? packages[billingCycle] : [];

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
            {/* for left side */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-mainBg">
                {/* 1st Navbar */}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
                    <Navbar title="Subscription Plans" />
                </div>

                {/* Subscription Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Choose Your Subscription Plan
                            </h1>
                            <p className="text-xl text-gray-600">
                                Select the plan that best fits your needs
                            </p>
                        </div>

                        {/* Billing Cycle Toggle */}
                        <div className="flex justify-center mb-12">
                            <div className="bg-white rounded-lg p-1 shadow-lg">
                                <div className="flex">
                                    <button
                                        onClick={() => handleBillingCycleChange('monthly')}
                                        className={`px-6 py-3 rounded-md font-medium transition-all ${billingCycle === 'monthly'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => handleBillingCycleChange('yearly')}
                                        className={`px-6 py-3 rounded-md font-medium transition-all ${billingCycle === 'yearly'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Yearly
                                        <span className="ml-2 text-sm text-green-600">Save 20%</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Packages Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {Array.isArray(currentPackages) && currentPackages.map((pkg, index) => {
                                const isSubscribed = isPackageSubscribed(pkg, billingCycle);

                                return (
                                    <div
                                        key={pkg.stripe_price_id}
                                        className={`bg-white rounded-lg shadow-lg p-8 border-2 transition-all hover:shadow-xl relative ${index === 1 ? 'border-blue-500 scale-105' : 'border-gray-200'
                                            } ${isSubscribed ? 'border-green-500 bg-green-50' : ''}`}
                                    >
                                        {/* Subscribed Badge */}
                                        {isSubscribed && (
                                            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                {subscriptionStatus?.subscriptionDetails?.isTrialing ? 'TRIAL' : 'SUBSCRIBED'}
                                            </div>
                                        )}

                                        {/* Trial Countdown */}
                                        {isSubscribed && subscriptionStatus?.subscriptionDetails?.isTrialing && (
                                            <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                {subscriptionStatus.subscriptionDetails.trialDaysRemaining} days left
                                            </div>
                                        )}

                                        {index === 1 && !isSubscribed && (
                                            <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full text-center mb-4">
                                                MOST POPULAR
                                            </div>
                                        )}

                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{pkg.name}</h3>

                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                                            <span className="text-gray-600 ml-2">
                                                /{billingCycle === 'monthly' ? 'month' : 'year'}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 mb-6">{pkg.description}</p>

                                        <ul className="space-y-3 mb-8">
                                            {pkg.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center">
                                                    <svg
                                                        className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {isSubscribed ? (
                                            <button
                                                onClick={handleCancelSubscription}
                                                disabled={isCancelling}
                                                className="w-full py-3 px-6 rounded-lg font-medium transition-all bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isCancelling ? 'Redirecting...' : 'Manage Subscription'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => createSubscription(pkg, billingCycle)}
                                                disabled={isCreatingCheckout}
                                                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${index === 1
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isCreatingCheckout ? 'Creating Checkout...' : 'Select Plan'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Additional Info */}
                        <div className="text-center text-gray-600">
                            <p className="mb-2">
                                All plans include a 30-day money-back guarantee
                            </p>
                            <p>
                                Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPackages;