
import { useEffect, useState } from "react";
import {
    Navbar,
    GamesParent,
    Grades,
    Overview,
    TeacherRemarks,
    Quizzes,
    SideDrawer
} from "../../../components";
import { toggleObject } from "../../../constants/parent/myChildren";
import { Get } from "../../../config/apiMethods";
import { useLocation } from "react-router-dom";

const MyChildren = () => {
    const location = useLocation();

    // Create a URLSearchParams object to extract the query parameters
    const searchParams = new URLSearchParams(location.search);
  
    // Get the value of the 'childern' query parameter
    const childernValue = searchParams.get('childern')
    
    const [currentState, setCurrentState] = useState<number>(0);
    const [mystd, setMyStd] = useState<any>({})
    // const [quiz, setQuiz] = useState<any>({})
    const [per, setPer] = useState<any>('')

    let ch: any = localStorage.getItem("mychildern")
    ch = JSON.parse(ch)
   
    useEffect(() => {
        
        if (ch) {
            setMyStd(ch)
            // Get(`/mychild/${childernValue}`).then((d) => {
            
            //     // setMyStd(d.data)
            //     // let marks = 0, score = 0;

            //     // d.data.map((i: any, index: any) => {
            //     //     marks += i.marks
            //     //     score += i.score
            //     //     if (index == d.data?.length - 1) {
            //     //         setPer(marks / score * 100)
            //     //     }
            //     // })
            
                
            // }).catch((err) => {

            // })
            

        }
    }, [childernValue])
    const renderToggleChildren = () => {
        try {

            switch (currentState) {
                case 0:
                    return <Overview per={per} mystd={mystd} />
                // case 1:
                //     return <Quizzes per={per} mystd={mystd} />
                case 1:
                    return <Grades mystd={mystd} />
                case 2:
                    return <TeacherRemarks childernValue={childernValue}/>                

                default:
                    return <Overview />
            }

        } catch (error) {
            

        }
    };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2000px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen md:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6" >
                    <Navbar title="My Children" mystd={mystd}/>
                </div>

                {/* menu */}
                <div className=" w-full mb-2 md:mb-6 flex flex-col justify-start items-center bg-white rounded-lg p-2 md:p-3" >

                    {/* Custom Toggle Button */}
                    <div className="flex flex-row justify-evenly md:px-6 items-center flex-wrap border-b w-full border-greyBlack" >

                        {
                            toggleObject?.map((item, index) => (
                                <div
                                    className={`flex flex-col items-center justify-center cursor-pointer md:px-3`}
                                    onClick={() => setCurrentState(index)}
                                >
                                    <img
                                        src={item?.image}
                                        className={`w-10 md:h-20 h-10 md:w-20 `}
                                        alt="toggle"
                                    />
                                    <h4 className="font-ubuntu text-xs md:text-base font-medium text-greyBlack" >{item?.title}</h4>
                                    <div className={`w-full h-0.5 md:h-1 rounded-full ${currentState === index ? 'bg-orange-500 ' : 'bg-none'}`} />
                                </div>
                            ))
                        }

                    </div>

                    <div className="w-full h-full flex flex-col justify-start items-start py-3 md:pt-6" >
                        {
                            renderToggleChildren()
                        }
                    </div>

                </div>

            </div>

        </div>
    )
};

export default MyChildren;
