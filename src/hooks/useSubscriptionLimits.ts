import { useState, useEffect } from 'react';
import { UseStateContext } from '../context/ContextProvider';
import { Get } from '../config/apiMethods';

interface SubscriptionLimits {
    canAddStudents: boolean;
    maxStudents: number;
    currentStudents: number;
    remainingStudents: number;
    planType: string;
}

export const useSubscriptionLimits = () => {
    const { role } = UseStateContext();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [limits, setLimits] = useState<SubscriptionLimits>({
        canAddStudents: false,
        maxStudents: 0,
        currentStudents: 0,
        remainingStudents: 0,
        planType: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLimits = async () => {
            if (!user || role === 'Student') {
                setLoading(false);
                return;
            }

            try {

                // Get user's subscription status
                const subscriptionResponse = await Get('/payment/user-subscription-status', null, null);
                const isSubscribed = subscriptionResponse?.data?.isSubscribed || false;

                if (!isSubscribed) {
                    setLimits({
                        canAddStudents: false,
                        maxStudents: 0,
                        currentStudents: 0,
                        remainingStudents: 0,
                        planType: 'No Subscription'
                    });
                    setLoading(false);
                    return;
                }

                // Get current students count
                let currentStudents = 0;
                if (role === 'Parent') {
                    try {
                        const studentsResponse = await Get('/parent/children', null, null);
                        currentStudents = studentsResponse?.data?.length || 0;
                    } catch (error) {
                        console.error('Error fetching children:', error);
                    }
                } else if (role === 'Teacher') {
                    try {
                        const studentsResponse = await Get('/teacher/students', null, null);
                        currentStudents = studentsResponse?.data?.length || 0;
                    } catch (error) {
                        console.error('Error fetching students:', error);
                    }
                }

                // Determine limits based on subscription plan
                let maxStudents = 0;
                let planType = '';

                if (subscriptionResponse?.data?.subscription?.packageName) {
                    const packageName = subscriptionResponse.data.subscription.packageName;

                    if (role === 'Parent') {
                        // Parent package limits
                        if (packageName.includes('1 Student')) {
                            maxStudents = 1;
                            planType = '1 Student Plan';
                        } else if (packageName.includes('2 Students')) {
                            maxStudents = 2;
                            planType = '2 Students Plan';
                        } else if (packageName.includes('3+ Students')) {
                            maxStudents = 999; // Unlimited
                            planType = '3+ Students Plan';
                        }
                    } else if (role === 'Teacher') {
                        // Teachers can add unlimited students
                        maxStudents = 999;
                        planType = 'Teacher Plan';
                    }
                } else {
                    // Fallback based on user plan
                    if (user.plan === 'allowToRegisterMultiStudents') {
                        maxStudents = 999;
                        planType = 'Multi-Student Plan';
                    } else {
                        maxStudents = 1;
                        planType = 'Single Student Plan';
                    }
                }

                const remainingStudents = Math.max(0, maxStudents - currentStudents);
                const canAddStudents = remainingStudents > 0;

                setLimits({
                    canAddStudents,
                    maxStudents,
                    currentStudents,
                    remainingStudents,
                    planType
                });

            } catch (error) {
                console.error('Error checking subscription limits:', error);
                setLimits({
                    canAddStudents: false,
                    maxStudents: 0,
                    currentStudents: 0,
                    remainingStudents: 0,
                    planType: 'Error'
                });
            } finally {
                setLoading(false);
            }
        };

        checkLimits();
    }, [user, role]);

    return { ...limits, loading };
};
