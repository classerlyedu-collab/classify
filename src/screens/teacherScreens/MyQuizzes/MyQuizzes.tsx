import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { Navbar, SideDrawer } from "../../../components";
import { Get, Delete } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlinePlus,
    HiOutlineSparkles,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
    HiOutlineExclamationTriangle,
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineRectangleStack,
    HiOutlineArrowRight,
    HiOutlineDocumentText,
} from "react-icons/hi2";

const TONES = [
    { bg: "from-pink-400 to-rose-500", chip: "bg-pink-100 text-pink-700" },
    { bg: "from-sky-400 to-blue-500", chip: "bg-sky-100 text-sky-700" },
    { bg: "from-amber-400 to-orange-500", chip: "bg-amber-100 text-amber-700" },
    { bg: "from-emerald-400 to-teal-500", chip: "bg-emerald-100 text-emerald-700" },
    { bg: "from-violet-400 to-purple-500", chip: "bg-violet-100 text-violet-700" },
    { bg: "from-fuchsia-400 to-pink-500", chip: "bg-fuchsia-100 text-fuchsia-700" },
    { bg: "from-cyan-400 to-blue-500", chip: "bg-cyan-100 text-cyan-700" },
    { bg: "from-lime-400 to-green-500", chip: "bg-lime-100 text-lime-700" },
];
const tone = (i: number) => TONES[i % TONES.length];

