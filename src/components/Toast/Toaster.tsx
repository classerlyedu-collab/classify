import { useEffect, useState } from "react";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaExclamationTriangle,
    FaTimes,
} from "react-icons/fa";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
    id: number;
    type: ToastType;
    message: string;
    duration: number;
};

type Subscriber = (item: ToastItem) => void;
const subscribers = new Set<Subscriber>();
let nextId = 1;

export const pushToast = (
    message: string,
    type: ToastType = "info",
    duration = 3500
) => {
    if (!message) return;
    const item: ToastItem = { id: nextId++, type, message, duration };
    subscribers.forEach((fn) => fn(item));
};

const TYPE_STYLES: Record<
    ToastType,
    { icon: any; iconClass: string; ringClass: string; barClass: string; label: string }
> = {
    success: {
        icon: FaCheckCircle,
        iconClass: "text-lightGreen2",
        ringClass: "ring-lightGreen2/20",
        barClass: "bg-lightGreen2",
        label: "Success",
    },
    error: {
        icon: FaTimesCircle,
        iconClass: "text-lightRed",
        ringClass: "ring-lightRed/20",
        barClass: "bg-lightRed",
        label: "Something went wrong",
    },
    info: {
        icon: FaInfoCircle,
        iconClass: "text-secondary",
        ringClass: "ring-secondary/20",
        barClass: "bg-gradient-to-r from-primary to-secondary",
        label: "Heads up",
    },
    warning: {
        icon: FaExclamationTriangle,
        iconClass: "text-orangeBrown",
        ringClass: "ring-orangeBrown/20",
        barClass: "bg-orangeBrown",
        label: "Warning",
    },
};

const ToastCard = ({
    item,
    onDismiss,
}: {
    item: ToastItem;
    onDismiss: (id: number) => void;
}) => {
    const cfg = TYPE_STYLES[item.type];
    const Icon = cfg.icon;
    const [leaving, setLeaving] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;
        const t = setTimeout(() => setLeaving(true), item.duration);
        return () => clearTimeout(t);
    }, [paused, item.duration]);

    useEffect(() => {
        if (!leaving) return;
        const t = setTimeout(() => onDismiss(item.id), 220);
        return () => clearTimeout(t);
    }, [leaving, item.id, onDismiss]);

    return (
        <div
            role={item.type === "error" ? "alert" : "status"}
            aria-live={item.type === "error" ? "assertive" : "polite"}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`pointer-events-auto relative w-[320px] sm:w-[360px] overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)] ring-1 ${cfg.ringClass} font-ubuntu transition-all duration-200 ${leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0 animate-[toastIn_220ms_ease-out]"
                }`}
        >
            <div className="flex items-start gap-3 p-3.5 pr-9">
                <span className={`mt-0.5 ${cfg.iconClass}`}>
                    <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-grey font-medium">
                        {cfg.label}
                    </p>
                    <p className="mt-0.5 text-sm text-black break-words leading-snug">
                        {item.message}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setLeaving(true)}
                    aria-label="Dismiss"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full text-greyBlack hover:text-black hover:bg-mainBg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <FaTimes size={11} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="absolute left-0 right-0 bottom-0 h-1 bg-mainBg overflow-hidden">
                <div
                    className={`h-full ${cfg.barClass}`}
                    style={{
                        animation: paused
                            ? "none"
                            : `toastBar ${item.duration}ms linear forwards`,
                    }}
                />
            </div>
        </div>
    );
};

const Toaster = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const sub: Subscriber = (item) => {
            setToasts((list) => [...list, item].slice(-5));
        };
        subscribers.add(sub);
        return () => {
            subscribers.delete(sub);
        };
    }, []);

    const dismiss = (id: number) =>
        setToasts((list) => list.filter((t) => t.id !== id));

    return (
        <>
            <style>
                {`@keyframes toastIn { from { opacity:0; transform: translateX(16px) scale(0.98);} to { opacity:1; transform: translateX(0) scale(1);} }
                  @keyframes toastBar { from { width: 100%; } to { width: 0%; } }`}
            </style>
            <div
                aria-live="polite"
                className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-[calc(100vw-2rem)]"
            >
                {toasts.map((t) => (
                    <ToastCard key={t.id} item={t} onDismiss={dismiss} />
                ))}
            </div>
        </>
    );
};

export default Toaster;
