import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { FloatingSelect } from "../../../components/FloatingInput";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineRocketLaunch,
    HiOutlineSparkles,
    HiOutlineBookOpen,
    HiOutlinePuzzlePiece,
    HiOutlineTrophy,
    HiOutlineFire,
    HiOutlineStar,
    HiOutlineArrowRight,
    HiOutlineAcademicCap,
    HiOutlineBolt,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineChatBubbleLeftRight,
    HiOutlineXMark,
    HiOutlinePaperAirplane,
} from "react-icons/hi2";

interface TeacherComment {
    _id: string;
    text: string;
    subject?: { _id: string; name: string };
    user: { _id: string; fullName?: string; userName?: string };
    userType: "Teacher" | "Student";
    recipient: { _id: string; fullName?: string };
    recipientType: "Teacher" | "Student";
    createdAt: string;
}

const greeting = () => {
    const h = new Date().getHours();
    if (h < 5) return "Hi there";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Hi night owl";
};

const greetingEmoji = () => {
    const h = new Date().getHours();
    if (h < 12) return "🌞";
    if (h < 17) return "✨";
    if (h < 21) return "🌙";
    return "🌟";
};

const dateFull = () =>
    new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

const Dashboard = () => {
    const navigate = useNavigate();
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [teacherMessageCounts, setTeacherMessageCounts] = useState<Record<string, number>>({});

    // Comments dialog
    const [showComments, setShowComments] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [comments, setComments] = useState<TeacherComment[]>([]);
    const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<string | number | null>(null);
    const [sending, setSending] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showComments) {
            setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
    }, [showComments, comments]);

    const openComments = async (teacher: any) => {
        const teacherAuthId = teacher?.auth?._id || teacher?._id;
        if (!teacherAuthId) return;
        setSelectedTeacher(teacher);
        setShowComments(true);
        setComments([]);
        setStudentSubjects([]);
        setNewComment("");
        setSelectedSubject(null);
        setLoadingComments(true);
        setLoadingSubjects(true);
        try {
            const res = await Get(`/teacher/comments/${teacherAuthId}`);
            if (res.success) setComments(res.data || []);
            else displayMessage(res.message, "error");
        } catch {
            displayMessage("Couldn't load messages", "error");
        } finally {
            setLoadingComments(false);
        }
        // Mark teacher's messages to me as read; clear the badge.
        Post(`/teacher/comments/read/${teacherAuthId}`)
            .then(() => {
                setTeacherMessageCounts((prev) => ({ ...prev, [teacherAuthId]: 0 }));
            })
            .catch(() => {
                /* silent */
            });
        try {
            const meId = user?._id;
            if (meId) {
                const sub = await Get(`/subject/student/${meId}/subjects`);
                if (sub.success) setStudentSubjects(sub.data || []);
            }
        } catch {
            // silent — subjects optional
        } finally {
            setLoadingSubjects(false);
        }
    };

    const closeComments = () => {
        setShowComments(false);
        setSelectedTeacher(null);
        setComments([]);
        setStudentSubjects([]);
        setNewComment("");
        setSelectedSubject(null);
    };

    const sendComment = async () => {
        if (!newComment.trim()) return;
        if (!selectedSubject) {
            displayMessage("Pick a subject first", "error");
            return;
        }
        const teacherAuthId = selectedTeacher?.auth?._id || selectedTeacher?._id;
        if (!teacherAuthId) return;
        setSending(true);
        try {
            const res = await Post("/teacher/comments", {
                text: newComment,
                recipientId: teacherAuthId,
                recipientType: "Teacher",
                subject: selectedSubject,
            });
            if (res.success) {
                const subj = studentSubjects.find((s: any) => s._id === selectedSubject);
                const newOne: TeacherComment = {
                    ...(res.data || {}),
                    _id: res.data?._id || `tmp-${Date.now()}`,
                    text: newComment,
                    subject: subj ? { _id: subj._id, name: subj.name } : undefined,
                    user: { _id: user?._id, fullName: user?.fullName || user?.userName },
                    userType: "Student",
                    recipient: { _id: teacherAuthId, fullName: selectedTeacher?.auth?.fullName },
                    recipientType: "Teacher",
                    createdAt: new Date().toISOString(),
                };
                setComments((prev) => [...prev, newOne]);
                setNewComment("");
                setSelectedSubject(null);
                displayMessage("Sent! 🎉", "success");
            } else {
                displayMessage(res.message || "Couldn't send", "error");
            }
        } catch {
            displayMessage("Couldn't send", "error");
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        Promise.allSettled([
            Get("/quiz", null, { grade: user?.profile?.grade?._id }),
            Get("/student/myteachers"),
        ])
            .then(([qRes, tRes]: any) => {
                if (qRes.status === "fulfilled" && qRes.value?.success) {
                    const list = qRes.value.data || [];
                    const shuffled = [...list].sort(() => 0.5 - Math.random());
                    setQuizzes(shuffled.slice(0, 6));
                }
                if (tRes.status === "fulfilled" && tRes.value?.data) {
                    const teacherList = tRes.value.data || [];
                    setTeachers(teacherList);
                    // Fire-and-forget per-teacher comment counts so each card can show a badge
                    teacherList.slice(0, 4).forEach((t: any) => {
                        const teacherAuthId = t?.auth?._id || t?._id;
                        if (!teacherAuthId) return;
                        Get(`/teacher/comments/${teacherAuthId}`)
                            .then((d: any) => {
                                if (d?.success) {
                                    const unreadFromTeacher = (d.data || []).filter(
                                        (c: any) =>
                                            c?.userType === "Teacher" && c?.readByRecipient !== true
                                    ).length;
                                    setTeacherMessageCounts((prev) => ({
                                        ...prev,
                                        [teacherAuthId]: unreadFromTeacher,
                                    }));
                                }
                            })
                            .catch(() => {
                                /* silent — badges are optional */
                            });
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [user?.profile?.grade?._id]);

    const fullName: string = user?.profile?.fullName || user?.fullName || user?.userName || "Friend";
    const firstName = fullName.split(" ")[0];
    const grade = user?.profile?.grade?.grade;

    // Playful "mock-but-deterministic" gamification stats
    const streak = useMemo(() => {
        try {
            const seed = (user?._id || "x").charCodeAt(0) || 7;
            return (seed % 9) + 1;
        } catch {
            return 3;
        }
    }, [user?._id]);
    const xp = useMemo(() => Math.max(120, ((user?._id || "x").length * 73) % 980), [user?._id]);
    const xpToNext = 1000;
    const xpPct = Math.min(100, Math.round((xp / xpToNext) * 100));
    const level = useMemo(() => Math.floor(xp / 200) + 1, [xp]);

    const stats = [
        {
            label: "Streak",
            value: `${streak} day${streak === 1 ? "" : "s"}`,
            icon: HiOutlineFire,
            tint: "from-orange-400 to-pink-500",
            sticker: "🔥",
        },
        {
            label: "XP",
            value: `${xp}`,
            icon: HiOutlineBolt,
            tint: "from-amber-400 to-orange-500",
            sticker: "⚡",
        },
        {
            label: "Level",
            value: `Lvl ${level}`,
            icon: HiOutlineStar,
            tint: "from-violet-400 to-fuchsia-500",
            sticker: "⭐",
        },
        {
            label: "Quizzes",
            value: `${quizzes.length}`,
            icon: HiOutlineCheckCircle,
            tint: "from-emerald-400 to-teal-500",
            sticker: "✅",
        },
    ];

    const actions = [
        {
            label: "Take a Quiz",
            desc: "Test what you know",
            icon: HiOutlineRocketLaunch,
            sticker: "🚀",
            tint: "from-pink-500 via-rose-500 to-orange-500",
            ring: "ring-pink-300/50",
            onClick: () => navigate(RouteName.DAILY_QUIZ),
        },
        {
            label: "My Subjects",
            desc: "Lessons & topics",
            icon: HiOutlineBookOpen,
            sticker: "📚",
            tint: "from-violet-500 via-purple-500 to-indigo-500",
            ring: "ring-violet-300/50",
            onClick: () => navigate(RouteName.SUBJECTS_SCREEN),
        },
        {
            label: "Play Games",
            desc: "Learn while you play",
            icon: HiOutlinePuzzlePiece,
            sticker: "🎮",
            tint: "from-emerald-500 via-teal-500 to-cyan-500",
            ring: "ring-emerald-300/50",
            onClick: () => navigate(RouteName.GAMES),
        },
        {
            label: "My Results",
            desc: "Check your scores",
            icon: HiOutlineTrophy,
            sticker: "🏆",
            tint: "from-amber-500 via-orange-500 to-rose-500",
            ring: "ring-amber-300/50",
            onClick: () => navigate(RouteName.RESULTS_SCREEN),
        },
    ];

    const subjectAccent = (i: number) => {
        const tones = [
            { bg: "from-pink-100 to-rose-100", icon: "bg-pink-500", emoji: "🎨" },
            { bg: "from-sky-100 to-blue-100", icon: "bg-sky-500", emoji: "🔬" },
            { bg: "from-amber-100 to-orange-100", icon: "bg-amber-500", emoji: "📐" },
            { bg: "from-emerald-100 to-teal-100", icon: "bg-emerald-500", emoji: "📖" },
            { bg: "from-violet-100 to-purple-100", icon: "bg-violet-500", emoji: "🌍" },
            { bg: "from-fuchsia-100 to-pink-100", icon: "bg-fuchsia-500", emoji: "🎵" },
        ];
        return tones[i % tones.length];
    };

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Dashboard" />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(217,70,239,0.55)]">
                        {/* Decorative confetti */}
                        <div aria-hidden className="absolute inset-0 pointer-events-none">
                            <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>⭐</span>
                            <span className="absolute top-16 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>✨</span>
                            <span className="absolute bottom-10 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>🎉</span>
                            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                            <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        </div>

                        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="max-w-xl">
                                <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">{dateFull()}</p>
                                <h1 className="font-trykker text-3xl md:text-5xl mt-1 leading-tight">
                                    {greeting()}, <span className="inline-block">{firstName}!</span>
                                    <span className="ml-2 inline-block animate-pulse" style={{ animationDuration: "2s" }}>{greetingEmoji()}</span>
                                </h1>
                                <p className="mt-3 text-sm md:text-base text-white/90 leading-relaxed">
                                    Ready to learn something awesome today? Let's keep your streak going! 🔥
                                </p>

                                {/* Level / XP card */}
                                <div className="mt-5 inline-flex flex-col bg-white/15 ring-1 ring-white/25 backdrop-blur rounded-2xl px-5 py-3 max-w-md w-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-8 w-8 rounded-xl bg-white text-fuchsia-600 flex items-center justify-center text-lg">⭐</span>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold">Level</p>
                                                <p className="text-sm font-bold leading-tight">Level {level}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-white/90">{xp} / {xpToNext} XP</p>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all"
                                            style={{ width: `${xpPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Avatar + grade chip */}
                            <div className="flex flex-col items-center md:items-end gap-3">
                                <div className="relative">
                                    {user?.image ? (
                                        <img
                                            src={user.image}
                                            alt=""
                                            className="h-24 w-24 md:h-28 md:w-28 rounded-3xl object-cover ring-4 ring-white/40 shadow-xl"
                                        />
                                    ) : (
                                        <div className="h-24 w-24 md:h-28 md:w-28 rounded-3xl bg-white text-fuchsia-600 flex items-center justify-center text-4xl font-trykker shadow-xl ring-4 ring-white/40">
                                            {firstName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="absolute -top-2 -right-2 h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 ring-4 ring-violet-500 flex items-center justify-center text-sm font-bold shadow-lg">
                                        {level}
                                    </span>
                                </div>
                                {grade && (
                                    <span className="px-3 py-1.5 rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur text-xs font-bold inline-flex items-center gap-1.5">
                                        <HiOutlineAcademicCap size={13} />
                                        Grade {grade}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Stat stickers */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
                        {stats.map((s) => {
                            const Icon = s.icon as any;
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
                                        <div className="mt-1 h-7 w-20 rounded-md bg-mainBg animate-pulse" />
                                    ) : (
                                        <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    {/* Big colorful action buttons */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
                        {actions.map((a) => {
                            const Icon = a.icon as any;
                            return (
                                <button
                                    key={a.label}
                                    type="button"
                                    onClick={a.onClick}
                                    className={`group relative overflow-hidden rounded-3xl text-left bg-gradient-to-br ${a.tint} text-white p-5 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all ring-2 ${a.ring}`}
                                >
                                    <div aria-hidden className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                                    <div className="relative flex items-center justify-between mb-4">
                                        <span className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center">
                                            <Icon size={22} />
                                        </span>
                                        <span className="text-3xl group-hover:scale-110 transition-transform">{a.sticker}</span>
                                    </div>
                                    <p className="relative font-trykker text-lg md:text-xl leading-tight">{a.label}</p>
                                    <p className="relative text-[12px] text-white/85 mt-0.5">{a.desc}</p>
                                    <HiOutlineArrowRight className="relative mt-3 group-hover:translate-x-1 transition-transform" size={18} />
                                </button>
                            );
                        })}
                    </section>

                    {/* Quizzes + Side */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {/* Quizzes for you */}
                        <div className="lg:col-span-2 rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                            <header className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Quizzes for you</h2>
                                        <p className="text-xs text-grey">Pick one and start scoring points!</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate(RouteName.DAILY_QUIZ)}
                                    className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-fuchsia-600 hover:underline"
                                >
                                    See all <HiOutlineArrowRight size={12} />
                                </button>
                            </header>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="h-24 rounded-2xl bg-mainBg animate-pulse" />
                                    ))}
                                </div>
                            ) : quizzes.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-8 text-center">
                                    <span className="text-5xl block mb-2">🌱</span>
                                    <p className="text-sm font-bold text-black">No quizzes yet</p>
                                    <p className="text-xs text-grey mt-1">Your teacher will share quizzes here soon.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {quizzes.map((q, i) => {
                                        const tone = subjectAccent(i);
                                        const subjectName = q?.subject?.name || q?.subject?.subject || "Quiz";
                                        const topicName = q?.topic?.name || q?.topic?.topic || "Surprise me!";
                                        const qCount = q?.questions?.length || 0;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => navigate(RouteName.QUIZ_CONFIRMATION || RouteName.DAILY_QUIZ)}
                                                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${tone.bg} p-4 text-left ring-1 ring-white hover:ring-fuchsia-300 hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className={`h-12 w-12 rounded-2xl ${tone.icon} text-white flex items-center justify-center text-2xl shadow-md`}>
                                                        {tone.emoji}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] uppercase tracking-wider font-bold text-greyBlack/70 truncate">
                                                            {subjectName}
                                                        </p>
                                                        <p className="text-sm font-bold text-black truncate">{topicName}</p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-greyBlack/80 bg-white/70 px-1.5 py-0.5 rounded-full">
                                                                <HiOutlineSparkles size={10} />
                                                                {qCount} Qs
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-greyBlack/80 bg-white/70 px-1.5 py-0.5 rounded-full">
                                                                <HiOutlineClock size={10} />
                                                                ~{Math.max(2, qCount)} min
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Side: missions + teachers */}
                        <div className="flex flex-col gap-4">
                            {/* Daily missions */}
                            <div className="rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 ring-1 ring-orange-200/50 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">🎯</span>
                                    <h3 className="font-trykker text-lg text-black">Today's missions</h3>
                                </div>
                                <ul className="space-y-2">
                                    {[
                                        { label: "Take 1 quiz", done: false, reward: "+50 XP", emoji: "🚀" },
                                        { label: "Open a subject", done: streak > 2, reward: "+30 XP", emoji: "📚" },
                                        { label: "Keep your streak", done: true, reward: `+${streak * 10} XP`, emoji: "🔥" },
                                    ].map((m, i) => (
                                        <li
                                            key={i}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/80 ring-1 transition ${
                                                m.done ? "ring-emerald-300/40" : "ring-white"
                                            }`}
                                        >
                                            <span className="text-xl">{m.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold ${m.done ? "text-greyBlack line-through" : "text-black"}`}>
                                                    {m.label}
                                                </p>
                                                <p className="text-[10px] font-bold text-orange-600">{m.reward}</p>
                                            </div>
                                            {m.done ? (
                                                <span className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                                    <HiOutlineCheckCircle size={16} />
                                                </span>
                                            ) : (
                                                <span className="h-7 w-7 rounded-full bg-white ring-2 ring-dashed ring-orange-300" />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* My teachers */}
                            <div className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">👩‍🏫</span>
                                        <h3 className="font-trykker text-lg text-black">My teachers</h3>
                                    </div>
                                    {teachers.length > 0 && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-grey bg-mainBg px-2 py-0.5 rounded-full">
                                            {teachers.length}
                                        </span>
                                    )}
                                </div>
                                {loading ? (
                                    <div className="space-y-2">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className="flex items-center gap-2.5">
                                                <div className="h-9 w-9 rounded-full bg-mainBg animate-pulse" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-3 w-2/3 rounded bg-mainBg animate-pulse" />
                                                    <div className="h-2.5 w-1/2 rounded bg-mainBg animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : teachers.length === 0 ? (
                                    <div className="py-6 text-center">
                                        <span className="text-4xl block mb-1">🤔</span>
                                        <p className="text-xs text-grey">No teachers yet.</p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-1.5">
                                        {teachers.slice(0, 4).map((t: any, i: number) => {
                                            const name = t?.auth?.fullName || t?.auth?.userName || t?.fullName || t?.userName || "Teacher";
                                            const img = t?.auth?.image || t?.image;
                                            const teacherAuthId = t?.auth?._id || t?._id;
                                            const msgCount = teacherAuthId ? teacherMessageCounts[teacherAuthId] || 0 : 0;
                                            return (
                                                <li key={t?._id || i}>
                                                    <button
                                                        type="button"
                                                        onClick={() => openComments(t)}
                                                        className="group w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 transition text-left"
                                                    >
                                                        <div className="relative flex-shrink-0">
                                                            {img ? (
                                                                <img src={img} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-inputBorder/40" />
                                                            ) : (
                                                                <span className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white text-xs font-bold flex items-center justify-center">
                                                                    {name.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                            {msgCount > 0 && (
                                                                <span
                                                                    aria-label={`${msgCount} message${msgCount === 1 ? "" : "s"} from this teacher`}
                                                                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm"
                                                                >
                                                                    {msgCount > 9 ? "9+" : msgCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-bold text-black truncate">{name}</p>
                                                            <p className="text-[10px] text-grey truncate flex items-center gap-1">
                                                                <HiOutlineChatBubbleLeftRight size={10} />
                                                                {msgCount > 0
                                                                    ? `${msgCount} message${msgCount === 1 ? "" : "s"} from teacher`
                                                                    : "Tap to message"}
                                                            </p>
                                                        </div>
                                                        <HiOutlineArrowRight
                                                            size={12}
                                                            className="text-grey group-hover:text-fuchsia-500 group-hover:translate-x-0.5 transition"
                                                        />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Encouragement footer */}
                    <p className="pb-6 text-center text-xs text-grey">
                        You're doing amazing! Come back tomorrow to keep your streak alive 🔥
                    </p>
                </div>
            </div>

            {/* Comments dialog with teacher */}
            {showComments && selectedTeacher && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
                    onClick={closeComments}
                >
                    <div
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-5 text-white flex-shrink-0">
                            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                            <div aria-hidden className="absolute inset-0 pointer-events-none">
                                <span className="absolute top-3 right-12 text-lg animate-bounce" style={{ animationDuration: "3s" }}>💬</span>
                                <span className="absolute bottom-3 left-32 text-base animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>✨</span>
                            </div>
                            <div className="relative flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {(selectedTeacher?.auth?.image || selectedTeacher?.image) ? (
                                        <img
                                            src={selectedTeacher?.auth?.image || selectedTeacher?.image}
                                            alt=""
                                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/30 flex-shrink-0"
                                        />
                                    ) : (
                                        <span className="h-12 w-12 rounded-2xl bg-white text-fuchsia-600 flex items-center justify-center font-trykker text-base shadow-md flex-shrink-0 ring-2 ring-white/30">
                                            {(selectedTeacher?.auth?.fullName || selectedTeacher?.auth?.userName || selectedTeacher?.fullName || "T").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <h2 className="font-trykker text-lg leading-tight truncate">
                                            {selectedTeacher?.auth?.fullName || selectedTeacher?.auth?.userName || selectedTeacher?.fullName || "Teacher"}
                                        </h2>
                                        <p className="text-xs text-white/85 mt-0.5 inline-flex items-center gap-1.5">
                                            <HiOutlineChatBubbleLeftRight size={11} />
                                            Say hi or ask a question
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

                        {/* Messages list */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-mainBg/40 [scrollbar-width:thin]">
                            {loadingComments ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="h-10 w-10 rounded-full border-4 border-fuchsia-200 border-t-fuchsia-500 animate-spin" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="text-5xl mb-2">💌</span>
                                    <p className="text-sm font-bold text-black">No messages yet</p>
                                    <p className="text-xs text-grey mt-1 max-w-xs">
                                        Start the conversation — ask about a topic, share what you learned, or just say hi!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {comments.map((comment) => {
                                        const isMine = comment.user?._id === user?._id;
                                        return (
                                            <div
                                                key={comment._id}
                                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl p-3 ring-1 shadow-sm ${
                                                        isMine
                                                            ? "bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white ring-fuchsia-300/40"
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
                                                        className={`text-[10px] mt-1 font-medium ${isMine ? "text-white/80" : "text-grey"}`}
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
                            <FloatingSelect
                                label="Subject"
                                value={selectedSubject ?? ""}
                                setValue={setSelectedSubject}
                                options={studentSubjects.map((s: any) => ({ value: s._id, label: s.name }))}
                                loading={loadingSubjects}
                                required
                            />
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
                                    placeholder="Type your message…"
                                    className="flex-1 h-12 px-3.5 rounded-xl ring-1 ring-inputBorder/60 bg-mainBg text-sm focus:bg-white focus:ring-2 focus:ring-fuchsia-400 outline-none transition"
                                />
                                <button
                                    type="button"
                                    onClick={sendComment}
                                    disabled={sending || !newComment.trim() || !selectedSubject}
                                    className="h-12 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:shadow-md hover:shadow-fuchsia-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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

export default Dashboard;
