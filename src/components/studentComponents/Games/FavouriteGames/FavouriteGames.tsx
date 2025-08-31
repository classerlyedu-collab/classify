
import { bestScoredData } from "../../../../constants/student/Games";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

const FavouriteGames = () => {

    return (
        <div className="w-full bg-white px-6 lg:px-4 py-3 rounded-2xl flex flex-col justify-start items-start ">

            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack">Favourite Games</h1>

            <div className="grid grid-cols-1 w-full max-w-80" >
                {
                    bestScoredData?.map((item, index) => (
                        <div id={index?.toString()} className="col-span-1 border-2 border-grey lg:col-span-4 mt-2 md:mt-5 rounded-3xl cursor-pointer">
                            <div className={`relative rotate-6 translate-x-6 hover:translate-x-0 group hover:rotate-0 flex flex-row border-4 shadow-md shadow-transparentBlack border-mainBg py-1.5 rounded-3xl justify-between items-center transition-all delay-200`}
                                style={{ background: getRandomColor('dark', index + 1) }}
                            >

                                <div className="-translate-x-3 transition-all delay-200 group-hover:-translate-x-0 flex w-2/5 border-4 bg-[#7000FF] border-[#DBBFFF] rounded-3xl h-20 justify-center items-center">

                                    <img src={item?.imageUrl} alt={item.title} className="w-4/5 h-4/5 rounded-3xl" />

                                </div>
                                <div className="flex flex-col w-3/5 h-full rounded-3xl justify-center items-start pl-4">
                                    <h5 className="text-black text-base md:text-lg font-semibold">{item.title}</h5>
                                    <p className="text-black text-xs md:text-sm font-semibold">{item.totalWins}</p>
                                </div>

                                <div className="absolute flex flex-col right-2 my-auto" >
                                    <div className="h-2 w-2 rounded-full bg-whiteTransparent mb-1" />
                                    <div className="h-2 w-2 rounded-full bg-whiteTransparent" />
                                </div>

                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}
export default FavouriteGames;