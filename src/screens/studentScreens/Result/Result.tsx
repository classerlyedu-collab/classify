import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineTrophy,
    HiOutlineCheckCircle,
    HiOutlineSparkles,
    HiOutlineFire,
    HiOutlineArrowRight,
    HiOutlineMagnifyingGlass,
    HiOutlineXCircle,
    HiOutlineRocketLaunch,
    HiOutlineAcademicCap,
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

const Result = () => {
    const navigate = useNavigate();
    const [myresult, setMyResult] = useState<any>({});
    const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pass" | "fail">("all");
    const [search, setSearch] = useState("");

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);
    const firstName = (user?.profile?.fullName || user?.userName || "Friend").split(" ")[0];

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            Get("/student/myresult"),
            Get("/quiz/student/myquiz?result=pass"),
            Get("/quiz/student/myquiz?result=fail"),
        ])
            .then(([sumRes, passRes, failRes]: any) => {
                if (sumRes.status === "fulfilled" && sumRes.value?.success) {
                    setMyResult(sumRes.value.data || {});
                }
                const pass = passRes.status === "fulfilled" && passRes.value?.success ? passRes.value.data || [] : [];
                const fail = failRes.status === "fulfilled" && failRes.value?.success ? failRes.value.data || [] : [];
                const merged = [
                    ...pass.map((q: any) => ({ ...q, _outcome: "pass" })),
                    ...fail.map((q: any) => ({ ...q, _outcome: "fail" })),
                ].sort((a, b) => {
                    const da = new Date(a?.completedAt || a?.updatedAt || a?.createdAt || 0).getTime();
                    const db = new Date(b?.completedAt || b?.updatedAt || b?.createdAt || 0).getTime();
                    return db - da;
                });
                setAllQuizzes(merged);
            })
            .catch(() => displayMessage("Failed to load results", "error"))
            .finally(() => setLoading(false));
    }, []);

    const passCount = myresult?.passquizes ?? allQuizzes.filter((q) => q._outcome === "pass").length;
    const failCount = myresult?.failquizes ?? allQuizzes.filter((q) => q._outcome === "fail").length;
    const totalCount = passCount + failCount;
    const successRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

    // Average score from items that have score/marks
    const scored = allQuizzes.filter((q) => (q?.score || 0) > 0);
    const avgPct =
        scored.length > 0
            ? Math.round(
                  scored.reduce((s, q) => s + ((q?.marks || 0) / (q?.score || 1)) * 100, 0) /
                      scored.length
              )
            : 0;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return allQuizzes.filter((quiz) => {
            if (filter !== "all" && quiz._outcome !== filter) return false;
            if (!q) return true;
            const subj = (quiz?.subject?.name || quiz?.subject?.subject || "").toLowerCase();
            const topic = (quiz?.topic?.name || quiz?.topic?.topic || "").toLowerCase();
            const lesson = (quiz?.lesson?.name || "").toLowerCase();
            return subj.includes(q) || topic.includes(q) || lesson.includes(q);
        });
    }, [allQuizzes, filter, search]);

    const statCards = [
        {
            label: "Total quizzes",
            value: String(totalCount),
            sticker: "🎯",
            tint: "from-violet-400 to-fuchsia-500",
            Icon: HiOutlineSparkles,
        },
        {
            label: "Passed",
            value: String(passCount),
            sticker: "✅",
            tint: "from-emerald-400 to-teal-500",
            Icon: HiOutlineCheckCircle,
        },
        {
            label: "Need work",
            value: String(failCount),
            sticker: "📝",
            tint: "from-rose-400 to-orange-500",
            Icon: HiOutlineXCircle,
        },
        {
            label: "Average",
            value: avgPct ? `${avgPct}%` : "—",
            sticker: "🔥",
            tint: "from-amber-400 to-orange-500",
            Icon: HiOutlineFire,
        },
    ];

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Results" hideSearchBar={true} />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(244,114,182,0.55)]">
                        <div aria-hidden className="absolute inset-0 pointer-events-none">
                            <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>🏆</span>
                            <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>⭐</span>
                            <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>✨</span>
                            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                            <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        </div>

                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="max-w-xl">
                                <p className="text-xs uppercase tracking-wider text-white/80 font-semibold inline-flex items-center gap-1.5">
                                    <HiOutlineTrophy size={12} />
                                    Your trophy room
                                </p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                                    Look how far you've come, {firstName}! 🌟
                                </h1>
                                <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                                    {loading
                                        ? "Loading your results…"
                                        : totalCount === 0
                                            ? "Take your first quiz to start collecting trophies!"
                                            : `You've completed ${totalCount} quiz${totalCount === 1 ? "" : "zes"} — keep crushing it!`}
                                </p>
                            </div>

                            {/* Success ring */}
                            <div className="flex-shrink-0 self-start lg:self-auto">
                                <div className="relative h-32 w-32 rounded-3xl bg-white/15 ring-2 ring-white/30 backdrop-blur flex flex-col items-center justify-center text-center shadow-xl">
                                    <p className="text-[10px] uppercase tracking-wider text-white/85 font-bold">Pass rate</p>
                                    <p className="font-trykker text-4xl leading-none mt-0.5">
                                        {loading ? "—" : `${successRate}%`}
                                    </p>
                                    <p className="text-[10px] mt-1 font-bold text-white/85">
                                        {passCount} of {totalCount}
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

                    {/* Recent quizzes */}
                    <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Recent results</h2>
                                    <p className="text-xs text-grey">Tap any quiz to see details.</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <div className="relative w-full sm:w-56">
                                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search subject or topic…"
                                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 text-sm font-medium focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition"
                                    />
                                </div>
                                <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl p-1 self-start sm:self-auto">
                                    {([
                                        { k: "all", label: `All${totalCount ? ` (${totalCount})` : ""}` },
                                        { k: "pass", label: `Passed${passCount ? ` (${passCount})` : ""}` },
                                        { k: "fail", label: `Need work${failCount ? ` (${failCount})` : ""}` },
                                    ] as const).map(({ k, label }) => (
                                        <button
                                            key={k}
                                            onClick={() => setFilter(k as any)}
                                            className={`h-7 px-3 text-[11px] font-bold rounded-lg transition whitespace-nowrap ${
                                                filter === k
                                                    ? k === "pass"
                                                        ? "bg-emerald-500 text-white shadow-sm"
                                                        : k === "fail"
                                                            ? "bg-rose-500 text-white shadow-sm"
                                                            : "bg-white text-fuchsia-600 shadow-sm"
                                                    : "text-grey hover:text-greyBlack"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </header>

                        {loading ? (
                            <div className="space-y-2">
                                {[0, 1, 2, 3, 4].map((i) => (
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
                                <span className="text-5xl block mb-2">{search || filter !== "all" ? "🔍" : "🌱"}</span>
                                <p className="text-sm font-bold text-black">
                                    {search || filter !== "all" ? "No matches" : "No quizzes yet"}
                                </p>
                                <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
                                    {search || filter !== "all"
                                        ? "Try a different search or filter."
                                        : "Take your first quiz to see results here!"}
                                </p>
                                {!(search || filter !== "all") && (
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
                            <ul className="flex flex-col gap-2">
                                {filtered.map((q, i) => {
                                    const t = tone(i);
                                    const subj = q?.subject?.name || q?.subject?.subject || "Quiz";
                                    const topic = q?.topic?.name || q?.topic?.topic || "";
                                    const lesson = q?.lesson?.name || "";
                                    const passed = q._outcome === "pass";
                                    const score = q?.score || 0;
                                    const marks = q?.marks || 0;
                                    const pct = score > 0 ? Math.round((marks / score) * 100) : null;
                                    return (
                                        <li
                                            key={q?._id || i}
                                            onClick={() =>
                                                navigate(RouteName.QUIZZES_DETAILS, {
                                                    state: { title: q._outcome },
                                                })
                                            }
                                            className="group flex items-center gap-3 rounded-2xl bg-white ring-1 ring-inputBorder/40 hover:ring-fuchsia-300 hover:shadow-md hover:-translate-y-0.5 transition-all p-3 cursor-pointer"
                                        >
                                            <span className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                                                {t.emoji}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.chip}`}>
                                                        {subj}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            passed
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-rose-100 text-rose-700"
                                                        }`}
                                                    >
                                                        {passed ? <HiOutlineCheckCircle size={10} /> : <HiOutlineXCircle size={10} />}
                                                        {passed ? "Passed" : "Try again"}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-black truncate">
                                                    {topic || lesson || "Quiz"}
                                                </p>
                                                {lesson && topic && (
                                                    <p className="text-[11px] text-grey truncate">
                                                        Lesson: {lesson}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end flex-shrink-0">
                                                {pct !== null ? (
                                                    <p className={`font-trykker text-xl leading-none ${passed ? "text-emerald-600" : "text-rose-600"}`}>
                                                        {pct}%
                                                    </p>
                                                ) : (
                                                    <p className="font-trykker text-lg text-grey leading-none">—</p>
                                                )}
                                                <p className="text-[10px] text-grey font-bold mt-0.5">
                                                    {marks}/{score}
                                                </p>
                                                <HiOutlineArrowRight
                                                    className="mt-1 text-grey group-hover:text-fuchsia-500 group-hover:translate-x-0.5 transition-all"
                                                    size={12}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/* CTA strip */}
                    {!loading && totalCount > 0 && (
                        <section className="mt-5">
                            <button
                                type="button"
                                onClick={() => navigate(RouteName.DAILY_QUIZ)}
                                className="group relative overflow-hidden w-full rounded-3xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 text-white p-5 shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-between text-left"
                            >
                                <div aria-hidden className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                                <div className="relative flex items-center gap-3">
                                    <span className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center text-2xl flex-shrink-0">
                                        🚀
                                    </span>
                                    <div>
                                        <p className="font-trykker text-lg leading-tight">Beat your best score!</p>
                                        <p className="text-xs text-white/85 mt-0.5">
                                            Pick a new quiz and earn more XP.
                                        </p>
                                    </div>
                                </div>
                                <HiOutlineArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
                            </button>
                        </section>
                    )}

                    <p className="pt-6 pb-4 text-center text-xs text-grey">
                        <HiOutlineAcademicCap className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={12} />
                        Every result is a step toward awesome. Keep at it!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Result;
