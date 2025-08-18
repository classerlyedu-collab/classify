import { useEffect, useState } from "react";
import { IoIosAlert } from "react-icons/io";
import { WelcomeStudentImagesArray } from "../../../../constants/student/Dashboard";


const WelcomeNotice = () => {

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    let user = JSON.parse(localStorage.getItem("user") || "");
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex: number) =>
                prevIndex === WelcomeStudentImagesArray?.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-lightbrown h-full py-5 px-4 rounded-2xl flex flex-row justify-between items-center">
            <div className="w-full md:w-1/2" >
                <div className="w-full">
                    <div className="justify-center items-center flex sm:hidden">
                        <img className="w-36 mb-4" src={WelcomeStudentImagesArray[currentImageIndex]} alt="Welcome" />
                    </div>
                    <h1 className="font-ubuntu text-lg md:text-xl font-bold">Hi, {user.userName}!</h1>
                    <div className="py-3 flex flex-col">
                        <p className="text-sm md:text-base font-ubuntu text-greyBlack ">Welcome to the student portal.</p>
                        <p className="text-sm md:text-base font-ubuntu text-greyBlack">Please stay connected and updated on the student portal

                        </p>
                    </div>
                    <div className="flex flex-row justify-start items-center py-2 ">
                        < IoIosAlert className="text-red-500" size={25} /> <h6 className="px-1 text-xs md:text-sm font-bold">Don’t forget to check out daily notices!</h6>
                    </div>
                </div>
            </div>
            <div className="justify-center items-center hidden sm:flex">
                <img className="h-52 w-72 object-contain" src={WelcomeStudentImagesArray[currentImageIndex]} alt="Welcome" />
            </div>
        </div>
    )
}
export default WelcomeNotice;