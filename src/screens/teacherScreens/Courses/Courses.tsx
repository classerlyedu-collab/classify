import { useEffect, useMemo, useState } from "react";
import { Navbar, SideDrawer } from "../../../components";
import { Profile } from "../../../components/teacherComponents/Courses/Profile";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import {
    HiOutlineBookOpen,
    HiOutlineSparkles,
    HiOutlineArrowRight,
    HiOutlineAcademicCap,
} from "react-icons/hi2";

type CourseTab = "my" | "new";

const COURSE_GRADIENTS = [
    "from-primary to-secondary",
    "from-fadeBlue to-bluecolor",
    "from-seagreen to-lightGreen2",
    "from-orangeBrown to-lightRed",
    "from-purple to-secondary",
];

const Courses = () => {
    const [newCourses, setNewCourses] = useState<any[]>([]);
    const [myCourses, setMyCourses] = useState<any[]>([]);
    const [tab, setTab] = useState<CourseTab>("my");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Get("/teacher/mycourses")
            .then((d) => {
                if (d?.success) {
                    setMyCourses(d.data?.mycourses || []);
                    setNewCourses(d.data?.newcourses || []);
                } else if (d?.message) {
                    displayMessage(d.message, "error");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const visible = useMemo(
        () => (tab === "my" ? myCourses : newCourses),
        [tab, myCourses, newCourses]
    );

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Courses" />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
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
                        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-white/70">
                                    Teaching
                                </p>
                                <h1 className="font-trykker text-2xl md:text-3xl mt-1">
                                    Courses
                                </h1>
                                <p className="mt-1 text-sm md:text-base text-white/85 max-w-md">
                                    Manage what you teach and discover new courses to add to your roster.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Stat label="My courses" value={loading ? "—" : String(myCourses.length)} />
                                <Stat label="Available" value={loading ? "—" : String(newCourses.length)} />
                            </div>
                        </div>
                    </section>

                    {/* Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Main panel */}
                        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5">
                            {/* Tabs */}
                            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                                <div className="inline-flex p-1 rounded-full bg-mainBg ring-1 ring-inputBorder/60">
                                    <button
                                        type="button"
                                        onClick={() => setTab("my")}
                                        className={`h-8 px-4 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition ${tab === "my"
                                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
                                                : "text-greyBlack hover:text-black"
                                            }`}
                                    >
                                        <HiOutlineBookOpen size={13} />
                                        My courses
                                        {myCourses.length > 0 && (
                                            <span
                                                className={`text-[10px] font-semibold ${tab === "my" ? "text-white/90" : "text-grey"
                                                    }`}
                                            >
                                                {myCourses.length}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTab("new")}
                                        className={`h-8 px-4 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition ${tab === "new"
                                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
                                                : "text-greyBlack hover:text-black"
                                            }`}
                                    >
                                        <HiOutlineSparkles size={13} />
                                        New
                                        {newCourses.length > 0 && (
                                            <span
                                                className={`text-[10px] font-semibold ${tab === "new" ? "text-white/90" : "text-grey"
                                                    }`}
                                            >
                                                {newCourses.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-grey">
                                    {tab === "my"
                                        ? "Courses currently assigned to you."
                                        : "Browse and request new courses."}
                                </p>
                            </div>

                            {/* Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-40 rounded-2xl bg-mainBg animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : visible.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-inputBorder/70 p-8 text-center">
                                    <span className="inline-flex h-12 w-12 rounded-full bg-mainBg items-center justify-center mb-2">
                                        <HiOutlineBookOpen className="text-grey" size={20} />
                                    </span>
                                    <p className="text-sm font-medium text-black">
                                        {tab === "my" ? "No courses assigned yet" : "Nothing new right now"}
                                    </p>
                                    <p className="text-xs text-grey mt-1 max-w-sm mx-auto">
                                        {tab === "my"
                                            ? "Once an admin assigns courses to your account, they'll appear here."
                                            : "Check back later — new courses become available regularly."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {visible.map((course: any, idx: number) => (
                                        <CourseCard
                                            key={course?._id ?? idx}
                                            course={course}
                                            gradient={
                                                COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length]
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Profile sidebar */}
                        <aside className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5">
                            <header className="mb-3">
                                <h2 className="font-trykker text-lg text-black">Your work</h2>
                                <p className="text-xs text-grey">Quick teacher snapshot.</p>
                            </header>
                            <Profile />
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur px-3 py-2">
        <span className="font-trykker text-xl leading-none">{value}</span>
        <span className="text-[11px] uppercase tracking-wider text-white/80 leading-none">
            {label}
        </span>
    </div>
);

const CourseCard = ({
    course,
    gradient,
}: {
    course: any;
    gradient: string;
}) => {
    const topics = course?.topics?.length ?? 0;
    const grade = course?.grade?.grade ?? course?.grade ?? null;
    return (
        <div className="group relative overflow-hidden rounded-2xl ring-1 ring-inputBorder/60 bg-white hover:ring-primary/40 hover:shadow-md transition flex flex-col">
            {/* Banner */}
            <div
                className={`relative h-24 bg-gradient-to-br ${gradient} flex items-center justify-center`}
            >
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                    }}
                />
                {course?.image ? (
                    <img
                        src={course.image}
                        alt=""
                        className="relative h-14 w-14 object-contain drop-shadow"
                    />
                ) : (
                    <HiOutlineBookOpen className="relative text-white" size={32} />
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
                            Course
                        </p>
                        <h3 className="text-sm font-semibold text-black truncate">
                            {course?.name || "Untitled"}
                        </h3>
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-mainBg text-greyBlack px-2 py-0.5">
                        <HiOutlineSparkles size={11} />
                        {topics} topic{topics === 1 ? "" : "s"}
                    </span>
                    {grade && (
                        <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-primary/10 text-secondary px-2 py-0.5">
                            <HiOutlineAcademicCap size={11} />
                            Grade {grade}
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-3 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                        Open
                        <HiOutlineArrowRight size={12} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Courses;
