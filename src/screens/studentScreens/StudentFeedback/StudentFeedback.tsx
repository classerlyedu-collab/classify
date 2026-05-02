import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineSparkles,
    HiOutlineChatBubbleLeftRight,
    HiOutlineStar,
    HiOutlinePaperAirplane,
    HiOutlineCheckCircle,
    HiOutlineAcademicCap,
    HiOutlineMagnifyingGlass,
    HiOutlineUsers,
    HiOutlineArrowRight,
} from "react-icons/hi2";

const RATING_LABELS = ["Needs work", "It's okay", "Pretty good", "Loved it!", "Best ever! 🌟"];
const RATING_EMOJI = ["😟", "😐", "🙂", "😊", "🤩"];

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

const getInitials = (name?: string) => {
    if (!name) return "T";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const formatDate = (s?: string) => {
    if (!s) return "";
    const date = new Date(s);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const StudentFeedback = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<"give" | "receive">("give");
    const [teachers, setTeachers] = useState<any[]>([]);
    const [receivedFeedback, setReceivedFeedback] = useState<any[]>([]);
    const [loadingT, setLoadingT] = useState(true);
    const [loadingF, setLoadingF] = useState(true);

    const [selectedTeacher, setSelectedTeacher] = useState<string | number | null>(null);
    const [feedback, setFeedback] = useState("");
    const [feedbackError, setFeedbackError] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<number | "all">("all");

    useEffect(() => {
        Get("/student/myteachers")
            .then((d) => {
                if (d.success) setTeachers(d.data || []);
                else displayMessage(d.message, "error");
            })
            .catch((err) => displayMessage(err.message, "error"))
            .finally(() => setLoadingT(false));

        Get("/student/feedback")
            .then((d) => {
                if (d.success) setReceivedFeedback(d.data || []);
            })
            .catch(() => {})
            .finally(() => setLoadingF(false));
    }, []);

    const teacherOptions = useMemo(() => {
        const map = new Map<string, any>();
        (teachers || []).forEach((t: any) => {
            const value = t?._id;
            if (value && !map.has(value)) map.set(value, t);
        });
        return Array.from(map.values());
    }, [teachers]);

    const filteredTeachers = useMemo(() => {
        if (!search.trim()) return teacherOptions;
        const q = search.trim().toLowerCase();
        return teacherOptions.filter((t: any) =>
            (t?.auth?.userName || "Teacher").toLowerCase().includes(q)
        );
    }, [teacherOptions, search]);

    const submitFeedback = () => {
        if (!selectedTeacher) {
            displayMessage("Pick a teacher first", "error");
            return;
        }
        if (!feedback.trim()) {
            setFeedbackError("Tell them what you think!");
            return;
        }
        if (!rating) {
            displayMessage("Pick a star rating", "error");
            return;
        }
        setSubmitting(true);
        Post("/student/feedback", { teacher: selectedTeacher, feedback, star: rating })
            .then((d) => {
                if (d.success) {
                    displayMessage("Feedback sent! 🎉", "success");
                    setFeedback("");
                    setRating(null);
                    setHoverRating(null);
                    setSelectedTeacher(null);
                    navigate(RouteName.STUDENT_FEEDBACK);
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch((err) => displayMessage(err.message, "error"))
            .finally(() => setSubmitting(false));
    };

    const filteredReceived = useMemo(() => {
        return receivedFeedback.filter((it: any) => {
            if (filter !== "all" && (it?.star || 0) !== filter) return false;
            return true;
        });
    }, [receivedFeedback, filter]);

    const avgStars = useMemo(() => {
        if (!receivedFeedback.length) return 0;
        const sum = receivedFeedback.reduce((s: number, f: any) => s + (Number(f?.star) || 0), 0);
        return Math.round((sum / receivedFeedback.length) * 10) / 10;
    }, [receivedFeedback]);

    const displayRating = hoverRating ?? rating;

    return (
        <div className="px-2 py-2 md:px-2 md:py-4 pb-12">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(217,70,239,0.55)]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>💬</span>
                    <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>⭐</span>
                    <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>✨</span>
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="max-w-xl">
                        <p className="text-xs uppercase tracking-wider text-white/80 font-semibold inline-flex items-center gap-1.5">
                            <HiOutlineChatBubbleLeftRight size={12} />
                            Feedback
                        </p>
                        <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                            Speak up & shine 🌟
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                            Tell your teachers what's awesome and read what they say back. Be kind, be honest!
                        </p>
                    </div>

                    {/* Stats pill */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
                        <div className="inline-flex items-center gap-3 rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur px-4 py-3">
                            <span className="h-10 w-10 rounded-xl bg-white text-fuchsia-600 flex items-center justify-center text-xl">
                                ⭐
                            </span>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold">Avg from teachers</p>
                                <p className="text-sm font-bold leading-tight">
                                    {loadingF ? "—" : avgStars > 0 ? `${avgStars} / 5` : "Not yet"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white ring-1 ring-inputBorder/50 rounded-2xl p-1 mb-5 max-w-md mx-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab("give")}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                        activeTab === "give"
                            ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-sm"
                            : "text-grey hover:text-greyBlack"
                    }`}
                >
                    <HiOutlinePaperAirplane size={14} />
                    Give feedback
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("receive")}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                        activeTab === "receive"
                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm"
                            : "text-grey hover:text-greyBlack"
                    }`}
                >
                    <HiOutlineChatBubbleLeftRight size={14} />
                    Mine
                    {receivedFeedback.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            activeTab === "receive" ? "bg-white/20" : "bg-mainBg text-grey"
                        }`}>
                            {receivedFeedback.length}
                        </span>
                    )}
                </button>
            </div>

            {/* GIVE FEEDBACK */}
            {activeTab === "give" && (
                <div className="space-y-4">
                    {/* Step 1: Pick a teacher */}
                    <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                        <header className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="h-7 w-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center font-trykker text-sm shadow-md">
                                    1
                                </span>
                                <div>
                                    <h2 className="font-trykker text-lg text-black leading-tight">Pick a teacher</h2>
                                    <p className="text-xs text-grey">Tap their card to choose.</p>
                                </div>
                            </div>
                            <div className="relative w-40 sm:w-56">
                                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search…"
                                    className="w-full h-9 pl-8 pr-3 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 text-xs font-medium focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition"
                                />
                            </div>
                        </header>

                        {loadingT ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 p-4 flex items-center gap-3 animate-pulse">
                                        <div className="h-12 w-12 rounded-full bg-mainBg" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 w-3/4 rounded bg-mainBg" />
                                            <div className="h-2.5 w-1/2 rounded bg-mainBg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredTeachers.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-8 text-center">
                                <span className="text-5xl block mb-2">{search ? "🔍" : "🤔"}</span>
                                <p className="text-sm font-bold text-black">
                                    {search ? "No teachers match" : "No teachers yet"}
                                </p>
                                <p className="text-xs text-grey mt-1">
                                    {search ? "Try a different name." : "Once you join a class, your teachers will show up here."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredTeachers.map((t: any, i) => {
                                    const isSelected = selectedTeacher === t?._id;
                                    const tn = tone(i);
                                    const name = t?.auth?.userName || "Teacher";
                                    return (
                                        <button
                                            key={t?._id || i}
                                            type="button"
                                            onClick={() => setSelectedTeacher(t?._id)}
                                            aria-pressed={isSelected}
                                            className={`group relative overflow-hidden rounded-2xl text-left p-3 ring-2 transition-all flex items-center gap-3 ${
                                                isSelected
                                                    ? "bg-gradient-to-br from-emerald-100 to-teal-100 ring-emerald-400 shadow-md"
                                                    : "bg-white ring-inputBorder/40 hover:ring-fuchsia-300 hover:shadow-md hover:-translate-y-0.5"
                                            }`}
                                        >
                                            {t?.auth?.image ? (
                                                <img
                                                    src={t.auth.image}
                                                    alt=""
                                                    className="h-12 w-12 rounded-2xl object-cover ring-1 ring-inputBorder/40 flex-shrink-0"
                                                />
                                            ) : (
                                                <span className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tn.bg} text-white flex items-center justify-center font-trykker text-base shadow-md flex-shrink-0`}>
                                                    {getInitials(name)}
                                                </span>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm font-bold truncate ${isSelected ? "text-emerald-800" : "text-black"}`}>
                                                    {name}
                                                </p>
                                                <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${isSelected ? "text-emerald-700" : "text-grey"}`}>
                                                    <HiOutlineAcademicCap size={10} />
                                                    Teacher
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <span className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                                    <HiOutlineCheckCircle size={14} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Step 2: Star rating */}
                    <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                        <header className="flex items-center gap-2 mb-4">
                            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center font-trykker text-sm shadow-md">
                                2
                            </span>
                            <div>
                                <h2 className="font-trykker text-lg text-black leading-tight">How was your experience?</h2>
                                <p className="text-xs text-grey">Tap a star to rate.</p>
                            </div>
                        </header>

                        <div className="flex flex-col items-center py-4">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const filled = (displayRating ?? 0) > i;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setRating(i + 1)}
                                            onMouseEnter={() => setHoverRating(i + 1)}
                                            onMouseLeave={() => setHoverRating(null)}
                                            className={`focus:outline-none transition-transform ${filled ? "scale-110" : "hover:scale-110"}`}
                                            aria-label={`Rate ${i + 1} star${i ? "s" : ""}`}
                                        >
                                            <HiOutlineStar
                                                size={42}
                                                className={`transition-colors ${
                                                    filled
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-inputBorder"
                                                }`}
                                                style={{ fill: filled ? "currentColor" : "none" }}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-3xl">{displayRating ? RATING_EMOJI[displayRating - 1] : "🤔"}</span>
                                <p className={`text-sm font-bold ${displayRating ? "text-amber-600" : "text-grey"}`}>
                                    {displayRating ? RATING_LABELS[displayRating - 1] : "Pick a rating"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Step 3: Message */}
                    <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                        <header className="flex items-center gap-2 mb-4">
                            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center font-trykker text-sm shadow-md">
                                3
                            </span>
                            <div>
                                <h2 className="font-trykker text-lg text-black leading-tight">Write your message</h2>
                                <p className="text-xs text-grey">Be kind and helpful — what did you love? What could be better?</p>
                            </div>
                        </header>
                        <textarea
                            value={feedback}
                            onChange={(e) => {
                                setFeedback(e.target.value);
                                if (feedbackError) setFeedbackError("");
                            }}
                            rows={5}
                            placeholder="Tell your teacher what you think…"
                            className={`w-full px-4 py-3 rounded-2xl ring-1 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition resize-none ${
                                feedbackError ? "ring-rose-400 bg-rose-50" : "ring-inputBorder/60 bg-mainBg/60 focus:bg-white"
                            }`}
                        />
                        <div className="flex items-center justify-between mt-2">
                            {feedbackError ? (
                                <p className="text-xs text-rose-600 font-bold">{feedbackError}</p>
                            ) : (
                                <p className="text-[11px] text-grey">
                                    {feedback.trim().length} character{feedback.trim().length === 1 ? "" : "s"}
                                </p>
                            )}
                            <p className="text-[11px] text-grey">
                                <HiOutlineSparkles className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={10} />
                                Be respectful — they read every word
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={submitFeedback}
                            disabled={submitting || !selectedTeacher || !feedback.trim() || !rating}
                            className="mt-5 w-full h-12 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 hover:shadow-lg hover:shadow-fuchsia-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <HiOutlinePaperAirplane size={16} />
                                    Send feedback
                                    <span className="text-base">🚀</span>
                                </>
                            )}
                        </button>
                    </section>
                </div>
            )}

            {/* RECEIVE FEEDBACK */}
            {activeTab === "receive" && (
                <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💌</span>
                            <div>
                                <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Notes from your teachers</h2>
                                <p className="text-xs text-grey">Sweet messages just for you.</p>
                            </div>
                        </div>
                        {!loadingF && receivedFeedback.length > 0 && (
                            <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl p-1 self-start sm:self-auto">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`h-7 px-3 text-[11px] font-bold rounded-lg transition ${
                                        filter === "all"
                                            ? "bg-white text-fuchsia-600 shadow-sm"
                                            : "text-grey hover:text-greyBlack"
                                    }`}
                                >
                                    All ({receivedFeedback.length})
                                </button>
                                {[5, 4, 3, 2, 1].map((s) => {
                                    const count = receivedFeedback.filter((f: any) => (f?.star || 0) === s).length;
                                    if (!count) return null;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setFilter(s)}
                                            className={`h-7 px-2 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
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
                        )}
                    </header>

                    {loadingF ? (
                        <div className="space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-full bg-mainBg animate-pulse" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 w-1/3 rounded bg-mainBg animate-pulse" />
                                            <div className="h-2 w-1/4 rounded bg-mainBg animate-pulse" />
                                        </div>
                                        <div className="h-3 w-16 rounded bg-mainBg animate-pulse" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="h-3 w-full rounded bg-mainBg animate-pulse" />
                                        <div className="h-3 w-2/3 rounded bg-mainBg animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredReceived.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-12 text-center">
                            <span className="text-6xl block mb-3">{filter !== "all" ? "🔍" : "💌"}</span>
                            <p className="text-base font-bold text-black">
                                {filter !== "all" ? "No matches" : "No notes yet"}
                            </p>
                            <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
                                {filter !== "all"
                                    ? "Try a different rating filter."
                                    : "Keep learning and your teachers will leave kind notes here. ✨"}
                            </p>
                            {filter === "all" && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("give")}
                                    className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:shadow-md hover:shadow-fuchsia-500/30 transition"
                                >
                                    <HiOutlinePaperAirplane size={14} />
                                    Send feedback first
                                    <HiOutlineArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {filteredReceived.map((item: any, i: number) => {
                                const tn = tone(i);
                                const name = item?.from?.auth?.userName || "Teacher";
                                const stars = Number(item?.star) || 0;
                                return (
                                    <li
                                        key={item?._id || i}
                                        className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/40 hover:ring-fuchsia-300 hover:shadow-md transition-all p-5"
                                    >
                                        <div aria-hidden className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${tn.bg} opacity-15 blur-2xl pointer-events-none`} />
                                        <div className="relative flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                {item?.from?.auth?.image ? (
                                                    <img
                                                        src={item.from.auth.image}
                                                        alt=""
                                                        className="h-11 w-11 rounded-2xl object-cover ring-1 ring-inputBorder/40 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <span className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${tn.bg} text-white flex items-center justify-center font-trykker text-base shadow-md flex-shrink-0`}>
                                                        {getInitials(name)}
                                                    </span>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-black truncate">{name}</p>
                                                    <p className="text-[11px] text-grey">{formatDate(item?.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                                {Array.from({ length: 5 }).map((_, idx) => {
                                                    const filled = idx < stars;
                                                    return (
                                                        <HiOutlineStar
                                                            key={idx}
                                                            size={16}
                                                            className={filled ? "text-amber-400" : "text-inputBorder"}
                                                            style={{ fill: filled ? "currentColor" : "none" }}
                                                            strokeWidth={1.5}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="relative bg-mainBg/60 rounded-2xl px-4 py-3 ring-1 ring-inputBorder/30">
                                            <span className="absolute top-2 left-3 text-2xl text-grey/50 leading-none">"</span>
                                            <p className="text-sm text-greyBlack leading-relaxed pl-5 pr-2">
                                                {item.feedback || "No message provided."}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            )}

            <p className="pt-6 pb-4 text-center text-xs text-grey">
                <HiOutlineUsers className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={12} />
                Kind feedback helps everyone grow ✨
            </p>
        </div>
    );
};

export default StudentFeedback;
