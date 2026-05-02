import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { Chatbot } from "../../../components";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlineDocumentText,
    HiOutlineLanguage,
    HiOutlineCheckCircle,
    HiOutlineSparkles,
    HiOutlineRocketLaunch,
    HiOutlineArrowsPointingOut,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineBookOpen,
} from "react-icons/hi2";

const Material = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const content = searchParams.get("content") || "";

    const [lesson, setLesson] = useState<any>({});
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [marked, setMarked] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const subject = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("subject") || "{}");
        } catch {
            return {};
        }
    }, []);

    useEffect(() => {
        try {
            const cached = localStorage.getItem("lesson");
            if (cached) setLesson(JSON.parse(cached));
        } catch {}

        const lessonid = (() => {
            try {
                return JSON.parse(localStorage.getItem("lessonid") || "null");
            } catch {
                return null;
            }
        })();
        if (!lessonid) {
            setLoadingMeta(false);
            return;
        }
        Get(`/topic/lesson/content`, lessonid)
            .then((d) => {
                if (d.success) {
                    if (d.data) setLesson(d.data);
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch(() => displayMessage("Failed to load lesson", "error"))
            .finally(() => setLoadingMeta(false));
    }, []);

    const handleBack = () => {
        const topicId = lesson?.topic?._id || lesson?.topic;
        if (topicId) {
            navigate(`${RouteName.LESSONS_STUDENT}?topic=${topicId}`);
        } else {
            navigate(`${RouteName.TOPICS_SUBJECTS}?subject=${subject?._id || ""}`);
        }
    };

    const lessonName = lesson?.name || "Lesson";
    const lessonWords = lesson?.words;
    const lessonPages = lesson?.pages;
    const lessonLang = lesson?.lang;

    return (
        <div className="px-2 py-2 md:px-2 md:py-4 pb-32">
            {/* Back link */}
            <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline mb-3"
            >
                <HiOutlineArrowLeft size={14} />
                Back to lessons
            </button>

            {/* Hero / lesson header */}
            <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white p-6 md:p-7 shadow-[0_25px_60px_-25px_rgba(20,184,166,0.55)]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>📖</span>
                    <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>✨</span>
                    <span className="absolute bottom-6 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>🌟</span>
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <span className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-3xl flex-shrink-0">
                            📚
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">
                                {subject?.name || "Reading time"}
                            </p>
                            {loadingMeta ? (
                                <div className="mt-1 h-7 w-56 rounded bg-white/20 animate-pulse" />
                            ) : (
                                <h1 className="font-trykker text-2xl md:text-3xl mt-0.5 leading-tight line-clamp-2">
                                    {lessonName}
                                </h1>
                            )}
                            {!loadingMeta && (
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    {lessonLang && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white/20 ring-1 ring-white/25 px-2 py-0.5 rounded-full">
                                            <HiOutlineLanguage size={11} />
                                            {lessonLang}
                                        </span>
                                    )}
                                    {!!lessonWords && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white/20 ring-1 ring-white/25 px-2 py-0.5 rounded-full">
                                            <HiOutlineDocumentText size={11} />
                                            {lessonWords} words
                                        </span>
                                    )}
                                    {!!lessonPages && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white/20 ring-1 ring-white/25 px-2 py-0.5 rounded-full">
                                            <HiOutlineDocumentText size={11} />
                                            {lessonPages} pages
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        {content && (
                            <a
                                href={content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur text-white text-xs font-bold hover:bg-white/25 transition"
                            >
                                <HiOutlineArrowTopRightOnSquare size={13} />
                                Open
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => setFullscreen((v) => !v)}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur text-white text-xs font-bold hover:bg-white/25 transition"
                        >
                            <HiOutlineArrowsPointingOut size={13} />
                            {fullscreen ? "Shrink" : "Focus"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Reading frame */}
            <section className={`relative ${fullscreen ? "fixed inset-0 z-40 bg-mainBg p-4" : ""}`}>
                {fullscreen && (
                    <button
                        type="button"
                        onClick={() => setFullscreen(false)}
                        className="absolute top-6 right-6 z-50 h-10 px-4 rounded-xl bg-white ring-1 ring-inputBorder text-xs font-bold text-greyBlack hover:bg-mainBg transition flex items-center gap-1.5 shadow-md"
                    >
                        <HiOutlineArrowsPointingOut size={13} />
                        Exit focus
                    </button>
                )}
                <div className={`rounded-3xl bg-white ring-1 ring-inputBorder/50 overflow-hidden ${fullscreen ? "h-full" : ""}`}>
                    {/* Mock browser bar */}
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-inputBorder/40 bg-mainBg/50">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <p className="text-[11px] text-grey font-bold uppercase tracking-wider truncate">
                            📖 Reading: {lessonName}
                        </p>
                        <span className="text-[10px] text-grey font-bold uppercase tracking-wider hidden sm:inline">
                            Stay focused 🎯
                        </span>
                    </div>

                    {/* Iframe with loading overlay */}
                    <div className={`relative bg-white ${fullscreen ? "h-[calc(100vh-12rem)]" : "h-[70vh] md:h-[80vh]"}`}>
                        {iframeLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                                <div className="text-center">
                                    <div className="h-12 w-12 mx-auto mb-3 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
                                    <p className="text-sm font-bold text-greyBlack">Loading your lesson…</p>
                                    <p className="text-xs text-grey mt-1">Hang tight, almost there ✨</p>
                                </div>
                            </div>
                        )}
                        {content ? (
                            <iframe
                                key={content}
                                loading="lazy"
                                onLoad={() => setIframeLoading(false)}
                                className="w-full h-full"
                                src={content}
                                title="Lesson Material"
                                allow="fullscreen"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-5xl block mb-2">🤔</span>
                                    <p className="text-sm font-bold text-black">No content URL</p>
                                    <p className="text-xs text-grey mt-1">This lesson doesn't have material yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Sticky action bar */}
            {!fullscreen && (
                <div className="fixed bottom-4 left-4 right-4 lg:right-auto lg:left-[calc(16.6667%+1.5rem)] lg:w-[min(560px,calc(100vw-300px))] z-40 pointer-events-none">
                    <div className="pointer-events-auto rounded-2xl bg-white/95 backdrop-blur ring-1 ring-inputBorder/60 shadow-lg p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                                marked
                                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md"
                                    : "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600"
                            }`}>
                                {marked ? <HiOutlineCheckCircle size={18} /> : <HiOutlineBookOpen size={18} />}
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-black truncate">
                                    {marked ? "Awesome work! 🎉" : "Reading in progress…"}
                                </p>
                                <p className="text-[10px] text-grey truncate">
                                    {marked ? "Lesson marked as done. +25 XP earned!" : "Mark it done when you finish reading"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!marked ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMarked(true);
                                        displayMessage("Great job! +25 XP 🎉", "success");
                                    }}
                                    className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-md hover:shadow-emerald-500/30 transition flex items-center gap-1.5"
                                >
                                    <HiOutlineCheckCircle size={14} />
                                    I'm done!
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const topicId = lesson?.topic?._id || lesson?.topic;
                                        if (topicId) {
                                            navigate(`${RouteName.QUIZ_CONFIRMATION}?topic=${topicId}`);
                                        } else {
                                            navigate(RouteName.LESSONS_STUDENT);
                                        }
                                    }}
                                    className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-md hover:shadow-fuchsia-500/30 transition flex items-center gap-1.5"
                                >
                                    <HiOutlineRocketLaunch size={14} />
                                    Take a quiz
                                    <HiOutlineArrowRight size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Encouragement (only when not in focus mode) */}
            {!fullscreen && (
                <p className="pt-6 pb-4 text-center text-xs text-grey">
                    <HiOutlineSparkles className="inline mb-0.5 mr-0.5 text-violet-500" size={12} />
                    Take your time — every page makes you smarter
                </p>
            )}

            <Chatbot />
        </div>
    );
};

export default Material;
