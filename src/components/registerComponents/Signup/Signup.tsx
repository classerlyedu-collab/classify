import { CustomInput, CustomRadio, DropDown, CourseSelection } from "../../../components";
import { gradeObject } from "../../../constants/register";
import { MultiDropDown } from "../../multiselectDropdown";

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
    gradeData: any
    course: any
    courseError: any
    setCourse: any
    setCourseError: any
    courseData: any,
    grades: any;
    setGrades: any;
    termsAccepted: boolean;
    setTermsAccepted: any;
};

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
    course, courseError, setCourse, setCourseError,
    courseData, grades, setGrades,
    termsAccepted, setTermsAccepted,
}: SignupProps) => {

    return (
        <>
            <div className="w-11/12" >
                <CustomInput
                    value={fullName}
                    setValue={setFullName}
                    error={fullNameError}
                    setError={setFullNameError}
                    required={true}
                    label="Full Name"
                    placeholder="e.g Mary Jackson"
                />
                <CustomInput
                    value={email}
                    setValue={setemail}
                    // error={userNameError}
                    // setError={setUserNameError}
                    required={true}
                    label="Email"
                    placeholder="e.g maryjackson123@gmail.com"
                />

                <CustomInput
                    value={userName}
                    setValue={setUserName}
                    error={userNameError}
                    setError={setUserNameError}
                    required={true}
                    label="Username"
                    placeholder="e.g maryjackson123"
                />

                <CustomInput
                    value={password}
                    setValue={setPassword}
                    error={passwordError}
                    setError={setPasswordError}
                    required={true}
                    type="password"
                    label="Password"
                    placeholder="6+ characters"

                />

                <CustomInput
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    error={confirmPasswordError}
                    setError={setConfirmPasswordError}
                    required={true}
                    label="Confirm Password"
                    placeholder="6+ characters"
                    type='password'
                />

                {/* radio buttons div */}
                <div className="flex flex-row justify-between items-center px-3" >
                    <CustomRadio
                        value={role}
                        setValue={setRole}
                        name="Parent"
                        label="Parent"
                        error={roleError}
                        setError={setRoleError}
                    />
                    <CustomRadio
                        value={role}
                        setValue={setRole}
                        name="Student"
                        label="Student"
                        error={roleError}
                        setError={setRoleError}
                    />
                    <CustomRadio
                        value={role}
                        setValue={setRole}
                        name="Teacher"
                        label="Teacher"
                        error={roleError}
                        setError={setRoleError}
                    />
                </div>



                {
                    role === "Student" && (
                        <DropDown
                            value={grade}
                            setValue={setGrade}
                            error={gradeError}
                            setError={setGradeError}
                            label="Select Grade"
                            data={gradeData.map((i: any) => {
                                return {
                                    value: i._id,
                                    label: i.grade
                                }
                            })}

                        />
                    )
                }
                {
                    role === "Teacher" && (
                        <MultiDropDown
                            value={grades}
                            setValue={setGrades}
                            error={gradeError}
                            setError={setGradeError}
                            label="Select Grade"
                            data={gradeData.map((i: any) => {
                                return {
                                    value: i._id,
                                    label: i.grade
                                }
                            })}

                        />
                    )
                }

                {

                    grade && role === "Student" && (
                        <CourseSelection
                            value={course}
                            setValue={setCourse}
                            // error={courseError}
                            // setError={setCourseError}
                            label="Select Course"
                            data={courseData.map((i: any) => {
                                return {
                                    value: i._id,
                                    label: i.name
                                }
                            })}

                        />
                    )
                }

                {
                    (grades?.length > 0) && role === "Teacher" && (
                        <CourseSelection
                            value={course}
                            setValue={setCourse}
                            // error={courseError}
                            // setError={setCourseError}
                            label="Select Course"
                            data={courseData.map((i: any) => {
                                return {
                                    value: i._id,
                                    label: i.name
                                }
                            })}

                        />
                    )
                }

                {
                    role === 'Student' && (
                        <CustomInput
                            value={rollNo}
                            setValue={setRollNo}
                            error={rollNoError}
                            setError={setRollNoError}
                            label="Parent Code"
                            placeholder="e.g 123456"
                            type='number'
                        />
                    )
                }

                {/* <div className={`${role === null ? 'h-36 md:h-40' : (role === 'Teacher' ? 'hidden' : 'h-20')}`} /> */}
                {/* <div className="h-20" /> */}

            </div>

            {/* policies */}
            <div className="flex items-start justify-center mb-4">
                <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 md:w-6 h-4 md:h-6 text-secondary bg-gray-100 border-gray-300 rounded-lg mt-0.5"
                />
                <p className="text-xs font-medium text-inputPlaceholder ml-2">
                    Creating an account means you're okay with our{" "}
                    <a
                        href="https://gamma.app/docs/Classerly-Terms-of-Use-e5vf07e83fahkw8?mode=present#card-ay2yzv05j51jqeu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary cursor-pointer hover:underline"
                    >
                        Terms of Use
                    </a>
                    {" "}(click to read), Privacy Policy, and our default{" "}
                    <span className="text-radio cursor-pointer">Notification Settings.</span>
                </p>
            </div>
        </>
    );
};

export default Signup;