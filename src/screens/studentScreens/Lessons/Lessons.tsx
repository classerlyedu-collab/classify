import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlineBookOpen,
    HiOutlineSparkles,
    HiOutlineCheckCircle,
    HiOutlineDocumentText,
    HiOutlineLanguage,
    HiOutlinePlay,
    HiOutlineMagnifyingGlass,
    HiOutlineFire,
    HiOutlineLockClosed,
} from "react-icons/hi2";

interface Lesson {
    name: string;
    image?: string;
    content: string;
    words?: number;
    pages?: number;
    lang?: string;
    _id: any;
    per?: string;
    status?: string;
}

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

const isComplete = (status?: string) => /100\s*%|^complete/i.test(status || "");
const progressPct = (status?: string) => {
    const m = status?.match(/(\d+)\s*%/);
    return m ? Math.min(100, parseInt(m[1])) : 0;
};

const Lessons = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const topicId = searchParams.get("topic");

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const subject = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("subject") || "{}");
        } catch {
            return {};
        }
    }, []);

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    const isStudent = user?.userType === "Student";
    const canOpenLessons = user?.userType !== "Parent";

    useEffect(() => {
        setLoading(true);
        Get(`/topic/lesson`, topicId)
            .then((d) => {
                if (!d.success) {
                    displayMessage(d.message, "error");
                    return;
                }
                if ((d.data?.length || 0) === 0) {
                    displayMessage("No lessons in this topic yet", "info");
                }
                setLessons(d.data || []);
            })
            .catch(() => displayMessage("Failed to load lessons", "error"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId]);

    const stats = useMemo(() => {
        const completed = lessons.filter((l) => isComplete(l.status)).length;
        const inProgress = lessons.filter((l) => {
            const p = progressPct(l.status);
            return p > 0 && p < 100;
        }).length;
        const totalWords = lessons.reduce((s, l) => s + (Number(l.words) || 0), 0);
        const totalPages = lessons.reduce((s, l) => s + (Number(l.pages) || 0), 0);
        return { completed, inProgress, totalWords, totalPages };
    }, [lessons]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return lessons;
        return lessons.filter((l) => (l.name || "").toLowerCase().includes(q));
    }, [lessons, search]);

    const continueLesson = useMemo(() => {
        if (!lessons.length) return null;
        const inProg = lessons.find((l) => {
            const p = progressPct(l.status);
            return p > 0 && p < 100;
        });
        if (inProg) return inProg;
        return lessons.find((l) => !isComplete(l.status)) || lessons[0];
    }, [lessons]);

    const openLesson = (lesson: Lesson) => {
        if (!canOpenLessons) return;
        try {
            localStorage.setItem("lesson", JSON.stringify(lesson));
            localStorage.setItem("lessonid", JSON.stringify(lesson._id));
        } catch {}
        navigate(`${RouteName.MATERIAL_STUDENT}?content=${lesson.content}`);
    };

    const subjectName = subject?.name || "Lessons";

    const statCards = [
        {
            label: "Lessons",
            value: String(lessons.length),
            sticker: "📚",
            tint: "from-violet-400 to-fuchsia-500",
            Icon: HiOutlineBookOpen,
        },
        {
            label: "Completed",
            value: String(stats.completed),
            sticker: "✅",
            tint: "from-emerald-400 to-teal-500",
            Icon: HiOutlineCheckCircle,
        },
        {
            label: "In progress",
            value: String(stats.inProgress),
            sticker: "🔥",
            tint: "from-amber-400 to-orange-500",
            Icon: HiOutlineFire,
        },
        {
            label: stats.totalPages ? "Total pages" : "Total words",
            value: stats.totalPages ? String(stats.totalPages) : String(stats.totalWords),
            sticker: stats.totalPages ? "📄" : "✏️",
            tint: "from-pink-400 to-rose-500",
            Icon: HiOutlineDocumentText,
        },
    ];

    return (
        <div className="px-2 py-2 md:px-2 md:py-4">
            {/* Back link */}
            <button
                type="button"
                onClick={() => navigate(`${RouteName.TOPICS_SUBJECTS}?subject=${subject?._id || ""}`)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline mb-3"
            >
                <HiOutlineArrowLeft size={14} />
                Back to topics
            </button>

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-cyan-500 via-sky-500 to-violet-600 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(99,102,241,0.55)]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>📖</span>
                    <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>✨</span>
                    <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>🌟</span>
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4 max-w-xl">
                        <span className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-4xl flex-shrink-0">
                            📚
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">Lessons</p>
                            <h1 className="font-trykker text-3xl md:text-4xl mt-0.5 leading-tight truncate">
                                {subjectName}
                            </h1>
                            <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                                {loading
                                    ? "Loading your lessons…"
                                    : lessons.length === 0
                                        ? "No lessons in this topic yet — check back soon!"
                                        : `Pick a lesson to start reading. ${lessons.length} lesson${lessons.length > 1 ? "s" : ""} ready for you!`}
                            </p>
                        </div>
                    </div>

                    {/* Continue card */}
                    {continueLesson && !loading && canOpenLessons && (
                        <button
                            type="button"
                            onClick={() => openLesson(continueLesson)}
                            className="group relative w-full max-w-sm rounded-3xl bg-white/15 ring-1 ring-white/25 backdrop-blur p-4 text-left hover:bg-white/20 transition flex-shrink-0"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <HiOutlineFire size={10} />
                                    {progressPct(continueLesson.status) > 0 ? "Continue" : "Up next"}
                                </span>
                                {continueLesson.lang && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 ring-1 ring-white/25 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <HiOutlineLanguage size={10} />
                                        {continueLesson.lang}
                                    </span>
                                )}
                            </div>
                            <p className="text-xl md:text-2xl font-trykker leading-tight mb-2 line-clamp-2">
                                {continueLesson.name}
                            </p>
                            {isStudent && progressPct(continueLesson.status) > 0 && (
                                <>
                                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                                        <span className="text-white/85 font-bold">Progress</span>
                                        <span className="font-bold">{progressPct(continueLesson.status)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-3">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all"
                                            style={{ width: `${progressPct(continueLesson.status)}%` }}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="inline-flex items-center gap-1 text-xs font-bold bg-white text-sky-600 px-3 py-1.5 rounded-full">
                                <HiOutlinePlay size={12} />
                                {progressPct(continueLesson.status) > 0 ? "Continue reading" : "Start reading"}
                                <HiOutlineArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </button>
                    )}
                </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
                {statCards.map((s) => {
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

            {/* Lessons list */}
            <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📖</span>
                        <div>
                            <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Choose a lesson</h2>
                            <p className="text-xs text-grey">Tap any card to start reading.</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-64">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search lessons…"
                            className="w-full h-10 pl-9 pr-3 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 text-sm font-medium focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none transition"
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 overflow-hidden">
                                <div className="h-2 w-full bg-mainBg animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-mainBg animate-pulse flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-4 w-3/4 rounded bg-mainBg animate-pulse" />
                                            <div className="h-3 w-1/2 rounded bg-mainBg animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-2 w-full rounded bg-mainBg animate-pulse" />
                                    <div className="h-10 rounded-xl bg-mainBg animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-10 text-center">
                        <span className="text-5xl block mb-2">{search ? "🔍" : "🌱"}</span>
                        <p className="text-sm font-bold text-black">
                            {search ? "No matches" : "No lessons yet"}
                        </p>
                        <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
                            {search
                                ? "Try a different lesson name."
                                : "Your teacher is preparing lessons. Check back soon!"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((l, i) => {
                            const t = tone(i);
                            const completed = isComplete(l.status);
                            const pct = progressPct(l.status);
                            const inProg = pct > 0 && !completed;
                            return (
                                <div
                                    key={l._id || i}
                                    className={`group relative overflow-hidden rounded-2xl bg-white ring-1 transition-all ${
                                        canOpenLessons
                                            ? "ring-inputBorder/40 hover:ring-sky-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                            : "ring-inputBorder/40 opacity-90"
                                    }`}
                                    onClick={() => openLesson(l)}
                                    role={canOpenLessons ? "button" : undefined}
                                    tabIndex={canOpenLessons ? 0 : -1}
                                    onKeyDown={(e) => {
                                        if (canOpenLessons && (e.key === "Enter" || e.key === " ")) {
                                            e.preventDefault();
                                            openLesson(l);
                                        }
                                    }}
                                >
                                    <div className={`h-2 w-full bg-gradient-to-r ${t.bg}`} />
                                    <div className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center font-trykker text-lg shadow-md flex-shrink-0`}>
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-bold text-black leading-tight line-clamp-2">{l.name}</p>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    {l.lang && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-mainBg text-greyBlack/80 px-1.5 py-0.5 rounded-full">
                                                            <HiOutlineLanguage size={10} />
                                                            {l.lang}
                                                        </span>
                                                    )}
                                                    {!!l.words && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-mainBg text-greyBlack/80 px-1.5 py-0.5 rounded-full">
                                                            <HiOutlineDocumentText size={10} />
                                                            {l.words} words
                                                        </span>
                                                    )}
                                                    {!!l.pages && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-mainBg text-greyBlack/80 px-1.5 py-0.5 rounded-full">
                                                            <HiOutlineDocumentText size={10} />
                                                            {l.pages} pages
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {completed ? (
                                                <span className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0" aria-label="Completed">
                                                    <HiOutlineCheckCircle size={15} />
                                                </span>
                                            ) : !canOpenLessons ? (
                                                <span className="h-7 w-7 rounded-full bg-mainBg text-grey flex items-center justify-center flex-shrink-0" aria-label="Locked">
                                                    <HiOutlineLockClosed size={14} />
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Status pill / progress */}
                                        {isStudent && (
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between text-[11px] mb-1">
                                                    <span className={`inline-flex items-center gap-1 font-bold ${
                                                        completed ? "text-emerald-700" : inProg ? "text-amber-700" : "text-grey"
                                                    }`}>
                                                        {completed ? "✅ Done!" : inProg ? "🔥 In progress" : "🌱 Not started"}
                                                    </span>
                                                    <span className="font-bold text-black">{pct}%</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-mainBg overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            completed
                                                                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                                                : inProg
                                                                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                                                    : "bg-inputBorder"
                                                        }`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.chip}`}>
                                                <HiOutlineSparkles size={10} />
                                                +25 XP
                                            </span>
                                            {canOpenLessons ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                                                    {completed ? "Read again" : inProg ? "Continue" : "Start"}
                                                    <HiOutlineArrowRight size={12} />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-grey">
                                                    View only
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <p className="pt-6 pb-4 text-center text-xs text-grey">
                Reading is a superpower — keep going! 📚✨
            </p>
        </div>
    );
};

export default Lessons;
