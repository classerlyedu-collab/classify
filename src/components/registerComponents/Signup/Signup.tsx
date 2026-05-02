import {
    CourseSelection,
    FloatingInput,
    FloatingSelect,
    FloatingMultiSelect,
} from "../../../components";
import { FaGraduationCap, FaChalkboardTeacher, FaUserShield, FaCheck } from "react-icons/fa";

type SignupProps = {
    role: string | null;
    setRole: any;
    fullName: string;
    setFullName: any;
    userName: string;
    setUserName: any;
    password: string;
    setPassword: any;
    confirmPassword: string;
    setConfirmPassword: any;
    grade: number | null;
    setGrade: any;
    rollNo: string;
    setRollNo: any;
    fullNameError: string;
    setFullNameError: any;
    userNameError: string;
    setUserNameError: any;
    passwordError: string;
    setPasswordError: any;
    confirmPasswordError: string;
    setConfirmPasswordError: any;
    roleError: string;
    setRoleError: any;
    gradeError: string;
    setGradeError: any;
    rollNoError: string;
    setRollNoError: any;
    email: string;
    setemail: any;
    gradeData: any;
    course: any;
    courseError: any;
    setCourse: any;
    setCourseError: any;
    courseData: any;
    grades: any;
    setGrades: any;
    termsAccepted: boolean;
    setTermsAccepted: any;
};

const ROLE_OPTIONS = [
    { value: "Student", label: "Student", icon: FaGraduationCap, hint: "Learn & track" },
    { value: "Teacher", label: "Teacher", icon: FaChalkboardTeacher, hint: "Plan & grade" },
    { value: "Parent", label: "Parent", icon: FaUserShield, hint: "Stay in the loop" },
] as const;

const Signup = ({
    role,
    setRole,
    fullName,
    setFullName,
    userName,
    setUserName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    grade,
    setGrade,
    rollNo,
    setRollNo,
    fullNameError,
    setFullNameError,
    userNameError,
    setUserNameError,
    passwordError,
    setPasswordError,
    confirmPasswordError,
    setConfirmPasswordError,
    roleError,
    setRoleError,
    gradeError,
    setGradeError,
    rollNoError,
    setRollNoError,
    email,
    setemail,
    gradeData,
    course,
    setCourse,
    courseData,
    grades,
    setGrades,
    termsAccepted,
    setTermsAccepted,
}: SignupProps) => {
    return (
        <div className="w-full">
            {/* Role selector cards */}
            <div className="mb-4">
                <div role="radiogroup" className="grid grid-cols-3 gap-2">
                    {ROLE_OPTIONS.map(({ value, label, icon: Icon, hint }) => {
                        const active = role === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => {
                                    setRole(value);
                                    if (roleError) setRoleError("");
                                }}
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
                {roleError && (
                    <p role="alert" className="mt-1 ml-1 text-xs text-lightRed">
                        {roleError}
                    </p>
                )}
            </div>

            {/* Identity row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <FloatingInput
                    label="Full name"
                    value={fullName}
                    setValue={setFullName}
                    error={fullNameError}
                    setError={setFullNameError}
                    autoComplete="name"
                    required
                />
                <FloatingInput
                    label="Email"
                    type="email"
                    value={email}
                    setValue={setemail}
                    autoComplete="email"
                    inputMode="email"
                    required
                />
            </div>

            {/* Username */}
            <div className="mb-3">
                <FloatingInput
                    label="Username"
                    value={userName}
                    setValue={setUserName}
                    error={userNameError}
                    setError={setUserNameError}
                    autoComplete="username"
                    required
                />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <FloatingInput
                    label="Password"
                    type="password"
                    value={password}
                    setValue={setPassword}
                    error={passwordError}
                    setError={setPasswordError}
                    autoComplete="new-password"
                    required
                />
                <FloatingInput
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    error={confirmPasswordError}
                    setError={setConfirmPasswordError}
                    autoComplete="new-password"
                    required
                />
            </div>

            {/* Role-specific fields */}
            {role === "Student" && (
                <div className="mb-3">
                    <FloatingSelect
                        label="Select grade"
                        value={grade as any}
                        setValue={setGrade}
                        error={gradeError}
                        setError={setGradeError}
                        options={gradeData.map((i: any) => ({ value: i._id, label: i.grade }))}
                        required
                    />
                </div>
            )}
            {role === "Teacher" && (
                <div className="mb-3">
                    <FloatingMultiSelect
                        label="Select grades"
                        value={grades}
                        setValue={setGrades}
                        error={gradeError}
                        setError={setGradeError}
                        options={gradeData.map((i: any) => ({ value: i._id, label: i.grade }))}
                        required
                    />
                </div>
            )}

            {grade && role === "Student" && (
                <div className="mb-3">
                    <CourseSelection
                        value={course}
                        setValue={setCourse}
                        label="Select Course"
                        data={courseData.map((i: any) => ({ value: i._id, label: i.name }))}
                    />
                </div>
            )}

            {grades?.length > 0 && role === "Teacher" && (
                <div className="mb-3">
                    <CourseSelection
                        value={course}
                        setValue={setCourse}
                        label="Select Course"
                        data={courseData.map((i: any) => ({ value: i._id, label: i.name }))}
                    />
                </div>
            )}

            {role === "Student" && (
                <div className="mb-3">
                    <FloatingInput
                        label="Parent code"
                        type="number"
                        inputMode="numeric"
                        value={rollNo}
                        setValue={setRollNo}
                        error={rollNoError}
                        setError={setRollNoError}
                    />
                </div>
            )}

            {/* Terms */}
            <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none group">
                <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="peer sr-only"
                />
                <span
                    aria-hidden
                    className="h-[18px] w-[18px] shrink-0 rounded-md border-2 border-inputBorder bg-white flex items-center justify-center transition group-hover:border-primary peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-primary peer-checked:to-secondary peer-focus:ring-2 peer-focus:ring-primary/40"
                >
                    <FaCheck size={9} className={`text-white transition ${termsAccepted ? "opacity-100" : "opacity-0"}`} />
                </span>
                <span className="text-xs md:text-sm leading-snug text-greyBlack">
                    I agree to the{" "}
                    <a
                        href="https://gamma.app/docs/Classerly-Terms-of-Use-e5vf07e83fahkw8?mode=present#card-ay2yzv05j51jqeu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline font-medium"
                    >
                        Terms
                    </a>{" "}
                    &{" "}
                    <a
                        href="https://classerly.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline font-medium"
                    >
                        Privacy Policy
                    </a>
                    .
                </span>
            </label>
        </div>
    );
};

export default Signup;
