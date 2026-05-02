import { Dispatch, SetStateAction } from "react";
import {
    HiOutlineLockClosed,
    HiOutlineEnvelope,
    HiOutlineKey,
    HiOutlineCheckCircle,
    HiOutlineArrowLeft,
    HiOutlineSparkles,
    HiOutlineShieldCheck,
} from "react-icons/hi2";
import { FloatingInput, OtpInput } from "../../../components";

type ForgotState = "Email" | "Pin" | "Password" | "Done";

type propsForgotPassword = {
    userName: string;
    setUserName: Dispatch<SetStateAction<string>>;
    userNameError: string;
    setUserNameError: Dispatch<SetStateAction<string>>;
    forgotPasswordState: ForgotState;
    password: string;
    setpassword: Dispatch<SetStateAction<string>>;
    confirmpassword: string;
    setconfirmpassword: Dispatch<SetStateAction<string>>;
    passwordError: string;
    setpasswordError: Dispatch<SetStateAction<string>>;
    confirmpasswordError: string;
    setconfirmpasswordError: Dispatch<SetStateAction<string>>;
    setForgotPasswordState: any;
    setScreenStatus: any;
    otp: string;
    setOtp: any;
};

const STEPS: ForgotState[] = ["Email", "Pin", "Password", "Done"];

