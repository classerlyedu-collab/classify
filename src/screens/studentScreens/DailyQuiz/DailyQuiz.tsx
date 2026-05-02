import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Get } from "../../../config/apiMethods";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineRocketLaunch,
    HiOutlineSparkles,
    HiOutlineClock,
    HiOutlineTrophy,
    HiOutlineFire,
    HiOutlineArrowRight,
    HiOutlineBolt,
    HiOutlinePlay,
    HiOutlineMagnifyingGlass,
    HiOutlineStar,
} from "react-icons/hi2";

const SUBJECT_TONES = [
    { bg: "from-pink-400 to-rose-500", chip: "bg-pink-100 text-pink-700", emoji: "🎨" },
    { bg: "from-sky-400 to-blue-500", chip: "bg-sky-100 text-sky-700", emoji: "🔬" },
    { bg: "from-amber-400 to-orange-500", chip: "bg-amber-100 text-amber-700", emoji: "📐" },
    { bg: "from-emerald-400 to-teal-500", chip: "bg-emerald-100 text-emerald-700", emoji: "📖" },
    { bg: "from-violet-400 to-purple-500", chip: "bg-violet-100 text-violet-700", emoji: "🌍" },
    { bg: "from-fuchsia-400 to-pink-500", chip: "bg-fuchsia-100 text-fuchsia-700", emoji: "🎵" },
    { bg: "from-cyan-400 to-blue-500", chip: "bg-cyan-100 text-cyan-700", emoji: "🚀" },
    { bg: "from-lime-400 to-green-500", chip: "bg-lime-100 text-lime-700", emoji: "🌱" },
];
const tone = (i: number) => SUBJECT_TONES[i % SUBJECT_TONES.length];

