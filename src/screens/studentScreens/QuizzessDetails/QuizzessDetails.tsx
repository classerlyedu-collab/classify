
import { useEffect, useState } from "react";
import {
    Analytics,
    AttendancePercentage,
    ClassProgress,
    Navbar,
    Progress,
    SideDrawer,
    SpendHours,
    StudentPerformance
} from "../../../components";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";

const QuizzessDetails = () => {

    const location = useLocation();
    const { state } = location || {}; // Access the passed state
    const navigate = useNavigate();

    const headerArray = [
        "#",
        "Subject",
        "Topic",
        "Lesson",
        "Score",
        "Marks",
        "Action",
    ];

    const dummyQuizzess = [
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
        {
            score: 9,
            subject: 'Science',
            Topic: 'Topic Name',
            Lesson: 'Lesson name'
        },
    ];

    const [myresult, setMyResult] = useState<any>([])

    useEffect(() => {
        Get(`/quiz/student/myquiz?result=${state.title}`).then((d) => {

            if (d.success) {
                setMyResult(d.data)

            } else {
                displayMessage(d.message, "error")
            }
        })
    }, [])
    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6" >
                    <Navbar title={state?.title === "pass" ? "Quizzes Completed Successfully" : "Quizzes Need Improvement"} hideSearchBar={true} />
                </div>

                {/* center */}
                <div className="grid grid-cols-10 gap-3 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit" >

                    <div className="col-span-10 gap-3 flex flex-col items-center justify-between">
                        <div className="w-full grid grid-cols-12 flex-row items-center justify-between">
                            {headerArray?.map((item, index) => (
                                <div
                                    id={`header-${index}`}
                                    key={index}
                                    className={`first:col-span-1 col-span-2 last:col-span-1`}
                                >
                                    <h6 className="text-sm text-grey font-ubuntu font-light">
                                        {item}
                                    </h6>
                                </div>
                            ))}
                        </div>

                        <div className="w-full flex flex-col gap-2">
                            {myresult?.map((item: any, index: any) => (
                                <div className="w-full flex-row grid grid-cols-12 items-center justify-between">
                                    <h6 className="text-xs sm:text-sm text-greyBlack col-span-1 font-ubuntu font-light">
                                        {index + 1}
                                    </h6>
                                    <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                                        {item?.quiz?.subject?.name}
                                    </h6>
                                    <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                                        {item?.quiz?.topic?.name}
                                    </h6>
                                    <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                                        {item?.quiz?.lesson?.name}
                                    </h6>
                                    <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                                        {item?.marks}
                                        {/* marks gain in quiz */}


                                    </h6>
                                    <h6 className="text-xs sm:text-sm text-greyBlack col-span-1 font-ubuntu font-light">
                                        {item?.score}
                                        {/* total score of quiz */}
                                    </h6>
                                    <div className="bg-primary px-2 py-1 col-span-2 max-w-24 rounded-md hover:opacity-80 cursor-pointer"
                                        onClick={() => {

                                            Post(`/quiz/student/${item?.quiz?._id}?status=start`).then((d) => {

                                                if (d.success) {

                                                    navigate(RouteName?.SOLO_QUIZ, { state: item?.quiz })
                                                } else {
                                                    displayMessage(d.message, "error")
                                                }
                                            })
                                        }}
                                    >
                                        <p className="text-xs sm:text-sm font-semibold text-white">Start Again</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
};

export default QuizzessDetails;
