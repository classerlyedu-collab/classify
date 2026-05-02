import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCornerDownLeft, FiArrowRight } from "react-icons/fi";
import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineCalendar,
    HiOutlineCog6Tooth,
    HiOutlineAcademicCap,
    HiOutlineDocumentText,
    HiOutlineSparkles,
    HiOutlineChatBubbleLeftRight,
    HiOutlineGift,
    HiOutlineCreditCard,
    HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { RouteName } from "../../routes/RouteNames";

type Cmd = {
    id: string;
    label: string;
    keywords: string;
    section: string;
    icon: React.ComponentType<any>;
    onRun: (navigate: ReturnType<typeof useNavigate>) => void;
    roles?: Array<"Parent" | "Teacher" | "Student">;
};

const ALL_COMMANDS: Cmd[] = [
    {
        id: "dashboard-parent",
        label: "Go to Dashboard",
        keywords: "dashboard home parent overview",
        section: "Navigation",
        icon: HiOutlineHome,
        roles: ["Parent"],
        onRun: (n) => n(RouteName.DASHBOARD_SCREEN),
    },
    {
        id: "dashboard-teacher",
        label: "Go to Dashboard",
        keywords: "dashboard home teacher overview",
        section: "Navigation",
        icon: HiOutlineHome,
        roles: ["Teacher"],
        onRun: (n) => n(RouteName.DASHBOARD_SCREEN_TEACHER),
    },
    {
        id: "dashboard-student",
        label: "Go to Dashboard",
        keywords: "dashboard home student overview",
        section: "Navigation",
        icon: HiOutlineHome,
        roles: ["Student"],
        onRun: (n) => n(RouteName.DASHBOARD_SCREEN_STUDENT),
    },
    {
        id: "my-children",
        label: "My Children",
        keywords: "children kids family",
        section: "Family",
        icon: HiOutlineUsers,
        roles: ["Parent"],
        onRun: (n) => n(RouteName.MYCHILDREN_SCREEN),
    },
    {
        id: "courses",
        label: "Courses",
        keywords: "courses subjects classes lessons",
        section: "Learn",
        icon: HiOutlineAcademicCap,
        roles: ["Student"],
        onRun: (n) => n(RouteName.SUBJECTS_SCREEN),
    },
    {
        id: "results",
        label: "Results",
        keywords: "results grades scores",
        section: "Learn",
        icon: HiOutlineDocumentText,
        roles: ["Student"],
        onRun: (n) => n(RouteName.RESULTS_SCREEN),
    },
    {
        id: "quizzes",
        label: "Quizzes",
        keywords: "quizzes tests assessments",
        section: "Teach",
        icon: HiOutlineSparkles,
        roles: ["Teacher"],
        onRun: (n) => n(RouteName.MY_QUIZZES),
    },
    {
        id: "students",
        label: "Students",
        keywords: "students class roster",
        section: "Teach",
        icon: HiOutlineAcademicCap,
        roles: ["Teacher"],
        onRun: (n) => n(RouteName.STUDENTS_SCREEN),
    },
    {
        id: "feedback-teacher",
        label: "Feedback",
        keywords: "feedback comments review",
        section: "Teach",
        icon: HiOutlineChatBubbleLeftRight,
        roles: ["Teacher"],
        onRun: (n) => n(RouteName.FEEDBACK_SCREEN),
    },
    {
        id: "feedback-student",
        label: "Feedback",
        keywords: "feedback comments review",
        section: "Learn",
        icon: HiOutlineChatBubbleLeftRight,
        roles: ["Student"],
        onRun: (n) => n(RouteName.STUDENT_FEEDBACK),
    },
    {
        id: "calendar",
        label: "Calendar",
        keywords: "calendar schedule events",
        section: "Plan",
        icon: HiOutlineCalendar,
        onRun: (n) => n(RouteName.CALENDAR_SCREEN),
    },
    {
        id: "settings",
        label: "Settings",
        keywords: "settings profile account preferences password email",
        section: "Account",
        icon: HiOutlineCog6Tooth,
        onRun: (n) => n(RouteName.SETTING_SCREEN),
    },
    {
        id: "subscription",
        label: "Subscription & Billing",
        keywords: "subscription billing plan upgrade payment",
        section: "Account",
        icon: HiOutlineCreditCard,
        roles: ["Parent", "Teacher"],
        onRun: (n) => n(RouteName.SUBSCRIPTION),
    },
    {
        id: "coupons",
        label: "Coupons",
        keywords: "coupons promo discount",
        section: "Account",
        icon: HiOutlineGift,
        onRun: (n) => n(RouteName.COUPON),
    },
    {
        id: "signout",
        label: "Sign out",
        keywords: "logout signout exit",
        section: "Account",
        icon: HiOutlineArrowRightOnRectangle,
        onRun: (n) => n(RouteName.AUTH_SCREEN, { replace: true }),
    },
];

type CommandPaletteProps = {
    isOpen: boolean;
    onClose: () => void;
    role?: "Parent" | "Teacher" | "Student" | string | null;
};

const RECENT_KEY = "classerly:cmd:recent";

