import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { Get } from "../../../config/apiMethods";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineUsers,
    HiOutlineBookOpen,
    HiOutlineSparkles,
    HiOutlineBell,
    HiOutlineArrowRight,
    HiOutlineCalendarDays,
    HiOutlineChatBubbleLeftRight,
    HiOutlinePlus,
    HiOutlineAcademicCap,
    HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { FiTrendingUp, FiPlus } from "react-icons/fi";

const greeting = () => {
    const h = new Date().getHours();
    if (h < 5) return "Still up";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
};

const dateFull = () =>
    new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

const getInitials = (name?: string) =>
    (name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "T";

const getCurrentUserId = () => {
    try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u?._id || u?.id || null;
    } catch {
        return null;
    }
};

const isUnread = (n: any, id: any) => {
    if (!id || !n?.readBy) return true;
    return !n.readBy.some((r: any) => r.userId === id || r.userId?._id === id);
};

const timeAgo = (ts: string) => {
    if (!ts) return "—";
    const s = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [analytics, setAnalytics] = useState<{ students: number; subject: number; quizes: number; games?: number } | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [feedbackList, setFeedbackList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            setUser(JSON.parse(localStorage.getItem("user") || "{}"));
        } catch {
            setUser({});
        }
        Promise.allSettled([
            Get("/teacher/dashboard"),
            Get("/teacher/mystudents"),
            Get("/getNotification"),
            Get("/teacher/feedback"),
        ])
            .then(([dashRes, stuRes, notifRes, fbRes]: any) => {
                if (dashRes.status === "fulfilled" && dashRes.value?.success) {
                    setAnalytics(dashRes.value.data || null);
                }
                if (stuRes.status === "fulfilled" && stuRes.value?.success) {
                    setStudents(stuRes.value.data || []);
                }
                if (notifRes.status === "fulfilled" && notifRes.value?.success) {
                    setNotifications(notifRes.value.data || []);
                }
                if (fbRes.status === "fulfilled" && fbRes.value?.success) {
                    setFeedbackList(fbRes.value.data || []);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const userId = getCurrentUserId();
    const unreadCount = useMemo(
        () => notifications.filter((n) => isUnread(n, userId)).length,
        [notifications, userId]
    );

    const fullName: string = user?.profile?.fullName || user?.fullName || user?.userName || "there";
    const firstName = fullName.split(" ")[0];

    const grades: string[] = useMemo(() => {
        const arr = user?.profile?.grade;
        if (!arr) return [];
        if (Array.isArray(arr)) {
            return arr
                .map((g: any) => (typeof g === "object" ? g?.grade : null))
                .filter(Boolean);
        }
        return [];
    }, [user?.profile?.grade]);

    const stats = [
        {
            label: "Students",
            value: loading ? "—" : String(analytics?.students ?? students.length),
            icon: HiOutlineUsers,
            tone: "from-primary/15 to-secondary/15 text-secondary",
            onClick: () => navigate(RouteName.STUDENTS_SCREEN),
        },
        {
            label: "Subjects",
            value: loading ? "—" : String(analytics?.subject ?? 0),
            icon: HiOutlineBookOpen,
            tone: "from-fadeBlue/15 to-bluecolor/10 text-bluecolor",
        },
        {
            label: "Quizzes",
            value: loading ? "—" : String(analytics?.quizes ?? 0),
            icon: HiOutlineSparkles,
            tone: "from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown",
            onClick: () => navigate(RouteName.MY_QUIZZES),
        },
        {
            label: "Unread alerts",
            value: loading ? "—" : String(unreadCount),
            icon: HiOutlineBell,
            tone: "from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2",
        },
    ];

    const quickActions = [
        {
            label: "New quiz",
            desc: "Create one in minutes",
            icon: HiOutlinePlus,
            onClick: () => navigate(RouteName.ADD_QUIZ),
            primary: true,
        },
        {
            label: "My quizzes",
            desc: "View, edit, share",
            icon: HiOutlineSparkles,
            onClick: () => navigate(RouteName.MY_QUIZZES),
        },
        {
            label: "My students",
            desc: "See classes & progress",
            icon: HiOutlineUsers,
            onClick: () => navigate(RouteName.STUDENTS_SCREEN),
        },
        {
            label: "Feedback",
            desc: "Notes for & from students",
            icon: HiOutlineChatBubbleLeftRight,
            onClick: () => navigate(RouteName.FEEDBACK_SCREEN),
        },
        {
            label: "Calendar",
            desc: "Plan upcoming events",
            icon: HiOutlineCalendarDays,
            onClick: () => navigate(RouteName.CALENDAR_SCREEN),
        },
    ];

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
                                <p className="text-xs uppercase tracking-wider text-white/70">{dateFull()}</p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                                    {greeting()}, {firstName}.
                                </h1>
                                {loading ? (
                                    <div className="mt-2 h-4 w-72 rounded bg-white/20 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                                        {students.length > 0
                                            ? `You're teaching ${students.length} student${students.length > 1 ? "s" : ""} today. Let's make it count.`
                                            : "Ready to inspire? Create your first quiz to get started."}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate(RouteName.ADD_QUIZ)}
                                        className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white text-secondary text-sm font-semibold hover:bg-white/95 transition focus:outline-none focus:ring-2 focus:ring-white/60"
                                    >
                                        <FiPlus size={16} />
                                        New quiz
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(RouteName.STUDENTS_SCREEN)}
                                        className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white/15 ring-1 ring-white/30 text-white text-sm font-medium hover:bg-white/25 transition focus:outline-none focus:ring-2 focus:ring-white/60"
                                    >
                                        <HiOutlineUsers size={16} />
                                        My students
                                    </button>
                                </div>

                                {grades.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold mr-1 self-center">Teaches</span>
                                        {grades.map((g) => (
                                            <span
                                                key={g}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-sm text-[11px] font-semibold"
                                            >
                                                <HiOutlineAcademicCap size={11} />
                                                Grade {g}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Snapshot */}
                            <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                                <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                                    <FiTrendingUp size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Today</p>
                                    {loading ? (
                                        <div className="mt-1 h-4 w-24 rounded bg-white/20 animate-pulse" />
                                    ) : (
                                        <p className="text-sm font-semibold leading-tight">
                                            {unreadCount > 0
                                                ? `${unreadCount} new alert${unreadCount > 1 ? "s" : ""}`
                                                : "All caught up"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                        {stats.map((s) => {
                            const Icon = s.icon as any;
                            const Tag: any = s.onClick ? "button" : "div";
                            return (
                                <Tag
                                    key={s.label}
                                    type={s.onClick ? "button" : undefined}
                                    onClick={s.onClick}
                                    className={`text-left group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 hover:ring-primary/40 hover:shadow-md transition ${s.onClick ? "cursor-pointer" : ""}`}
                                >
                                    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tone} opacity-30 blur-xl pointer-events-none`} />
                                    <div className="flex items-center justify-between">
                                        <span className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.tone} flex items-center justify-center`}>
                                            <Icon size={16} />
                                        </span>
                                        {s.onClick && (
                                            <HiOutlineArrowRight className="text-grey opacity-0 group-hover:opacity-100 transition" size={14} />
                                        )}
                                    </div>
                                    <p className="mt-3 text-[11px] uppercase tracking-wider text-grey font-medium">{s.label}</p>
                                    {loading ? (
                                        <div className="mt-1.5 h-7 w-16 rounded-md bg-mainBg animate-pulse" />
                                    ) : (
                                        <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                                    )}
                                </Tag>
                            );
                        })}
                    </section>

                    {/* Students + Activity */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {/* Students panel */}
                        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5">
                            <header className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="font-trykker text-lg text-black">Your students</h2>
                                    <p className="text-xs text-grey">Tap a card to open their profile.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate(RouteName.STUDENTS_SCREEN)}
                                    className="text-xs font-medium text-secondary hover:underline inline-flex items-center gap-1"
                                >
                                    View all <HiOutlineArrowRight size={12} />
                                </button>
                            </header>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="h-20 rounded-xl bg-mainBg animate-pulse" />
                                    ))}
                                </div>
                            ) : students.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-inputBorder/70 p-6 text-center">
                                    <span className="inline-flex h-12 w-12 rounded-full bg-mainBg items-center justify-center mb-2">
                                        <HiOutlineUsers className="text-grey" size={20} />
                                    </span>
                                    <p className="text-sm font-medium text-black">No students yet</p>
                                    <p className="text-xs text-grey mt-1">
                                        Once students join your class, they'll appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {students.slice(0, 6).map((s: any) => {
                                        const studentAuth = s?.auth || s;
                                        const name = studentAuth?.fullName || studentAuth?.userName || s?.userName || "Student";
                                        const grade = s?.grade?.grade ?? studentAuth?.profile?.grade?.grade;
                                        const img = studentAuth?.image || s?.image;
                                        return (
                                            <button
                                                key={s?._id || name}
                                                type="button"
                                                onClick={() => navigate(RouteName.STUDENTS_SCREEN)}
                                                className="group flex items-center gap-3 rounded-xl ring-1 ring-inputBorder/60 hover:ring-primary/40 hover:bg-mainBg/40 p-3 text-left transition"
                                            >
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt=""
                                                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-inputBorder/60"
                                                    />
                                                ) : (
                                                    <span className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-semibold">
                                                        {getInitials(name)}
                                                    </span>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-black truncate">{name}</p>
                                                    <p className="text-[11px] text-grey truncate flex items-center gap-1 mt-0.5">
                                                        <HiOutlineAcademicCap size={11} />
                                                        Grade {grade ?? "—"}
                                                    </p>
                                                </div>
                                                <HiOutlineArrowRight className="text-grey group-hover:text-secondary transition" size={14} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Activity */}
                        <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5">
                            <header className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="font-trykker text-lg text-black">Activity</h2>
                                    <p className="text-xs text-grey">Recent notifications.</p>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full bg-gradient-to-r from-primary to-secondary text-white px-2 py-0.5">
                                        {unreadCount} new
                                    </span>
                                )}
                            </header>

                            {loading ? (
                                <div className="space-y-2">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="h-12 rounded-xl bg-mainBg animate-pulse" />
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                    <span className="inline-flex h-10 w-10 rounded-full bg-mainBg items-center justify-center mb-2">
                                        <HiOutlineBell className="text-grey" size={16} />
                                    </span>
                                    <p className="text-xs text-grey">No activity yet.</p>
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1">
                                    {notifications.slice(0, 5).map((n, i) => {
                                        const unread = isUnread(n, userId);
                                        return (
                                            <li
                                                key={i}
                                                className={`flex items-start gap-2 rounded-xl px-2 py-2 ${unread ? "bg-primary/5" : ""}`}
                                            >
                                                <span
                                                    className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${unread
                                                        ? "bg-gradient-to-br from-primary to-secondary text-white"
                                                        : "bg-mainBg text-greyBlack"}`}
                                                >
                                                    <HiOutlineBell size={13} />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-xs leading-snug ${unread ? "text-black font-medium" : "text-greyBlack"}`}>
                                                        {n?.title || "Notification"}
                                                    </p>
                                                    <p className="text-[10px] text-grey mt-0.5">
                                                        {timeAgo(n?.createdAt || n?.updatedAt)}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>

                    {/* Quick actions */}
                    <section className="mb-6">
                        <header className="mb-3">
                            <h2 className="font-trykker text-lg text-black">Quick actions</h2>
                            <p className="text-xs text-grey">Jump straight to what you need.</p>
                        </header>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            {quickActions.map((a) => {
                                const Icon = a.icon as any;
                                const isPrimary = a.primary;
                                return (
                                    <button
                                        key={a.label}
                                        type="button"
                                        onClick={a.onClick}
                                        className={`group relative overflow-hidden text-left rounded-2xl p-4 transition ${
                                            isPrimary
                                                ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md hover:shadow-lg hover:shadow-secondary/30 hover:-translate-y-0.5"
                                                : "bg-white ring-1 ring-inputBorder/50 hover:ring-primary/40 hover:shadow-md"
                                        }`}
                                    >
                                        <span
                                            className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${
                                                isPrimary
                                                    ? "bg-white/20 ring-1 ring-white/30 backdrop-blur-sm"
                                                    : "bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-secondary/15 text-secondary"
                                            }`}
                                        >
                                            <Icon size={16} />
                                        </span>
                                        <p className={`text-sm font-semibold ${isPrimary ? "text-white" : "text-black"}`}>
                                            {a.label}
                                        </p>
                                        <p className={`text-[11px] mt-0.5 leading-snug ${isPrimary ? "text-white/85" : "text-grey"}`}>
                                            {a.desc}
                                        </p>
                                        <HiOutlineArrowRight
                                            className={`absolute top-4 right-4 transition opacity-0 group-hover:opacity-100 ${isPrimary ? "text-white" : "text-grey group-hover:text-secondary"}`}
                                            size={14}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Feedback inbox */}
                    <section className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5 mb-6">
                        <header className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-trykker text-lg text-black">Feedback inbox</h2>
                                <p className="text-xs text-grey">Recent notes from your students.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate(RouteName.FEEDBACK_SCREEN)}
                                className="text-xs font-medium text-secondary hover:underline inline-flex items-center gap-1"
                            >
                                View all <HiOutlineArrowRight size={12} />
                            </button>
                        </header>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[0, 1].map((i) => (
                                    <div key={i} className="h-24 rounded-xl bg-mainBg animate-pulse" />
                                ))}
                            </div>
                        ) : feedbackList.length === 0 ? (
                            <div className="py-6 text-center">
                                <span className="inline-flex h-10 w-10 rounded-full bg-mainBg items-center justify-center mb-2">
                                    <HiOutlineClipboardDocumentList className="text-grey" size={16} />
                                </span>
                                <p className="text-xs text-grey">No feedback yet.</p>
                            </div>
                        ) : (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {feedbackList.slice(0, 4).map((f: any, i: number) => {
                                    const fromName = f?.from?.auth?.userName || f?.from?.userName || "Student";
                                    const stars = Number(f?.star) || 0;
                                    return (
                                        <li
                                            key={f?._id || i}
                                            className="rounded-xl ring-1 ring-inputBorder/50 p-3 hover:ring-primary/40 transition"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 text-secondary flex items-center justify-center text-xs font-semibold">
                                                    {getInitials(fromName)}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-black truncate">{fromName}</p>
                                                    <p className="text-[10px] text-grey">{timeAgo(f?.createdAt)} ago</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-amber-600 inline-flex items-center gap-0.5">
                                                    {"★".repeat(stars) || "—"}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-greyBlack leading-relaxed line-clamp-2">
                                                {f?.feedback || "No message"}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <p className="pb-6 text-center text-[11px] text-grey">
                        Press <span className="font-semibold text-greyBlack">⌘ K</span> to search anywhere on Classerly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
