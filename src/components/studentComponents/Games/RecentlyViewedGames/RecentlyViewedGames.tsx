import { recentlyViewedGamesData } from "../../../../constants/student/Games";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

const RecentlyViewedGames = () => {

    return (
        <div className="w-full bg-white py-5 px-4 lg:px-6 rounded-2xl flex flex-col">

            {/* header */}
            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">Recently Viewed Games</h1>

            {/* content */}
            <div className="flex flex-col items-start justify-start max-h-72 md:max-h-96 overflow-y-auto w-full" >
                {
                    recentlyViewedGamesData?.map((item, index) => (
                        <div className="flex items-center justify-between py-3 lg:py-5 border-b last:border-b-0 border-grey w-full flex-wrap" >

                            <div className="flex items-center justify-start" >
                                <div
                                    className="rounded-2xl"
                                    style={{
                                        background: getRandomColor('dark', index, 0.8)
                                    }} >
                                    <div className="translate-x-1.5 translate-y-1.5 rounded-2xl border border-greyBlack p-1 lg:p-1.5" style={{
                                        background: getRandomColor('dark', index+1, 0.8)
                                    }} >
                                        <img src={item?.imageUrl} className="w-12 h-12 rounded-2xl object-contain" />
                                    </div>
                                </div>

                                <div className="ml-3 sm:ml-5" >
                                    <h1 className="font-ubuntu font-medium text-sm md:text-base lg:text-sm xl:text-base text-greyBlack  mb-2">{item?.title}</h1>
                                    <h1 className="font-ubuntu font-medium text-xs md:text-sm lg:text-xs xl:text-sm text-greyBlack  mb-2">{item?.message}</h1>
                                </div>
                            </div>

                            <div className="bg-[#7470E8] px-2 sm:px-4 lg:px-6 py-2 rounded-full flex items-center self-end  justify-center group cursor-pointer mr-1 hover:bg-white hover:border border-greyBlack transition-all delay-100" >
                                <h1 className="font-ubuntu font-medium text-xs xl:text-sm text-white group-hover:text-greyBlack transition-all delay-100">Play Now</h1>
                            </div>


                        </div>
                    ))
                }
            </div>

        </div>
    )
}
export default RecentlyViewedGames;