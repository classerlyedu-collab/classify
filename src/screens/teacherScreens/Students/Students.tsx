import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { FloatingInput, FloatingSelect } from "../../../components/FloatingInput";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import { UseStateContext } from "../../../context/ContextProvider";
import {
    HiOutlineUsers,
    HiOutlineAcademicCap,
    HiOutlineSparkles,
    HiOutlineMagnifyingGlass,
    HiOutlinePlus,
    HiOutlineArrowRight,
    HiOutlineChatBubbleLeftRight,
    HiOutlineXMark,
    HiOutlineIdentification,
    HiOutlinePaperAirplane,
    HiOutlineUserGroup,
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

const getInitials = (name?: string) =>
    (name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "S";

interface Comment {
    _id: string;
    text: string;
    subject?: { _id: string; name: string };
    user: { _id: string; fullName: string };
    userType: "Teacher" | "Student";
    recipient: { _id: string; fullName: string };
    recipientType: "Teacher" | "Student";
    createdAt: string;
}

const Students = () => {
    const navigate = useNavigate();
    const { role } = UseStateContext();

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState<string>("all");

    // Add student
    const [showAdd, setShowAdd] = useState(false);
    const [studentCode, setStudentCode] = useState("");
    const [selectedGrade, setSelectedGrade] = useState<string | number | null>(null);
    const [gradeData, setGradeData] = useState<any[]>([]);
    const [loadingGradeData, setLoadingGradeData] = useState(true);
    const [adding, setAdding] = useState(false);

    // Comments dialog
    const [showComments, setShowComments] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<string | number | null>(null);
    const [sending, setSending] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const [studentMessageCounts, setStudentMessageCounts] = useState<Record<string, number>>({});

    const fetchStudentMessageCounts = (list: any[]) => {
        list.forEach((s: any) => {
            const studentAuthId = s?.auth?._id;
            if (!studentAuthId) return;
            Get(`/teacher/comments/${studentAuthId}`)
                .then((d: any) => {
                    if (d?.success) {
                        const unreadFromStudent = (d.data || []).filter(
                            (c: any) =>
                                c?.userType === "Student" && c?.readByRecipient !== true
                        ).length;
                        setStudentMessageCounts((prev) => ({
                            ...prev,
                            [studentAuthId]: unreadFromStudent,
                        }));
                    }
                })
                .catch(() => {
                    /* silent — badges are optional */
                });
        });
    };

    const fetchStudents = (silent = false) => {
        if (!silent) setLoading(true);
        Get("/teacher/mystudents")
            .then((d) => {
                if (d.success) {
                    const list = d.data || [];
                    setStudents(list);
                    fetchStudentMessageCounts(list);
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch((err) => displayMessage(err.message, "error"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setLoadingGradeData(true);
        Get("/grade")
            .then((d) => (d.success ? setGradeData(d.data || []) : displayMessage(d.message, "error")))
            .catch((e) => displayMessage(e.message, "error"))
            .finally(() => setLoadingGradeData(false));
    }, []);

    useEffect(() => {
        if (showComments) {
            setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
    }, [showComments, comments]);

    const grades = useMemo(() => {
        const set = new Set<string>();
        students.forEach((s) => {
            const g = s?.grade?.grade;
            if (g) set.add(String(g));
        });
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [students]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return students.filter((s) => {
            if (gradeFilter !== "all" && String(s?.grade?.grade) !== gradeFilter) return false;
            if (!q) return true;
            const name = (s?.auth?.fullName || s?.auth?.userName || "").toLowerCase();
            const code = (s?.code || "").toLowerCase();
            const parent = (s?.parent?.auth?.fullName || "").toLowerCase();
            return name.includes(q) || code.includes(q) || parent.includes(q);
        });
    }, [students, search, gradeFilter]);

    const stats = useMemo(() => {
        const distinctGrades = grades.length;
        const linkedToParent = students.filter((s) => s?.parent?.auth?._id).length;
        return { total: students.length, grades: distinctGrades, parents: linkedToParent };
    }, [students, grades]);

    const handleAddStudent = () => {
        if (!studentCode.trim() || !selectedGrade || adding) return;
        setAdding(true);
        Post("/teacher/addstudent", { stdId: [studentCode.trim()], grade: selectedGrade })
            .then((d) => {
                if (d.success) {
                    displayMessage(d.message || "Student added", "success");
                    setStudentCode("");
                    setSelectedGrade(null);
                    setShowAdd(false);
                    fetchStudents(true);
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch((err) => displayMessage(err.message, "error"))
            .finally(() => setAdding(false));
    };

    const openComments = async (student: any) => {
        setSelectedStudent(student);
        setShowComments(true);
        setComments([]);
        setStudentSubjects([]);
        setNewComment("");
        setSelectedSubject(null);
        setIsLoadingComments(true);
        setIsLoadingSubjects(role === "Teacher");
        try {
            const res = await Get(`/teacher/comments/${student.auth._id}`);
            if (res.success) setComments(res.data || []);
            else displayMessage(res.message, "error");
        } catch {
            displayMessage("Failed to load comments", "error");
        } finally {
            setIsLoadingComments(false);
        }
        // Mark student's messages to me as read; clear the badge.
        Post(`/teacher/comments/read/${student.auth._id}`)
            .then(() => {
                setStudentMessageCounts((prev) => ({ ...prev, [student.auth._id]: 0 }));
            })
            .catch(() => {
                /* silent */
            });
        if (role === "Teacher") {
            try {
                const sub = await Get(`/subject/student/${student.auth._id}/subjects`);
                if (sub.success) setStudentSubjects(sub.data || []);
            } catch {
                displayMessage("Failed to load subjects", "error");
            } finally {
                setIsLoadingSubjects(false);
            }
        }
    };

    const closeComments = () => {
        setShowComments(false);
        setSelectedStudent(null);
        setComments([]);
        setStudentSubjects([]);
        setNewComment("");
        setSelectedSubject(null);
    };

    const sendComment = async () => {
        if (!newComment.trim()) {
            displayMessage("Please enter a comment", "error");
            return;
        }
        if (role === "Teacher" && !selectedSubject) {
            displayMessage("Please select a subject", "error");
            return;
        }
        setSending(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const payload: any = {
                text: newComment,
                recipientId: selectedStudent.auth._id,
                recipientType: "Student",
                ...(role === "Teacher" && { subject: selectedSubject }),
            };
            const response = await Post("/teacher/comments", payload);
            if (response.success) {
                const subjectData = studentSubjects.find((sub) => sub._id === selectedSubject);
                const newCommentData: any = {
                    ...response.data,
                    subject: subjectData ? { _id: subjectData._id, name: subjectData.name } : undefined,
                    user: { _id: currentUser._id, fullName: currentUser.fullName },
                    userType: "Teacher",
                };
                setComments([...comments, newCommentData]);
                setNewComment("");
                setSelectedSubject(null);
                displayMessage("Comment sent", "success");
            } else {
                displayMessage(response.message, "error");
            }
        } catch {
            displayMessage("Failed to send comment", "error");
        } finally {
            setSending(false);
        }
    };

    const statCards = [
        {
            label: "Total students",
            value: String(stats.total),
            Icon: HiOutlineUsers,
            tone: "from-primary/15 to-secondary/15 text-secondary",
        },
        {
            label: "Grades",
            value: String(stats.grades),
            Icon: HiOutlineAcademicCap,
            tone: "from-fadeBlue/15 to-bluecolor/10 text-bluecolor",
        },
        {
            label: "Linked to parent",
            value: String(stats.parents),
            Icon: HiOutlineUserGroup,
            tone: "from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2",
        },
        {
            label: "Without parent",
            value: String(Math.max(0, stats.total - stats.parents)),
            Icon: HiOutlineSparkles,
            tone: "from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown",
        },
    ];

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="My Students" />
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
                        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                            <div className="max-w-xl">
                                <p className="text-xs uppercase tracking-wider text-white/70">Class roster</p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">My students</h1>
                                {loading ? (
                                    <div className="mt-2 h-4 w-72 rounded bg-white/20 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                                        {students.length === 0
                                            ? "Add your first student to start tracking progress."
                                            : `${students.length} student${students.length === 1 ? "" : "s"} across ${stats.grades} grade${stats.grades === 1 ? "" : "s"}.`}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdd(true)}
                                        className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white text-secondary text-sm font-semibold hover:bg-white/95 transition focus:outline-none focus:ring-2 focus:ring-white/60"
                                    >
                                        <HiOutlinePlus size={16} />
                                        Add student
                                    </button>
                                </div>
                            </div>

                            <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                                <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                                    <HiOutlineUsers size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Roster</p>
                                    {loading ? (
                                        <div className="mt-1 h-4 w-20 rounded bg-white/20 animate-pulse" />
                                    ) : (
                                        <p className="text-sm font-semibold leading-tight">
                                            {students.length} student{students.length === 1 ? "" : "s"}
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
                                        <div className="mt-1.5 h-7 w-12 rounded-md bg-mainBg animate-pulse" />
                                    ) : (
                                        <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    {/* Students list */}
                    <section className="rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
                        <header className="px-5 py-4 border-b border-inputBorder/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <h2 className="font-trykker text-lg text-black">Roster</h2>
                                <p className="text-xs text-grey">View progress, leave comments, and manage links.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, code, or parent…"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 p-4 flex items-center gap-3">
                                        <div className="h-14 w-14 rounded-2xl bg-mainBg animate-pulse flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 w-3/4 rounded bg-mainBg animate-pulse" />
                                            <div className="h-2.5 w-1/2 rounded bg-mainBg animate-pulse" />
                                            <div className="h-2.5 w-2/3 rounded bg-mainBg animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-14 px-6">
                                <span className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-secondary/15 items-center justify-center mb-4">
                                    <HiOutlineUsers className="text-secondary" size={24} />
                                </span>
                                <h3 className="font-trykker text-lg text-black">No students yet</h3>
                                <p className="text-sm text-grey mt-1 max-w-xs mx-auto">
                                    Add a student using their roll number to get started.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowAdd(true)}
                                    className="mt-5 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-md hover:shadow-secondary/25 transition"
                                >
                                    <HiOutlinePlus size={14} />
                                    Add student
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
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                                {filtered.map((s, i) => {
                                    const t = tone(i);
                                    const name = s?.auth?.fullName || s?.auth?.userName || "Student";
                                    const grade = s?.grade?.grade ?? "—";
                                    const code = s?.code || "—";
                                    const img = s?.auth?.image;
                                    const parent = s?.parent?.auth?.fullName;
                                    const studentAuthId = s?.auth?._id;
                                    const msgCount = studentAuthId ? studentMessageCounts[studentAuthId] || 0 : 0;
                                    return (
                                        <li
                                            key={s?._id || i}
                                            className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/40 hover:ring-primary/40 hover:shadow-md transition-all"
                                        >
                                            <div className={`h-1.5 w-full bg-gradient-to-r ${t.bg}`} />
                                            <div className="p-4">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="relative flex-shrink-0">
                                                        {img ? (
                                                            <img
                                                                src={img}
                                                                alt=""
                                                                className="h-14 w-14 rounded-2xl object-cover ring-1 ring-inputBorder/40"
                                                            />
                                                        ) : (
                                                            <span className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center font-trykker text-base shadow-md`}>
                                                                {getInitials(name)}
                                                            </span>
                                                        )}
                                                        {msgCount > 0 && (
                                                            <span
                                                                aria-label={`${msgCount} message${msgCount === 1 ? "" : "s"} from this student`}
                                                                className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm"
                                                            >
                                                                {msgCount > 9 ? "9+" : msgCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-black truncate">{name}</p>
                                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-fadeBlue/15 text-bluecolor">
                                                                <HiOutlineAcademicCap size={10} />
                                                                Gr {grade}
                                                            </span>
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.chip}`}>
                                                                <HiOutlineIdentification size={10} />
                                                                {code}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-grey mt-1.5 truncate">
                                                            Parent: <span className="font-medium text-greyBlack">{parent || "Not linked"}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1.5 pt-3 border-t border-inputBorder/30">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(RouteName.STUDENT_DETAILS_SCREEN, { state: s })
                                                        }
                                                        className="flex-1 h-9 rounded-xl text-xs font-semibold text-secondary bg-mainBg ring-1 ring-secondary/20 hover:bg-secondary hover:text-white hover:ring-secondary transition flex items-center justify-center gap-1.5"
                                                    >
                                                        <HiOutlineSparkles size={13} />
                                                        Details
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openComments(s)}
                                                        className="flex-1 h-9 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition flex items-center justify-center gap-1.5"
                                                    >
                                                        <HiOutlineChatBubbleLeftRight size={13} />
                                                        Comments
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            {/* Floating Add button */}
            <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="fixed bottom-6 right-6 z-30 h-14 px-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 hover:scale-[1.03] transition-all flex items-center gap-2"
            >
                <HiOutlinePlus size={18} />
                Add student
            </button>

            {/* Add student modal */}
            {showAdd && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => !adding && setShowAdd(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-fadeBlue p-5 text-white">
                            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center">
                                        <HiOutlineUserGroup size={18} />
                                    </span>
                                    <div>
                                        <h2 className="font-trykker text-lg leading-tight">Add a student</h2>
                                        <p className="text-xs text-white/85 mt-0.5">Use their roll number to link them to your class.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAdd(false)}
                                    disabled={adding}
                                    className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center disabled:opacity-50"
                                    aria-label="Close"
                                >
                                    <HiOutlineXMark size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <FloatingInput
                                label="Student roll number"
                                value={studentCode}
                                setValue={setStudentCode}
                                required
                            />
                            <FloatingSelect
                                label="Grade"
                                value={selectedGrade ?? ""}
                                setValue={setSelectedGrade}
                                options={gradeData.map((g) => ({ value: g._id, label: g.grade }))}
                                loading={loadingGradeData}
                                required
                            />
                            <p className="text-[11px] text-grey">
                                Tip: ask the student to share their student code from their profile.
                            </p>
                        </div>

                        <div className="px-5 py-4 bg-mainBg flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                disabled={adding}
                                className="h-10 px-4 rounded-xl text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 hover:ring-grey/40 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddStudent}
                                disabled={adding || !studentCode.trim() || !selectedGrade}
                                className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {adding ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Adding…
                                    </>
                                ) : (
                                    <>
                                        <HiOutlinePlus size={14} />
                                        Add student
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments dialog */}
            {showComments && selectedStudent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
                    onClick={closeComments}
                >
                    <div
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-fadeBlue p-5 text-white flex-shrink-0">
                            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                            <div className="relative flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {selectedStudent?.auth?.image ? (
                                        <img
                                            src={selectedStudent.auth.image}
                                            alt=""
                                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/30 flex-shrink-0"
                                        />
                                    ) : (
                                        <span className="h-12 w-12 rounded-2xl bg-white text-secondary flex items-center justify-center font-trykker text-base shadow-md flex-shrink-0 ring-2 ring-white/30">
                                            {getInitials(selectedStudent?.auth?.fullName)}
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <h2 className="font-trykker text-lg leading-tight truncate">
                                            {selectedStudent?.auth?.fullName}
                                        </h2>
                                        <p className="text-xs text-white/85 mt-0.5 inline-flex items-center gap-1.5">
                                            <HiOutlineChatBubbleLeftRight size={11} />
                                            Comments thread
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeComments}
                                    className="h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0"
                                    aria-label="Close"
                                >
                                    <HiOutlineXMark size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Comments list */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-mainBg/40 [scrollbar-width:thin]">
                            {isLoadingComments ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-secondary/15 items-center justify-center mb-3">
                                        <HiOutlineChatBubbleLeftRight className="text-secondary" size={22} />
                                    </span>
                                    <p className="text-sm font-semibold text-black">No comments yet</p>
                                    <p className="text-xs text-grey mt-1">Start the conversation below.</p>
                                </div>
                            ) : (
                                <>
                                    {comments.map((comment) => {
                                        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                                        const isMine = comment.user?._id === currentUser._id;
                                        return (
                                            <div
                                                key={comment._id}
                                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl p-3 ring-1 shadow-sm ${
                                                        isMine
                                                            ? "bg-gradient-to-br from-primary to-secondary text-white ring-secondary/30"
                                                            : "bg-white text-greyBlack ring-inputBorder/50"
                                                    }`}
                                                >
                                                    {comment.subject && (
                                                        <span
                                                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mb-1.5 ${
                                                                isMine
                                                                    ? "bg-white/20 text-white"
                                                                    : "bg-mainBg text-greyBlack"
                                                            }`}
                                                        >
                                                            {comment.subject.name}
                                                        </span>
                                                    )}
                                                    <p className="text-sm leading-snug">{comment.text}</p>
                                                    <p
                                                        className={`text-[10px] mt-1 font-medium ${isMine ? "text-white/75" : "text-grey"}`}
                                                    >
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={commentsEndRef} />
                                </>
                            )}
                        </div>

                        {/* Composer */}
                        <div className="border-t border-inputBorder/40 p-4 bg-white space-y-2 flex-shrink-0">
                            {role === "Teacher" && (
                                <FloatingSelect
                                    label="Subject"
                                    value={selectedSubject ?? ""}
                                    setValue={setSelectedSubject}
                                    options={studentSubjects.map((sub) => ({ value: sub._id, label: sub.name }))}
                                    loading={isLoadingSubjects}
                                    required
                                />
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendComment();
                                        }
                                    }}
                                    placeholder="Type your comment…"
                                    className="flex-1 h-12 px-3.5 rounded-xl ring-1 ring-inputBorder/60 bg-mainBg text-sm focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none transition"
                                />
                                <button
                                    type="button"
                                    onClick={sendComment}
                                    disabled={
                                        sending ||
                                        !newComment.trim() ||
                                        (role === "Teacher" && !selectedSubject)
                                    }
                                    className="h-12 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    {sending ? (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <HiOutlinePaperAirplane size={15} />
                                    )}
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
