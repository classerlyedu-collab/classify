import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowRight,
    HiOutlineHome,
    HiOutlineRocketLaunch,
    HiOutlineSparkles,
    HiOutlineTrophy,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineBolt,
    HiOutlineFire,
    HiOutlineAcademicCap,
} from "react-icons/hi2";

interface ResultState {
    marks?: number;
    score?: number;
    result?: string;
    quizData?: any;
    totalQuestions?: number;
    totalQuizQuestions?: number;
}

const tier = (pct: number) => {
    if (pct >= 95)
        return {
            label: "Quiz Master!",
            sub: "You crushed it — barely a slip!",
            tone: "from-amber-400 via-yellow-400 to-orange-400",
            ring: "ring-amber-300/50",
            shadow: "shadow-amber-300/40",
            sticker: "🏆",
            chip: "bg-amber-200 text-amber-900",
            xp: 100,
        };
    if (pct >= 80)
        return {
            label: "Excellent!",
            sub: "Awesome work — you really know your stuff.",
            tone: "from-emerald-400 via-teal-400 to-cyan-400",
            ring: "ring-emerald-300/50",
            shadow: "shadow-emerald-300/40",
            sticker: "🥇",
            chip: "bg-emerald-200 text-emerald-900",
            xp: 75,
        };
    if (pct >= 60)
        return {
            label: "Nice job!",
            sub: "Solid round — a bit more practice and you'll ace it.",
            tone: "from-sky-400 via-blue-400 to-indigo-400",
            ring: "ring-sky-300/50",
            shadow: "shadow-sky-300/40",
            sticker: "⭐",
            chip: "bg-sky-200 text-sky-900",
            xp: 50,
        };
    if (pct >= 40)
        return {
            label: "Good try!",
            sub: "You're getting there — review and try again.",
            tone: "from-violet-400 via-fuchsia-400 to-pink-400",
            ring: "ring-fuchsia-300/50",
            shadow: "shadow-fuchsia-300/40",
            sticker: "🌟",
            chip: "bg-fuchsia-200 text-fuchsia-900",
            xp: 30,
        };
    return {
        label: "Don't give up!",
        sub: "Practice makes perfect. Take another swing!",
        tone: "from-orange-400 via-rose-400 to-pink-500",
        ring: "ring-rose-300/50",
        shadow: "shadow-rose-300/40",
        sticker: "💪",
        chip: "bg-rose-200 text-rose-900",
        xp: 15,
    };
};

const QuizResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [resultData, setResultData] = useState<ResultState>({});
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (location.state) setResultData(location.state);
        setLoading(false);
        const t = setTimeout(() => setShowConfetti(true), 100);
        return () => clearTimeout(t);
    }, [location.state]);

    const marks = resultData.marks || 0;
    const total = resultData.score || 0;
    const pct = useMemo(() => (total > 0 ? Math.round((marks / total) * 100) : 0), [marks, total]);
    const t = useMemo(() => tier(pct), [pct]);
    const passed = resultData.result === "pass" || pct >= 60;

    const correct = marks;
    const incorrect = Math.max(0, total - marks);
    const totalQs = resultData.totalQuestions || resultData.quizData?.questions?.length || total;

    const subjectName = resultData.quizData?.subject?.name || resultData.quizData?.subject?.subject;
    const topicName = resultData.quizData?.topic?.name || resultData.quizData?.topic?.topic;
    const gradeName = resultData.quizData?.grade?.grade;

    if (loading) {
        return (
            <div className="px-2 py-2 md:px-2 md:py-4 flex items-center justify-center min-h-[60vh]">
                <div className="h-12 w-12 rounded-full border-4 border-fuchsia-200 border-t-fuchsia-500 animate-spin" />
            </div>
        );
    }

    // 12 confetti emoji positions (deterministic)
    const confettiEmoji = ["🎉", "✨", "🎊", "⭐", "🌟", "🎈"];
    const confettiPositions = Array.from({ length: 12 }).map((_, i) => ({
        emoji: confettiEmoji[i % confettiEmoji.length],
        left: `${(i * 8.3) % 100}%`,
        delay: `${(i * 0.15) % 1.5}s`,
        size: 18 + (i % 3) * 6,
    }));

    return (
        <div className="px-2 py-2 md:px-2 md:py-4 pb-12">
            {/* Hero */}
            <section
                className={`relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br ${t.tone} text-white p-6 md:p-10 shadow-[0_30px_70px_-25px_rgba(217,70,239,0.5)] ring-2 ${t.ring}`}
            >
                {/* Confetti shower (only on hi-tier results) */}
                {showConfetti && pct >= 60 && (
                    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
                        {confettiPositions.map((c, i) => (
                            <span
                                key={i}
                                className="absolute -top-8 animate-bounce"
                                style={{
                                    left: c.left,
                                    fontSize: `${c.size}px`,
                                    animationDuration: `${2 + (i % 3) * 0.5}s`,
                                    animationDelay: c.delay,
                                }}
                            >
                                {c.emoji}
                            </span>
                        ))}
                    </div>
                )}
                <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl pointer-events-none" />
                <div aria-hidden className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto">
                    {/* Sticker badge */}
                    <div className={`relative h-28 w-28 md:h-32 md:w-32 rounded-3xl bg-white/20 ring-4 ring-white/30 backdrop-blur flex items-center justify-center text-7xl md:text-8xl mb-4 shadow-2xl ${t.shadow}`}>
                        <span className={showConfetti ? "animate-bounce" : ""} style={{ animationDuration: "2s" }}>
                            {t.sticker}
                        </span>
                    </div>

                    {/* Pass / fail badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 ${
                        passed ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
                    }`}>
                        {passed ? <HiOutlineCheckCircle size={13} /> : <HiOutlineXCircle size={13} />}
                        {passed ? "Passed" : "Try again"}
                    </span>

                    <h1 className="font-trykker text-3xl md:text-5xl leading-tight">{t.label}</h1>
                    <p className="mt-2 text-sm md:text-base text-white/90 max-w-md">{t.sub}</p>

                    {/* Big score */}
                    <div className="mt-6 inline-flex items-baseline gap-2 bg-white/15 ring-1 ring-white/25 backdrop-blur rounded-3xl px-6 py-3">
                        <span className="font-trykker text-6xl md:text-7xl leading-none">{pct}</span>
                        <span className="font-trykker text-3xl md:text-4xl text-white/80 leading-none">%</span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-white/90 uppercase tracking-wider">
                        {marks} of {total} points · {totalQs} question{totalQs === 1 ? "" : "s"}
                    </p>
                </div>
            </section>

            {/* Stat row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
                {[
                    {
                        label: "Correct",
                        value: String(correct),
                        sub: total ? `out of ${total}` : "",
                        sticker: "✅",
                        tint: "from-emerald-400 to-teal-500",
                        Icon: HiOutlineCheckCircle,
                    },
                    {
                        label: "Missed",
                        value: String(incorrect),
                        sub: total ? "to review" : "",
                        sticker: "📝",
                        tint: "from-rose-400 to-orange-500",
                        Icon: HiOutlineXCircle,
                    },
                    {
                        label: "XP earned",
                        value: `+${t.xp}`,
                        sub: "added to your level",
                        sticker: "⚡",
                        tint: "from-amber-400 to-orange-500",
                        Icon: HiOutlineBolt,
                    },
                    {
                        label: "Accuracy",
                        value: `${pct}%`,
                        sub: pct >= 80 ? "amazing!" : pct >= 60 ? "nice work!" : "keep practicing",
                        sticker: "🎯",
                        tint: "from-violet-400 to-fuchsia-500",
                        Icon: HiOutlineSparkles,
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
                            <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                            {s.sub && <p className="text-[10px] text-grey mt-0.5 font-medium">{s.sub}</p>}
                        </div>
                    );
                })}
            </section>

            {/* Quiz info + actions */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                {/* Details card */}
                {resultData.quizData && (
                    <div className="lg:col-span-2 rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                        <header className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">📋</span>
                            <div>
                                <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Quiz details</h2>
                                <p className="text-xs text-grey">Here's what you just played.</p>
                            </div>
                        </header>
                        <ul className="space-y-2">
                            {[
                                { Icon: HiOutlineAcademicCap, label: "Subject", value: subjectName },
                                { Icon: HiOutlineSparkles, label: "Topic", value: topicName },
                                {
                                    Icon: HiOutlineFire,
                                    label: "Questions answered",
                                    value:
                                        resultData.totalQuizQuestions &&
                                        resultData.totalQuizQuestions !== resultData.totalQuestions
                                            ? `${resultData.totalQuestions} (from ${resultData.totalQuizQuestions} available)`
                                            : `${totalQs}`,
                                },
                                { Icon: HiOutlineTrophy, label: "Grade", value: gradeName },
                            ]
                                .filter((row) => row.value)
                                .map((row, i) => {
                                    const Icon = row.Icon as any;
                                    return (
                                        <li
                                            key={i}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-mainBg/60 hover:bg-mainBg transition"
                                        >
                                            <span className="h-9 w-9 rounded-xl bg-white ring-1 ring-inputBorder/40 text-secondary flex items-center justify-center flex-shrink-0">
                                                <Icon size={16} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] uppercase tracking-wider text-grey font-bold">{row.label}</p>
                                                <p className="text-sm font-bold text-black truncate">{row.value}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className={`${resultData.quizData ? "" : "lg:col-span-3 max-w-md mx-auto w-full"} flex flex-col gap-3`}>
                    <button
                        type="button"
                        onClick={() => navigate(RouteName.DAILY_QUIZ)}
                        className="group relative overflow-hidden rounded-3xl text-left bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white p-5 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all ring-2 ring-fuchsia-300/50"
                    >
                        <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                        <div className="relative flex items-center justify-between mb-3">
                            <span className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center">
                                <HiOutlineRocketLaunch size={22} />
                            </span>
                            <span className="text-3xl group-hover:scale-110 transition-transform">🚀</span>
                        </div>
                        <p className="relative font-trykker text-lg leading-tight">Try another quiz</p>
                        <p className="relative text-xs text-white/85 mt-0.5">Keep your streak alive!</p>
                        <HiOutlineArrowRight className="relative mt-3 group-hover:translate-x-1 transition-transform" size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(RouteName.DASHBOARD_SCREEN_STUDENT)}
                        className="group relative overflow-hidden rounded-3xl text-left bg-white ring-1 ring-inputBorder/50 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-md">
                                <HiOutlineHome size={22} />
                            </span>
                            <span className="text-3xl group-hover:scale-110 transition-transform">🏠</span>
                        </div>
                        <p className="font-trykker text-lg text-black leading-tight">Back to dashboard</p>
                        <p className="text-xs text-grey mt-0.5">See your stats and missions</p>
                        <HiOutlineArrowRight className="mt-3 text-grey group-hover:text-secondary group-hover:translate-x-1 transition-transform" size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(RouteName.RESULTS_SCREEN)}
                        className="text-center text-xs font-bold text-secondary hover:underline mt-1"
                    >
                        View all my results →
                    </button>
                </div>
            </section>

            <p className="pt-2 pb-4 text-center text-xs text-grey">
                <HiOutlineSparkles className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={12} />
                {pct >= 80
                    ? "You're on fire! Keep that streak going."
                    : pct >= 60
                        ? "Great effort! Each quiz makes you sharper."
                        : "Every try counts. Come back stronger!"}
            </p>
        </div>
    );
};

export default QuizResult;
