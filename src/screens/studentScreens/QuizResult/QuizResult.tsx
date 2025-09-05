import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { useEffect, useState } from "react";

interface QuizResultProps {
    marks?: number;
    score?: number;
    result?: string;
    quizData?: any;
    totalQuestions?: number;
    totalQuizQuestions?: number;
}

const QuizResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [resultData, setResultData] = useState<QuizResultProps>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get result data from location state or initialize with default values
        if (location.state) {
            setResultData(location.state);
        }
        setLoading(false);
    }, [location.state]);

    const getResultMessage = () => {
        const percentage = resultData.marks && resultData.score
            ? (resultData.marks / resultData.score) * 100
            : 0;

        if (percentage >= 90) {
            return {
                message: "Outstanding! You're a quiz master! 🌟",
                color: "text-yellow-600",
                bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
                icon: "🏆"
            };
        } else if (percentage >= 80) {
            return {
                message: "Excellent work! You're doing great! 🎉",
                color: "text-green-600",
                bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
                icon: "🥇"
            };
        } else if (percentage >= 70) {
            return {
                message: "Good job! Keep practicing! 👍",
                color: "text-blue-600",
                bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
                icon: "⭐"
            };
        } else {
            return {
                message: "Don't give up! Practice makes perfect! 💪",
                color: "text-purple-600",
                bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
                icon: "🔄"
            };
        }
    };

    const resultInfo = getResultMessage();
    const percentage = resultData.marks && resultData.score
        ? Math.round((resultData.marks / resultData.score) * 100)
        : 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete! 🎯</h1>
                    <p className="text-gray-600 mb-2">Here's how you did</p>
                    <div className="text-sm text-gray-500">
                        Scored {resultData.marks} out of {resultData.score} points
                        {resultData.totalQuestions && resultData.totalQuizQuestions &&
                            resultData.totalQuizQuestions !== resultData.totalQuestions &&
                            ` (from ${resultData.totalQuestions} answered questions)`
                        }
                    </div>
                </div>

                {/* Result Card */}
                <div className={`${resultInfo.bgColor} rounded-3xl p-8 shadow-xl border-2 border-white mb-8`}>
                    <div className="text-center">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className={`p-6 rounded-full ${resultInfo.color.replace('text-', 'bg-').replace('-600', '-100')} shadow-lg`}>
                                <div className={`text-6xl ${resultInfo.color}`}>
                                    {resultInfo.icon}
                                </div>
                            </div>
                        </div>

                        {/* Result Message */}
                        <h2 className={`text-2xl font-bold mb-4 ${resultInfo.color}`}>
                            {resultInfo.message}
                        </h2>

                        {/* Score Display */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600">{resultData.marks || 0}</div>
                                    <div className="text-gray-600 font-medium">Points Earned</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-gray-600">{resultData.score || 0}</div>
                                    <div className="text-gray-600 font-medium">Total Possible</div>
                                </div>
                            </div>

                            {/* Percentage */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
                                    <div className="text-gray-600 font-medium">Accuracy</div>
                                </div>
                            </div>
                        </div>

                        {/* Result Status */}
                        <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg ${resultData.result === 'pass'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {resultData.result === 'pass' ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate(RouteName.DASHBOARD_SCREEN_STUDENT)}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <span className="text-xl">🏠</span>
                        Back to Dashboard
                    </button>

                    <button
                        onClick={() => navigate(RouteName.DASHBOARD_SCREEN_STUDENT)}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <span className="text-xl">🔄</span>
                        Try Another Quiz
                    </button>
                </div>

                {/* Quiz Info */}
                {resultData.quizData && (
                    <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Quiz Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-600">Subject:</span>
                                <span className="ml-2 text-gray-800">{resultData.quizData.subject?.name}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Topic:</span>
                                <span className="ml-2 text-gray-800">{resultData.quizData.topic?.name}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Questions Answered:</span>
                                <span className="ml-2 text-gray-800">
                                    {resultData.totalQuestions || resultData.quizData?.questions?.length}
                                    {resultData.totalQuizQuestions && resultData.totalQuizQuestions !== resultData.totalQuestions &&
                                        ` (from ${resultData.totalQuizQuestions} available)`
                                    }
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Grade:</span>
                                <span className="ml-2 text-gray-800">{resultData.quizData.grade?.grade}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizResult;