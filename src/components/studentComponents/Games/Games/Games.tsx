import { useFetcher, useNavigate } from "react-router-dom";
import { gamesResult } from "../../../../constants/parent/myChildren";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { RouteName } from "../../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const Games = () => {

    const navigate = useNavigate();
    const [games,setGames] = useState<any[]>([])
    let user = JSON.parse(localStorage.getItem("user") || "");
    useEffect(()=>{

Get(`/game?grade=${user?.profile?.grade?._id}`).then((d)=>{
if(d.success){

    setGames(d.data)
}else{
    displayMessage(d.message)
}
}).catch((err)=>{
    displayMessage(err.message,"error")
})
    },[])

    return (
        <div className="w-full bg-mainBg py-5 rounded-2xl gap-3 md:gap-5 flex flex-row flex-wrap justify-start items-start ">

            {
                games?.map((item, index) => (

                    <div 
                    onClick={()=> navigate(RouteName.PLAY_GAME,{state:item})}
                    id={index?.toString()} className={`text-lg min-w-[10rem] sm:min-w-[12rem] md:min-w-[14rem] lg:min-w-[12rem] 2xl:min-w-[15rem] rounded-3xl flex flex-col justify-center items-center p-2 md:p-3 cursor-pointer group hover:px-1 transition-all delay-50`}
                        style={{ backgroundColor: getRandomColor('dark', index) }} >
                        <div className="border border-white rounded-3xl w-full">
                            <img className="rounded-3xl h-16 sm:h-20 w-full md:h-24 lg:h-20 2xl:h-24 object-cover" src={item.image} />
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

        </div>
    )
}
export default Games;