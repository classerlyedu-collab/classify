import {
  Signup,
  Signin,
  ForgotPassword,
} from "../../../components";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UseStateContext } from "../../../context/ContextProvider";
import { RouteName } from "../../../routes/RouteNames";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config/index";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserShield,
  FaLock,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";

type ScreenStatus = "Signin" | "Register" | "Forgot";
type ForgotState = "Email" | "Pin" | "Password" | "Done";

const FORGOT_STEPS: ForgotState[] = ["Email", "Pin", "Password", "Done"];
const FORGOT_LABELS: Record<ForgotState, string> = {
  Email: "Identify",
  Pin: "Verify",
  Password: "Reset",
  Done: "Done",
};

const PERSONAS = [
  {
    role: "Student",
    icon: FaGraduationCap,
    title: "Learn at your own pace.",
    blurb:
      "Lessons, quizzes, and progress in one place — built for how you actually study.",
    stat: "12k+ active learners",
  },
  {
    role: "Teacher",
    icon: FaChalkboardTeacher,
    title: "Less admin. More teaching.",
    blurb:
      "Plan lessons, grade in seconds, and see exactly where every student stands.",
    stat: "Saves ~6 hrs / week",
  },
  {
    role: "Parent",
    icon: FaUserShield,
    title: "Stay close to the journey.",
    blurb:
      "Real progress, real time. Know what your child is learning — without the guesswork.",
    stat: "Trusted by 8k families",
  },
];

