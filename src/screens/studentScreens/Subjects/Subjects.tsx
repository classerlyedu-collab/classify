
import {
    Challenges,
    FeaturedCategories,
    MotivationNotice,
    RecentResults,
} from "../../../components";
import { CourseSelection } from "../../../components/CourseSelection";
import { useState, useEffect } from "react";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { getRandomColor } from "../../../utils/randomColorGenerator";
import { SubjectsData } from "../../../constants/student/Dashboard";

const Subjects = () => {
    // Get current user data
    let user = JSON.parse(localStorage.getItem("user") || "");
    const navigate = useNavigate();

    // State for course selection
    const [course, setCourse] = useState<any>(user?.profile?.subjects?.map((subject: any) => subject._id || subject) || []);
    const [courseData, setCourseData] = useState([]);
    const [grade, setGrade] = useState(user?.profile?.grade?._id);
    const [hasChanges, setHasChanges] = useState(false);
    const [loadingCourseData, setLoadingCourseData] = useState(false);

    // State for enrolled subjects
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // Check for changes
    const checkForChanges = () => {
        const arraysMatch = (arr1: any, arr2: any) => {
            if (!arr1 || !arr2) return false;
            if (arr1.length !== arr2.length) return false;
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) {
                    return false;
                }
            }
            return true;
        };

        const currentSubjects = user?.profile?.subjects?.map((subject: any) => subject._id || subject) || [];
        if (!arraysMatch(course, currentSubjects)) {
            setHasChanges(true);
            return true;
        } else {
            setHasChanges(false);
            return false;
        }
    };

    useEffect(() => {
        checkForChanges();
    }, [course]);

    // Fetch course data based on grade
    useEffect(() => {
        if (grade) {
            setLoadingCourseData(true);
            Get(`/subject/grade/${grade}`)
                .then((d) => {
                    if (d.success) {
                        setCourseData(d.data);
                        setLoadingCourseData(false);
                    } else {
                        displayMessage(d.message);
                        setLoadingCourseData(false);
                    }
                })
                .catch((e) => {
                    displayMessage(e.message);
                    setLoadingCourseData(false);
                });
        }
    }, [grade]);

    // Fetch enrolled subjects
    useEffect(() => {
        setLoadingSubjects(true);
        Get("/student/mysubjects").then((d) => {
            if (d.success) {
                setEnrolledSubjects(d.data);
                setLoadingSubjects(false);
            } else {
                displayMessage(d.message, "error");
                setLoadingSubjects(false);
            }
        }).catch((error) => {
            displayMessage("Failed to fetch enrolled subjects", "error");
            setLoadingSubjects(false);
        });
    }, []);

    // Handle course update
    const handleUpdateCourses = () => {
        const reqbody = {
            grade: grade,
            subjects: course.filter((i: any) => { return i != null })
        };

        Post("/auth/updateuser", reqbody).then((res) => {
            if (res.success) {
                localStorage.setItem("token", res.data.token);
                delete res.data.token;
                localStorage.setItem("user", JSON.stringify(res.data.data));
                user = res.data.data; // Update local user reference

                // Update course state to reflect the new selection
                const newSubjects = res.data.data?.profile?.subjects?.map((subject: any) => subject._id || subject) || [];
                setCourse(newSubjects);
                setHasChanges(false);
                displayMessage(res.message, "success");

                // Refresh enrolled subjects after successful update
                Get("/student/mysubjects").then((d) => {
                    if (d.success) {
                        setEnrolledSubjects(d.data);
                    }
                }).catch((error) => {
                    // Failed to refresh enrolled subjects
                });
            } else {
                displayMessage(res.message, "error");
            }
        }).catch((error) => {
            displayMessage("Failed to update courses", "error");
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 px-2 py-2 md:px-4 md:py-6" >

            {/* My Enrolled Courses Section - Now at the top */}
            <div className="w-full mb-6 bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                <div className="flex flex-row items-center justify-between mb-6">
                    <div className="flex flex-row justify-center items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full mr-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">My Enrolled Courses</h2>
                            <span className="font-ubuntu font-medium text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                Grade {user?.profile?.grade?.grade}
                            </span>
                        </div>
                    </div>
                </div>

                {loadingSubjects ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <div className="text-blue-600 font-medium">Loading your courses...</div>
                        </div>
                    </div>
                ) : enrolledSubjects?.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-2 font-medium">No courses enrolled yet!</p>
                        <p className="text-sm text-gray-500">Select some courses below to get started with your learning journey! 🚀</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {enrolledSubjects?.map((subject: any, index: number) => (
                            <div
                                key={index}
                                onClick={() => {
                                    localStorage.setItem("subject", JSON.stringify(subject));
                                    navigate(`${RouteName?.TOPICS_SUBJECTS}?subject=${subject._id}`);
                                }}
                                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                                        style={{ background: getRandomColor("light", index) }}
                                    >
                                        <img
                                            className="w-10 h-10 object-contain"
                                            src={subject.image || SubjectsData[index % SubjectsData?.length]?.image}
                                            alt="subject-image"
                                        />
                                    </div>
                                    <h3 className="font-bold text-sm text-center text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {subject?.name}
                                    </h3>
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Course Selection Section - Redesigned for kids */}
            <div className="w-full mb-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-green-100">
                <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-full mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Choose Your Courses</h2>
                        <p className="text-gray-600 mt-1">Pick the subjects you want to learn! 🎯</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-inner border-2 border-green-200">
                    {loadingCourseData ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
                                <div className="text-green-600 font-medium">Loading available courses...</div>
                            </div>
                        </div>
                    ) : courseData?.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium">No courses available for your grade</p>
                        </div>
                    ) : (
                        <CourseSelection
                            value={course}
                            setValue={setCourse}
                            style={{
                                wrapper: "mb-0 w-full",
                                inputWrapper: "bg-transparent",
                                listWrapper: "bg-white border-2 border-green-200 rounded-xl shadow-sm",
                            }}
                            placeholder="Select Courses"
                            data={courseData?.map((i: any) => {
                                return {
                                    value: i._id,
                                    label: i.name,
                                };
                            })}
                        />
                    )}
                </div>

                {hasChanges && (
                    <div className="flex justify-center space-x-4 mt-6">
                        <button
                            onClick={() => {
                                setCourse(user?.profile?.subjects || []);
                                setHasChanges(false);
                            }}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateCourses}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            Save My Choices! ✨
                        </button>
                    </div>
                )}
            </div>

            {/* MotivationNotice and Featured Categories */}
            <div className="w-full mb-2 md:mb-6 h-auto" >

                {/* Motivation Notice */}
                <div className="w-full mb-6 h-auto" >
                    <MotivationNotice />
                </div>

                {/* Featured Categories - Enhanced */}
                <div className="w-full h-auto" >
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                        <div className="flex items-center mb-4">
                            <div className="bg-gray-800 p-3 rounded-full mr-4 shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Explore All Subjects</h3>
                                <p className="text-gray-600 text-sm">Discover all available subjects for your grade! 🌟</p>
                            </div>
                        </div>
                        <FeaturedCategories />
                    </div>
                </div>

            </div>

        </div>
    )
};

export default Subjects;
