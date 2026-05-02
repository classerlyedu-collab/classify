import {
    buildStyles,
    CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useEffect, useState } from "react";
import { displayMessage } from "../../../../config";
import { Get } from "../../../../config/apiMethods";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";
import {
    HiOutlineBookOpen,
    HiOutlineArrowRight,
    HiOutlineClock,
    HiOutlineAcademicCap,
} from "react-icons/hi2";

const COURSE_GRADIENTS: [string, string][] = [
    ["#A557F5", "#7102FF"], // primary → secondary
    ["#4A51F2", "#062FF0"], // fadeBlue → bluecolor
    ["#4BBDBD", "#219562"], // seagreen → green
    ["#F2994A", "#F95152"], // orange → red
    ["#9791D0", "#B05AF7"], // lightPurple → purple
];

const formatTime = (minutes: number) => {
    if (!minutes) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
};

const Grades = ({ mystd }: any) => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!mystd?._id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        Get(`/getMyChildsubjectdata/${mystd._id}`)
            .then((d) => {
                if (d?.success) setSubjects(d.data || []);
            })
            .catch((err) => console.error("Error fetching subjects:", err))
            .finally(() => setLoading(false));
    }, [mystd]);

    const handleSubjectClick = (id: string) => {
        Get(`/mychildbysubject/${mystd._id}?subject=${id}`)
            .then((d) => {
                if (d?.success) {
                    localStorage.setItem("childResult", JSON.stringify(d.data));
                    localStorage.setItem(
                        "resultHeaderTitle",
                        `${mystd?.auth?.fullName ?? "Child"} Result`
                    );
                    navigate(RouteName.CHILD_RESULT_SCREEN);
                } else {
                    displayMessage(
                        "Something went wrong! Please try again later.",
                        "error"
                    );
                }
            })
            .catch((e) => displayMessage(e.message, "error"));
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-44 rounded-2xl bg-mainBg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!subjects || subjects.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-inputBorder/70 p-8 text-center">
                <span className="inline-flex h-12 w-12 rounded-full bg-mainBg items-center justify-center mb-2">
                    <HiOutlineBookOpen className="text-grey" size={20} />
                </span>
                <p className="text-sm font-medium text-black">No courses yet</p>
                <p className="text-xs text-grey mt-1">
                    Courses will appear here once they are assigned to your child.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 font-ubuntu">
            {subjects.map((subject: any, idx: number) => {
                const progress = Number(subject?.progress) || 0;
                const completed = subject?.completedLessons || 0;
                const total = subject?.totalLessons || 0;
                const studyTime = completed * 20;
                const grad = COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length];
                const id = `child-progress-${idx}`;

                return (
                    <button
                        key={subject?._id ?? idx}
                        type="button"
                        onClick={() => handleSubjectClick(subject._id)}
                        className="group relative overflow-hidden text-left rounded-2xl ring-1 ring-inputBorder/60 hover:ring-primary/40 hover:shadow-md p-4 bg-white transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-2xl"
                            style={{
                                background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                            }}
                        />

                        {/* Header */}
                        <div className="relative flex items-center gap-3 mb-4">
                            <div
                                className="h-10 w-10 rounded-xl text-white flex items-center justify-center text-sm font-semibold shrink-0"
                                style={{
                                    background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                                }}
                            >
                                {idx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
                                    Course
                                </p>
                                <h3 className="text-sm font-semibold text-black truncate">
                                    {subject?.name}
                                </h3>
                            </div>
                            <HiOutlineArrowRight
                                className="text-grey group-hover:text-secondary transition shrink-0"
                                size={14}
                            />
                        </div>

                        {/* Progress + Stats */}
                        <div className="relative flex items-center gap-4">
                            <div className="h-20 w-20 shrink-0">
                                <svg width="0" height="0" className="absolute">
                                    <defs>
                                        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor={grad[0]} />
                                            <stop offset="100%" stopColor={grad[1]} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <CircularProgressbarWithChildren
                                    value={progress}
                                    maxValue={100}
                                    minValue={0}
                                    strokeWidth={8}
                                    styles={buildStyles({
                                        strokeLinecap: "round",
                                        pathColor: `url(#${id})`,
                                        trailColor: "#ECF4F7",
                                    })}
                                >
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="font-trykker text-base text-black">
                                            {Math.round(progress)}%
                                        </span>
                                        <span className="text-[9px] text-grey mt-0.5 hidden md:block">
                                            Complete
                                        </span>
                                    </div>
                                </CircularProgressbarWithChildren>
                            </div>

                            <dl className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <dt className="text-grey inline-flex items-center gap-1.5">
                                        <HiOutlineBookOpen size={12} />
                                        Lessons
                                    </dt>
                                    <dd className="font-semibold text-black">
                                        {completed}/{total}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <dt className="text-grey inline-flex items-center gap-1.5">
                                        <HiOutlineClock size={12} />
                                        Study time
                                    </dt>
                                    <dd className="font-semibold text-black">
                                        {formatTime(studyTime)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <dt className="text-grey inline-flex items-center gap-1.5">
                                        <HiOutlineAcademicCap size={12} />
                                        Status
                                    </dt>
                                    <dd className="font-semibold text-secondary">
                                        {progress >= 80
                                            ? "Excellent"
                                            : progress >= 50
                                                ? "On track"
                                                : progress > 0
                                                    ? "Catching up"
                                                    : "Not started"}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Linear progress */}
                        <div className="relative mt-4">
                            <div className="h-1.5 w-full rounded-full bg-mainBg overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${progress}%`,
                                        background: `linear-gradient(90deg, ${grad[0]}, ${grad[1]})`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="relative mt-3 pt-3 border-t border-inputBorder/40 flex items-center justify-between">
                            <span className="text-xs font-medium text-secondary">
                                View details
                            </span>
                            <HiOutlineArrowRight
                                className="text-grey group-hover:text-secondary transition"
                                size={12}
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default Grades;