const StepHeader = ({
    Icon,
    eyebrow,
    title,
    desc,
    state,
}: {
    Icon: React.ComponentType<any>;
    eyebrow: string;
    title: string;
    desc: React.ReactNode;
    state: ForgotState;
}) => {
    const stepIdx = STEPS.indexOf(state);
    return (
        <header className="mb-5">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-4">
                {STEPS.map((_, i) => {
                    const done = i < stepIdx;
                    const active = i === stepIdx;
                    return (
                        <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition ${
                                done
                                    ? "bg-gradient-to-r from-primary to-secondary"
                                    : active
                                        ? "bg-gradient-to-r from-primary to-secondary"
                                        : "bg-inputBorder"
                            }`}
                        />
                    );
                })}
            </div>
            <div className="flex items-start gap-3">
                <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-md shadow-secondary/25 flex-shrink-0">
                    <Icon size={22} />
                </span>
                <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-grey font-bold inline-flex items-center gap-1">
                        <HiOutlineSparkles size={10} className="text-secondary" />
                        {eyebrow} · Step {stepIdx + 1} of {STEPS.length}
                    </p>
                    <h1 className="font-trykker text-xl md:text-2xl text-black mt-1 leading-tight">{title}</h1>
                    <p className="text-xs md:text-sm text-grey mt-1.5 leading-relaxed">{desc}</p>
                </div>
            </div>
        </header>
    );
};

const ForgotPassword = ({
    userName,
    setUserName,
    userNameError,
    setUserNameError,
    forgotPasswordState,
    password,
    setpassword,
    passwordError,
    setpasswordError,
    confirmpassword,
    setconfirmpassword,
    confirmpasswordError,
    setconfirmpasswordError,
    setForgotPasswordState,
    setScreenStatus,
    setOtp,
}: propsForgotPassword) => {
    const handleOtpComplete = (pin: string) => setOtp(pin);

    const renderContent = () => {
        switch (forgotPasswordState) {
            case "Email":
                return (
                    <div>
                        <StepHeader
                            Icon={HiOutlineLockClosed}
                            eyebrow="Recovery"
                            title="Forgot your password?"
                            desc="No worries — enter your email or username and we'll send you a code to reset it."
                            state="Email"
                        />

                        <FloatingInput
                            label="Email or username"
                            value={userName}
                            setValue={setUserName}
                            error={userNameError}
                            setError={setUserNameError}
                            autoComplete="username"
                            required
                        />

                        <button
                            type="button"
                            onClick={() => {
                                setForgotPasswordState("Email");
                                setScreenStatus("Signin");
                            }}
                            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
                        >
                            <HiOutlineArrowLeft size={13} />
                            Back to sign in
                        </button>
                    </div>
                );

            case "Pin":
                return (
                    <div>
                        <StepHeader
                            Icon={HiOutlineKey}
                            eyebrow="Verify"
                            title="Check your inbox"
                            desc={
                                <>
                                    We sent a 6-digit code to{" "}
                                    <span className="font-semibold text-secondary break-all">{userName}</span>.
                                </>
                            }
                            state="Pin"
                        />

                        <div className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/40 p-5">
                            <p className="text-[10px] uppercase tracking-wider text-grey font-bold text-center mb-3">
                                Enter the 6-digit code
                            </p>
                            <OtpInput length={6} onComplete={handleOtpComplete} />
                        </div>

                        <p className="mt-4 text-xs text-grey text-center">
                            Didn't get the email?{" "}
                            <button
                                type="button"
                                onClick={() => setForgotPasswordState("Email")}
                                className="font-semibold text-secondary hover:underline"
                            >
                                Resend code
                            </button>
                        </p>

                        <button
                            type="button"
                            onClick={() => setForgotPasswordState("Email")}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-grey hover:text-secondary"
                        >
                            <HiOutlineArrowLeft size={13} />
                            Use a different email
                        </button>
                    </div>
                );

            case "Password":
                return (
                    <div>
                        <StepHeader
                            Icon={HiOutlineShieldCheck}
                            eyebrow="Reset"
                            title="Set a new password"
                            desc="Use at least 8 characters with a mix of letters, numbers, and symbols."
                            state="Password"
                        />

                        <div className="space-y-3">
                            <FloatingInput
                                label="New password"
                                type="password"
                                value={password}
                                setValue={setpassword}
                                error={passwordError}
                                setError={setpasswordError}
                                autoComplete="new-password"
                                required
                            />
                            <FloatingInput
                                label="Confirm new password"
                                type="password"
                                value={confirmpassword}
                                setValue={setconfirmpassword}
                                error={confirmpasswordError}
                                setError={setconfirmpasswordError}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        {/* Lightweight requirements row */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {[
                                { ok: password.length >= 8, label: "8+ chars" },
                                { ok: /[a-z]/.test(password) && /[A-Z]/.test(password), label: "Aa" },
                                { ok: /\d/.test(password), label: "0–9" },
                                { ok: /[^A-Za-z0-9]/.test(password), label: "!@#" },
                                {
                                    ok: password.length > 0 && password === confirmpassword,
                                    label: "Match",
                                },
                            ].map(({ ok, label }) => (
                                <span
                                    key={label}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                                        ok
                                            ? "bg-lightGreen2/15 text-lightGreen2 ring-1 ring-lightGreen2/25"
                                            : "bg-mainBg text-grey ring-1 ring-inputBorder/60"
                                    }`}
                                >
                                    {ok ? "✓" : "·"} {label}
                                </span>
                            ))}
                        </div>
                    </div>
                );

            case "Done":
                return (
                    <div>
                        <div className="flex justify-center mb-5">
                            <div className="relative">
                                <span className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <HiOutlineCheckCircle size={40} />
                                </span>
                                <span className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-amber-300 text-amber-900 flex items-center justify-center text-base shadow-sm">
                                    🎉
                                </span>
                            </div>
                        </div>
                        <div className="text-center max-w-sm mx-auto">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold inline-flex items-center gap-1">
                                <HiOutlineSparkles size={10} />
                                All set
                            </p>
                            <h1 className="font-trykker text-2xl md:text-3xl text-black mt-1 leading-tight">
                                Password reset!
                            </h1>
                            <p className="text-sm text-grey mt-2 leading-relaxed">
                                Your password has been updated. Want to set up a{" "}
                                <span className="bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text font-semibold">
                                    recovery email
                                </span>{" "}
                                for next time?
                            </p>
                        </div>

                        <div className="mt-6 space-y-2">
                            <button
                                type="button"
                                className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition flex items-center justify-center gap-1.5"
                            >
                                <HiOutlineEnvelope size={15} />
                                Set up recovery email
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setForgotPasswordState("Email");
                                    setScreenStatus("Signin");
                                }}
                                className="w-full h-11 rounded-xl text-sm font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-secondary/40 transition flex items-center justify-center gap-1.5"
                            >
                                I'll do this later
                                <HiOutlineArrowLeft size={13} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return <div className="w-full">{renderContent()}</div>;
};

export default ForgotPassword;
