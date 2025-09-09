import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaChevronDown, FaGraduationCap, FaChartLine, FaIdCard, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { UseStateContext } from "../../../context/ContextProvider";
import { RouteName } from "../../../routes/RouteNames";
import { displayMessage } from "../../../config";
import { Get } from "../../../config/apiMethods";
import SideDrawer from "../../../components/sideDrawer/SideDrawer";
import Navbar from "../../../components/parentComponents/Navbar/Navbar";
import Grades from "../../../components/parentComponents/MyChildren/Grades/Grades";
import TeacherRemarks from "../../../components/parentComponents/MyChildren/TeacherRemarks/TeacherRemarks";

const MyChildren = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const childernValue = searchParams.get('childern')

    const [currentState, setCurrentState] = useState<number>(0);
    const [mystd, setMyStd] = useState<any>({})
    const [per, setPer] = useState<any>('')
    const [childData, setChildData] = useState<any[]>([]);
    const [selectedChild, setSelectedChild] = useState<any>(null);
    const [showChildSelector, setShowChildSelector] = useState<boolean>(false);
    const [showChildCards, setShowChildCards] = useState<boolean>(true);

    let ch: any = localStorage.getItem("mychildern")
    ch = JSON.parse(ch)

    useEffect(() => {
        // Fetch children data
        Get("/mychilds")
            .then((d) => {
                if (d.success) {
                    setChildData(d.data);
                    if (d.data?.length > 0) {
                        const currentChild = ch || d.data[0];
                        setSelectedChild(currentChild);
                        setMyStd(currentChild);
                    }
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch((err) => {
                displayMessage(err.message, "error");
            });
    }, [])

    useEffect(() => {
        if (ch) {
            setMyStd(ch)
            setSelectedChild(ch)
        }
    }, [childernValue])

    const handleChildSelect = (child: any) => {
        setSelectedChild(child);
        setMyStd(child);
        setShowChildCards(false);
        localStorage.setItem("mychildern", JSON.stringify(child));
        navigate(RouteName.MYCHILDREN_SCREEN + `?childern=${child._id}`);
        setShowChildSelector(false);
    };

    const renderToggleChildren = () => {
        try {
            switch (currentState) {
                case 0:
                    return <Grades mystd={mystd} />
                case 1:
                    return <TeacherRemarks childernValue={childernValue} />
                default:
                    return <Grades mystd={mystd} />
            }
        } catch (error) {
            console.error("Error rendering toggle children:", error);
        }
    };

    const toggleObject = [
        {
            title: "Courses",
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        },
        {
            title: "Teacher Remarks",
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        }
    ];

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 flex-wrap">
            {/* Left Sidebar */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* Main Content */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-transparent">
                {/* Navbar */}
                <div className="w-full h-fit bg-transparent mb-2 md:mb-6">
                    <Navbar title="My Children" mystd={mystd} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Back Button - Only show when a child is selected */}
                    {selectedChild && !showChildCards && (
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setShowChildCards(true);
                                    setSelectedChild(null);
                                    setMyStd({});
                                    localStorage.removeItem("mychildern");
                                    navigate(RouteName.MYCHILDREN_SCREEN);
                                }}
                                className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 transition-all duration-200 shadow-sm"
                            >
                                <FaArrowLeft className="text-gray-600" />
                                <span className="font-semibold text-gray-800 font-ubuntu">Back to Children</span>
                            </button>
                        </div>
                    )}

                    {/* Show Child Cards when no child is selected */}
                    {showChildCards && (
                        <div className="w-full">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 font-ubuntu mb-2">Select a Child to View Progress</h2>
                                <p className="text-gray-600 font-ubuntu">Click on any child card below to view their detailed progress</p>
                            </div>

                            {/* Children Grid */}
                            {childData && childData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {childData.map((child: any, index: number) => (
                                        <div
                                            key={index}
                                            onClick={() => handleChildSelect(child)}
                                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-blue-200 cursor-pointer hover:scale-105"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <img
                                                        src={child?.auth?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"}
                                                        alt={child?.auth?.fullName}
                                                        className="w-14 h-14 rounded-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800 font-ubuntu text-lg">
                                                        {child?.auth?.fullName || "Student Name"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-ubuntu">
                                                        {child?.grade?.grade || "Grade"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <FaIdCard className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-600 font-ubuntu">Student Code: {child?.code || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-600 font-ubuntu">Year: {new Date().getFullYear()}-{new Date().getFullYear() + 1}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm text-blue-600 font-ubuntu text-center font-semibold">
                                                    Click to view progress
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaUser className="text-gray-300 text-6xl mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-500 font-ubuntu mb-2">No Children Found</h3>
                                    <p className="text-gray-400 font-ubuntu">Children will appear here once they are registered.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show Tabs and Content when a child is selected */}
                    {selectedChild && !showChildCards && (
                        <>
                            {/* Selected Child Info */}
                            <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedChild?.auth?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"}
                                        alt={selectedChild?.auth?.fullName}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 font-ubuntu">
                                            {selectedChild?.auth?.fullName}
                                        </h2>
                                        <p className="text-gray-600 font-ubuntu">
                                            {selectedChild?.grade?.grade} • Student Code: {selectedChild?.code}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="w-full bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                                <div className="flex flex-wrap border-b border-gray-200">
                                    {toggleObject?.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentState(index)}
                                            className={`flex-1 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-200 ${currentState === index
                                                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <img
                                                    src={item?.image}
                                                    className="w-6 h-6 md:w-8 md:h-8"
                                                    alt={item?.title}
                                                />
                                                <span className="font-semibold text-sm md:text-base font-ubuntu">
                                                    {item?.title}
                                                </span>
                                            </div>
                                            <div className={`w-full h-1 rounded-full transition-all duration-200 ${currentState === index ? 'bg-white' : 'bg-transparent'
                                                }`} />
                                        </button>
                                    ))}
                                </div>

                                {/* Content Area */}
                                <div className="p-6">
                                    {renderToggleChildren()}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
};

export default MyChildren;