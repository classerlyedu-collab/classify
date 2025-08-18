import { useEffect, useState } from "react";
import { TeaherRemarksobj } from "../../../../constants/parent/myChildren";
import { Get } from "../../../../config/apiMethods";
import { FaStar } from "react-icons/fa";

const TeacherRemarks = ({childernValue}:any) => {
    const [remarks, setRemarks] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    
    useEffect(() => {
        // Get current logged in user (parent)
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Fetch teacher remarks
        Get(`/parent/feedback/${childernValue}`).then((d) => {
            if (d.success) {
                setRemarks(d.data);
            }
        }).catch((err) => {
            console.error("Failed to fetch remarks:", err);
        });

        // Fetch teacher feedback with parent ID
        Get(`/teacher/parent-feedbacks/${childernValue}/${currentUser.profile._id}`).then((d) => {
            if (d.success) {
                setFeedback(d.data);
            }
        }).catch((err) => {
            console.error("Failed to fetch feedback:", err);
        });
    }, [childernValue]);

    return (
        <div className="w-full px-1">
            {/* Teacher Remarks Section */}
            <div className="mb-8">
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2 md:mb-4">Teacher Remarks</h1>
                <div>
                    {remarks?.map((item: any, index: number) => (
                        <div key={index} className="flex flex-row flex-wrap w-full justify-between items-center mb-3 md:mb-3 bg-white shadow-md shadow-gray-500 py-2 md:py-6 rounded-md px-2 md:px-4">
                            <div className="flex flex-row justify-start items-center">
                                <div className="flex justify-center justify-items-center mr-2 md:mr-4">
                                    <img 
                                        src={item?.from?.auth?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"} 
                                        className="w-20 rounded-full" 
                                        alt="teacher"
                                    />
                                </div>
                                <div className="flex flex-col justify-center justify-items-center">
                                    <h1 className="font-ubuntu font-medium text-purple-600 text-base md:text-lg text-purple">
                                        {item?.from?.auth?.userName?.slice(0,12)}
                                    </h1>
                                    <h1 className="font-medium text-xs md:text-sm">
                                        {item?.createdAt.split(".")[0].split("T").join(" ")}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex flex-row justify-center items-center h-full text-greyBlack mt-3 md:mt-0 md:w-1/2">
                                <h1 className="font-ubuntu font-semibold text-sm text-gray-600 text-center">
                                    "{item.feedback}"
                                </h1>
                            </div>

                            <div className="flex flex-row h-full justify-end w-full md:w-auto items-end mt-3 md:mt-0">
                                {Array.from({ length: item?.star }).map((_, index) => (
                                    <img
                                        key={index}
                                        src={require('../../../../images/myChildren/star.png')}
                                        className="h-4 w-4 md:h-6 md:w-6"
                                        alt="star"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Teacher Feedback Section */}
            <div>
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2 md:mb-4">Feedback for You from Teachers</h1>
                <div>
                    {feedback?.map((item: any, index: number) => (
                        <div key={index} className="flex flex-row flex-wrap w-full justify-between items-center mb-3 md:mb-3 bg-white shadow-md shadow-gray-500 py-2 md:py-6 rounded-md px-2 md:px-4">
                            <div className="flex flex-row justify-start items-center">
                                <div className="flex justify-center justify-items-center mr-2 md:mr-4">
                                    <img 
                                        src={item?.teacherId?.auth?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"} 
                                        className="w-20 rounded-full" 
                                        alt="teacher"
                                    />
                                </div>
                                <div className="flex flex-col justify-center justify-items-center">
                                    <h1 className="font-ubuntu font-medium text-purple-600 text-base md:text-lg text-purple">
                                        {item?.teacherId?.auth?.userName?.slice(0,12)}
                                    </h1>
                                    <h1 className="font-medium text-xs md:text-sm">
                                        {new Date(item?.createdAt).toLocaleDateString()}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex flex-row justify-center items-center h-full text-greyBlack mt-3 md:mt-0 md:w-1/2">
                                <h1 className="font-ubuntu font-semibold text-sm text-gray-600 text-center">
                                    "{item.comment}"
                                </h1>
                            </div>

                            <div className="flex flex-row h-full justify-end w-full md:w-auto items-end mt-3 md:mt-0">
                                {Array.from({ length: item?.stars }).map((_, index) => (
                                    <FaStar
                                        key={index}
                                        className="h-4 w-4 md:h-6 md:w-6 text-yellow-400"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherRemarks;