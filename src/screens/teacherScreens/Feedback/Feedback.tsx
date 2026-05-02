import { useEffect, useMemo, useState } from "react";
import { Navbar, SideDrawer } from "../../../components";
import { FloatingSelect } from "../../../components/FloatingInput";
import { displayMessage } from "../../../config";
import { Get, Post } from "../../../config/apiMethods";
import {
    HiOutlineStar,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCalendarDays,
    HiOutlineHandThumbUp,
    HiOutlinePaperAirplane,
    HiOutlineSparkles,
    HiOutlineMagnifyingGlass,
    HiOutlineHeart,
} from "react-icons/hi2";

const RATING_LABELS = ["Needs work", "Okay", "Good", "Very good", "Excellent"];
const RATING_EMOJI = ["😞", "😐", "🙂", "😊", "🤩"];

const TONES = [
    { bg: "from-pink-400 to-rose-500", chip: "bg-pink-100 text-pink-700" },
    { bg: "from-sky-400 to-blue-500", chip: "bg-sky-100 text-sky-700" },
    { bg: "from-amber-400 to-orange-500", chip: "bg-amber-100 text-amber-700" },
    { bg: "from-emerald-400 to-teal-500", chip: "bg-emerald-100 text-emerald-700" },
    { bg: "from-violet-400 to-purple-500", chip: "bg-violet-100 text-violet-700" },
    { bg: "from-fuchsia-400 to-pink-500", chip: "bg-fuchsia-100 text-fuchsia-700" },
];
const tone = (i: number) => TONES[i % TONES.length];

