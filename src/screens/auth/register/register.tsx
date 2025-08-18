import {
  ImagesSlider,
  Signup,
  Signin,
  ForgotPassword,
} from "../../../components";
import { useEffect, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { UseStateContext } from "../../../context/ContextProvider";
import { RouteName } from "../../../routes/RouteNames";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config/index";

const Register = () => {
  const { setRole } = UseStateContext();

  const navigate = useNavigate();

  // conditional states
  const [screenStatus, setScreenStatus] = useState<
    "Signin" | "Register" | "Forgot"
  >("Signin");

  const [userRole, setUserRole] = useState<
    "Parent" | "Student" | "Teacher" | null
  >("Parent");
  const [forgotPasswordState, setForgotPasswordState] = useState<
    "Email" | "Pin" | "Password" | "Done"
  >("Email");
  const [showDialog, setShowDialog] = useState<boolean>(false);

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
  useEffect(() => {
    Get("/grade")
      .then((d) => {
        if (d.success) {
          setGradeData(d.data);
        } else {
          displayMessage(d.message);
        }
      })
      .catch((e) => {
        displayMessage(e.message);
      });
    localStorage.clear();
  }, []);
  useEffect(() => {
    if (userRole === "Student" && grade) {
      Get(`/subject/grade/${grade}`)
        .then((d) => {
          if (d.success) {
            setCourseData(d.data);
          } else {
            displayMessage(d.message);
          }
        })
        .catch((e) => {
          displayMessage(e.message);
        });
    }
    if (userRole === "Teacher" && grades?.length > 0) {
      Get(`/subject/grade/${grades}`)
        .then((d) => {
          if (d.success) {
            setCourseData(d.data);
          } else {
            displayMessage(d.message);
          }
        })
        .catch((e) => {
          displayMessage(e.message);
        });
    }
  }, [grade, grades, userRole]);

  const handleClick = () => {
    try {
      if (screenStatus === "Signin") {
        Post("/auth/login", {
          userName: userName,
          password: password,
        })
          .then((res) => {
            if (res.success) {
              if (res.data.isBlocked) {
                alert("Admin has blocked your access to Classerly!");
                return;
              }

              localStorage.setItem("token", res.data.token);
              delete res.data.token;

              localStorage.setItem("user", JSON.stringify(res.data));

              displayMessage(res.message, "success");
              setRole(res.data.userType);
              // navigate(RouteName?.DASHBOARD_SCREEN);

              if (res.data.isSubscribed === true) {
                switch (res.data.userType) {
                  case "Parent":
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                  case "Student":
                    navigate(RouteName?.DASHBOARD_SCREEN_STUDENT);
                    break;
                  case "Teacher":
                    navigate(RouteName?.DASHBOARD_SCREEN_TEACHER);
                    break;

                  default:
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                }
              } else {
                switch (res.data.userType) {
                  case "Parent":
                    navigate(RouteName?.PARENTS_PAYMENT);
                    break;
                  case "Student":
                    navigate(RouteName?.STUDENT_PAYMENT);
                    break;
                  case "Teacher":
                    navigate(RouteName?.TEACHER_PAYMENT);
                    break;

                  default:
                    navigate(RouteName?.DASHBOARD_SCREEN);
                    break;
                }
              }
            } else {
              displayMessage(res.message, "error");
            }
          })
          .catch((err) => {
            displayMessage(err.message, "error");
          });
      } else if (screenStatus === "Register") {
        setRole(userRole);
        if (password != confirmPassword) {
          displayMessage("password must be same", "error");
          return;
        }
        let payload: any;
        if (userRole == "Teacher") {
          payload = {
            userType: userRole,
            userName: userName,
            password: password,
            fullName,
            email,
            grade: grades,
            subject: course,
          };
        } else {
          payload = {
            userType: userRole,
            userName: userName,
            password: password,
            fullName,
            email,
            grade,
            subject: course,
          };
        }

        if (userRole == "Parent") {
          payload.childIds = rollNo;
        }
        if (userRole == "Student") {
          payload.parent = rollNo;
        }
        // if(userRole=="Teacher"){
        //     payload.subject= course
        // }

        // return;
        Post("/auth/register", payload)
          .then((res) => {
            if (res.success) {
              localStorage.setItem("token", res.data.token);

              localStorage.setItem("user", JSON.stringify(res.data));

              displayMessage(res.message, "success");

              // navigate(RouteName?.DASHBOARD_SCREEN);

              switch (userRole) {
                // case 'Parent':
                //     navigate(RouteName?.DASHBOARD_SCREEN);
                //     break;
                // case "Student":
                //     navigate(RouteName?.DASHBOARD_SCREEN_STUDENT);
                //     break;
                // case 'Teacher':
                //     navigate(RouteName?.DASHBOARD_SCREEN_TEACHER);
                //     break;

                // default:
                //     navigate(RouteName?.DASHBOARD_SCREEN);
                //     break;
                case "Parent":
                  navigate(RouteName?.PARENTS_PAYMENT);
                  break;
                case "Student":
                  navigate(RouteName?.STUDENT_PAYMENT);
                  break;
                case "Teacher":
                  navigate(RouteName?.TEACHER_PAYMENT);
                  break;

                default:
                  navigate(RouteName?.DASHBOARD_SCREEN);
                  break;
              }
            } else {
              displayMessage(res.message, "error");
            }
          })
          .catch((err) => {
            displayMessage(err.message, "error");
          });
      } else if (screenStatus === "Forgot") {
        switch (forgotPasswordState) {
          case "Email": {
            Post("/auth/forgotpassword", {
              userName,
            })
              .then((res) => {
                if (res.success) {
                  localStorage.setItem("token", res.token);

                  displayMessage(res.message, "success");

                  setForgotPasswordState("Pin");
                } else {
                  displayMessage(res.message, "error");
                }
              })
              .catch((err) => {
                displayMessage(err.message, "error");
              });

            break;
          }
          case "Pin": {
            Post("/auth/verify", {
              otp,
            })
              .then((res) => {
                if (res.success) {
                  localStorage.setItem("token", res.token);

                  displayMessage(res.message, "success");

                  setForgotPasswordState("Password");
                } else {
                  displayMessage(res.message, "error");
                }
              })
              .catch((err) => {
                displayMessage(err.message, "error");
              });
            break;
          }
          case "Password": {
            Post("/auth/restepassword", {
              password,
            })
              .then((res) => {
                if (res.success) {
                  displayMessage(res.message, "success");

                  setScreenStatus("Signin");

                  // setForgotPasswordState("Done");
                } else {
                  displayMessage(res.message, "error");
                }
              })
              .catch((err) => {
                displayMessage(err.message, "error");
              });
            break;
          }
          default:
            setForgotPasswordState("Email");
            break;
        }
      }
    } catch (error) {}
  };

  const handleDialog = () => {
    setForgotPasswordState("Email");
    setScreenStatus("Signin");
    setShowDialog(false);
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex md:flex-row flex-col flex-wrap font-ubuntu font-semibold text-sm md:text-lg lg:text-xl xl:text-5xl">
          {/* slider section */}
          <ImagesSlider />

          {/* register section */}
          <div className="flex-1 flex-col w-full py-5 flex items-center h-full">
            <div className="w-4/5 flex flex-col items-centeer justify-center">
              {/* <h3 className="text-md md:text-lg font-ubuntu font-bold bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text text-center">
                                Classerly
                            </h3> */}
              <div className="pt-5 flex justify-around items-center md:mx-6">
                <img
                  src={require("../../../images/settings/sm-Logo-Transparent-PNG-942x1024 (1).png")}
                  width="100px"
                  height="100px"
                />
              </div>
              <div
                onClick={() => window.open("https://classerly.com", "_blank")}
                className="cursor-pointer"
              >
                <p className="text-xs md:text-sm text-black opacity-50 font-ubuntu font-normal text-center">
                  Classerly.com
                </p>
              </div>

              {/* switcher */}
              <div className="pt-5 flex justify-around items-center md:mx-6">
                <div
                  className="flex flex-col items-center justify-center w-fit cursor-pointer"
                  onClick={() => {
                    setScreenStatus("Register");
                    setForgotPasswordState("Email");
                  }}
                >
                  <h5 className="text-md md:text-lg font-medium">Sign Up</h5>
                  {screenStatus === "Register" && (
                    <div className="w-full h-1 md:h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  )}
                </div>
                <div
                  className="flex flex-col items-center justify-center w-fit cursor-pointer"
                  onClick={() => {
                    setScreenStatus("Signin");
                    setForgotPasswordState("Email");
                  }}
                >
                  <h5 className="text-md md:text-lg font-medium">Sign In</h5>
                  {screenStatus === "Signin" && (
                    <div className="w-full h-1 md:h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  )}
                </div>
              </div>

              {/* form */}
              <div
                className={`mt-4 md:mt-6 border-t pt-3 md:pt-5 border-gray-600 flex flex-col justify-between h-full`}
              >
                <div className="mb-5">
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
                    />
                  ) : (
                    <>
                      {screenStatus === "Signin" ? (
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
                    </>
                  )}
                </div>

                <div>
                  {}
                  <div
                    onClick={handleClick}
                    className={`w-11/13 h-8 md:h-10  bg-gradient-to-r  from-primary to-secondary flex justify-center items-center rounded-md cursor-pointer ${
                      forgotPasswordState === "Done" && "hidden"
                    }`}
                  >
                    <p className="text-white text-sm md:text-base font-normal">
                      {screenStatus === "Signin"
                        ? "Sign In"
                        : screenStatus === "Forgot"
                        ? forgotPasswordState === "Pin"
                          ? "Continue"
                          : "Reset Password"
                        : "Create Account"}
                    </p>
                  </div>

                  {/* pagination */}
                  {screenStatus === "Forgot" && (
                    <div className="flex mt-4 md:mt-5 flex-row justify-center items-center ">
                      <div
                        className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${
                          forgotPasswordState === "Email"
                            ? "border-black"
                            : "border-inputBorder"
                        }`}
                      >
                        <p
                          className={`text-xs md:text-sm ${
                            forgotPasswordState === "Email"
                              ? "text-black"
                              : "text-inputBorder"
                          } `}
                        >
                          1
                        </p>
                      </div>
                      <div
                        className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${
                          forgotPasswordState === "Pin"
                            ? "border-black"
                            : "border-inputBorder"
                        }`}
                      >
                        <p
                          className={`text-xs md:text-sm ${
                            forgotPasswordState === "Pin"
                              ? "text-black"
                              : "text-inputBorder"
                          } `}
                        >
                          2
                        </p>
                      </div>
                      <div
                        className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${
                          forgotPasswordState === "Password"
                            ? "border-black"
                            : "border-inputBorder"
                        }`}
                      >
                        <p
                          className={`text-xs md:text-sm ${
                            forgotPasswordState === "Password"
                              ? "text-black"
                              : "text-inputBorder"
                          } `}
                        >
                          3
                        </p>
                      </div>
                      <div
                        className={`w-7 h-7 mx-1 flex justify-center items-center rounded-full border ${
                          forgotPasswordState === "Done"
                            ? "border-black"
                            : "border-inputBorder"
                        }`}
                      >
                        <p
                          className={`text-xs md:text-sm ${
                            forgotPasswordState === "Done"
                              ? "text-black"
                              : "text-inputBorder"
                          } `}
                        >
                          {forgotPasswordState === "Done" ? (
                            <FaArrowRightLong className="text-xs md:text-sm" />
                          ) : (
                            "4"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showDialog && (
            <div
              className={`absolute w-screen h-screen flex flex-row justify-center items-center z-10 bg-transparentBlack`}
              onClick={handleDialog}
            >
              <img
                onClick={handleDialog}
                src={require("../../../images/register/created.png")}
                className="cursor-pointer w-4/5 md:w-1/3 h-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