const DailyQuiz = () => {
    const navigate = useNavigate();
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        Get("/quiz", null, { grade: user?.profile?.grade?._id })
            .then((d) => {
                if (d.success) setQuizzes(d.data || []);
            })
            .finally(() => setLoading(false));
    }, [user?.profile?.grade?._id]);

    // Group by subject for filter chips
    const subjects = useMemo(() => {
        const map = new Map<string, { id: string; name: string; count: number }>();
        quizzes.forEach((q) => {
            const id = q?.subject?._id || q?.subject;
            const name = q?.subject?.name || q?.subject?.subject || "Other";
            if (!id) return;
            const existing = map.get(id);
            if (existing) existing.count += 1;
            else map.set(id, { id, name, count: 1 });
        });
        return Array.from(map.values());
    }, [quizzes]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return quizzes.filter((quiz) => {
            const subId = quiz?.subject?._id || quiz?.subject;
            const subName = (quiz?.subject?.name || quiz?.subject?.subject || "").toLowerCase();
            const topic = (quiz?.topic?.name || quiz?.topic?.topic || "").toLowerCase();
            if (filter !== "all" && subId !== filter) return false;
            if (q && !topic.includes(q) && !subName.includes(q)) return false;
            return true;
        });
    }, [quizzes, search, filter]);

    const featuredQuiz = filtered[0] || quizzes[0];
    const featuredQ = featuredQuiz?.questions?.length || 0;
    const featuredSubject =
        featuredQuiz?.subject?.name || featuredQuiz?.subject?.subject || "Surprise quiz";
    const featuredTopic =
        featuredQuiz?.topic?.name || featuredQuiz?.topic?.topic || "Get ready!";

    const handleStartQuiz = (q: any) => {
        try {
            localStorage.setItem("selectedQuiz", JSON.stringify(q));
        } catch {}
        navigate(RouteName.QUIZ_CONFIRMATION);
    };

    const stats = [
        {
            label: "Today's quizzes",
            value: String(quizzes.length),
            sticker: "🎯",
            tint: "from-pink-400 to-rose-500",
            Icon: HiOutlineRocketLaunch,
        },
        {
            label: "Subjects",
            value: String(subjects.length),
            sticker: "📚",
            tint: "from-violet-400 to-fuchsia-500",
            Icon: HiOutlineSparkles,
        },
        {
            label: "XP per quiz",
            value: "+50",
            sticker: "⚡",
            tint: "from-amber-400 to-orange-500",
            Icon: HiOutlineBolt,
        },
        {
            label: "Best mode",
            value: "Solo",
            sticker: "🏆",
            tint: "from-emerald-400 to-teal-500",
            Icon: HiOutlineTrophy,
        },
    ];

    return (
        <div className="px-2 py-2 md:px-2 md:py-4">
            {/* Hero with featured quiz */}
            <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(236,72,153,0.55)]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>🎯</span>
                    <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.6s" }}>⚡</span>
                    <span className="absolute bottom-10 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>🌟</span>
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="max-w-xl">
                        <p className="text-xs uppercase tracking-wider text-white/80 font-semibold inline-flex items-center gap-1.5">
                            <HiOutlineFire size={12} />
                            Daily quizzes
                        </p>
                        <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                            Time to play! 🎯
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                            Pick a quiz, beat the clock, and earn XP. The more you play, the higher you climb!
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => featuredQuiz && handleStartQuiz(featuredQuiz)}
                                disabled={!featuredQuiz}
                                className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-white text-fuchsia-600 text-sm font-bold shadow-lg hover:scale-[1.03] transition-transform disabled:opacity-60"
                            >
                                <HiOutlinePlay size={16} />
                                Start a quiz
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(RouteName.SOLO_QUIZ)}
                                className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur text-sm font-bold hover:bg-white/25 transition"
                            >
                                <HiOutlineRocketLaunch size={16} />
                                Solo mode
                            </button>
                        </div>
                    </div>

                    {/* Featured quiz card */}
                    {featuredQuiz && (
                        <button
                            type="button"
                            onClick={() => handleStartQuiz(featuredQuiz)}
                            className="group relative w-full max-w-sm rounded-3xl bg-white/15 ring-1 ring-white/25 backdrop-blur p-4 text-left hover:bg-white/20 transition"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <HiOutlineStar size={10} strokeWidth={3} />
                                    Featured
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 ring-1 ring-white/25 px-2 py-0.5 rounded-full">
                                    {featuredSubject}
                                </span>
                            </div>
                            <p className="text-xl md:text-2xl font-trykker leading-tight mb-3">
                                {featuredTopic}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full font-bold">
                                    <HiOutlineSparkles size={11} />
                                    {featuredQ} questions
                                </span>
                                <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full font-bold">
                                    <HiOutlineClock size={11} />
                                    ~{Math.max(2, featuredQ)} min
                                </span>
                                <span className="ml-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-fuchsia-600 group-hover:translate-x-1 transition-transform">
                                    <HiOutlineArrowRight size={14} />
                                </span>
                            </div>
                        </button>
                    )}
                </div>
            </section>

            {/* Stat stickers */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
                {stats.map((s) => {
                    const Icon = s.Icon as any;
                    return (
                        <div
                            key={s.label}
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

            {/* Game modes */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-5">
                <button
                    type="button"
                    onClick={() => navigate(RouteName.SOLO_QUIZ)}
                    className="group relative overflow-hidden rounded-3xl text-left bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all ring-2 ring-violet-300/50"
                >
                    <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                    <div className="relative flex items-center justify-between mb-3">
                        <span className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center">
                            <HiOutlineRocketLaunch size={22} />
                        </span>
                        <span className="text-4xl group-hover:scale-110 transition-transform">🚀</span>
                    </div>
                    <p className="relative font-trykker text-xl md:text-2xl leading-tight">Solo Adventure</p>
                    <p className="relative text-sm text-white/85 mt-1">
                        Race the clock by yourself and earn XP for every correct answer.
                    </p>
                    <div className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full">
                        Start solo
                        <HiOutlineArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => navigate(RouteName.RESULTS_SCREEN)}
                    className="group relative overflow-hidden rounded-3xl text-left bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all ring-2 ring-orange-300/50"
                >
                    <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                    <div className="relative flex items-center justify-between mb-3">
                        <span className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center">
                            <HiOutlineTrophy size={22} />
                        </span>
                        <span className="text-4xl group-hover:scale-110 transition-transform">🏆</span>
                    </div>
                    <p className="relative font-trykker text-xl md:text-2xl leading-tight">My Trophies</p>
                    <p className="relative text-sm text-white/85 mt-1">
                        See how you're doing. Check past scores and beat your high score!
                    </p>
                    <div className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full">
                        View results
                        <HiOutlineArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </section>

            {/* Quiz library */}
            <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎮</span>
                        <div>
                            <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Pick your quiz</h2>
                            <p className="text-xs text-grey">Tap any topic to start playing.</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-64">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search topics…"
                            className="w-full h-10 pl-9 pr-3 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 text-sm font-medium focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition"
                        />
                    </div>
                </header>

                {/* Subject filter chips */}
                {!loading && subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <button
                            type="button"
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                filter === "all"
                                    ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md"
                                    : "bg-mainBg text-greyBlack hover:bg-mainBg/60"
                            }`}
                        >
                            All ({quizzes.length})
                        </button>
                        {subjects.map((s, i) => {
                            const t = tone(i);
                            const active = filter === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setFilter(s.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 ${
                                        active
                                            ? `bg-gradient-to-r ${t.bg} text-white shadow-md`
                                            : `${t.chip} hover:opacity-80`
                                    }`}
                                >
                                    <span>{t.emoji}</span>
                                    {s.name} ({s.count})
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Quiz tiles */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 p-4 h-28 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-10 text-center">
                        <span className="text-5xl block mb-2">{search || filter !== "all" ? "🔍" : "🌱"}</span>
                        <p className="text-sm font-bold text-black">
                            {search || filter !== "all" ? "No matches" : "No quizzes yet"}
                        </p>
                        <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
                            {search || filter !== "all"
                                ? "Try a different topic or subject."
                                : "Your teacher will share quizzes here soon. Check back later!"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.map((q, i) => {
                            const subjId = q?.subject?._id || q?.subject;
                            const idx = subjects.findIndex((s) => s.id === subjId);
                            const t = tone(idx >= 0 ? idx : i);
                            const subj = q?.subject?.name || q?.subject?.subject || "Quiz";
                            const topic = q?.topic?.name || q?.topic?.topic || "Surprise!";
                            const qCount = q?.questions?.length || 0;
                            return (
                                <button
                                    key={q?._id || i}
                                    type="button"
                                    onClick={() => handleStartQuiz(q)}
                                    className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/40 hover:ring-fuchsia-300 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
                                >
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${t.bg}`} />
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <span className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center shadow-md text-2xl flex-shrink-0`}>
                                                {t.emoji}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${t.chip} truncate max-w-full`}>
                                                    {subj}
                                                </span>
                                                <p className="text-sm font-bold text-black mt-1.5 leading-tight line-clamp-2">{topic}</p>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-greyBlack/80 bg-mainBg px-1.5 py-0.5 rounded-full">
                                                        <HiOutlineSparkles size={10} />
                                                        {qCount} Qs
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-greyBlack/80 bg-mainBg px-1.5 py-0.5 rounded-full">
                                                        <HiOutlineClock size={10} />
                                                        ~{Math.max(2, qCount)} min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-inputBorder/30 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                                <HiOutlineBolt size={10} />
                                                +50 XP
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-fuchsia-600 group-hover:translate-x-0.5 transition-transform">
                                                Play
                                                <HiOutlineArrowRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            <p className="pt-6 pb-4 text-center text-xs text-grey">
                You got this! Every quiz makes you smarter 🌟
            </p>
        </div>
    );
};

export default DailyQuiz;