const getInitials = (name?: string) =>
    (name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "S";

const formatDate = (s?: string) => {
    if (!s) return "";
    return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const [activeTab, setActiveTab] = useState<"reviews" | "give">("reviews");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<number | "all">("all");

    // Compose
    const [selectedStudent, setSelectedStudent] = useState<string | number | null>(null);
    const [teacherNote, setTeacherNote] = useState("");
    const [teacherStars, setTeacherStars] = useState<number | null>(null);
    const [hoverStars, setHoverStars] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const refreshFeedback = () => {
        setLoading(true);
        Get("/teacher/feedback")
            .then((d) => {
                if (d.success) setFeedbacks(d.data || []);
                else displayMessage(d.message, "error");
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refreshFeedback();
        setLoadingStudents(true);
        Get("/teacher/mystudents")
            .then((d) => {
                if (d.success) setStudents(d.data || []);
            })
            .catch(() => {})
            .finally(() => setLoadingStudents(false));
    }, []);

    const stats = useMemo(() => {
        const list = feedbacks || [];
        const total = list.length;
        const avg = total ? list.reduce((s, f: any) => s + (Number(f.star) || 0), 0) / total : 0;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recent = list.filter((f: any) => new Date(f.createdAt) > weekAgo).length;
        const satisfaction = Math.round((avg / 5) * 100);
        return { total, avg, recent, satisfaction };
    }, [feedbacks]);

    const ratingCounts = useMemo(() => {
        const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbacks.forEach((f: any) => {
            const s = Number(f?.star) || 0;
            if (s >= 1 && s <= 5) counts[s] += 1;
        });
        return counts;
    }, [feedbacks]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return feedbacks.filter((f: any) => {
            if (filter !== "all" && Number(f?.star) !== filter) return false;
            if (!q) return true;
            const name = (f?.from?.auth?.userName || f?.from?.auth?.fullName || "").toLowerCase();
            const text = (f?.feedback || "").toLowerCase();
            return name.includes(q) || text.includes(q);
        });
    }, [feedbacks, search, filter]);

    const handleSendFeedback = async () => {
        if (!selectedStudent) {
            displayMessage("Pick a student first", "error");
            return;
        }
        if (!teacherStars) {
            displayMessage("Pick a star rating", "error");
            return;
        }
        if (!teacherNote.trim()) {
            displayMessage("Write a quick note", "error");
            return;
        }
        setSubmitting(true);
        try {
            const res: any = await Post("/teacher/feedback", {
                student: selectedStudent,
                feedback: teacherNote.trim(),
                star: teacherStars,
            });
            if (res?.success) {
                displayMessage("Feedback sent to student", "success");
                setTeacherNote("");
                setTeacherStars(null);
                setHoverStars(null);
                setSelectedStudent(null);
                refreshFeedback();
                setActiveTab("reviews");
            } else {
                displayMessage(res?.message || "Failed to send feedback", "error");
            }
        } catch (err: any) {
            displayMessage(err?.message || "Failed to send feedback", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const displayStars = hoverStars ?? teacherStars;

    const statCards = [
        {
            label: "Total reviews",
            value: String(stats.total),
            sub: "all-time",
            Icon: HiOutlineChatBubbleLeftRight,
            tone: "from-primary/15 to-secondary/15 text-secondary",
        },
        {
            label: "Average rating",
            value: stats.total ? `${stats.avg.toFixed(1)}/5` : "—",
            sub: stats.total ? "from your students" : "no reviews yet",
            Icon: HiOutlineStar,
            tone: "from-amber-400/15 to-orange-500/10 text-orangeBrown",
        },
        {
            label: "This week",
            value: String(stats.recent),
            sub: "new in 7 days",
            Icon: HiOutlineCalendarDays,
            tone: "from-fadeBlue/15 to-bluecolor/10 text-bluecolor",
        },
        {
            label: "Satisfaction",
            value: stats.total ? `${stats.satisfaction}%` : "—",
            sub: "happy students",
            Icon: HiOutlineHandThumbUp,
            tone: "from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2",
        },
    ];

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Feedback" />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto pb-12">
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
                                <p className="text-xs uppercase tracking-wider text-white/70 inline-flex items-center gap-1.5">
                                    <HiOutlineHeart size={12} />
                                    Feedback hub
                                </p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                                    What your students think
                                </h1>
                                {loading ? (
                                    <div className="mt-2 h-4 w-72 rounded bg-white/20 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                                        {stats.total === 0
                                            ? "No feedback yet. Drop your first note to a student to start the conversation."
                                            : `${stats.total} review${stats.total === 1 ? "" : "s"} · ${stats.avg.toFixed(1)}/5 average rating.`}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("give")}
                                        className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white text-secondary text-sm font-semibold hover:bg-white/95 transition focus:outline-none focus:ring-2 focus:ring-white/60"
                                    >
                                        <HiOutlinePaperAirplane size={16} />
                                        Send feedback
                                    </button>
                                </div>
                            </div>

                            <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                                <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                                    <HiOutlineStar size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Avg rating</p>
                                    {loading ? (
                                        <div className="mt-1 h-4 w-20 rounded bg-white/20 animate-pulse" />
                                    ) : (
                                        <p className="text-sm font-semibold leading-tight">
                                            {stats.total ? `${stats.avg.toFixed(1)} / 5` : "Not yet"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                        {statCards.map((s) => {
                            const Icon = s.Icon as any;
                            return (
                                <div
                                    key={s.label}
                                    className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 hover:ring-primary/40 hover:shadow-md transition"
                                >
                                    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tone} opacity-30 blur-xl pointer-events-none`} />
                                    <span className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.tone} flex items-center justify-center`}>
                                        <Icon size={16} />
                                    </span>
                                    <p className="mt-3 text-[11px] uppercase tracking-wider text-grey font-medium">{s.label}</p>
                                    {loading ? (
                                        <div className="mt-1.5 h-7 w-16 rounded-md bg-mainBg animate-pulse" />
                                    ) : (
                                        <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                                    )}
                                    <p className="text-[10px] text-grey mt-0.5 font-medium">{s.sub}</p>
                                </div>
                            );
                        })}
                    </section>

                    {/* Main grid */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Rating breakdown */}
                        <div className="lg:col-span-1 rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5 self-start">
                            <header className="mb-4">
                                <h2 className="font-trykker text-lg text-black">Rating breakdown</h2>
                                <p className="text-xs text-grey mt-0.5">How students are rating you.</p>
                            </header>

                            {loading ? (
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((s) => (
                                        <div key={s} className="flex items-center gap-3">
                                            <div className="w-10 h-3 rounded bg-mainBg animate-pulse" />
                                            <div className="flex-1 h-2 rounded-full bg-mainBg animate-pulse" />
                                            <div className="w-6 h-3 rounded bg-mainBg animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            ) : stats.total === 0 ? (
                                <div className="py-6 text-center">
                                    <span className="text-4xl block mb-1">⭐</span>
                                    <p className="text-xs text-grey">No ratings yet.</p>
                                </div>
                            ) : (
                                <ul className="space-y-2.5">
                                    {[5, 4, 3, 2, 1].map((s) => {
                                        const count = ratingCounts[s] || 0;
                                        const pct = stats.total ? (count / stats.total) * 100 : 0;
                                        return (
                                            <li key={s} className="flex items-center gap-3">
                                                <span className="inline-flex items-center gap-0.5 w-9 text-xs font-bold text-greyBlack">
                                                    {s}
                                                    <HiOutlineStar size={12} className="text-amber-400" />
                                                </span>
                                                <div className="flex-1 h-2 rounded-full bg-mainBg overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-xs font-bold text-greyBlack text-right">{count}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            <div className="mt-5 pt-4 border-t border-inputBorder/40 flex items-center gap-3">
                                <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-lg shadow-md">
                                    <HiOutlineSparkles size={18} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-grey font-bold">Satisfaction</p>
                                    <p className="text-sm font-bold text-black">
                                        {stats.total ? `${stats.satisfaction}% love your class` : "Pending feedback"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews / Give */}
                        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
                            <header className="px-5 py-4 border-b border-inputBorder/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <h2 className="font-trykker text-lg text-black">
                                        {activeTab === "reviews" ? "Student reviews" : "Send feedback"}
                                    </h2>
                                    <p className="text-xs text-grey mt-0.5">
                                        {activeTab === "reviews"
                                            ? "What your students are saying."
                                            : "Pick a student, rate, and write a kind note."}
                                    </p>
                                </div>
                                <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl p-1 self-start md:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("reviews")}
                                        className={`h-8 px-3 text-xs font-semibold rounded-lg transition ${
                                            activeTab === "reviews"
                                                ? "bg-white text-secondary shadow-sm"
                                                : "text-grey hover:text-greyBlack"
                                        }`}
                                    >
                                        Reviews{stats.total ? ` (${stats.total})` : ""}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("give")}
                                        className={`h-8 px-3 text-xs font-semibold rounded-lg transition ${
                                            activeTab === "give"
                                                ? "bg-white text-secondary shadow-sm"
                                                : "text-grey hover:text-greyBlack"
                                        }`}
                                    >
                                        Give feedback
                                    </button>
                                </div>
                            </header>

                            {/* REVIEWS LIST */}
                            {activeTab === "reviews" ? (
                                <div className="p-5">
                                    {!loading && feedbacks.length > 0 && (
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
                                            <div className="relative w-full sm:w-56">
                                                <HiOutlineMagnifyingGlass
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                                                    size={14}
                                                />
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    placeholder="Search name or message…"
                                                    className="w-full h-9 pl-9 pr-3 rounded-xl ring-1 ring-inputBorder/60 bg-mainBg text-xs font-medium focus:ring-2 focus:ring-primary/40 focus:bg-white outline-none transition"
                                                />
                                            </div>
                                            <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl p-1 self-start sm:self-auto overflow-x-auto max-w-full">
                                                <button
                                                    onClick={() => setFilter("all")}
                                                    className={`h-7 px-3 text-[11px] font-semibold rounded-lg transition whitespace-nowrap ${
                                                        filter === "all"
                                                            ? "bg-white text-secondary shadow-sm"
                                                            : "text-grey hover:text-greyBlack"
                                                    }`}
                                                >
                                                    All
                                                </button>
                                                {[5, 4, 3, 2, 1].map((s) => {
                                                    const count = ratingCounts[s] || 0;
                                                    if (!count) return null;
                                                    return (
                                                        <button
                                                            key={s}
                                                            onClick={() => setFilter(s)}
                                                            className={`h-7 px-2 text-[11px] font-semibold rounded-lg transition flex items-center gap-1 whitespace-nowrap ${
                                                                filter === s
                                                                    ? "bg-white text-amber-600 shadow-sm"
                                                                    : "text-grey hover:text-greyBlack"
                                                            }`}
                                                        >
                                                            {s}★ ({count})
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {loading ? (
                                        <div className="space-y-3">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 p-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="h-10 w-10 rounded-full bg-mainBg animate-pulse" />
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="h-3 w-1/3 rounded bg-mainBg animate-pulse" />
                                                            <div className="h-2 w-1/4 rounded bg-mainBg animate-pulse" />
                                                        </div>
                                                        <div className="h-3 w-20 rounded bg-mainBg animate-pulse" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="h-3 w-full rounded bg-mainBg animate-pulse" />
                                                        <div className="h-3 w-2/3 rounded bg-mainBg animate-pulse" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : filtered.length === 0 ? (
                                        <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-10 text-center">
                                            <span className="text-5xl block mb-2">{filter !== "all" || search ? "🔍" : "💌"}</span>
                                            <p className="text-sm font-bold text-black">
                                                {filter !== "all" || search ? "No matches" : "No feedback yet"}
                                            </p>
                                            <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
                                                {filter !== "all" || search
                                                    ? "Try a different search or rating."
                                                    : "Encourage your students to share what they think."}
                                            </p>
                                            {!(filter !== "all" || search) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab("give")}
                                                    className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-md hover:shadow-secondary/25 transition"
                                                >
                                                    <HiOutlinePaperAirplane size={14} />
                                                    Send feedback first
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {filtered.map((f: any, i: number) => {
                                                const tn = tone(i);
                                                const name =
                                                    f?.from?.auth?.userName ||
                                                    f?.from?.auth?.fullName ||
                                                    "Student";
                                                const stars = Number(f?.star) || 0;
                                                const img = f?.from?.auth?.image;
                                                return (
                                                    <li
                                                        key={f?._id || i}
                                                        className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/40 hover:ring-primary/40 hover:shadow-md transition-all p-4"
                                                    >
                                                        <div
                                                            aria-hidden
                                                            className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${tn.bg} opacity-15 blur-2xl pointer-events-none`}
                                                        />
                                                        <div className="relative flex items-start justify-between gap-3 mb-3">
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                {img ? (
                                                                    <img
                                                                        src={img}
                                                                        alt=""
                                                                        className="h-10 w-10 rounded-2xl object-cover ring-1 ring-inputBorder/40 flex-shrink-0"
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${tn.bg} text-white flex items-center justify-center font-trykker text-sm shadow-md flex-shrink-0`}
                                                                    >
                                                                        {getInitials(name)}
                                                                    </span>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-black truncate">{name}</p>
                                                                    <p className="text-[11px] text-grey">{formatDate(f?.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                                                {Array.from({ length: 5 }).map((_, idx) => {
                                                                    const filled = idx < stars;
                                                                    return (
                                                                        <HiOutlineStar
                                                                            key={idx}
                                                                            size={14}
                                                                            className={filled ? "text-amber-400" : "text-inputBorder"}
                                                                            style={{ fill: filled ? "currentColor" : "none" }}
                                                                            strokeWidth={1.5}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="relative bg-mainBg/60 rounded-2xl px-4 py-3 ring-1 ring-inputBorder/30">
                                                            <span className="absolute top-2 left-3 text-2xl text-grey/50 leading-none">
                                                                "
                                                            </span>
                                                            <p className="text-sm text-greyBlack leading-relaxed pl-5 pr-2">
                                                                {f?.feedback || "No message provided."}
                                                            </p>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                /* GIVE FEEDBACK */
                                <div className="p-5 space-y-4">
                                    <FloatingSelect
                                        label="Student"
                                        value={selectedStudent ?? ""}
                                        setValue={setSelectedStudent}
                                        options={students.map((s: any) => ({
                                            value: s?._id,
                                            label: s?.auth?.fullName || s?.auth?.userName || "Student",
                                        }))}
                                        loading={loadingStudents}
                                        required
                                    />

                                    <div className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/40 p-5">
                                        <p className="text-[11px] uppercase tracking-wider text-grey font-semibold mb-3">
                                            Rating
                                        </p>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                {Array.from({ length: 5 }).map((_, i) => {
                                                    const filled = (displayStars ?? 0) > i;
                                                    return (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => setTeacherStars(i + 1)}
                                                            onMouseEnter={() => setHoverStars(i + 1)}
                                                            onMouseLeave={() => setHoverStars(null)}
                                                            className={`focus:outline-none transition-transform ${filled ? "scale-110" : "hover:scale-110"}`}
                                                            aria-label={`Rate ${i + 1} star${i ? "s" : ""}`}
                                                        >
                                                            <HiOutlineStar
                                                                size={36}
                                                                className={
                                                                    filled
                                                                        ? "text-amber-400"
                                                                        : "text-inputBorder"
                                                                }
                                                                style={{ fill: filled ? "currentColor" : "none" }}
                                                                strokeWidth={1.5}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-2xl">
                                                    {displayStars ? RATING_EMOJI[displayStars - 1] : "🤔"}
                                                </span>
                                                <p
                                                    className={`text-sm font-bold ${
                                                        displayStars ? "text-amber-600" : "text-grey"
                                                    }`}
                                                >
                                                    {displayStars
                                                        ? RATING_LABELS[displayStars - 1]
                                                        : "Pick a rating"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] uppercase tracking-wider text-grey font-semibold mb-2 ml-1">
                                            Your note
                                        </label>
                                        <textarea
                                            value={teacherNote}
                                            onChange={(e) => setTeacherNote(e.target.value)}
                                            rows={4}
                                            placeholder="Be kind and specific — what's going well? What can they work on?"
                                            className="w-full px-3.5 py-3 rounded-xl ring-1 ring-inputBorder/60 bg-mainBg text-sm leading-relaxed focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none transition resize-none"
                                        />
                                        <div className="mt-1 flex items-center justify-between">
                                            <p className="text-[11px] text-grey">
                                                {teacherNote.trim().length} character{teacherNote.trim().length === 1 ? "" : "s"}
                                            </p>
                                            <p className="text-[11px] text-grey inline-flex items-center gap-1">
                                                <HiOutlineSparkles className="text-secondary" size={11} />
                                                Students see this as a notification
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendFeedback}
                                        disabled={
                                            submitting ||
                                            !selectedStudent ||
                                            !teacherStars ||
                                            !teacherNote.trim()
                                        }
                                        className="w-full h-12 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                    />
                                                </svg>
                                                Sending
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlinePaperAirplane size={16} />
                                                Send feedback
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
