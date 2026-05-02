import { useId, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type FloatingInputProps = {
    label: string;
    value: string;
    setValue: (v: string) => void;
    error?: string;
    setError?: (v: string) => void;
    type?: "text" | "email" | "password" | "number" | "tel";
    autoComplete?: string;
    required?: boolean;
    inputMode?: "text" | "email" | "numeric" | "tel" | "search";
    onCapsLockChange?: (on: boolean) => void;
    className?: string;
};

const FloatingInput = ({
    label,
    value,
    setValue,
    error,
    setError,
    type = "text",
    autoComplete,
    required,
    inputMode,
    onCapsLockChange,
    className = "",
}: FloatingInputProps) => {
    const id = useId();
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const filled = value !== undefined && value !== null && String(value).length > 0;
    const floated = focused || filled;

    return (
        <div className={`relative ${className}`}>
            <div
                className={`relative h-12 rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-primary/30 ${error
                    ? "border-lightRed focus-within:border-lightRed"
                    : "border-inputBorder focus-within:border-primary"
                    }`}
            >
                <input
                    id={id}
                    type={isPassword && showPassword ? "text" : type}
                    value={value}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(e) => {
                        setValue(e.target.value);
                        if (error && setError) setError("");
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyUp={(e) => {
                        if (isPassword && onCapsLockChange && typeof e.getModifierState === "function") {
                            onCapsLockChange(e.getModifierState("CapsLock"));
                        }
                    }}
                    className={`peer absolute inset-0 w-full h-full bg-transparent rounded-xl px-3 pt-3.5 text-sm text-black font-ubuntu focus:outline-none ${isPassword ? "pr-10" : ""
                        }`}
                    placeholder=" "
                />

                <label
                    htmlFor={id}
                    className={`pointer-events-none absolute left-3 transition-all duration-150 font-ubuntu ${floated
                        ? "top-1 text-[10px] font-medium " +
                        (error ? "text-lightRed" : focused ? "text-secondary" : "text-label")
                        : "top-1/2 -translate-y-1/2 text-sm text-inputPlaceholder"
                        }`}
                >
                    {label}
                    {required && <span className="text-labelRequired ml-0.5">*</span>}
                </label>

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full text-greyBlack hover:text-secondary hover:bg-mainBg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} role="alert" className="mt-1 ml-1 text-xs text-lightRed">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FloatingInput;
