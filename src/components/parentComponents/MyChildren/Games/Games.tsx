import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { useEffect, useState } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const Games = ({ ch }: any) => {
    const [games, setGames] = useState<any[]>([])

    useEffect(() => {
        if (ch) {

            Get(`/game?grade=${ch?.grade?._id}`).then((d) => {
                if (d.success) {

                    setGames(d.data)
                } else {
                    displayMessage(d.message)
                }
            }).catch((err) => {
                displayMessage(err.message, "error")
            })
        }
    }, [ch])

    return (
        <div className="w-full px-7">

            {/* most played games */}
            <h1 className="font-ubuntu text-sm md:text-base lg:text-xl font-medium text-greyBlack pb-3">Most Played Games</h1>
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-3">
                {
                    games?.map((item, index) => (

                        <div
                            // onClick={()=> navigate(RouteName.PLAY_GAME,{state:item})}
                            id={index?.toString()} className={`text-lg min-w-[10rem] sm:min-w-[12rem] md:min-w-[14rem] lg:min-w-[12rem] 2xl:min-w-[15rem] rounded-3xl flex flex-col justify-center items-center p-2 md:p-3 cursor-pointer group hover:px-1 transition-all delay-50`}
                            style={{ backgroundColor: getRandomColor('dark', index) }} >
                            <div className="border border-white rounded-3xl w-full">
                                <img className="rounded-3xl h-16 sm:h-20 w-full md:h-24 lg:h-20 2xl:h-24 object-cover" src={item.image} alt={item.title} />
                            </div>
                            <div className="flex flex-col justify-center items-center mt-2">
                                <h5 className="text-white text-xs md:text-sm font-semibold">{item.title}</h5>
                                {/* <p className="text-white text-xs md:text-sm font-medium">{item.completion}%
                                    <span className="text-whiteTransparent text-xs md:text-sm font-normal"> complete</span>
                                </p> */}
                            </div>
                        </div>
                    ))
                }

                {/* best scored games */}
                {/* <div className="flex flex-col col-span-2 lg:col-span-3 pr-5" >
                    <h1 className="font-ubuntu text-sm md:text-base lg:text-xl font-medium text-greyBlack mt-2 md:mt-3">Best Scored</h1>

                    {
                        bestScoredData?.map((item, index) => (
                            <div id={index?.toString()} className="flex flex-col border-2 border-grey col-span-2 lg:col-span-4 mt-2 md:mt-5 rounded-3xl cursor-pointer">
                                <div className={`rotate-6 translate-x-6 hover:translate-x-0 group hover:rotate-0 flex flex-row border-4 shadow-md shadow-transparentBlack border-mainBg py-1.5 rounded-3xl justify-between items-center transition-all delay-200`}
                                    style={{ background: getRandomColor('dark', index) }}
                                >

                                    <div className="-translate-x-3 transition-all delay-200 group-hover:-translate-x-0 flex w-2/5 border-4 bg-[#7000FF] border-[#DBBFFF] rounded-3xl h-20 justify-center items-center">

                                        <img src={item?.imageUrl} className="w-4/5 h-4/5 rounded-3xl" />

                                    </div>
                                    <div className="flex flex-col w-3/5 h-full rounded-3xl justify-center items-start pl-4">
                                        <h5 className="text-black text-base md:text-lg font-semibold">{item.title}</h5>
                                        <p className="text-black text-xs md:text-sm font-semibold">{item.totalWins}</p>
                                    </div>

                                </div>
                            </div>
                        ))
                    }
                </div> */}

                {/* spend hours */}
                {/* <div className=" bg-blue-100 text-lg col-span-2 lg:col-span-6 rounded-3xl h-52 md:h-80 mt-8 lg:mt-0 ml-5" >

                    <BarChart
                        xAxis={[{ scaleType: 'band', data: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'] }]}
                        series={[{ data: [4, 3, 5, 5, 3, 6, 5] }, { data: [1, 6, 3, 5, 3, 6, 5] }]}
                        borderRadius={100}
                    />
                </div> */}

                {/* leader board */}
                {/* <div className="p-5  text-lg col-span-2 lg:col-span-3" >
                    <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 md:mb-5">Leaderboard</h1>
                    <div className='flex flex-col justify-center items-center sm:w-full w-full border-2 border-[#E5D1FF] shadow-sm shadow-[#E5D1FF] rounded-2xl p-2 md:p-3 max-h-72 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-400 ' >
                        <div className='flex flex-row w-full justify-between items-center' >
                            <h1 className="font-ubuntu text-sm text-greyBlack font-semibold" >Top Students</h1>
                            <h1 className="font-ubuntu text-sm text-greyBlack font-semibold" >Grade 3</h1>
                        </div>
                        {
                            gamesPositionHolders?.map((item, index) => (
                                <div id={index.toString()} className='w-full flex justify-start items-center bg-mainBg mt-2 rounded-lg px-3 py-2'>

                                    <img className="w-9 h-9 md:h-12 md:w-12 rounded-full mr-3 md:mr-4" src={item?.image} alt="Profile" />
                                    <div className='h-full flex-col justify-between items-start' >
                                        <h1 className="font-ubuntu text-sm text-greyBlack font-semibold mb-1" >{item?.name}</h1>
                                        <h1 className="font-ubuntu text-xs text-blue-500 font-semibold" >{item?.position}</h1>

                                    </div>

                                </div>
                            ))
                        }
                    </div>
                </div> */}




            </div>

        </div>

    )

};

export default Games;