const CommandPalette = ({ isOpen, onClose, role }: CommandPaletteProps) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const allowed = useMemo(
        () =>
            ALL_COMMANDS.filter(
                (c) => !c.roles || (role && c.roles.includes(role as any))
            ),
        [role]
    );

    const recent = useMemo<string[]>(() => {
        try {
            const raw = localStorage.getItem(RECENT_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            const recents = recent
                .map((id) => allowed.find((c) => c.id === id))
                .filter(Boolean) as Cmd[];
            const remaining = allowed.filter((c) => !recent.includes(c.id));
            return { mode: "default" as const, recents, remaining };
        }
        const tokens = q.split(/\s+/).filter(Boolean);
        const score = (c: Cmd) => {
            const hay = `${c.label} ${c.section} ${c.keywords}`.toLowerCase();
            let s = 0;
            for (const t of tokens) {
                if (!hay.includes(t)) return -1;
                if (c.label.toLowerCase().startsWith(t)) s += 5;
                if (c.label.toLowerCase().includes(t)) s += 3;
                if (c.keywords.toLowerCase().includes(t)) s += 1;
            }
            return s;
        };
        const ranked = allowed
            .map((c) => ({ c, s: score(c) }))
            .filter((x) => x.s >= 0)
            .sort((a, b) => b.s - a.s)
            .map((x) => x.c);
        return { mode: "search" as const, results: ranked };
    }, [query, allowed, recent]);

    // Flat list for keyboard navigation
    const flat: Cmd[] = useMemo(() => {
        if (filtered.mode === "search") return filtered.results;
        return [...filtered.recents, ...filtered.remaining];
    }, [filtered]);

    useEffect(() => {
        if (!isOpen) return;
        setQuery("");
        setHighlight(0);
        const t = setTimeout(() => inputRef.current?.focus(), 30);
        return () => clearTimeout(t);
    }, [isOpen]);

    useEffect(() => {
        setHighlight(0);
    }, [query]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => Math.min(flat.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter") {
                const cmd = flat[highlight];
                if (cmd) {
                    e.preventDefault();
                    runCommand(cmd);
                }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, flat, highlight]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>(
            `[data-cmd-index="${highlight}"]`
        );
        el?.scrollIntoView({ block: "nearest" });
    }, [highlight]);

    const runCommand = (c: Cmd) => {
        try {
            const next = [c.id, ...recent.filter((id) => id !== c.id)].slice(0, 5);
            localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
            /* ignore */
        }
        onClose();
        c.onRun(navigate);
    };

    if (!isOpen) return null;

    const renderItem = (c: Cmd, idx: number) => {
        const Icon = c.icon;
        const active = idx === highlight;
        return (
            <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={active}
                data-cmd-index={idx}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => runCommand(c)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${active ? "bg-gradient-to-r from-primary/10 to-secondary/10" : ""
                    }`}
            >
                <span
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${active
                        ? "bg-gradient-to-br from-primary to-secondary text-white"
                        : "bg-mainBg text-secondary"
                        }`}
                >
                    <Icon size={15} />
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block text-sm text-black font-medium truncate">
                        {c.label}
                    </span>
                    <span className="block text-[11px] text-grey">{c.section}</span>
                </span>
                {active ? (
                    <FiCornerDownLeft className="text-secondary shrink-0" size={14} />
                ) : (
                    <FiArrowRight className="text-grey opacity-0 group-hover:opacity-100 shrink-0" size={14} />
                )}
            </button>
        );
    };

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm font-ubuntu flex items-start justify-center pt-[12vh] px-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-[cmdIn_180ms_ease-out]"
            >
                <style>{`@keyframes cmdIn { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

                {/* Search input */}
                <div className="flex items-center gap-2 px-4 h-14 border-b border-inputBorder/50">
                    <FiSearch className="text-secondary" size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, settings, actions…"
                        className="flex-1 h-full bg-transparent text-sm text-black placeholder:text-inputPlaceholder focus:outline-none"
                    />
                    <span className="text-[10px] text-grey rounded-md border border-inputBorder bg-mainBg px-1.5 py-0.5 font-medium">
                        Esc
                    </span>
                </div>

                {/* Results */}
                <div
                    ref={listRef}
                    role="listbox"
                    className="max-h-[60vh] overflow-y-auto p-2"
                >
                    {flat.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-sm text-greyBlack font-medium">
                                No matches for "{query}"
                            </p>
                            <p className="text-xs text-grey mt-1">
                                Try a different keyword.
                            </p>
                        </div>
                    ) : filtered.mode === "search" ? (
                        <div className="flex flex-col gap-0.5">
                            {filtered.results.map((c, i) => renderItem(c, i))}
                        </div>
                    ) : (
                        <>
                            {filtered.recents.length > 0 && (
                                <div className="mb-2">
                                    <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-grey font-semibold">
                                        Recent
                                    </p>
                                    <div className="flex flex-col gap-0.5">
                                        {filtered.recents.map((c, i) => renderItem(c, i))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-grey font-semibold">
                                    Suggestions
                                </p>
                                <div className="flex flex-col gap-0.5">
                                    {filtered.remaining.map((c, i) =>
                                        renderItem(c, filtered.recents.length + i)
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 h-10 border-t border-inputBorder/50 bg-mainBg/40">
                    <p className="text-[11px] text-grey">
                        <span className="font-medium text-greyBlack">↑↓</span> to navigate ·{" "}
                        <span className="font-medium text-greyBlack">↵</span> to open
                    </p>
                    <p className="text-[11px] text-grey">
                        <span className="text-greyBlack font-medium">⌘ K</span> anywhere
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommandPalette;
