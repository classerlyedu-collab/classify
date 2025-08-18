import { IoIosNotificationsOutline } from "react-icons/io";
import { recentlyViewedGamesData } from "../../../../constants/student/Games";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

const Notifications = () => {

    return (
        <div className="w-full bg-white py-5 px-4 lg:px-6 rounded-2xl flex flex-col">

            {/* header */}
            <div className="w-full flex items-center justify-between flex-wrap" >
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">Notifications</h1>

                <div className="relative cursor-pointer" >
                    <IoIosNotificationsOutline className="flex justify-center items-center text-2xl md:text-3xl" />
                    <div className={`w-2 h-2 bg-red-600 rounded-full absolute top-1 right-1`} />
                </div>
            </div>

            {/* content */}
            <div className="flex flex-col items-start justify-start max-h-72 md:max-h-96 overflow-y-auto w-full" >
                {
                    recentlyViewedGamesData?.map((item, index) => (
                        <div className="relative flex items-center justify-start py-3 lg:py-5 border-b last:border-b-0 border-grey w-full flex-wrap" >

                            <div className="translate-x-1.5 translate-y-1.5 rounded-2xl border border-greyBlack p-1 lg:p-1.5" style={{
                                background: getRandomColor('dark', index + 1, 0.8)
                            }} >
                                <img src={item?.imageUrl} className="w-12 h-12 rounded-2xl object-contain" />
                            </div>

                            <div className="ml-2 sm:ml-3" >
                                <h1 className="font-ubuntu font-medium text-sm md:text-base lg:text-sm xl:text-base text-greyBlack  mb-2">{item?.title}</h1>
                                <h1 className="font-ubuntu font-medium text-xs md:text-sm lg:text-xs xl:text-sm text-greyBlack  mb-2">{item?.message}</h1>
                            </div>

                            <div className="absolute flex flex-col right-2 my-auto" >
                                <div className="h-2 w-2 rounded-full bg-grey mb-1" />
                                <div className="h-2 w-2 rounded-full bg-grey" />
                            </div>


                        </div>
                    ))
                }
            </div>

        </div>
    )
}
export default Notifications;