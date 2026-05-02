import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowLeft,
    HiOutlineArrowsPointingOut,
    HiOutlineArrowTopRightOnSquare,
    HiOutlinePuzzlePiece,
    HiOutlineSparkles,
    HiOutlineHome,
    HiOutlineArrowPath,
    HiOutlineLightBulb,
    HiOutlineHandRaised,
    HiOutlineXMark,
} from "react-icons/hi2";

const GAMES_URL = "https://kids.poki.com/";

const Games = () => {
    const navigate = useNavigate();
    const [iframeKey, setIframeKey] = useState(0);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);

    // Reset loading state whenever the iframe is reloaded
    useEffect(() => {
        setIframeLoading(true);
    }, [iframeKey]);

    const reload = () => setIframeKey((k) => k + 1);

    return (
        <div className="px-2 py-2 md:px-2 md:py-4 pb-12">
            {/* Back link */}
            <button
                type="button"
                onClick={() => navigate(RouteName.DASHBOARD_SCREEN_STUDENT)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline mb-3"
            >
                <HiOutlineArrowLeft size={14} />
                Back to dashboard
            </button>

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(20,184,166,0.55)]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>🎮</span>
                    <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>🧩</span>
                    <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>⭐</span>
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-center gap-4 min-w-0">
                        <span className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-4xl flex-shrink-0">
                            🎮
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider text-white/80 font-semibold inline-flex items-center gap-1.5">
                                <HiOutlinePuzzlePiece size={12} />
                                Game time
                            </p>
                            <h1 className="font-trykker text-3xl md:text-4xl mt-0.5 leading-tight">Play & learn 🚀</h1>
                            <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed max-w-md">
                                Pick a game, take a break, and have fun. Don't forget to come back and study too!
                            </p>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        <button
                            type="button"
                            onClick={reload}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur text-white text-xs font-bold hover:bg-white/25 transition"
                        >
                            <HiOutlineArrowPath size={13} />
                            Refresh
                        </button>
                        <a
                            href={GAMES_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur text-white text-xs font-bold hover:bg-white/25 transition"
                        >
                            <HiOutlineArrowTopRightOnSquare size={13} />
                            Open
                        </a>
                        <button
                            type="button"
                            onClick={() => setFullscreen((v) => !v)}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-white text-emerald-600 text-xs font-bold hover:scale-[1.03] transition-transform"
                        >
                            <HiOutlineArrowsPointingOut size={13} />
                            {fullscreen ? "Shrink" : "Big screen"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Mini reminder strip */}
            {!fullscreen && (
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 ring-1 ring-orange-200/40 p-3 md:p-4 mb-5">
                    <div className="flex items-center gap-3 flex-wrap text-xs text-orange-800 font-bold">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 ring-1 ring-amber-200">
                            <HiOutlineLightBulb size={13} className="text-amber-600" />
                            Take breaks every 20 min
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 ring-1 ring-amber-200">
                            <HiOutlineHandRaised size={13} className="text-rose-600" />
                            Be kind in chat
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 ring-1 ring-amber-200">
                            <HiOutlineSparkles size={13} className="text-fuchsia-600" />
                            Have fun & don't forget homework!
                        </span>
                    </div>
                </div>
            )}

            {/* Game frame */}
            <section className={`relative ${fullscreen ? "fixed inset-0 z-40 bg-mainBg p-4" : ""}`}>
                {fullscreen && (
                    <button
                        type="button"
                        onClick={() => setFullscreen(false)}
                        className="absolute top-6 right-6 z-50 h-10 px-4 rounded-xl bg-white ring-1 ring-inputBorder text-xs font-bold text-greyBlack hover:bg-mainBg transition flex items-center gap-1.5 shadow-md"
                    >
                        <HiOutlineXMark size={13} />
                        Exit big screen
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
                            🎮 Playing: kids.poki.com
                        </p>
                        <span className="text-[10px] text-grey font-bold uppercase tracking-wider hidden sm:inline">
                            Have fun! 🌟
                        </span>
                    </div>

                    {/* Iframe with loading overlay */}
                    <div className={`relative bg-white ${fullscreen ? "h-[calc(100vh-12rem)]" : "h-[75vh] md:h-[82vh]"}`}>
                        {iframeLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                                <div className="text-center">
                                    <div className="relative inline-block mb-3">
                                        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-teal-500/30 animate-pulse">
                                            🎮
                                        </div>
                                        <span className="absolute -bottom-1 -right-1 text-xl animate-bounce">⚡</span>
                                    </div>
                                    <p className="text-sm font-bold text-greyBlack">Loading the game arcade…</p>
                                    <p className="text-xs text-grey mt-1">Get ready to play! ✨</p>
                                </div>
                            </div>
                        )}
                        <iframe
                            key={iframeKey}
                            loading="lazy"
                            onLoad={() => setIframeLoading(false)}
                            className="w-full h-full"
                            src={GAMES_URL}
                            title="Games Platform"
                            allow="fullscreen"
                        />
                    </div>
                </div>
            </section>

            {/* Bottom helper (hidden in focus mode) */}
            {!fullscreen && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(RouteName.SUBJECTS_SCREEN)}
                        className="group rounded-2xl bg-white ring-1 ring-inputBorder/50 hover:ring-fuchsia-300 hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex items-center gap-3 text-left"
                    >
                        <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                            📚
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-black truncate">Back to learning</p>
                            <p className="text-[11px] text-grey">Open your subjects</p>
                        </div>
                        <span className="text-grey group-hover:text-secondary group-hover:translate-x-0.5 transition-all">→</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(RouteName.DASHBOARD_SCREEN_STUDENT)}
                        className="group rounded-2xl bg-white ring-1 ring-inputBorder/50 hover:ring-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex items-center gap-3 text-left"
                    >
                        <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                            <HiOutlineHome size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-black truncate">Go home</p>
                            <p className="text-[11px] text-grey">Check your dashboard</p>
                        </div>
                        <span className="text-grey group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all">→</span>
                    </button>
                </div>
            )}

            {!fullscreen && (
                <p className="pt-6 pb-4 text-center text-xs text-grey">
                    <HiOutlineSparkles className="inline mb-0.5 mr-0.5 text-fuchsia-500" size={12} />
                    Games are fun, but learning is your superpower 🦸
                </p>
            )}
        </div>
    );
};

export default Games;