const Register = () => {
  const { setRole, updateUser } = UseStateContext();
  const navigate = useNavigate();

  const [screenStatus, setScreenStatus] = useState<ScreenStatus>("Signin");
  const [userRole, setUserRole] = useState<
    "Parent" | "Student" | "Teacher" | null
  >("Parent");
  const [forgotPasswordState, setForgotPasswordState] =
    useState<ForgotState>("Email");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activePersona, setActivePersona] = useState(0);

  // inputs
  const [fullName, setFullName] = useState<string>("");
  const [email, setemail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [grade, setGrade] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [rollNo, setRollNo] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [course, setCourse] = useState<any[]>([]);
  const [courseError, setCourseError] = useState("");

  // errors
  const [fullNameError, setFullNameError] = useState<string>("");
  const [userNameError, setUserNameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [roleError, setRoleError] = useState<string>("");
  const [gradeError, setGradeError] = useState<string>("");
  const [rollNoError, setRollNoError] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  useEffect(() => {
    Get("/grade")
      .then((d) => {
        if (d.success) setGradeData(d.data);
        else displayMessage(d.message);
      })
      .catch((e) => displayMessage(e.message));
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (userRole === "Student" && grade) {
      Get(`/subject/grade/${grade}`)
        .then((d) => {
          if (d.success) setCourseData(d.data);
          else displayMessage(d.message);
        })
        .catch((e) => displayMessage(e.message));
    }
    if (userRole === "Teacher" && grades?.length > 0) {
      Get(`/subject/grade/${grades}`)
        .then((d) => {
          if (d.success) setCourseData(d.data);
          else displayMessage(d.message);
        })
        .catch((e) => displayMessage(e.message));
    }
  }, [grade, grades, userRole]);

  // Rotating persona panel
  useEffect(() => {
    const id = setInterval(() => {
      setActivePersona((i) => (i + 1) % PERSONAS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const primaryLabel = useMemo(() => {
    if (screenStatus === "Signin") return submitting ? "Signing you in…" : "Sign in";
    if (screenStatus === "Register") return submitting ? "Creating account…" : "Create account";
    if (forgotPasswordState === "Email") return submitting ? "Sending…" : "Send reset code";
    if (forgotPasswordState === "Pin") return submitting ? "Verifying…" : "Verify code";
    if (forgotPasswordState === "Password") return submitting ? "Updating…" : "Reset password";
    return "Continue";
  }, [screenStatus, forgotPasswordState, submitting]);

  const isPrimaryDisabled = useMemo(() => {
    if (submitting) return true;
    if (screenStatus === "Signin") return !userName.trim() || !password;
    if (screenStatus === "Register") return !termsAccepted;
    if (screenStatus === "Forgot") {
      if (forgotPasswordState === "Email") return !userName.trim();
      if (forgotPasswordState === "Pin") return !otp || otp.length < 4;
      if (forgotPasswordState === "Password") return !password || !confirmPassword;
    }
    return false;
  }, [screenStatus, forgotPasswordState, userName, password, confirmPassword, otp, submitting, termsAccepted]);

  const handleClick = () => {
    if (isPrimaryDisabled) return;
    try {
      if (screenStatus === "Signin") {
        setSubmitting(true);
        Post("/auth/login", { userName, password })
          .then((res) => {
            if (res.success) {
              if (res.data.isBlocked) {
                displayMessage("Admin has blocked your access to Classerly.", "error");
                return;
              }
              localStorage.setItem("token", res.data.token);
              delete res.data.token;
              updateUser(res.data);
              displayMessage(res.message, "success");
              if (res.data.userType === "Student") {
                navigate(RouteName?.DASHBOARD_SCREEN_STUDENT);
              } else if (res.data.isSubscribed === true) {
                switch (res.data.userType) {
                  case "Parent":
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                  case "Teacher":
                    navigate(RouteName?.DASHBOARD_SCREEN_TEACHER);
                    break;
                  default:
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                }
              } else {
                navigate(RouteName?.SUBSCRIPTION);
              }
            } else {
              displayMessage(res.message, "error");
            }
          })
          .catch((err) => displayMessage(err.message, "error"))
          .finally(() => setSubmitting(false));
      } else if (screenStatus === "Register") {
        setRole(userRole);
        if (password !== confirmPassword) {
          displayMessage("Passwords don't match.", "error");
          return;
        }
        if (!termsAccepted) {
          displayMessage("Please accept the Terms of Use to continue.", "error");
          return;
        }
        let payload: any;
        if (userRole === "Teacher") {
          payload = {
            userType: userRole,
            userName,
            password,
            fullName,
            email,
            grade: grades,
            subject: course,
          };
        } else {
          payload = {
            userType: userRole,
            userName,
            password,
            fullName,
            email,
            grade,
            subject: course,
          };
        }
        if (userRole === "Parent") {
          if (rollNo && rollNo.trim() !== "") payload.childIds = rollNo;
        }
        if (userRole === "Student") {
          payload.parent = rollNo;
        }
        setSubmitting(true);
        Post("/auth/register", payload)
          .then((res) => {
            if (res.success) {
              localStorage.setItem("token", res.data.token);
              updateUser(res.data);
              displayMessage(res.message, "success");
              switch (userRole) {
                case "Parent":
                  navigate(RouteName?.SUBSCRIPTION);
                  break;
                case "Student":
                  navigate(RouteName?.DASHBOARD_SCREEN_STUDENT);
                  break;
                case "Teacher":
                  navigate(RouteName?.SUBSCRIPTION);
                  break;
                default:
                  navigate(RouteName?.DASHBOARD_SCREEN);
                  break;
              }
            } else {
              displayMessage(res.message, "error");
            }
          })
          .catch((err) => displayMessage(err.message, "error"))
          .finally(() => setSubmitting(false));
      } else if (screenStatus === "Forgot") {
        setSubmitting(true);
        switch (forgotPasswordState) {
          case "Email":
            Post("/auth/forgotpassword", { userName })
              .then((res) => {
                if (res.success) {
                  localStorage.setItem("token", res.token);
                  displayMessage(res.message, "success");
                  setForgotPasswordState("Pin");
                } else displayMessage(res.message, "error");
              })
              .catch((err) => displayMessage(err.message, "error"))
              .finally(() => setSubmitting(false));
            break;
          case "Pin":
            Post("/auth/verify", { otp })
              .then((res) => {
                if (res.success) {
                  localStorage.setItem("token", res.token);
                  displayMessage(res.message, "success");
                  setForgotPasswordState("Password");
                } else displayMessage(res.message, "error");
              })
              .catch((err) => displayMessage(err.message, "error"))
              .finally(() => setSubmitting(false));
            break;
          case "Password":
            Post("/auth/restepassword", { password })
              .then((res) => {
                if (res.success) {
                  displayMessage(res.message, "success");
                  setScreenStatus("Signin");
                  setForgotPasswordState("Email");
                } else displayMessage(res.message, "error");
              })
              .catch((err) => displayMessage(err.message, "error"))
              .finally(() => setSubmitting(false));
            break;
          default:
            setForgotPasswordState("Email");
            setSubmitting(false);
        }
      }
    } catch {
      setSubmitting(false);
    }
  };

  const handleDialog = () => {
    setForgotPasswordState("Email");
    setScreenStatus("Signin");
    setShowDialog(false);
  };

  const onKeyDownSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && screenStatus !== "Register") {
      e.preventDefault();
      handleClick();
    }
  };

  const currentForgotIndex = FORGOT_STEPS.indexOf(forgotPasswordState);
  const persona = PERSONAS[activePersona];
  const PersonaIcon = persona.icon;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-mainBg font-ubuntu">
      {/* Decorative gradient orbs (CSS only, no libs) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-secondary/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-[24rem] w-[24rem] rounded-full bg-fadeBlue/20 blur-3xl" />
      </div>

      <div className="relative h-screen w-full flex flex-col lg:flex-row">
        {/* ─────────── BRAND / STORYTELLING PANEL ─────────── */}
        <aside className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative px-12 py-10 flex-col justify-between text-white">
          {/* gradient base */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-fadeBlue"
          />
          {/* subtle grid pattern */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center ring-1 ring-white/20">
              <img
                src={require("../../../images/settings/sm-Logo-Transparent-PNG-942x1024 (1).png")}
                alt=""
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <p className="font-trykker text-xl leading-none">Classerly</p>
              <p className="text-[11px] text-white/70 mt-1">Learning, together.</p>
            </div>
          </div>

          {/* Persona card */}
          <div className="relative max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] uppercase tracking-wider ring-1 ring-white/20">
              <PersonaIcon className="text-white/90" />
              For {persona.role.toLowerCase()}s
            </div>

            <h1 className="mt-5 font-trykker text-4xl xl:text-5xl leading-[1.1]">
              {persona.title}
            </h1>
            <p className="mt-4 text-white/85 text-base xl:text-lg leading-relaxed">
              {persona.blurb}
            </p>

            {/* Stat chip */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur px-3 py-2 text-sm ring-1 ring-white/15">
              <FaCheck className="text-white" />
              {persona.stat}
            </div>

            {/* Persona indicators */}
            <div className="mt-8 flex items-center gap-2">
              {PERSONAS.map((p, i) => {
                const active = i === activePersona;
                return (
                  <button
                    key={p.role}
                    onClick={() => setActivePersona(i)}
                    aria-label={`Show ${p.role} story`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${active ? "w-10 bg-white" : "w-4 bg-white/40 hover:bg-white/70"
                      }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Footer trust line */}
          <div className="relative flex items-center justify-between text-[11px] text-white/70">
            <span>© {new Date().getFullYear()} Classerly</span>
            <span className="inline-flex items-center gap-1.5">
              <FaLock className="text-white/80" /> 256-bit encrypted
            </span>
          </div>
        </aside>

        {/* ─────────── FORM PANEL ─────────── */}
        <main
          className="relative flex-1 h-screen overflow-y-auto px-5 sm:px-8 lg:px-12 [scrollbar-width:thin]"
          onKeyDown={onKeyDownSubmit}
        >
          <div className="min-h-full flex items-center justify-center py-10 lg:py-12">
            <div className="w-full max-w-md">
            {/* Mobile-only compact brand strip */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <img
                src={require("../../../images/settings/sm-Logo-Transparent-PNG-942x1024 (1).png")}
                alt="Classerly"
                className="h-9 w-9 object-contain"
              />
              <span className="font-trykker text-lg text-black">Classerly</span>
            </div>

            {/* Glass card */}
            <div className="relative rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(113,2,255,0.25)] ring-1 ring-black/5 p-6 sm:p-8">
              {/* Top row: heading + helper action */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-trykker text-2xl text-black tracking-tight">
                    {screenStatus === "Signin" && "Welcome back"}
                    {screenStatus === "Register" && "Create your account"}
                    {screenStatus === "Forgot" && "Reset your password"}
                  </h2>
                  <p className="mt-1 text-sm text-greyBlack">
                    {screenStatus === "Signin" && "Sign in to continue learning."}
                    {screenStatus === "Register" && "Join Classerly in under a minute."}
                    {screenStatus === "Forgot" && "Three quick steps and you're back in."}
                  </p>
                </div>
                {screenStatus === "Forgot" && (
                  <button
                    type="button"
                    onClick={() => {
                      setScreenStatus("Signin");
                      setForgotPasswordState("Email");
                    }}
                    className="shrink-0 inline-flex items-center gap-1 text-xs text-secondary hover:underline focus:outline-none"
                  >
                    <FaArrowLeft size={10} />
                    Back
                  </button>
                )}
              </div>

              {/* Tab switcher (segmented) */}
              {screenStatus !== "Forgot" && (
                <div
                  role="tablist"
                  aria-label="Authentication mode"
                  className="grid grid-cols-2 p-1 rounded-full bg-mainBg ring-1 ring-inputBorder/60 mb-6"
                >
                  <button
                    role="tab"
                    aria-selected={screenStatus === "Signin"}
                    onClick={() => {
                      setScreenStatus("Signin");
                      setForgotPasswordState("Email");
                    }}
                    className={`h-9 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${screenStatus === "Signin"
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                      : "text-greyBlack hover:text-black"
                      }`}
                  >
                    Sign in
                  </button>
                  <button
                    role="tab"
                    aria-selected={screenStatus === "Register"}
                    onClick={() => {
                      setScreenStatus("Register");
                      setForgotPasswordState("Email");
                    }}
                    className={`h-9 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${screenStatus === "Register"
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                      : "text-greyBlack hover:text-black"
                      }`}
                  >
                    Create account
                  </button>
                </div>
              )}

              {/* Forgot stepper */}
              {screenStatus === "Forgot" && (
                <div className="mb-6">
                  <div className="h-1.5 w-full rounded-full bg-inputBorder/40 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{
                        width: `${Math.max(0, (currentForgotIndex / (FORGOT_STEPS.length - 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px]">
                    {FORGOT_STEPS.map((step, i) => (
                      <span
                        key={step}
                        className={
                          i <= currentForgotIndex
                            ? "text-secondary font-medium"
                            : "text-grey"
                        }
                      >
                        {FORGOT_LABELS[step]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active form */}
              <section className="mb-6">
                {screenStatus === "Register" ? (
                  <Signup
                    role={userRole}
                    setRole={setUserRole}
                    roleError={roleError}
                    setRoleError={setRoleError}
                    fullName={fullName}
                    email={email}
                    setemail={setemail}
                    setFullName={setFullName}
                    fullNameError={fullNameError}
                    setFullNameError={setFullNameError}
                    userName={userName}
                    setUserName={setUserName}
                    userNameError={userNameError}
                    setUserNameError={setUserNameError}
                    password={password}
                    setPassword={setPassword}
                    passwordError={passwordError}
                    setPasswordError={setPasswordError}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    confirmPasswordError={confirmPasswordError}
                    setConfirmPasswordError={setConfirmPasswordError}
                    rollNo={rollNo}
                    setRollNo={setRollNo}
                    rollNoError={rollNoError}
                    setRollNoError={setRollNoError}
                    grade={grade}
                    setGrade={setGrade}
                    gradeError={gradeError}
                    setGradeError={setGradeError}
                    gradeData={gradeData}
                    course={course}
                    courseError={courseError}
                    setCourse={setCourse}
                    setCourseError={setCourseError}
                    courseData={courseData}
                    grades={grades}
                    setGrades={setGrades}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                  />
                ) : screenStatus === "Signin" ? (
                  <Signin
                    setScreenStatus={setScreenStatus}
                    userName={userName}
                    setUserName={setUserName}
                    password={password}
                    setPassword={setPassword}
                    userNameError={userNameError}
                    setUserNameError={setUserNameError}
                    passwordError={passwordError}
                    setPasswordError={setPasswordError}
                  />
                ) : (
                  <ForgotPassword
                    userName={userName}
                    setUserName={setUserName}
                    userNameError={userNameError}
                    setUserNameError={setUserNameError}
                    forgotPasswordState={forgotPasswordState}
                    password={password}
                    setpassword={setPassword}
                    passwordError={passwordError}
                    setpasswordError={setPasswordError}
                    confirmpassword={confirmPassword}
                    setconfirmpassword={setConfirmPassword}
                    confirmpasswordError={confirmPasswordError}
                    setconfirmpasswordError={setConfirmPasswordError}
                    setScreenStatus={setScreenStatus}
                    setForgotPasswordState={setForgotPasswordState}
                    otp={otp}
                    setOtp={setOtp}
                  />
                )}
              </section>

              {/* Primary CTA */}
              {forgotPasswordState !== "Done" && (
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={isPrimaryDisabled}
                  aria-busy={submitting}
                  className={`group relative w-full h-12 rounded-xl text-white text-sm font-medium overflow-hidden transition focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 ${isPrimaryDisabled
                    ? "bg-gradient-to-r from-primary to-secondary opacity-60 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-secondary/30 active:scale-[0.99]"
                    }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting && (
                      <span
                        className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {primaryLabel}
                  </span>
                </button>
              )}

            </div>

            </div>
          </div>
        </main>

        {/* Success dialog */}
        {showDialog && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-transparentBlack px-4"
            onClick={handleDialog}
          >
            <img
              onClick={handleDialog}
              src={require("../../../images/register/created.png")}
              alt="Account created successfully"
              className="cursor-pointer w-4/5 md:w-1/3 h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
