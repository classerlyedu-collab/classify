import { useEffect, useState } from "react";
import { FloatingInput } from "../../FloatingInput";
import {
    FaGraduationCap,
    FaChalkboardTeacher,
    FaUserShield,
    FaCheck,
} from "react-icons/fa";

type Role = "Student" | "Teacher" | "Parent";

type SigninProps = {
    setScreenStatus: any;
    userName: string;
    setUserName: any;
    password: string;
    setPassword: any;
    userNameError: string;
    setUserNameError: any;
    passwordError: string;
    setPasswordError: any;
};

const ROLE_OPTIONS: { value: Role; label: string; icon: any; hint: string }[] = [
    { value: "Student", label: "Student", icon: FaGraduationCap, hint: "Learn & track" },
    { value: "Teacher", label: "Teacher", icon: FaChalkboardTeacher, hint: "Plan & grade" },
    { value: "Parent", label: "Parent", icon: FaUserShield, hint: "Stay in the loop" },
];

const Signin = ({
    userName,
    setUserName,
    password,
    setPassword,
    userNameError,
    setUserNameError,
    passwordError,
    setPasswordError,
    setScreenStatus,
}: SigninProps) => {
    const [role, setRole] = useState<Role>(() => {
        const saved =
            (typeof window !== "undefined" && localStorage.getItem("classerly:lastRole")) as Role | null;
        return saved && ROLE_OPTIONS.some((r) => r.value === saved) ? saved : "Student";
    });
    const [capsOn, setCapsOn] = useState(false);
    const [remember, setRemember] = useState<boolean>(() => {
        return typeof window !== "undefined" && localStorage.getItem("classerly:remember") === "1";
    });

    useEffect(() => {
        localStorage.setItem("classerly:lastRole", role);
    }, [role]);

    useEffect(() => {
        localStorage.setItem("classerly:remember", remember ? "1" : "0");
    }, [remember]);

    return (
        <div className="w-full">
            {/* Role cards */}
            <div role="radiogroup" className="grid grid-cols-3 gap-2 mb-4">
                {ROLE_OPTIONS.map(({ value, label, icon: Icon, hint }) => {
                    const active = role === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setRole(value)}
                            className={`group relative rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 border-2 transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${active
                                ? "border-transparent bg-gradient-to-br from-primary to-secondary text-white shadow-md"
                                : "border-inputBorder bg-white text-greyBlack hover:border-primary hover:text-black"
                                }`}
                        >
                            {active && (
                                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-white/95 text-secondary flex items-center justify-center">
                                    <FaCheck size={8} />
                                </span>
                            )}
                            <Icon size={18} />
                            <span className="text-xs font-semibold leading-none">{label}</span>
                            <span className={`text-[10px] leading-tight ${active ? "text-white/85" : "text-grey"}`}>
                                {hint}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Identifier */}
            <div className="mb-3">
                <FloatingInput
                    label="Email or username"
                    value={userName}
                    setValue={setUserName}
                    error={userNameError}
                    setError={setUserNameError}
                    autoComplete="username"
                    required
                />
            </div>

            {/* Password */}
            <FloatingInput
                label="Password"
                type="password"
                value={password}
                setValue={setPassword}
                error={passwordError}
                setError={setPasswordError}
                autoComplete="current-password"
                required
                onCapsLockChange={setCapsOn}
            />

            <div className="min-h-[1rem] mt-1" aria-live="polite">
                {capsOn && !passwordError && (
                    <p className="text-xs text-orangeBrown">Caps Lock is on.</p>
                )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center pt-2">
                <label className="inline-flex items-center gap-2 text-xs md:text-sm text-greyBlack cursor-pointer select-none group">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="peer sr-only"
                    />
                    <span
                        aria-hidden
                        className="h-[18px] w-[18px] rounded-md border-2 border-inputBorder bg-white flex items-center justify-center transition group-hover:border-primary peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-primary peer-checked:to-secondary peer-focus:ring-2 peer-focus:ring-primary/40"
                    >
                        <FaCheck size={9} className={`text-white transition ${remember ? "opacity-100" : "opacity-0"}`} />
                    </span>
                    Keep me signed in
                </label>
                <button
                    type="button"
                    onClick={() => setScreenStatus("Forgot")}
                    className="text-xs md:text-sm font-normal cursor-pointer focus:outline-none"
                >
                    <span className="bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text hover:underline">
                        Forgot password?
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Signin;
