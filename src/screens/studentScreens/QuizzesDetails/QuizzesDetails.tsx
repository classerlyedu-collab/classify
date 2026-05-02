import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineMagnifyingGlass,
    HiOutlineRocketLaunch,
    HiOutlineRocketLaunch as HiOutlineRocket,
    HiOutlineSparkles,
    HiOutlineFire,
    HiOutlineTrophy,
    HiOutlineArrowPath,
} from "react-icons/hi2";

const TONES = [
    { bg: "from-pink-400 to-rose-500", chip: "bg-pink-100 text-pink-700", emoji: "🎨" },
    { bg: "from-sky-400 to-blue-500", chip: "bg-sky-100 text-sky-700", emoji: "🔬" },
    { bg: "from-amber-400 to-orange-500", chip: "bg-amber-100 text-amber-700", emoji: "📐" },
    { bg: "from-emerald-400 to-teal-500", chip: "bg-emerald-100 text-emerald-700", emoji: "📖" },
    { bg: "from-violet-400 to-purple-500", chip: "bg-violet-100 text-violet-700", emoji: "🌍" },
    { bg: "from-fuchsia-400 to-pink-500", chip: "bg-fuchsia-100 text-fuchsia-700", emoji: "🎵" },
    { bg: "from-cyan-400 to-blue-500", chip: "bg-cyan-100 text-cyan-700", emoji: "🚀" },
    { bg: "from-lime-400 to-green-500", chip: "bg-lime-100 text-lime-700", emoji: "🌱" },
];
const tone = (i: number) => TONES[i % TONES.length];

const QuizzesDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location?.state as { title?: string }) || {};
    const isPass = state?.title === "pass";

    const [myresult, setMyResult] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!state?.title) {
            navigate(RouteName.RESULTS_SCREEN);
            return;
        }
        setLoading(true);
        Get(`/quiz/student/myquiz?result=${state.title}`)
            .then((d) => {
                if (d.success) setMyResult(d.data || []);
                else displayMessage(d.message, "error");
            })
            .catch(() => displayMessage("Failed to load results", "error"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return myresult;
        return myresult.filter((it: any) => {
            const subj = (it?.quiz?.subject?.name || "").toLowerCase();
            const topic = (it?.quiz?.topic?.name || "").toLowerCase();
            const lesson = (it?.quiz?.lesson?.name || "").toLowerCase();
            return subj.includes(q) || topic.includes(q) || lesson.includes(q);
        });
    }, [myresult, search]);

    const stats = useMemo(() => {
        const totalMarks = myresult.reduce((sum: number, it: any) => sum + (Number(it?.marks) || 0), 0);
        const totalScore = myresult.reduce((sum: number, it: any) => sum + (Number(it?.score) || 0), 0);
        const avgPct =
            myresult.length === 0
                ? 0
                : Math.round(
                      myresult.reduce((sum: number, it: any) => {
                          const m = Number(it?.marks) || 0;
                          const s = Number(it?.score) || 0;
                          return sum + (s > 0 ? (m / s) * 100 : 0);
                      }, 0) / myresult.length
                  );
        const subjects = new Set(
            myresult.map((it: any) => it?.quiz?.subject?._id || it?.quiz?.subject).filter(Boolean)
        );
        return { totalMarks, totalScore, avgPct, subjects: subjects.size };
    }, [myresult]);

    const handleRetry = (item: any) => {
        if (!item?.quiz?._id || retryingId) return;
        setRetryingId(item.quiz._id);
        Post(`/quiz/student/${item.quiz._id}?status=start`)
            .then((d) => {
                if (d.success) {
                    navigate(RouteName?.SOLO_QUIZ, { state: item.quiz });
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch(() => displayMessage("Could not start the quiz", "error"))
            .finally(() => setRetryingId(null));
    };

    const heroTitle = isPass ? "Your wins" : "Try-again list";
    const heroSubtitle = isPass
        ? "Quizzes you crushed — keep that streak going!"
        : "Don't worry — give them another shot and beat your last score.";
    const heroEmoji = isPass ? "🏆" : "💪";
    const heroGradient = isPass
        ? "from-emerald-400 via-teal-500 to-cyan-500"
        : "from-orange-400 via-rose-500 to-pink-500";
    const heroShadow = isPass
        ? "shadow-[0_25px_60px_-25px_rgba(20,184,166,0.55)]"
        : "shadow-[0_25px_60px_-25px_rgba(244,63,94,0.55)]";

    const statCards = [
        {
            label: "Quizzes",
            value: String(myresult.length),
            sticker: "🎯",
            tint: "from-violet-400 to-fuchsia-500",
            Icon: HiOutlineSparkles,
        },
        {
            label: "Subjects",
            value: String(stats.subjects),
            sticker: "📚",
            tint: "from-sky-400 to-blue-500",
            Icon: HiOutlineRocket,
        },
        {
            label: "Average",
            value: stats.avgPct ? `${stats.avgPct}%` : "—",
            sticker: "🔥",
            tint: "from-amber-400 to-orange-500",
            Icon: HiOutlineFire,
        },
        {
            label: "Total points",
            value: stats.totalScore ? `${stats.totalMarks}/${stats.totalScore}` : "—",
            sticker: isPass ? "🏆" : "💪",
            tint: isPass ? "from-emerald-400 to-teal-500" : "from-rose-400 to-orange-500",
            Icon: HiOutlineTrophy,
        },
    ];

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title={isPass ? "Wins" : "Try Again"} hideSearchBar={true} />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                    {/* Back link */}
                    <button
                        type="button"
                        onClick={() => navigate(RouteName.RESULTS_SCREEN)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline mb-3"
                    >
                        <HiOutlineArrowLeft size={14} />
                        Back to results
                    </button>

                    {/* Hero */}
                    <section className={`relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br ${heroGradient} text-white p-6 md:p-8 ${heroShadow}`}>
                        <div aria-hidden className="absolute inset-0 pointer-events-none">
                            <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>{heroEmoji}</span>
                            <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>⭐</span>
                            <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>✨</span>
                            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                            <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        </div>

                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                            <div className="flex items-center gap-4 min-w-0">
                                <span className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-4xl flex-shrink-0">
                                    {heroEmoji}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-wider text-white/80 font-semibold inline-flex items-center gap-1.5">
                                        {isPass ? (
                                            <>
                                                <HiOutlineCheckCircle size={12} />
                                                Passed
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineXCircle size={12} />
                                                Need work
                                            </>
                                        )}
                                    </p>
                                    <h1 className="font-trykker text-3xl md:text-4xl mt-0.5 leading-tight">{heroTitle}</h1>
                                    <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed max-w-md">
                                        {heroSubtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur px-4 py-3 self-start lg:self-auto">
                                <span className="h-10 w-10 rounded-xl bg-white text-fuchsia-600 flex items-center justify-center text-xl">
                                    🎯
                                </span>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold">Total</p>
                                    <p className="text-sm font-bold leading-tight">
                                        {loading ? "—" : `${myresult.length} quiz${myresult.length === 1 ? "" : "zes"}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
                        {statCards.map((s, i) => {
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
                                    {loading ? (
                                        <div className="mt-1 h-7 w-16 rounded-md bg-mainBg animate-pulse" />
                                    ) : (
                                        <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    {/* Quiz list */}
                    <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{isPass ? "🥇" : "📝"}</span>
                                <div>
                                    <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">
                                        {isPass ? "Quizzes you aced" : "Quizzes to retry"}
                                    </h2>
                                    <p className="text-xs text-grey">Tap a card to play it again.</p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-64">
                                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search subject or topic…"
                                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 text-sm font-medium focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition"
                                />
                            </div>
                        </header>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 p-4 flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-mainBg animate-pulse flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 w-2/3 rounded bg-mainBg animate-pulse" />
                                            <div className="h-2.5 w-1/2 rounded bg-mainBg animate-pulse" />
                                        </div>
                                        <div className="h-9 w-20 rounded-xl bg-mainBg animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-10 text-center">
                                <span className="text-5xl block mb-2">{search ? "🔍" : isPass ? "🌱" : "🎉"}</span>
                                <p className="text-sm font-bold text-black">
                                    {search
                                        ? "No matches"
                                        : isPass
                                            ? "No wins yet"
                                            : "Nothing to retry — nice!"}
                                </p>
                                <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
                                    {search
                                        ? "Try a different subject or topic."
                                        : isPass
                                            ? "Take your first quiz to start collecting wins."
                                            : "You've passed every quiz so far. Keep going!"}
                                </p>
                                {!search && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(RouteName.DAILY_QUIZ)}
                                        className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:shadow-md hover:shadow-fuchsia-500/30 transition"
                                    >
                                        <HiOutlineRocketLaunch size={14} />
                                        Take a quiz
                                        <HiOutlineArrowRight size={14} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filtered.map((item: any, i: number) => {
                                    const t = tone(i);
                                    const subj = item?.quiz?.subject?.name || "Quiz";
                                    const topic = item?.quiz?.topic?.name || "";
                                    const lesson = item?.quiz?.lesson?.name || "";
                                    const score = Number(item?.score) || 0;
                                    const marks = Number(item?.marks) || 0;
                                    const pct = score > 0 ? Math.round((marks / score) * 100) : null;
                                    const retrying = retryingId === item?.quiz?._id;

                                    return (
                                        <li
                                            key={item?._id || i}
                                            className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/40 hover:ring-fuchsia-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                                        >
                                            <div className={`h-1.5 w-full bg-gradient-to-r ${t.bg}`} />
                                            <div className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <span className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                                                        {t.emoji}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.chip}`}>
                                                                {subj}
                                                            </span>
                                                            <span className="text-[10px] text-grey font-bold">#{i + 1}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-black truncate">{topic || lesson || "Quiz"}</p>
                                                        {lesson && topic && (
                                                            <p className="text-[11px] text-grey truncate">Lesson: {lesson}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        {pct !== null ? (
                                                            <p className={`font-trykker text-2xl leading-none ${isPass ? "text-emerald-600" : "text-rose-600"}`}>
                                                                {pct}%
                                                            </p>
                                                        ) : (
                                                            <p className="font-trykker text-lg text-grey leading-none">—</p>
                                                        )}
                                                        <p className="text-[10px] text-grey font-bold mt-0.5">
                                                            {marks}/{score}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-inputBorder/30 flex items-center justify-between gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        isPass
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-rose-100 text-rose-700"
                                                    }`}>
                                                        {isPass ? <HiOutlineCheckCircle size={10} /> : <HiOutlineXCircle size={10} />}
                                                        {isPass ? "Passed" : "Try again"}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRetry(item)}
                                                        disabled={retrying}
                                                        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 ${
                                                            isPass
                                                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-md hover:shadow-emerald-500/30"
                                                                : "bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:shadow-md hover:shadow-fuchsia-500/30"
                                                        }`}
                                                    >
                                                        {retrying ? (
                                                            <>
                                                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>
                                                                Loading
                                                            </>
                                                        ) : (
                                                            <>
                                                                <HiOutlineArrowPath size={13} />
                                                                {isPass ? "Play again" : "Retry"}
                                                                <HiOutlineArrowRight size={11} />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <p className="pt-6 pb-4 text-center text-xs text-grey">
                        <HiOutlineSparkles className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={12} />
                        {isPass
                            ? "Amazing job! Keep stacking those wins."
                            : "Every retry makes you sharper — you got this!"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuizzesDetails;
