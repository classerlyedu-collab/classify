import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiBell, FiX, FiCheck, FiInbox } from "react-icons/fi";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

type NotificationModalProps = {
    isVisible: boolean;
    onClose: () => void;
    notifications: any[];
    onNotificationsUpdated?: () => void;
};

const getCurrentUserId = () => {
    try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u?._id || u?.id || null;
    } catch {
        return null;
    }
};

const isReadByMe = (n: any, id: any) => {
    if (!id || !n?.readBy) return false;
    return n.readBy.some(
        (r: any) => r.userId === id || r.userId?._id === id
    );
};

const getTimeAgo = (ts: string) => {
    const now = Date.now();
    const t = new Date(ts).getTime();
    const s = Math.max(0, Math.floor((now - t) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w < 4) return `${w}w ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}mo ago`;
    return `${Math.floor(d / 365)}y ago`;
};

const isToday = (ts: string) => {
    if (!ts) return false;
    const a = new Date(ts);
    const b = new Date();
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

const NotificationsModal: React.FC<NotificationModalProps> = ({
    isVisible,
    onClose,
    notifications,
    onNotificationsUpdated,
}) => {
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [marking, setMarking] = useState(false);
    const userId = getCurrentUserId();

    useEffect(() => {
        if (!isVisible) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isVisible, onClose]);

    const filtered = useMemo(() => {
        if (filter === "unread") {
            return (notifications || []).filter((n) => !isReadByMe(n, userId));
        }
        return notifications || [];
    }, [notifications, filter, userId]);

    const grouped = useMemo(() => {
        const today: any[] = [];
        const earlier: any[] = [];
        filtered.forEach((n) => {
            const ts = n?.createdAt || n?.updatedAt;
            if (ts && isToday(ts)) today.push(n);
            else earlier.push(n);
        });
        return { today, earlier };
    }, [filtered]);

    const unreadCount = useMemo(
        () => (notifications || []).filter((n) => !isReadByMe(n, userId)).length,
        [notifications, userId]
    );

    const handleMarkAll = async () => {
        try {
            setMarking(true);
            const res = await Post("/markAllNotificationsAsRead", {});
            if (res?.success) {
                displayMessage(res.message || "All notifications marked as read", "success");
                onNotificationsUpdated?.();
            } else {
                displayMessage(res?.message || "Failed to mark as read", "error");
            }
        } catch {
            displayMessage("Failed to mark notifications as read", "error");
        } finally {
            setMarking(false);
        }
    };

    if (!isVisible) return null;

    const renderItem = (n: any, idx: number) => {
        const read = isReadByMe(n, userId);
        const ts = n?.createdAt || n?.updatedAt;
        return (
            <li
                key={idx}
                className={`group relative flex gap-3 px-4 py-3 transition cursor-pointer ${read ? "bg-white" : "bg-primary/5 hover:bg-primary/10"
                    } hover:bg-mainBg`}
            >
                {/* unread dot rail */}
                <span
                    aria-hidden
                    className={`absolute left-0 top-0 bottom-0 w-[3px] ${read ? "bg-transparent" : "bg-gradient-to-b from-primary to-secondary"
                        }`}
                />

                {/* icon */}
                <span
                    className={`mt-0.5 h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${read
                            ? "bg-mainBg text-greyBlack"
                            : "bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary"
                        }`}
                >
                    <FiBell size={16} />
                </span>

                {/* content */}
                <div className="min-w-0 flex-1">
                    <p
                        className={`text-sm leading-snug ${read ? "text-greyBlack" : "text-black font-medium"
                            }`}
                    >
                        {n?.title || "Notification"}
                    </p>
                    {n?.body && (
                        <p className="text-xs text-grey mt-0.5 leading-snug truncate">
                            {n.body}
                        </p>
                    )}
                    <p className="text-[11px] text-grey mt-1">
                        {ts ? getTimeAgo(ts) : ""}
                    </p>
                </div>

                {!read && (
                    <span className="self-start mt-2 h-2 w-2 rounded-full bg-gradient-to-br from-primary to-secondary" />
                )}
            </li>
        );
    };

    return createPortal(
        <>
            {/* Overlay */}
            <div
                aria-hidden
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Notifications"
                className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-white shadow-2xl flex flex-col font-ubuntu animate-[notifIn_220ms_ease-out]"
            >
                <style>{`@keyframes notifIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

                {/* Header */}
                <header className="px-5 py-4 border-b border-inputBorder/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center">
                                <FiBell size={16} />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold text-black leading-none">
                                    Notifications
                                </h2>
                                <p className="text-[11px] text-grey mt-1">
                                    {unreadCount > 0
                                        ? `${unreadCount} unread`
                                        : "You're all caught up"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close notifications"
                            className="h-8 w-8 rounded-full text-greyBlack hover:text-black hover:bg-white flex items-center justify-center"
                        >
                            <FiX size={15} />
                        </button>
                    </div>

                    {/* Filter tabs */}
                    <div className="mt-4 inline-flex p-1 rounded-full bg-white ring-1 ring-inputBorder/60">
                        {(["all", "unread"] as const).map((f) => {
                            const active = filter === f;
                            return (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFilter(f)}
                                    className={`h-7 px-3 rounded-full text-xs font-medium transition ${active
                                            ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
                                            : "text-greyBlack hover:text-black"
                                        }`}
                                >
                                    {f === "all" ? "All" : `Unread${unreadCount ? ` (${unreadCount})` : ""}`}
                                </button>
                            );
                        })}
                    </div>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
                    {filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                            <span className="h-14 w-14 rounded-full bg-mainBg flex items-center justify-center mb-3">
                                <FiInbox className="text-grey" size={22} />
                            </span>
                            <p className="text-sm font-medium text-black">
                                {filter === "unread" ? "No unread notifications" : "Nothing here yet"}
                            </p>
                            <p className="text-xs text-grey mt-1 max-w-[260px]">
                                {filter === "unread"
                                    ? "You've read everything. Switch to All to see history."
                                    : "We'll let you know when something needs your attention."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {grouped.today.length > 0 && (
                                <section>
                                    <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-wider text-grey font-semibold">
                                        Today
                                    </p>
                                    <ul className="divide-y divide-inputBorder/40">
                                        {grouped.today.map((n, i) => renderItem(n, i))}
                                    </ul>
                                </section>
                            )}
                            {grouped.earlier.length > 0 && (
                                <section>
                                    <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-wider text-grey font-semibold">
                                        Earlier
                                    </p>
                                    <ul className="divide-y divide-inputBorder/40">
                                        {grouped.earlier.map((n, i) => renderItem(n, i + grouped.today.length))}
                                    </ul>
                                </section>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {unreadCount > 0 && (
                    <footer className="px-5 py-3 border-t border-inputBorder/50 bg-white">
                        <button
                            type="button"
                            onClick={handleMarkAll}
                            disabled={marking}
                            className="w-full h-10 rounded-xl border border-inputBorder hover:border-primary text-sm font-medium text-secondary hover:bg-primary/5 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiCheck size={14} />
                            {marking ? "Marking…" : "Mark all as read"}
                        </button>
                    </footer>
                )}
            </aside>
        </>,
        document.body
    );
};

export default NotificationsModal;
