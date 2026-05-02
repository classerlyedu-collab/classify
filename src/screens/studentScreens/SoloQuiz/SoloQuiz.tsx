import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineClock,
    HiOutlineArrowRight,
    HiOutlineXMark,
    HiOutlineExclamationTriangle,
    HiOutlineCheckCircle,
    HiOutlineSparkles,
    HiOutlineFlag,
    HiOutlineFire,
} from "react-icons/hi2";

const calculateTimePerQuestion = (startTime: Date, endTime: Date, questionCount: number): number => {
    const totalTimeInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    if (totalTimeInSeconds <= 0) return 30;
    const timePerQuestion = Math.floor(totalTimeInSeconds / questionCount);
    return Math.max(30, Math.min(300, timePerQuestion));
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const LETTER_TONES = [
    { bg: "from-pink-400 to-rose-500", soft: "bg-pink-50", border: "border-pink-200" },
    { bg: "from-sky-400 to-blue-500", soft: "bg-sky-50", border: "border-sky-200" },
    { bg: "from-amber-400 to-orange-500", soft: "bg-amber-50", border: "border-amber-200" },
    { bg: "from-violet-400 to-fuchsia-500", soft: "bg-violet-50", border: "border-violet-200" },
    { bg: "from-emerald-400 to-teal-500", soft: "bg-emerald-50", border: "border-emerald-200" },
    { bg: "from-cyan-400 to-blue-500", soft: "bg-cyan-50", border: "border-cyan-200" },
];

const SoloQuiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [quizdata] = useState<any>(location.state);

    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(15);
    const [questionTime, setQuestionTime] = useState<number>(30);
    const [, setSelectedAnswers] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [randomQuestions, setRandomQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmExit, setConfirmExit] = useState(false);

    // Calculate time per question
    useEffect(() => {
        if (!quizdata?.startsAt || !quizdata?.endsAt) return;
        let startTime: Date;
        let endTime: Date;
        const startsAtStr = quizdata.startsAt.toString();
        const endsAtStr = quizdata.endsAt.toString();
        const isNewFormat = /^\d{2}:\d{2}$/.test(startsAtStr) || /^\d{2}:\d{2}$/.test(endsAtStr);
        if (isNewFormat) {
            const today = new Date();
            const todayStr = today.toDateString();
            startTime = new Date(`${todayStr} ${startsAtStr}`);
            endTime = new Date(`${todayStr} ${endsAtStr}`);
        } else {
            startTime = new Date(quizdata.startsAt);
            endTime = new Date(quizdata.endsAt);
        }
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return;
        const availableQuestions = quizdata.questions?.length || 0;
        const questionsToShow = Math.min(10, availableQuestions);
        const finalTimePerQuestion = calculateTimePerQuestion(startTime, endTime, questionsToShow);
        setQuestionTime(finalTimePerQuestion);
        setTimeRemaining(finalTimePerQuestion);
    }, [quizdata]);

    // Pick random subset
    useEffect(() => {
        if (quizdata?.questions && quizdata.questions.length > 0) {
            const availableQuestions = quizdata.questions.length;
            const questionsToSelect = Math.min(10, availableQuestions);
            const shuffled = [...quizdata.questions].sort(() => 0.5 - Math.random());
            setRandomQuestions(shuffled.slice(0, questionsToSelect));
            setIsLoading(false);
        }
    }, [quizdata]);

    // Timer
    useEffect(() => {
        if (currentQuestion >= randomQuestions?.length) return;
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev > 1) return prev - 1;
                handleNextQuestion();
                return questionTime;
            });
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestion, randomQuestions?.length, questionTime]);

    const finishQuiz = () => {
        setSubmitting(true);
        Post(`/quiz/student/${quizdata._id}?status=end`)
            .then((d) => {
                if (d.success) {
                    navigate(RouteName?.QUIZ_RESULT, {
                        state: {
                            marks: d.data?.marks,
                            score: d.data?.score,
                            result: d.data?.result,
                            quizData: quizdata,
                            totalQuestions: d.data?.totalQuestions,
                            totalQuizQuestions: d.data?.totalQuizQuestions,
                        },
                    });
                } else {
                    displayMessage(d.message);
                }
            })
            .catch(() => displayMessage("Could not finish quiz", "error"))
            .finally(() => setSubmitting(false));
    };

    const handleSelectAnswer = (answer: string) => setSelectedAnswer(answer);

    const handleNextQuestion = () => {
        if (currentQuestion >= randomQuestions?.length) return;
        setSelectedAnswers((prev) => [...prev, selectedAnswer || ""]);

        const currentRandomQuestion = randomQuestions[currentQuestion];
        if (!currentRandomQuestion || !currentRandomQuestion._id) {
            if (currentQuestion >= randomQuestions?.length - 1) finishQuiz();
            return;
        }

        const originalIndex =
            quizdata.questions?.findIndex((q: any) => q._id === currentRandomQuestion._id) ??
            currentQuestion;

        Post(`/quiz/student/a/${quizdata._id}`, {
            answer: selectedAnswer,
            index: originalIndex,
        })
            .then((d) => {
                if (!d.success) displayMessage(d.message);
            })
            .catch(() => {});

        setSelectedAnswer(null);

        if (currentQuestion < randomQuestions?.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setTimeRemaining(questionTime);
        } else {
            finishQuiz();
        }
    };

    const total = randomQuestions?.length || 0;
    const progressPct = total > 0 ? ((currentQuestion) / total) * 100 : 0;
    const timePct = questionTime > 0 ? (timeRemaining / questionTime) * 100 : 0;
    const lowTime = timeRemaining <= 5;
    const currentQ = randomQuestions[currentQuestion];
    const questionImage = currentQ?.image;

    // Use either currentQ.options or currentQ.answers (some seed data uses answers)
    const options: string[] = useMemo(() => {
        if (Array.isArray(currentQ?.options)) return currentQ.options;
        if (Array.isArray(currentQ?.answers)) return currentQ.answers;
        return [];
    }, [currentQ]);

    if (isLoading) {
        return (
            <div className="px-2 py-2 md:px-2 md:py-4 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="relative inline-block mb-4">
                        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center text-4xl shadow-lg shadow-fuchsia-500/30 animate-pulse">
                            🎯
                        </div>
                        <span className="absolute -bottom-2 -right-2 text-2xl animate-bounce">⚡</span>
                    </div>
                    <h2 className="font-trykker text-2xl text-black">Getting your quiz ready</h2>
                    <p className="text-sm text-grey mt-1.5 max-w-xs mx-auto">
                        Picking {Math.min(10, quizdata?.questions?.length || 0)} fun questions just for you…
                    </p>
                    <div className="mt-4 h-1.5 w-48 mx-auto rounded-full bg-mainBg overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 animate-pulse rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-2 py-2 md:px-2 md:py-4 select-none">
            {/* Top bar: progress + timer + exit */}
            <div className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-4 md:p-5 mb-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] uppercase tracking-wider text-grey font-bold">Question</span>
                        <span className="font-trykker text-3xl md:text-4xl text-fuchsia-600 leading-none">
                            {currentQuestion + 1}
                        </span>
                        <span className="font-trykker text-lg md:text-xl text-grey leading-none">/ {total}</span>
                    </div>

                    {/* Timer */}
                    <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded-2xl transition ${
                        lowTime
                            ? "bg-rose-100 ring-1 ring-rose-300"
                            : timeRemaining < questionTime / 2
                                ? "bg-amber-100 ring-1 ring-amber-300"
                                : "bg-emerald-100 ring-1 ring-emerald-300"
                    }`}>
                        <HiOutlineClock
                            size={18}
                            className={`${lowTime ? "text-rose-600 animate-pulse" : timeRemaining < questionTime / 2 ? "text-amber-600" : "text-emerald-600"}`}
                        />
                        <span className={`font-trykker text-lg md:text-xl leading-none ${
                            lowTime ? "text-rose-700 animate-pulse" : timeRemaining < questionTime / 2 ? "text-amber-700" : "text-emerald-700"
                        }`}>
                            {timeRemaining}s
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setConfirmExit(true)}
                        className="h-9 w-9 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 hover:ring-rose-300 hover:bg-rose-50 hover:text-rose-600 transition flex items-center justify-center text-grey"
                        aria-label="Exit quiz"
                    >
                        <HiOutlineXMark size={16} />
                    </button>
                </div>

                {/* Progress bars stacked */}
                <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-mainBg overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <div className="h-1 w-full rounded-full bg-mainBg overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                lowTime
                                    ? "bg-rose-500"
                                    : timeRemaining < questionTime / 2
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                            }`}
                            style={{ width: `${timePct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question card */}
            <div className="rounded-3xl bg-white ring-1 ring-inputBorder/50 overflow-hidden mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                    {/* Question + answers */}
                    <div className={`${questionImage ? "lg:col-span-3" : "lg:col-span-5"} p-5 md:p-7`}>
                        <div className="flex items-start gap-3 mb-5">
                            <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center font-trykker text-lg shadow-md flex-shrink-0">
                                {currentQuestion + 1}
                            </span>
                            <h1 className="text-base md:text-xl font-bold text-black leading-relaxed">
                                {currentQ?.question || "Loading question..."}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {options.map((opt, i) => {
                                const isSelected = selectedAnswer === opt;
                                const t = LETTER_TONES[i % LETTER_TONES.length];
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSelectAnswer(opt)}
                                        className={`group relative overflow-hidden rounded-2xl text-left p-4 ring-2 transition-all flex items-center gap-3 ${
                                            isSelected
                                                ? `bg-gradient-to-br ${t.bg} text-white ring-white shadow-lg scale-[1.02]`
                                                : `bg-white ${t.border} hover:shadow-md hover:-translate-y-0.5`
                                        }`}
                                    >
                                        <span
                                            className={`h-10 w-10 rounded-xl flex items-center justify-center font-trykker text-lg flex-shrink-0 transition ${
                                                isSelected
                                                    ? "bg-white/25 text-white ring-1 ring-white/40"
                                                    : `bg-gradient-to-br ${t.bg} text-white shadow-md`
                                            }`}
                                        >
                                            {LETTERS[i] || i + 1}
                                        </span>
                                        <span
                                            className={`text-sm md:text-base font-semibold leading-snug ${
                                                isSelected ? "text-white" : "text-black"
                                            }`}
                                        >
                                            {opt}
                                        </span>
                                        {isSelected && (
                                            <span className="ml-auto h-7 w-7 rounded-full bg-white/25 ring-1 ring-white/40 flex items-center justify-center flex-shrink-0">
                                                <HiOutlineCheckCircle size={15} className="text-white" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Image (if present) */}
                    {questionImage && (
                        <div className="lg:col-span-2 bg-mainBg/40 lg:border-l border-inputBorder/40 p-5 flex items-center justify-center">
                            <img
                                src={questionImage}
                                alt="Question"
                                className="rounded-2xl object-cover w-full max-h-[320px] lg:max-h-[420px] shadow-md"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Action footer */}
                <div className="px-5 md:px-7 py-4 bg-mainBg/40 border-t border-inputBorder/40 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-grey font-bold inline-flex items-center gap-1">
                        <HiOutlineSparkles size={12} className="text-secondary" />
                        {selectedAnswer ? "Locked in! You can change it." : "Pick the best answer to continue"}
                    </p>
                    <button
                        type="button"
                        onClick={handleNextQuestion}
                        disabled={!selectedAnswer || submitting}
                        className={`inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold transition ${
                            selectedAnswer && !submitting
                                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/30 hover:scale-[1.03]"
                                : "bg-mainBg text-grey cursor-not-allowed"
                        }`}
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Finishing
                            </>
                        ) : currentQuestion < total - 1 ? (
                            <>
                                Next question
                                <HiOutlineArrowRight size={14} />
                            </>
                        ) : (
                            <>
                                <HiOutlineFlag size={14} />
                                Finish quiz
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Question dots */}
            <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-3 overflow-x-auto">
                <div className="flex items-center justify-center gap-1.5 min-w-max">
                    {Array.from({ length: total }).map((_, i) => {
                        const done = i < currentQuestion;
                        const active = i === currentQuestion;
                        return (
                            <div key={i} className="relative flex flex-col items-center gap-1">
                                {active && (
                                    <span className="text-[8px] font-bold text-fuchsia-600 uppercase tracking-wider">Now</span>
                                )}
                                <span
                                    className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold transition ${
                                        done
                                            ? "bg-emerald-500 text-white shadow-sm"
                                            : active
                                                ? "bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-md ring-2 ring-fuchsia-200 scale-110"
                                                : "bg-mainBg text-grey"
                                    }`}
                                >
                                    {done ? <HiOutlineCheckCircle size={14} /> : i + 1}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="pt-4 pb-2 text-center text-xs text-grey">
                <HiOutlineFire className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={12} />
                You're doing amazing! Keep going.
            </p>

            {/* Exit confirmation */}
            {confirmExit && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setConfirmExit(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-orangeBrown/10 ring-1 ring-orangeBrown/20 text-orangeBrown flex items-center justify-center flex-shrink-0">
                                    <HiOutlineExclamationTriangle size={22} />
                                </div>
                                <div>
                                    <h3 className="font-trykker text-lg text-black">Leave the quiz?</h3>
                                    <p className="text-sm text-grey mt-1 leading-relaxed">
                                        Your progress will be lost. Are you sure you want to stop?
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-mainBg flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmExit(false)}
                                className="h-10 px-4 rounded-xl text-sm font-bold text-greyBlack bg-white ring-1 ring-inputBorder/60 hover:ring-grey/40 transition"
                            >
                                Keep playing
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="h-10 px-5 rounded-xl text-sm font-bold text-white bg-orangeBrown hover:bg-orangeBrown/90 transition flex items-center gap-1.5 justify-center"
                            >
                                <HiOutlineXMark size={14} />
                                Yes, leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SoloQuiz;
