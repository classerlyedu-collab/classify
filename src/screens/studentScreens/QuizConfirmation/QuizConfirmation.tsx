import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlineRocketLaunch,
    HiOutlineSparkles,
    HiOutlineClock,
    HiOutlineBolt,
    HiOutlinePlay,
    HiOutlineLightBulb,
    HiOutlineHandRaised,
    HiOutlineFire,
    HiOutlineCheckCircle,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineAcademicCap,
    HiOutlineTrophy,
} from "react-icons/hi2";

const calculateTimePerQuestion = (startTime: Date, endTime: Date, questionCount: number): number => {
    const totalTimeInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    if (totalTimeInSeconds <= 0) return 30;
    const timePerQuestion = Math.floor(totalTimeInSeconds / questionCount);
    return Math.max(30, Math.min(300, timePerQuestion));
};

const QuizConfirmation = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [quizdata, setQuizData] = useState<any>({});
    const [quizes, setQuizes] = useState<any[]>([]);
    const [calculatedTime, setCalculatedTime] = useState<number>(300);
    const [actualQuestionCount, setActualQuestionCount] = useState<number>(10);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    const subject = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("subject") || "{}");
        } catch {
            return {};
        }
    }, []);

    useEffect(() => {
        if (quizdata?.startsAt && quizdata?.endsAt && quizdata?.questions) {
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
            if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
                const availableQuestions = quizdata.questions.length;
                const questionsToShow = Math.min(10, availableQuestions);
                const timePerQuestion = calculateTimePerQuestion(startTime, endTime, questionsToShow);
                setCalculatedTime(timePerQuestion);
                setActualQuestionCount(questionsToShow);
            }
        }
    }, [quizdata]);

    useEffect(() => {
        const params = new URLSearchParams();
        const quiz = searchParams.get("quiz");
        const topic = searchParams.get("topic");
        const lesson = searchParams.get("lesson");
        if (quiz) params.append("_id", quiz);
        if (topic) params.append("topic", topic);
        if (lesson) params.append("lesson", lesson);
        setLoading(true);
        Get(`/quiz?${params.toString()}`)
            .then((d) => {
                if (d.success) {
                    setQuizes(d.data || []);
                    setQuizData(d.data?.[0] || {});
                } else {
                    setQuizes([]);
                    setQuizData({});
                }
            })
            .catch(() => displayMessage("Failed to load quiz", "error"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStart = () => {
        if (!quizdata?._id || starting) return;
        setStarting(true);
        Post(`/quiz/student/${quizdata._id}?status=start`)
            .then((d) => {
                if (d.success) {
                    navigate(RouteName?.SOLO_QUIZ, { state: quizdata });
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch(() => displayMessage("Could not start quiz", "error"))
            .finally(() => setStarting(false));
    };

    const handleBack = () => {
        const topicId = searchParams.get("topic") || quizdata?.topic?._id || quizdata?.topic;
        if (topicId) {
            navigate(`${RouteName.LESSONS_STUDENT}?topic=${topicId}`);
        } else {
            navigate(`${RouteName.TOPICS_SUBJECTS}?subject=${subject?._id || ""}`);
        }
    };

    const currentIndex = quizes.findIndex((q) => q._id === quizdata._id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < quizes.length - 1;

    const totalSeconds = calculatedTime * actualQuestionCount;
    const totalTimeLabel =
        totalSeconds >= 60
            ? `${Math.round((totalSeconds / 60) * 10) / 10} min`
            : `${totalSeconds} sec`;
    const perQLabel =
        calculatedTime >= 60
            ? `${(calculatedTime / 60).toFixed(1)} min`
            : `${calculatedTime} sec`;

    const lessonName = quizdata?.lesson?.name || "Quiz";
    const topicName = quizdata?.topic?.name || quizdata?.topic?.topic || subject?.name || "Topic";

    return (
        <div className="px-2 py-2 md:px-2 md:py-4">
            {/* Back link */}
            <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline mb-3"
            >
                <HiOutlineArrowLeft size={14} />
                Back to lessons
            </button>

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(236,72,153,0.55)]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>🎯</span>
                    <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>⚡</span>
                    <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>🌟</span>
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="max-w-xl">
                        <p className="text-xs uppercase tracking-wider text-white/80 font-semibold inline-flex items-center gap-1.5">
                            <HiOutlineFire size={12} />
                            Quiz time
                        </p>
                        {loading ? (
                            <>
                                <div className="mt-1 h-9 w-72 rounded bg-white/20 animate-pulse" />
                                <div className="mt-3 h-4 w-80 rounded bg-white/20 animate-pulse" />
                            </>
                        ) : (
                            <>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                                    Ready to play? 🚀
                                </h1>
                                <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                                    {actualQuestionCount} questions about <span className="font-bold">{topicName}</span>. Stay focused and have fun — you got this!
                                </p>
                            </>
                        )}
                    </div>

                    {/* Big trophy emoji */}
                    <div className="hidden md:flex items-center justify-center h-24 w-24 rounded-3xl bg-white/15 ring-2 ring-white/30 backdrop-blur text-6xl shadow-xl">
                        🏆
                    </div>
                </div>
            </section>

            {/* Lesson nav (if multiple) */}
            {!loading && quizes.length > 1 && (
                <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-3 mb-5 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        disabled={!hasPrev}
                        onClick={() => hasPrev && setQuizData(quizes[currentIndex - 1])}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-secondary/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <HiOutlineChevronLeft size={13} />
                        Previous
                    </button>
                    <div className="text-center min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-grey font-bold">Lesson</p>
                        <p className="text-sm font-bold text-black truncate">
                            {lessonName}
                            <span className="text-grey font-medium ml-1.5">
                                ({Math.max(0, currentIndex) + 1} of {quizes.length})
                            </span>
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={!hasNext}
                        onClick={() => hasNext && setQuizData(quizes[currentIndex + 1])}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-secondary/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next
                        <HiOutlineChevronRight size={13} />
                    </button>
                </div>
            )}

            {/* Quiz info stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
                {[
                    {
                        label: "Questions",
                        value: loading ? null : `${actualQuestionCount}`,
                        sub: loading ? null : quizdata?.questions?.length ? `from ${quizdata.questions.length}` : "—",
                        sticker: "🎯",
                        tint: "from-pink-400 to-rose-500",
                        Icon: HiOutlineSparkles,
                    },
                    {
                        label: "Per question",
                        value: loading ? null : perQLabel,
                        sub: loading ? null : "to think + answer",
                        sticker: "⏱️",
                        tint: "from-amber-400 to-orange-500",
                        Icon: HiOutlineClock,
                    },
                    {
                        label: "Total time",
                        value: loading ? null : totalTimeLabel,
                        sub: loading ? null : "to finish",
                        sticker: "⚡",
                        tint: "from-violet-400 to-fuchsia-500",
                        Icon: HiOutlineBolt,
                    },
                    {
                        label: "Earn",
                        value: "+50 XP",
                        sub: "for completing",
                        sticker: "🏆",
                        tint: "from-emerald-400 to-teal-500",
                        Icon: HiOutlineTrophy,
                    },
                ].map((s, i) => {
                    const Icon = s.Icon as any;
                    return (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 hover:scale-[1.02] hover:shadow-md transition-transform"
                        >
                            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.tint} opacity-25 blur-xl pointer-events-none`} />
                            <div className="flex items-center justify-between">
                                <span className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${s.tint} text-white flex items-center justify-center shadow-md`}>
                                    <Icon size={18} />
                                </span>
                                <span className="text-2xl">{s.sticker}</span>
                            </div>
                            <p className="mt-3 text-[11px] uppercase tracking-wider text-grey font-bold">{s.label}</p>
                            {s.value === null ? (
                                <div className="mt-1 h-7 w-20 rounded-md bg-mainBg animate-pulse" />
                            ) : (
                                <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                            )}
                            {s.sub && (
                                <p className="text-[10px] text-grey mt-0.5 font-medium">{s.sub}</p>
                            )}
                        </div>
                    );
                })}
            </section>

            {/* Tips + CTA */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Rules */}
                <div className="lg:col-span-2 rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                    <header className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Before you start</h2>
                            <p className="text-xs text-grey">A few quick tips to do your best.</p>
                        </div>
                    </header>

                    <ul className="space-y-2">
                        {[
                            {
                                Icon: HiOutlineClock,
                                emoji: "⏱️",
                                title: "Watch the timer",
                                desc: `You'll have ${perQLabel} for each question. Pick the best answer you know!`,
                            },
                            {
                                Icon: HiOutlineLightBulb,
                                emoji: "💡",
                                title: "Trust your gut",
                                desc: "If you're unsure, go with your first instinct — it's usually right.",
                            },
                            {
                                Icon: HiOutlineHandRaised,
                                emoji: "🙌",
                                title: "No phone, no friends",
                                desc: "Use just your brain — that's how you'll grow it!",
                            },
                            {
                                Icon: HiOutlineCheckCircle,
                                emoji: "✅",
                                title: "Score & XP",
                                desc: "Right answers earn XP. Don't worry — it's just for fun!",
                            },
                        ].map((tip, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-2xl bg-mainBg/60 hover:bg-mainBg transition"
                            >
                                <span className="h-9 w-9 rounded-xl bg-white ring-1 ring-inputBorder/40 flex items-center justify-center text-lg flex-shrink-0">
                                    {tip.emoji}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-black">{tip.title}</p>
                                    <p className="text-[12px] text-greyBlack/80 mt-0.5 leading-snug">{tip.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Start CTA card */}
                <div className="rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white p-6 ring-2 ring-fuchsia-300/40 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                    <div aria-hidden className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                    <div className="relative h-20 w-20 rounded-3xl bg-white/20 ring-2 ring-white/30 backdrop-blur flex items-center justify-center text-5xl mb-4 shadow-xl">
                        🚀
                    </div>
                    <p className="relative font-trykker text-xl md:text-2xl leading-tight mb-1">
                        Quiz your brain!
                    </p>
                    <p className="relative text-xs text-white/85 leading-relaxed mb-5 max-w-[18ch]">
                        Tap start when you're ready. Good luck!
                    </p>

                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={loading || starting || !quizdata?._id}
                        title={!loading && !quizdata?._id ? "No quiz is available for this topic yet" : undefined}
                        className="relative w-full h-12 rounded-2xl bg-white text-fuchsia-600 text-base font-bold shadow-xl hover:scale-[1.03] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {starting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Starting…
                            </>
                        ) : loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Loading…
                            </>
                        ) : !quizdata?._id ? (
                            <>No quiz available</>
                        ) : (
                            <>
                                <HiOutlinePlay size={18} />
                                Let's start!
                                <HiOutlineArrowRight size={16} />
                            </>
                        )}
                    </button>
                    {!loading && !quizdata?._id && (
                        <p className="relative mt-2 text-[11px] text-white/90 leading-snug max-w-[22ch]">
                            We couldn't find a quiz for this topic yet. Try a different lesson.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handleBack}
                        className="relative mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-white/85 hover:text-white"
                    >
                        Maybe later
                    </button>

                    <div className="relative mt-4 flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold">
                        <HiOutlineAcademicCap size={11} />
                        <span>Practice = stronger brain 💪</span>
                    </div>
                </div>
            </section>

            <p className="pt-2 pb-4 text-center text-xs text-grey">
                <HiOutlineRocketLaunch className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={12} />
                Take a deep breath. You're going to do great!
            </p>
        </div>
    );
};

export default QuizConfirmation;
