import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import { SubjectsData } from "../../../constants/student/Dashboard";
import { UseStateContext } from "../../../context/ContextProvider";
import {
    HiOutlineCheck,
    HiOutlineXMark,
    HiOutlinePlus,
    HiOutlineSparkles,
    HiOutlineArrowRight,
    HiOutlineRocketLaunch,
    HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const TONES = [
    { bg: "from-pink-100 to-rose-100", icon: "bg-pink-500", text: "text-pink-700", emoji: "🎨" },
    { bg: "from-sky-100 to-blue-100", icon: "bg-sky-500", text: "text-sky-700", emoji: "🔬" },
    { bg: "from-amber-100 to-orange-100", icon: "bg-amber-500", text: "text-amber-700", emoji: "📐" },
    { bg: "from-emerald-100 to-teal-100", icon: "bg-emerald-500", text: "text-emerald-700", emoji: "📖" },
    { bg: "from-violet-100 to-purple-100", icon: "bg-violet-500", text: "text-violet-700", emoji: "🌍" },
    { bg: "from-fuchsia-100 to-pink-100", icon: "bg-fuchsia-500", text: "text-fuchsia-700", emoji: "🎵" },
    { bg: "from-cyan-100 to-blue-100", icon: "bg-cyan-500", text: "text-cyan-700", emoji: "🚀" },
    { bg: "from-lime-100 to-green-100", icon: "bg-lime-600", text: "text-lime-700", emoji: "🌱" },
];

const tone = (i: number) => TONES[i % TONES.length];

const Subjects = () => {
    const { updateUser } = UseStateContext();
    let user = JSON.parse(localStorage.getItem("user") || "{}");
    const navigate = useNavigate();

    const initialSelection = useMemo(
        () => user?.profile?.subjects?.map((s: any) => s._id || s) || [],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const [course, setCourse] = useState<string[]>(initialSelection);
    const [courseData, setCourseData] = useState<any[]>([]);
    const [grade] = useState(user?.profile?.grade?._id);
    const [loadingCourseData, setLoadingCourseData] = useState(true);

    const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [saving, setSaving] = useState(false);

    const arraysMatch = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        const setA = new Set(a);
        return b.every((v) => setA.has(v));
    };
    const dirty = !arraysMatch(course, initialSelection);

    useEffect(() => {
        if (!grade) {
            setLoadingCourseData(false);
            return;
        }
        Get(`/subject/grade/${grade}`)
            .then((d) => {
                if (d.success) setCourseData(d.data || []);
                else displayMessage(d.message);
            })
            .catch((e) => displayMessage(e.message))
            .finally(() => setLoadingCourseData(false));
    }, [grade]);

    useEffect(() => {
        Get("/student/mysubjects")
            .then((d) => {
                if (d.success) setEnrolledSubjects(d.data || []);
                else displayMessage(d.message, "error");
            })
            .catch(() => displayMessage("Failed to fetch enrolled subjects", "error"))
            .finally(() => setLoadingSubjects(false));
    }, []);

    const toggleCourse = (id: string) => {
        setCourse((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
    };

    const handleDiscard = () => setCourse(initialSelection);

    const handleSave = () => {
        if (saving) return;
        setSaving(true);
        Post("/auth/updateuser", {
            grade,
            subjects: course.filter((i) => i != null),
        })
            .then((res) => {
                if (res.success) {
                    localStorage.setItem("token", res.data.token);
                    delete res.data.token;
                    updateUser(res.data.data);
                    user = res.data.data;
                    const newSubjects = res.data.data?.profile?.subjects?.map((s: any) => s._id || s) || [];
                    setCourse(newSubjects);
                    displayMessage("Saved! 🎉", "success");
                    Get("/student/mysubjects").then((d) => {
                        if (d.success) setEnrolledSubjects(d.data || []);
                    });
                } else {
                    displayMessage(res.message, "error");
                }
            })
            .catch(() => displayMessage("Failed to update courses", "error"))
            .finally(() => setSaving(false));
    };

    const openSubject = (subject: any) => {
        localStorage.setItem("subject", JSON.stringify(subject));
        navigate(`${RouteName?.TOPICS_SUBJECTS}?subject=${subject._id}`);
    };

    return (
        <div className="px-2 py-2 md:px-2 md:py-4 pb-32">
            {/* Hero strip */}
            <section className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(99,102,241,0.55)]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>📚</span>
                    <span className="absolute top-20 right-16 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.4s" }}>🌟</span>
                    <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.2s" }}>🚀</span>
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="max-w-xl">
                        <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">Your learning</p>
                        <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                            My Subjects 🎒
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                            Pick what you want to learn. Tap a subject to open lessons and quizzes!
                        </p>
                    </div>
                    {user?.profile?.grade?.grade && (
                        <span className="self-start md:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur text-sm font-bold">
                            <HiOutlineSparkles size={14} />
                            Grade {user.profile.grade.grade}
                        </span>
                    )}
                </div>
            </section>

            {/* Enrolled */}
            <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6 mb-5">
                <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        <div>
                            <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">My courses</h2>
                            <p className="text-xs text-grey">Tap a subject to start learning.</p>
                        </div>
                    </div>
                    {!loadingSubjects && enrolledSubjects.length > 0 && (
                        <span className="text-[10px] uppercase tracking-wider text-grey bg-mainBg font-bold px-2 py-1 rounded-full">
                            {enrolledSubjects.length} active
                        </span>
                    )}
                </header>

                {loadingSubjects ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 p-4 flex flex-col items-center gap-2">
                                <div className="h-16 w-16 rounded-2xl bg-mainBg animate-pulse" />
                                <div className="h-3 w-3/4 rounded bg-mainBg animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : enrolledSubjects.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-10 text-center">
                        <span className="text-5xl block mb-2">🌱</span>
                        <p className="text-sm font-bold text-black">No courses yet</p>
                        <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
                            Pick from the subjects below to start your learning adventure!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {enrolledSubjects.map((subject: any, i: number) => {
                            const t = tone(i);
                            return (
                                <button
                                    key={subject._id || i}
                                    type="button"
                                    onClick={() => openSubject(subject)}
                                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${t.bg} ring-1 ring-white p-4 hover:ring-violet-400 hover:shadow-lg hover:-translate-y-1 transition-all text-center`}
                                >
                                    <div className="flex flex-col items-center gap-2.5">
                                        <div className={`relative h-16 w-16 rounded-2xl ${t.icon} flex items-center justify-center shadow-md`}>
                                            {subject.image ? (
                                                <img
                                                    src={subject.image}
                                                    alt=""
                                                    className="w-10 h-10 object-contain"
                                                />
                                            ) : SubjectsData[i % SubjectsData?.length]?.image ? (
                                                <img
                                                    src={SubjectsData[i % SubjectsData?.length].image}
                                                    alt=""
                                                    className="w-10 h-10 object-contain"
                                                />
                                            ) : (
                                                <span className="text-2xl">{t.emoji}</span>
                                            )}
                                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                        </div>
                                        <p className={`text-sm font-bold ${t.text} leading-tight line-clamp-2`}>
                                            {subject.name || "Subject"}
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-greyBlack/70 bg-white/70 px-1.5 py-0.5 rounded-full">
                                            <HiOutlineRocketLaunch size={10} />
                                            Open
                                            <HiOutlineArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Add subjects */}
            <section className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 ring-1 ring-orange-200/40 p-5 md:p-6">
                <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <div>
                            <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Add more subjects</h2>
                            <p className="text-xs text-grey">Tap a card to add or remove it from your list.</p>
                        </div>
                    </div>
                    {!loadingCourseData && courseData.length > 0 && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-orange-700 bg-white px-2 py-1 rounded-full ring-1 ring-orange-200">
                            {course.length} of {courseData.length} picked
                        </span>
                    )}
                </header>

                {loadingCourseData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-20 rounded-2xl bg-white/80 ring-1 ring-inputBorder/30 animate-pulse" />
                        ))}
                    </div>
                ) : courseData.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-orange-200 p-10 text-center bg-white/60">
                        <span className="text-5xl block mb-2">🤔</span>
                        <p className="text-sm font-bold text-black">No subjects available</p>
                        <p className="text-xs text-grey mt-1">Check back soon — your school is adding more subjects!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {courseData.map((c: any, i: number) => {
                            const selected = course.includes(c._id);
                            const t = tone(i);
                            return (
                                <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => toggleCourse(c._id)}
                                    aria-pressed={selected}
                                    className={`group relative overflow-hidden rounded-2xl text-left p-4 ring-2 transition-all ${
                                        selected
                                            ? "bg-gradient-to-br from-emerald-100 to-teal-100 ring-emerald-400 shadow-md"
                                            : "bg-white ring-inputBorder/40 hover:ring-orange-300 hover:shadow-md hover:-translate-y-0.5"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-colors ${
                                            selected ? "bg-emerald-500 text-white" : `${t.icon} text-white`
                                        }`}>
                                            {selected ? <HiOutlineCheck size={22} strokeWidth={3} /> : t.emoji}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-bold truncate ${selected ? "text-emerald-800" : "text-black"}`}>
                                                {c.name}
                                            </p>
                                            <p className={`text-[11px] mt-0.5 ${selected ? "text-emerald-700" : "text-grey"}`}>
                                                {selected ? "Added — tap to remove" : "Tap to add"}
                                            </p>
                                        </div>
                                    </div>
                                    {selected && (
                                        <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded-full">
                                            <HiOutlineCheck size={10} strokeWidth={3} />
                                            Picked
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Sticky save bar */}
            <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-[min(560px,calc(100vw-340px))] z-40 pointer-events-none">
                <div
                    className={`pointer-events-auto rounded-2xl bg-white/95 backdrop-blur ring-1 ring-inputBorder/60 shadow-lg p-3 flex items-center justify-between gap-3 transition-all ${
                        dirty ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white flex items-center justify-center flex-shrink-0">
                            <HiOutlineExclamationTriangle size={16} />
                        </span>
                        <p className="text-xs font-bold text-greyBlack truncate">You changed your subjects!</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleDiscard}
                            disabled={saving}
                            className="h-9 px-3 rounded-xl text-xs font-bold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-grey/40 transition flex items-center gap-1 disabled:opacity-50"
                        >
                            <HiOutlineXMark size={13} />
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-md hover:shadow-emerald-500/30 transition disabled:opacity-50 flex items-center gap-1"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving
                                </>
                            ) : (
                                <>
                                    <HiOutlinePlus size={13} />
                                    Save my picks ✨
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subjects;
