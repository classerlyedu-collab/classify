import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { LessonStatus, QuizResults } from "../../../components/parentComponents/ChildResult";
import { ChildResultType } from "../../../types/parent/ChildOverview";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowLeft,
    HiOutlineBookOpen,
    HiOutlineDocumentText,
    HiOutlineSparkles,
    HiOutlineCheckCircle,
} from "react-icons/hi2";
import { FiTrendingUp } from "react-icons/fi";

type Tab = "topics" | "quizzes";

const ChildResult = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState<ChildResultType[] | null>(null);
    const [childName, setChildName] = useState<string>("Child");
    const [activeTab, setActiveTab] = useState<Tab>("topics");

    const isTeacher = (() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u?.userType === "Teacher";
        } catch {
            return false;
        }
    })();
    const backRoute = isTeacher ? RouteName.STUDENTS_SCREEN : RouteName.MYCHILDREN_SCREEN;
    const backLabel = isTeacher ? "Back to students" : "Back to my children";

    useEffect(() => {
        try {
            const raw = localStorage.getItem("childResult");
            const titleRaw = localStorage.getItem("resultHeaderTitle") || "";
            setChildName(titleRaw.replace(" Result", "") || "Child");
            if (!raw) return;
            let parsed = JSON.parse(raw) as any[];
            parsed = parsed.map((i: any) => {
                const total = i?.lessons?.length || 0;
                const read = total
                    ? (i.lessons.filter((j: any) => j.read).length / total) * 100
                    : 0;
                i.read = read.toFixed(2);
                return i;
            });
            setResult(parsed as ChildResultType[]);
        } catch {
            /* ignore */
        }
    }, []);

    const stats = useMemo(() => {
        if (!result || result.length === 0) {
            return {
                totalTopics: 0,
                completedLessons: 0,
                totalLessons: 0,
                averageProgress: 0,
            };
        }
        let totalLessons = 0;
        let completedLessons = 0;
        result.forEach((topic) => {
            totalLessons += topic.lessons.length;
            completedLessons += topic.lessons.filter((l: any) => l.read).length;
        });
        return {
            totalTopics: result.length,
            completedLessons,
            totalLessons,
            averageProgress: totalLessons
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0,
        };
    }, [result]);

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title={`${childName}'s results`} />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                    <button
                        type="button"
                        onClick={() => navigate(backRoute)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline mb-4"
                    >
                        <HiOutlineArrowLeft size={14} />
                        {backLabel}
                    </button>

                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-7 shadow-[0_20px_60px_-20px_rgba(113,2,255,0.35)]">
                        <div
                            aria-hidden
                            className="absolute inset-0 opacity-[0.07]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wider text-white/70">
                                    Course results
                                </p>
                                <h1 className="font-trykker text-2xl md:text-3xl mt-1">
                                    {childName}'s results
                                </h1>
                                <p className="mt-1 text-sm md:text-base text-white/85 max-w-md">
                                    Lesson progress and quiz performance for this course.
                                </p>
                            </div>

                            {/* Overall progress ring */}
                            <div className="relative flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3 shrink-0">
                                <div className="relative h-14 w-14">
                                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.25)"
                                            strokeWidth="4"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={`${stats.averageProgress}, 100`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                                        {stats.averageProgress}%
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-white/70 leading-none">
                                        Overall progress
                                    </p>
                                    <p className="font-trykker text-base mt-1 leading-none">
                                        {stats.completedLessons} of {stats.totalLessons} lessons
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
                        <StatCard
                            label="Topics"
                            value={String(stats.totalTopics)}
                            icon={HiOutlineBookOpen}
                            tone="from-primary/15 to-secondary/15 text-secondary"
                        />
                        <StatCard
                            label="Lessons completed"
                            value={String(stats.completedLessons)}
                            icon={HiOutlineCheckCircle}
                            tone="from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2"
                        />
                        <StatCard
                            label="Total lessons"
                            value={String(stats.totalLessons)}
                            icon={HiOutlineDocumentText}
                            tone="from-fadeBlue/15 to-bluecolor/10 text-bluecolor"
                        />
                        <StatCard
                            label="Success rate"
                            value={`${stats.averageProgress}%`}
                            icon={FiTrendingUp}
                            tone="from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown"
                        />
                    </section>

                    {/* Tabbed content */}
                    <section className="rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
                        <div className="flex border-b border-inputBorder/40">
                            <TabButton
                                active={activeTab === "topics"}
                                onClick={() => setActiveTab("topics")}
                                icon={HiOutlineBookOpen}
                                label="Topics"
                                helper={`${stats.totalTopics} • ${stats.completedLessons}/${stats.totalLessons} lessons`}
                            />
                            <TabButton
                                active={activeTab === "quizzes"}
                                onClick={() => setActiveTab("quizzes")}
                                icon={HiOutlineSparkles}
                                label="Quiz results"
                                helper="Performance overview"
                            />
                        </div>
                        <div className="p-5 md:p-6">
                            {activeTab === "topics" && <LessonStatus result={result} />}
                            {activeTab === "quizzes" && <QuizResults result={result} />}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    icon: any;
    tone: string;
}) => (
    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4">
        <div
            className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${tone} opacity-30 blur-xl pointer-events-none`}
        />
        <span
            className={`relative h-9 w-9 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center`}
        >
            <Icon size={16} />
        </span>
        <p className="relative mt-3 text-[11px] uppercase tracking-wider text-grey font-medium">
            {label}
        </p>
        <p className="relative mt-0.5 font-trykker text-2xl text-black">{value}</p>
    </div>
);

const TabButton = ({
    active,
    onClick,
    icon: Icon,
    label,
    helper,
}: {
    active: boolean;
    onClick: () => void;
    icon: any;
    label: string;
    helper: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`relative flex-1 flex items-center gap-3 px-4 py-3 text-left transition ${active ? "" : "hover:bg-mainBg/40"
            }`}
    >
        <span
            className={`h-9 w-9 rounded-xl flex items-center justify-center ${active
                ? "bg-gradient-to-br from-primary to-secondary text-white"
                : "bg-mainBg text-greyBlack"
                }`}
        >
            <Icon size={16} />
        </span>
        <div className="min-w-0">
            <p
                className={`text-sm ${active ? "text-secondary font-semibold" : "text-greyBlack font-medium"
                    }`}
            >
                {label}
            </p>
            <p className="text-[11px] text-grey truncate">{helper}</p>
        </div>
        {active && (
            <span
                aria-hidden
                className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary to-secondary"
            />
        )}
    </button>
);

export default ChildResult;
