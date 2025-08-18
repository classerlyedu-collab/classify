
import { useState } from "react";
import {
    Navbar,
    SideDrawer,
    Information,
    Email,
    Password,
    Notification,

} from "../../../components";

import { sideBarData } from "../../../constants/parent/settings"
import { UseStateContext } from "../../../context/ContextProvider";

const Settings = () => {
    const {
        hasChanges,
        setIsModalOpen
    } = UseStateContext();

    const [currentState, setCurrentState] = useState<number>(0);

    const handleClick = (index:any) => {
        try {
            if(hasChanges){
                setIsModalOpen(true);
            } else {
                setCurrentState(index);
            }
        } catch (error) {
            setCurrentState(index);
        }
    }

    const renderToggleChildren = () => {
        try {

            switch (currentState) {
                case 0:
                    return <Information />
                case 1:
                    return <Password />
                case 2:
                    return <Email />
                case 3:
                    return <Notification />

                default:
                    return <Information />
            }

        } catch (error) {
            

        }
    };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6 px-2 py-2 md:px-4 md:py-6  md:pr-16" >
                    <Navbar title="Settings" />
                </div>

                {/* center */}
                <div className="grid sm:grid-cols-1 md:grid-cols-10 border-t border-grey px-2 md:px-4 md:pr-16 md:h-screen md:mt-3" >
                    <div className="flex flex-row md:flex-col lg:col-span-2 md:col-span-2 border-r-none sm:border-r sm:border-grey md:py-8 ">
                        {
                            sideBarData?.map((item, index) => (
                                <div
                                    onClick={() => handleClick(index)}
                                    className="flex flex-row items-center justify-between md:items-start md:justify-start ml-4 md:mb-8 cursor-pointer py-2 md:py-0  " >
                                    <div className={`h-full rounded-r-md bg-secondary w-1 md:mr-2 transition-all delay-150 ${currentState === index ? 'hidden md:flex' : 'hidden'}`} />
                                    <h1 className={`font-ubuntu font-semibold md:font-medium text-xs lg:text-sm md:text-sm font ${currentState === index ? 'text-secondary md:text-greyBlack' : 'text-greyBlack'}`}>{item?.title}</h1>
                                </div>
                            ))
                        }
                    </div>

                    {/* for form */}
                    <div className="grid lg:grid-col-span-8 md:col-span-8 h-52 md:h-auto ">
                        {
                            renderToggleChildren()
                        }
                    </div>

                </div>

            </div>

        </div>
    )
};

export default Settings;