const MyQuizzes = () => {
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
    const [deleting, setDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingTitle, setDeletingTitle] = useState<string>("");
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState<string>("all");

    useEffect(() => {
        setLoading(true);
        Get(`/quiz?createdBy=${user?.profile?._id}`)
            .then((d) => {
                if (d.success) setQuizzes(d.data || []);
                else displayMessage(d.message, "error");
            })
            .catch(() => displayMessage("Failed to load quizzes", "error"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async () => {
        if (!deletingId || deleting) return;
        setDeleting(true);
        try {
            const res = await Delete(`/quiz/teacher/${deletingId}`);
            if (res.success) {
                displayMessage("Quiz deleted", "success");
                setQuizzes((prev) => prev.filter((q) => q._id !== deletingId));
                setDeletingId(null);
                setDeletingTitle("");
            } else {
                displayMessage(res.message || "Failed to delete quiz", "error");
            }
        } catch {
            displayMessage("Failed to delete quiz", "error");
        } finally {
            setDeleting(false);
        }
    };

    const grades = useMemo(() => {
        const set = new Set<string>();
        quizzes.forEach((q) => {
            const g = q?.grade?.grade;
            if (g) set.add(String(g));
        });
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [quizzes]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return quizzes.filter((quiz) => {
            if (gradeFilter !== "all" && String(quiz?.grade?.grade) !== gradeFilter) return false;
            if (!q) return true;
            const subj = (quiz?.subject?.name || "").toLowerCase();
            const topic = (quiz?.topic?.name || "").toLowerCase();
            const lesson = (quiz?.lesson?.name || "").toLowerCase();
            const type = (quiz?.type || "").toLowerCase();
            return subj.includes(q) || topic.includes(q) || lesson.includes(q) || type.includes(q);
        });
    }, [quizzes, search, gradeFilter]);

    const stats = useMemo(() => {
        const subjects = new Set(
            quizzes.map((q) => q?.subject?._id || q?.subject).filter(Boolean)
        );
        const topics = new Set(
            quizzes.map((q) => q?.topic?._id || q?.topic).filter(Boolean)
        );
        const totalQuestions = quizzes.reduce(
            (s, q) => s + (Array.isArray(q?.questions) ? q.questions.length : 0),
            0
        );
        return { subjects: subjects.size, topics: topics.size, totalQuestions };
    }, [quizzes]);

    const statCards = [
        {
            label: "Total quizzes",
            value: String(quizzes.length),
            Icon: HiOutlineSparkles,
            tone: "from-primary/15 to-secondary/15 text-secondary",
        },
        {
            label: "Subjects",
            value: String(stats.subjects),
            Icon: HiOutlineBookOpen,
            tone: "from-fadeBlue/15 to-bluecolor/10 text-bluecolor",
        },
        {
            label: "Topics",
            value: String(stats.topics),
            Icon: HiOutlineRectangleStack,
            tone: "from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown",
        },
        {
            label: "Questions",
            value: String(stats.totalQuestions),
            Icon: HiOutlineDocumentText,
            tone: "from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2",
        },
    ];

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Quizzes" hideSearchBar />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto pb-24">
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
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                        />

                        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                            <div className="max-w-xl">
                                <p className="text-xs uppercase tracking-wider text-white/70">Library</p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">My quizzes</h1>
                                {loading ? (
                                    <div className="mt-2 h-4 w-72 rounded bg-white/20 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                                        {quizzes.length === 0
                                            ? "Build your first quiz and assign it to your class."
                                            : `${quizzes.length} quiz${quizzes.length === 1 ? "" : "zes"} created · ${stats.totalQuestions} total question${stats.totalQuestions === 1 ? "" : "s"}.`}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate(RouteName.ADD_QUIZ)}
                                        className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white text-secondary text-sm font-semibold hover:bg-white/95 transition focus:outline-none focus:ring-2 focus:ring-white/60"
                                    >
                                        <HiOutlinePlus size={16} />
                                        New quiz
                                    </button>
                                </div>
                            </div>

                            <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                                <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                                    <HiOutlineSparkles size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Library</p>
                                    {loading ? (
                                        <div className="mt-1 h-4 w-24 rounded bg-white/20 animate-pulse" />
                                    ) : (
                                        <p className="text-sm font-semibold leading-tight">
                                            {quizzes.length} quiz{quizzes.length === 1 ? "" : "zes"}
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
                                    className="text-left group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 hover:ring-primary/40 hover:shadow-md transition"
                                >
                                    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tone} opacity-30 blur-xl pointer-events-none`} />
                                    <span className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.tone} flex items-center justify-center`}>
                                        <Icon size={16} />
                                    </span>
                                    <p className="mt-3 text-[11px] uppercase tracking-wider text-grey font-medium">{s.label}</p>
                                    {loading ? (
                                        <div className="mt-1.5 h-7 w-12 rounded-md bg-mainBg animate-pulse" />
                                    ) : (
                                        <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    {/* Library */}
                    <section className="rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
                        <header className="px-5 py-4 border-b border-inputBorder/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <h2 className="font-trykker text-lg text-black">All quizzes</h2>
                                <p className="text-xs text-grey">Edit, share, or remove your quizzes.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <div className="relative w-full sm:w-56">
                                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search subject, topic, type…"
                                        className="w-full h-10 pl-9 pr-3 rounded-xl ring-1 ring-inputBorder/60 bg-mainBg text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:bg-white outline-none transition"
                                    />
                                </div>
                                {grades.length > 0 && (
                                    <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl p-1 self-start sm:self-auto overflow-x-auto max-w-full">
                                        <button
                                            onClick={() => setGradeFilter("all")}
                                            className={`h-7 px-3 text-[11px] font-semibold rounded-lg transition whitespace-nowrap ${
                                                gradeFilter === "all"
                                                    ? "bg-white text-secondary shadow-sm"
                                                    : "text-grey hover:text-greyBlack"
                                            }`}
                                        >
                                            All
                                        </button>
                                        {grades.map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setGradeFilter(g)}
                                                className={`h-7 px-3 text-[11px] font-semibold rounded-lg transition whitespace-nowrap ${
                                                    gradeFilter === g
                                                        ? "bg-white text-secondary shadow-sm"
                                                        : "text-grey hover:text-greyBlack"
                                                }`}
                                            >
                                                Gr {g}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </header>

                        {loading ? (
                            <>
                                <div className="hidden md:block">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-mainBg/60">
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Quiz</th>
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Grade</th>
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Type</th>
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Questions</th>
                                                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-grey">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-inputBorder/30">
                                            {[0, 1, 2, 3].map((i) => (
                                                <tr key={i}>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-mainBg animate-pulse" />
                                                            <div className="space-y-1.5">
                                                                <div className="h-3.5 w-40 rounded bg-mainBg animate-pulse" />
                                                                <div className="h-2.5 w-24 rounded bg-mainBg animate-pulse" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4"><div className="h-5 w-12 rounded-full bg-mainBg animate-pulse" /></td>
                                                    <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-mainBg animate-pulse" /></td>
                                                    <td className="px-5 py-4"><div className="h-4 w-8 rounded bg-mainBg animate-pulse" /></td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <div className="h-8 w-8 rounded-lg bg-mainBg animate-pulse" />
                                                            <div className="h-8 w-8 rounded-lg bg-mainBg animate-pulse" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <ul className="md:hidden divide-y divide-inputBorder/30">
                                    {[0, 1, 2].map((i) => (
                                        <li key={i} className="p-4 flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-mainBg animate-pulse flex-shrink-0" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3.5 w-3/4 rounded bg-mainBg animate-pulse" />
                                                <div className="h-2.5 w-1/2 rounded bg-mainBg animate-pulse" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : !quizzes.length ? (
                            <div className="text-center py-14 px-6">
                                <span className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-secondary/15 items-center justify-center mb-4">
                                    <HiOutlineSparkles className="text-secondary" size={24} />
                                </span>
                                <h3 className="font-trykker text-lg text-black">No quizzes yet</h3>
                                <p className="text-sm text-grey mt-1 max-w-xs mx-auto">
                                    Build your first quiz to test what your students know.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate(RouteName.ADD_QUIZ)}
                                    className="mt-5 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-md hover:shadow-secondary/25 transition"
                                >
                                    <HiOutlinePlus size={14} />
                                    Create a quiz
                                    <HiOutlineArrowRight size={14} />
                                </button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-14 px-6">
                                <span className="inline-flex h-12 w-12 rounded-2xl bg-mainBg items-center justify-center mb-3">
                                    <HiOutlineMagnifyingGlass className="text-grey" size={20} />
                                </span>
                                <p className="text-sm font-semibold text-black">No matches</p>
                                <p className="text-xs text-grey mt-1">Try a different search or filter.</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-mainBg/60">
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Quiz</th>
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Grade</th>
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Type</th>
                                                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Questions</th>
                                                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-grey">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-inputBorder/30">
                                            {filtered.map((quiz, i) => {
                                                const t = tone(i);
                                                const subj = quiz?.subject?.name || "Quiz";
                                                const topic = quiz?.topic?.name || "—";
                                                const lesson = quiz?.lesson?.name;
                                                const grade = quiz?.grade?.grade ?? "—";
                                                const type = quiz?.type || "—";
                                                const qCount = Array.isArray(quiz?.questions) ? quiz.questions.length : 0;
                                                return (
                                                    <tr key={quiz._id} className="hover:bg-mainBg/40 transition">
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                                                                    {(subj || "Q").charAt(0)}
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-black truncate">{topic}</p>
                                                                    <p className="text-[11px] text-grey truncate">
                                                                        <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-bold uppercase tracking-wider mr-1.5 ${t.chip}`}>
                                                                            {subj}
                                                                        </span>
                                                                        {lesson && <span>· {lesson}</span>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-fadeBlue/15 text-bluecolor ring-1 ring-bluecolor/20">
                                                                <HiOutlineAcademicCap size={11} />
                                                                Gr {grade}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-mainBg ring-1 ring-inputBorder/60 text-greyBlack">
                                                                {type}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-sm font-semibold text-black">{qCount}</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => navigate(RouteName.UPDATE_QUIZ, { state: quiz })}
                                                                    className="h-8 w-8 rounded-lg hover:bg-mainBg flex items-center justify-center text-grey hover:text-secondary transition"
                                                                    title="Edit quiz"
                                                                >
                                                                    <HiOutlinePencilSquare size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setDeletingId(quiz._id);
                                                                        setDeletingTitle(quiz?.topic?.name || quiz?.title || `${subj} quiz`);
                                                                    }}
                                                                    className="h-8 w-8 rounded-lg hover:bg-orangeBrown/10 flex items-center justify-center text-grey hover:text-orangeBrown transition"
                                                                    title="Delete quiz"
                                                                >
                                                                    <HiOutlineTrash size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <ul className="md:hidden divide-y divide-inputBorder/30">
                                    {filtered.map((quiz, i) => {
                                        const t = tone(i);
                                        const subj = quiz?.subject?.name || "Quiz";
                                        const topic = quiz?.topic?.name || "—";
                                        const grade = quiz?.grade?.grade ?? "—";
                                        const qCount = Array.isArray(quiz?.questions) ? quiz.questions.length : 0;
                                        return (
                                            <li key={quiz._id} className="p-4 flex items-start gap-3">
                                                <span className={`h-11 w-11 rounded-xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                                                    {(subj || "Q").charAt(0)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-black truncate">{topic}</p>
                                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.chip}`}>
                                                            {subj}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-fadeBlue/15 text-bluecolor">
                                                            Gr {grade}
                                                        </span>
                                                        <span className="text-[10px] text-grey">· {qCount} Qs</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(RouteName.UPDATE_QUIZ, { state: quiz })}
                                                        className="h-8 w-8 rounded-lg bg-mainBg flex items-center justify-center text-grey hover:text-secondary"
                                                    >
                                                        <HiOutlinePencilSquare size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDeletingId(quiz._id);
                                                            setDeletingTitle(quiz?.topic?.name || quiz?.title || `${subj} quiz`);
                                                        }}
                                                        className="h-8 w-8 rounded-lg bg-orangeBrown/10 flex items-center justify-center text-orangeBrown"
                                                    >
                                                        <HiOutlineTrash size={15} />
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </section>
                </div>
            </div>

            {/* Floating "New quiz" button */}
            <button
                type="button"
                onClick={() => navigate(RouteName.ADD_QUIZ)}
                className="fixed bottom-6 right-6 z-30 h-14 px-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 hover:scale-[1.03] transition-all flex items-center gap-2"
            >
                <HiOutlinePlus size={18} />
                New quiz
            </button>

            {/* Delete confirmation modal */}
            {deletingId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => !deleting && setDeletingId(null)}
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
                                    <h3 className="font-trykker text-lg text-black">Delete quiz?</h3>
                                    <p className="text-sm text-grey mt-1 leading-relaxed">
                                        <span className="font-semibold text-greyBlack">"{deletingTitle}"</span>{" "}
                                        will be permanently removed. Student attempts keep their scores, but the quiz won't be available anymore.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-mainBg flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeletingId(null)}
                                className="h-10 px-4 rounded-xl text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 hover:ring-grey/40 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-orangeBrown hover:bg-orangeBrown/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Deleting…
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineTrash size={14} />
                                        Yes, delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyQuizzes;
