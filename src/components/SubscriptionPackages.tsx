import React, { useEffect, useMemo, useState } from 'react';
import { displayMessage } from '../config';
import { UseStateContext } from '../context/ContextProvider';
import { SideDrawer, Navbar } from './index';
import {
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineSparkles,
    HiOutlineShieldCheck,
    HiOutlineLifebuoy,
    HiOutlineArrowRight,
    HiOutlineBolt,
    HiOutlineAcademicCap,
    HiOutlineChevronDown,
} from 'react-icons/hi2';

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

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const { role } = UseStateContext();

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
        }
        return { monthly: [], yearly: [] };
    };

    const packages = useMemo(() => getPackagesByRole(role || 'Student'), [role]);

    useEffect(() => {
        fetchSubscriptionStatus().finally(() => setIsLoading(false));
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/subscription-details`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptionStatus(data.data);
            } else {
                console.error('Failed to fetch subscription status:', response.status);
                try {
                    const fallbackResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/user-subscription-status`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
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

    const isPackageSubscribed = (pkg: Package): boolean => {
        if (!subscriptionStatus?.isSubscribed || !subscriptionStatus.subscriptionDetails) return false;
        const details = subscriptionStatus.subscriptionDetails;
        const priceMatch = Math.abs(details.packagePrice - pkg.price) < 0.01;
        if (details.isTrialing) return priceMatch;
        return priceMatch && details.isActive;
    };

    const handleCancelSubscription = async () => {
        try {
            setIsCancelling(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/create-customer-portal-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = data.data.url;
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
            setPendingPriceId(selectedPackage.stripe_price_id);
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082'}/api/v1/payment/create-checkout-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        billingCycle: selectedBillingCycle,
                        packageName: selectedPackage.name,
                        packagePrice: selectedPackage.price,
                        stripePriceId: selectedPackage.stripe_price_id
                    })
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = data.data.url;
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
            setPendingPriceId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
                <SideDrawer />
                <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                    <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                        <div className="px-4 md:px-8 py-3">
                            <Navbar title="Subscription" />
                        </div>
                    </div>
                    <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                        {/* Hero skeleton */}
                        <div className="rounded-3xl mb-6 bg-white ring-1 ring-inputBorder/50 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                <div className="space-y-3 max-w-xl flex-1">
                                    <div className="h-3 w-24 rounded bg-mainBg animate-pulse" />
                                    <div className="h-8 w-56 rounded bg-mainBg animate-pulse" />
                                    <div className="h-4 w-72 rounded bg-mainBg animate-pulse" />
                                </div>
                                <div className="h-12 w-48 rounded-2xl bg-mainBg animate-pulse" />
                            </div>
                        </div>

                        {/* Plan cards skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="h-4 w-28 rounded bg-mainBg animate-pulse" />
                                            <div className="h-3 w-40 rounded bg-mainBg animate-pulse" />
                                        </div>
                                        <div className="h-6 w-16 rounded-full bg-mainBg animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-mainBg animate-pulse" />
                                        <div className="h-7 w-7 rounded-full bg-mainBg animate-pulse" />
                                        <div className="h-3 w-20 rounded bg-mainBg animate-pulse ml-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-12 w-32 rounded bg-mainBg animate-pulse" />
                                        <div className="h-3 w-28 rounded bg-mainBg animate-pulse" />
                                    </div>
                                    <div className="h-11 w-full rounded-xl bg-mainBg animate-pulse" />
                                    <div className="h-px w-full bg-inputBorder/50" />
                                    <div className="space-y-2 pt-1">
                                        {[0, 1, 2, 3].map((j) => (
                                            <div key={j} className="flex items-center gap-2.5">
                                                <div className="h-4 w-4 rounded bg-mainBg animate-pulse" />
                                                <div className="h-3 flex-1 rounded bg-mainBg animate-pulse" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust cards skeleton */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4">
                                    <div className="h-10 w-10 rounded-xl bg-mainBg animate-pulse mb-3" />
                                    <div className="h-3.5 w-28 rounded bg-mainBg animate-pulse mb-2" />
                                    <div className="h-2.5 w-36 rounded bg-mainBg animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (role === "Student") {
        return (
            <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
                <SideDrawer />
                <div className="flex-1 lg:ml-[16.6667%] flex items-center justify-center px-4">
                    <div className="max-w-md text-center bg-white rounded-3xl ring-1 ring-inputBorder/50 p-8 shadow-sm">
                        <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary flex items-center justify-center">
                            <HiOutlineAcademicCap size={26} />
                        </div>
                        <h2 className="font-trykker text-xl text-black">You're already covered</h2>
                        <p className="text-sm text-grey mt-2">
                            Students don't need a subscription. You're linked to your parent or teacher account.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const currentPackages = Array.isArray(packages[billingCycle]) ? packages[billingCycle] : [];
    const monthlyHasMultiple = (packages.monthly?.length || 0) > 1;
    const trialing = subscriptionStatus?.subscriptionDetails?.isTrialing;
    const trialDays = subscriptionStatus?.subscriptionDetails?.trialDaysRemaining ?? 0;
    const periodEnd = subscriptionStatus?.subscriptionDetails?.currentPeriodEnd;

    const trustItems = [
        {
            Icon: HiOutlineShieldCheck,
            title: '30-day guarantee',
            desc: 'Money-back, no questions asked.',
            tone: 'from-lightGreen2/20 to-lightGreen2/5 text-lightGreen2',
            ring: 'ring-lightGreen2/20',
        },
        {
            Icon: HiOutlineBolt,
            title: 'Cancel anytime',
            desc: 'Switch or stop in one click.',
            tone: 'from-orangeBrown/20 to-orangeBrown/5 text-orangeBrown',
            ring: 'ring-orangeBrown/20',
        },
        {
            Icon: HiOutlineLifebuoy,
            title: 'Human support',
            desc: 'Real people, real answers.',
            tone: 'from-fadeBlue/25 to-bluecolor/10 text-bluecolor',
            ring: 'ring-bluecolor/20',
        },
        {
            Icon: HiOutlineSparkles,
            title: 'Secure checkout',
            desc: 'Powered by Stripe.',
            tone: 'from-primary/20 to-secondary/10 text-secondary',
            ring: 'ring-secondary/20',
        },
    ];

    const faqs = [
        {
            q: 'Can I switch plans later?',
            a: 'Yes — you can upgrade, downgrade, or switch billing cycles anytime from the billing portal. Changes take effect immediately and are pro-rated.',
        },
        {
            q: 'What happens when my trial ends?',
            a: "Your card is charged for the plan you selected. You can cancel before the trial ends and you won't be billed.",
        },
        {
            q: 'How do I cancel?',
            a: 'Open the billing portal from this page and click cancel. Your access continues until the end of the current billing period.',
        },
        {
            q: 'Is my payment information secure?',
            a: 'Payments are processed by Stripe. We never store your card details on our servers.',
        },
    ];

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Subscription" />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(113,2,255,0.35)]">
                        <div
                            aria-hidden
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            }}
                        />
                        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                            <div className="max-w-xl">
                                <p className="text-xs uppercase tracking-wider text-white/70">Plans & billing</p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                                    Choose your plan.
                                </h1>
                                <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                                    {role === 'Teacher'
                                        ? 'Unlock the tools you need to teach, track, and grow.'
                                        : 'Pick the plan that matches your family — switch anytime.'}
                                </p>
                            </div>

                            {/* Billing toggle */}
                            <div className="relative inline-flex items-center gap-1 rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur p-1">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`h-9 px-4 rounded-xl text-sm font-semibold transition ${
                                        billingCycle === 'monthly' ? 'bg-white text-secondary shadow-sm' : 'text-white/80 hover:text-white'
                                    }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`h-9 px-4 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                                        billingCycle === 'yearly' ? 'bg-white text-secondary shadow-sm' : 'text-white/80 hover:text-white'
                                    }`}
                                >
                                    Yearly
                                    <span className={`text-[10px] uppercase tracking-wider font-bold rounded-full px-1.5 py-0.5 ${
                                        billingCycle === 'yearly' ? 'bg-lightGreen2/20 text-lightGreen2' : 'bg-white/20 text-white'
                                    }`}>
                                        Save 20%
                                    </span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Active subscription banner */}
                    {subscriptionStatus?.isSubscribed && subscriptionStatus.subscriptionDetails && (
                        <section className="mb-6 rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                    trialing
                                        ? 'bg-gradient-to-br from-fadeBlue/20 to-bluecolor/15 text-bluecolor'
                                        : 'bg-gradient-to-br from-lightGreen2/20 to-lightGreen2/10 text-lightGreen2'
                                }`}>
                                    <HiOutlineCheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-grey font-semibold">
                                        {trialing ? 'Trial active' : 'Active subscription'}
                                    </p>
                                    <p className="text-sm font-semibold text-black">
                                        {trialing
                                            ? `${trialDays} day${trialDays === 1 ? '' : 's'} left in your trial`
                                            : `Renews ${periodEnd ? new Date(periodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'soon'}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className="h-10 px-4 text-sm font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 rounded-xl hover:ring-primary/40 transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isCancelling ? 'Opening portal…' : (
                                    <>
                                        Manage billing
                                        <HiOutlineArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </section>
                    )}

                    {/* Plans grid */}
                    <section className={`grid gap-5 mb-8 items-stretch ${
                        currentPackages.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                        currentPackages.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' :
                        'grid-cols-1 md:grid-cols-3'
                    }`}>
                        {currentPackages.map((pkg, index) => {
                            const isSubscribed = isPackageSubscribed(pkg);
                            const isPopular = monthlyHasMultiple && billingCycle === 'monthly' && index === 1;
                            const isThisLoading = isCreatingCheckout && pendingPriceId === pkg.stripe_price_id;

                            // Derive seat count from plan name for parent plans
                            const nameMatch = pkg.name.match(/^(\d+)/);
                            const seatCount = nameMatch ? parseInt(nameMatch[1]) : null;
                            const isPlus = /\+/.test(pkg.name);

                            // Approx monthly equivalent for yearly plans
                            const monthlyEquivalent = billingCycle === 'yearly' ? (pkg.price / 12).toFixed(2) : null;

                            return (
                                <div
                                    key={pkg.stripe_price_id}
                                    className={`relative rounded-3xl flex flex-col overflow-hidden transition-all ${
                                        isSubscribed
                                            ? 'bg-white ring-2 ring-lightGreen2 shadow-[0_15px_40px_-15px_rgba(34,197,94,0.25)]'
                                            : isPopular
                                                ? 'bg-white ring-2 ring-primary shadow-[0_20px_50px_-20px_rgba(113,2,255,0.30)]'
                                                : 'bg-white ring-1 ring-inputBorder/50 hover:ring-primary/30 hover:shadow-md'
                                    }`}
                                >
                                    {/* Top accent bar for popular/current */}
                                    {(isPopular || isSubscribed) && (
                                        <div className={`h-1 w-full ${
                                            isSubscribed
                                                ? 'bg-lightGreen2'
                                                : 'bg-gradient-to-r from-primary via-secondary to-fadeBlue'
                                        }`} />
                                    )}

                                    <div className="p-6 flex flex-col flex-1">
                                        {/* Header row: tier name + status pill */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="min-w-0">
                                                <h3 className="font-trykker text-lg text-black leading-tight">{pkg.name}</h3>
                                                <p className="text-[11px] text-grey mt-1 leading-relaxed">{pkg.description}</p>
                                            </div>
                                            {isSubscribed ? (
                                                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-lightGreen2/10 ring-1 ring-lightGreen2/30 text-lightGreen2 text-[10px] font-bold uppercase tracking-wider">
                                                    <HiOutlineCheck size={11} strokeWidth={3} />
                                                    {trialing ? `Trial · ${trialDays}d` : 'Active'}
                                                </span>
                                            ) : isPopular ? (
                                                <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-wider">
                                                    Popular
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Seat indicator (parent plans only) */}
                                        {seatCount && (
                                            <div className="flex items-center gap-2 mb-5">
                                                <div className="flex -space-x-1.5">
                                                    {[...Array(Math.min(seatCount, 3))].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white ${
                                                                isPopular ? 'bg-gradient-to-br from-primary to-secondary' :
                                                                isSubscribed ? 'bg-gradient-to-br from-lightGreen2 to-emerald-600' :
                                                                'bg-gradient-to-br from-bluecolor to-fadeBlue'
                                                            }`}
                                                        >
                                                            <HiOutlineAcademicCap size={12} />
                                                        </span>
                                                    ))}
                                                    {isPlus && (
                                                        <span className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-grey ring-2 ring-white bg-mainBg">
                                                            +
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-grey font-medium">
                                                    {seatCount} {seatCount === 1 ? 'student' : 'students'}{isPlus ? ' or more' : ''}
                                                </span>
                                            </div>
                                        )}

                                        {/* Price block */}
                                        <div className="mb-5">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-semibold text-grey">$</span>
                                                <span className="text-5xl font-trykker text-black tracking-tight leading-none">
                                                    {Math.floor(pkg.price)}
                                                </span>
                                                <span className="text-2xl font-trykker text-black leading-none">
                                                    .{(pkg.price % 1).toFixed(2).slice(2)}
                                                </span>
                                                <span className="text-sm text-grey ml-1">
                                                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                                                </span>
                                            </div>
                                            {monthlyEquivalent && (
                                                <p className="text-[11px] text-lightGreen2 font-semibold mt-1.5">
                                                    ≈ ${monthlyEquivalent}/mo · billed yearly
                                                </p>
                                            )}
                                            {!monthlyEquivalent && (
                                                <p className="text-[11px] text-grey mt-1.5">
                                                    Billed monthly · cancel anytime
                                                </p>
                                            )}
                                        </div>

                                        {/* CTA — moved up for prominence */}
                                        {isSubscribed ? (
                                            <button
                                                onClick={handleCancelSubscription}
                                                disabled={isCancelling}
                                                className="w-full h-11 rounded-xl text-sm font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-primary/40 transition disabled:opacity-50 flex items-center justify-center gap-1.5 mb-5"
                                            >
                                                {isCancelling ? 'Opening portal…' : 'Manage subscription'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => createSubscription(pkg, billingCycle)}
                                                disabled={isCreatingCheckout}
                                                className={`group w-full h-11 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 mb-5 ${
                                                    isPopular
                                                        ? 'text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-secondary/30'
                                                        : 'text-secondary bg-white ring-1 ring-secondary/40 hover:bg-secondary hover:text-white hover:ring-secondary hover:shadow-md hover:shadow-secondary/20'
                                                }`}
                                            >
                                                {isThisLoading ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Redirecting…
                                                    </>
                                                ) : (
                                                    <>
                                                        Get started
                                                        <HiOutlineArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Divider */}
                                        <div className="relative mb-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-inputBorder/50" />
                                            </div>
                                            <div className="relative flex justify-center">
                                                <span className="bg-white px-2 text-[10px] uppercase tracking-wider text-grey font-semibold">
                                                    What's included
                                                </span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-2.5 flex-1">
                                            {pkg.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2.5">
                                                    <HiOutlineCheck
                                                        size={16}
                                                        strokeWidth={2.5}
                                                        className={`mt-0.5 flex-shrink-0 ${
                                                            isPopular ? 'text-secondary' :
                                                            isSubscribed ? 'text-lightGreen2' :
                                                            'text-greyBlack'
                                                        }`}
                                                    />
                                                    <span className="text-[13px] text-greyBlack leading-snug">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    {/* Trust cards */}
                    <section className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {trustItems.map(({ Icon, title, desc, tone, ring }) => (
                            <div
                                key={title}
                                className={`group relative overflow-hidden rounded-2xl bg-white ring-1 ${ring} p-4 hover:shadow-md transition`}
                            >
                                <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tone} opacity-50 blur-xl pointer-events-none`} />
                                <span className={`relative inline-flex h-10 w-10 rounded-xl bg-gradient-to-br ${tone} items-center justify-center ring-1 ${ring} group-hover:scale-105 transition`}>
                                    <Icon size={18} />
                                </span>
                                <p className="relative mt-3 text-sm font-semibold text-black leading-tight">{title}</p>
                                <p className="relative mt-1 text-[11px] text-grey leading-snug">{desc}</p>
                            </div>
                        ))}
                    </section>

                    {/* FAQ */}
                    <section className="mb-6">
                        <header className="mb-4 text-center">
                            <h2 className="font-trykker text-xl md:text-2xl text-black">Frequently asked</h2>
                            <p className="text-xs text-grey mt-1">Everything you need to know before subscribing.</p>
                        </header>
                        <div className="max-w-2xl mx-auto rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden divide-y divide-inputBorder/40">
                            {faqs.map((item, i) => {
                                const isOpen = openFaq === i;
                                return (
                                    <div key={i}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : i)}
                                            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-mainBg/40 transition"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="text-sm font-semibold text-black">{item.q}</span>
                                            <HiOutlineChevronDown
                                                size={16}
                                                className={`text-grey flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-secondary' : ''}`}
                                            />
                                        </button>
                                        <div
                                            className={`grid transition-all duration-200 ease-out ${
                                                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="px-5 pb-4 text-sm text-grey leading-relaxed">{item.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Footer note */}
                    <div className="text-center pb-6">
                        <p className="text-[11px] text-grey inline-flex items-center gap-1">
                            <HiOutlineSparkles size={12} className="text-secondary" />
                            All plans include a 30-day money-back guarantee. Need help? <button type="button" className="font-semibold text-secondary hover:underline ml-1">Contact support</button>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPackages;
