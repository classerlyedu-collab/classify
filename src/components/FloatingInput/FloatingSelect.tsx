import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";

type Option = { value: string | number; label: string };

type FloatingSelectProps = {
    label: string;
    value: string | number | null;
    setValue: (v: any) => void;
    options: Option[];
    error?: string;
    setError?: (v: string) => void;
    required?: boolean;
    loading?: boolean;
    className?: string;
};

const DROPDOWN_MAX_PX = 208; // matches max-h-52
const GAP = 4;

const FloatingSelect = ({
    label,
    value,
    setValue,
    options,
    error,
    setError,
    required,
    loading = false,
    className = "",
}: FloatingSelectProps) => {
    const id = useId();
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const dropdownRef = useRef<HTMLUListElement | null>(null);
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{
        top: number;
        left: number;
        width: number;
        dropUp: boolean;
    } | null>(null);

    const recompute = () => {
        const trigger = buttonRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropUp = spaceBelow < DROPDOWN_MAX_PX + GAP && spaceAbove > spaceBelow;
        setPosition({
            top: dropUp ? rect.top - GAP : rect.bottom + GAP,
            left: rect.left,
            width: rect.width,
            dropUp,
        });
    };

    useLayoutEffect(() => {
        if (!open) return;
        recompute();
        const onScroll = () => recompute();
        const onResize = () => recompute();
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onResize);
        };
    }, [open]);

    const filled = value !== null && value !== undefined && value !== "";
    const floated = open || filled || loading;

    const selectedLabel =
        filled ? options.find((o) => o.value === value)?.label ?? "" : "";

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (wrapperRef.current?.contains(target)) return;
            if (dropdownRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const choose = (optVal: string | number) => {
        if (error && setError) setError("");
        setValue(optVal);
        setOpen(false);
    };

    const isEmpty = options.length === 0;

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <button
                ref={buttonRef}
                type="button"
                id={id}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-busy={loading}
                disabled={loading || isEmpty}
                onClick={() => !loading && !isEmpty && setOpen((v) => !v)}
                className={`relative w-full h-12 rounded-xl border bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${error
                    ? "border-lightRed"
                    : open
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-inputBorder hover:border-primary"
                    } ${loading || isEmpty ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
            >
                {loading ? (
                    <span className="absolute left-3 bottom-1.5 text-sm font-ubuntu italic text-grey/70">
                        Loading…
                    </span>
                ) : (
                    <span
                        className={`absolute left-3 bottom-1.5 text-sm font-ubuntu truncate max-w-[calc(100%-2.5rem)] ${filled ? "text-black" : "text-transparent"
                            }`}
                    >
                        {selectedLabel}
                    </span>
                )}

                <span
                    className={`pointer-events-none absolute left-3 transition-all duration-150 font-ubuntu ${floated
                        ? "top-1 text-[10px] font-medium " +
                        (error ? "text-lightRed" : open ? "text-secondary" : "text-label")
                        : "top-1/2 -translate-y-1/2 text-sm text-inputPlaceholder"
                        }`}
                >
                    {label}
                    {required && <span className="text-labelRequired ml-0.5">*</span>}
                </span>

                {!loading && isEmpty && !filled && (
                    <span className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-xs text-grey font-ubuntu">
                        No options
                    </span>
                )}

                <FiChevronDown
                    aria-hidden
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${open ? "text-secondary rotate-180" : "text-greyBlack"
                        }`}
                    size={16}
                />
            </button>

            {open && position && createPortal(
                <ul
                    ref={dropdownRef}
                    role="listbox"
                    style={{
                        position: "fixed",
                        top: position.dropUp ? undefined : position.top,
                        bottom: position.dropUp ? window.innerHeight - position.top : undefined,
                        left: position.left,
                        width: position.width,
                    }}
                    className="z-[1000] max-h-52 overflow-y-auto rounded-xl border border-inputBorder bg-white shadow-xl ring-1 ring-black/5 py-1 font-ubuntu"
                >
                    {isEmpty && (
                        <li className="px-3 py-2 text-xs text-grey">No options</li>
                    )}
                    {options.map((o) => {
                        const selected = value === o.value;
                        return (
                            <li
                                key={o.value}
                                role="option"
                                aria-selected={selected}
                                onClick={() => choose(o.value)}
                                className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-sm transition ${selected ? "text-secondary bg-primary/5 font-semibold" : "text-greyBlack hover:bg-mainBg"
                                    }`}
                            >
                                <span className="truncate">{o.label}</span>
                                {selected && (
                                    <span
                                        aria-hidden
                                        className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center"
                                    >
                                        <FaCheck size={9} />
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>,
                document.body
            )}

            {error && (
                <p role="alert" className="mt-1 ml-1 text-xs text-lightRed">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FloatingSelect;
