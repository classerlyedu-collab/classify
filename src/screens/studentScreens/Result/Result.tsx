
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
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

const Result = () => {
    
    const [myresult,setMyResult] = useState<any>({})
    useEffect(()=>{
    Get("/student/myresult").then((d)=>{
      if(d.success){
        setMyResult(d.data)
      
    }else{
      displayMessage(d.message,"error")
    }
    })
    },[])
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
                    <Navbar title="Results" hideSearchBar={true} />
                </div>

                {/* center */}
                <div className="grid grid-cols-10 gap-3 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit" >

                    {/* analytics */}
                    <div className="col-span-10 xl:col-span-7 h-fit" >
                        <Analytics myresult={myresult}/>
                    </div>

                    <div className="grid grid-cols-10 col-span-10 lg:col-span-4 xl:col-span-3 lg:col-start-7 lg:row-start-2 xl:col-start-auto xl:row-start-auto row-span-2 gap-3 md:gap-5 h-fit" >
                        {/* studentPerformance */}
                        {/* <div className="col-span-10 sm:col-span-5 lg:col-span-10 h-fit" >
                            <StudentPerformance />
                        </div> */}

                        {/* Attendance Percentage */}
                        {/* <div className="col-span-10 sm:col-span-5 lg:col-span-10 h-fit" >
                            <AttendancePercentage />
                        </div> */}
                    </div>

                    {/* spend hours */}
                    {/* <div className="col-span-10 sm:col-span-10 lg:col-span-6 xl:col-span-4 xl:row-span-2 lg:col-start-1 lg:row-start-3 xl:col-start-auto xl:row-start-auto h-fit" >
                        <SpendHours />
                    </div> */}

                    {/* Class Progress */}
                    {/* <div className="col-span-10 sm:col-span-5 lg:col-span-4 xl:col-span-3 h-fit lg:col-start-7 lg:row-start-3 xl:col-start-auto xl:row-start-auto" >
                        <ClassProgress />
                    </div> */}

                    {/* Progress */}
                    {/* <div className="col-span-10 lg:col-span-6 xl:col-span-6 sm:col-start-1 sm:row-start-4 lg:row-start-2 xl:row-start-auto lg:col-start-1 sm:col-span-10 xl:col-start-auto h-fit" >
                        <Progress />
                    </div> */}

                </div>

            </div>

        </div>
    )
};

export default Result;
