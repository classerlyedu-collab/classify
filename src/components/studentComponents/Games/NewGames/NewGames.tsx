import { newGamesData } from "../../../../constants/student/Games";
import { MdNewReleases } from "react-icons/md";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

const NewGames = () => {

    return (
        <div className="flex flex-col sm:flex-row md:flex-col items-start gap-3 sm:gap-10 md:gap-5 justify-start mx-7 sm:mx-5 mt-2" >
            {
                newGamesData?.map((item, index) => (
                    <div
                        style={{
                            background: getRandomColor('dark', index, 0.8),
                            borderTopRightRadius: '40px',
                            borderBottomRightRadius: '40px',
                            borderTopLeftRadius: '30px',
                            borderBottomLeftRadius: '30px',
                        }}
                        className="w-full max-w-64 md:max-w-80"
                    >
                        <MdNewReleases className="text-5xl z-10 -translate-x-4 -translate-y-4" style={{
                            color: getRandomColor('dark', index + 1)
                        }} />

                        <div className="grid grid-cols-10" >

                            <div className="col-span-7 h-fit  flex flex-col items-start justify-start pl-5" >
                                <h1 className="font-ubuntu font-semibold text-sm md:text-base lg:text-sm xl:text-base text-white  mb-2">{item?.title}</h1>
                                <h1 className="font-ubuntu font-medium text-xs md:text-sm lg:text-xs xl:text-sm text-mainBg  mb-2">{item?.message}</h1>

                                <div className="bg-[#E4C9FC] px-2 sm:px-4 lg:px-6 py-2 rounded-full flex items-center self-center  justify-center group cursor-pointer mr-1 hover:bg-white hover:border border-greyBlack transition-all delay-100 my-4">
                                    <h1 className="font-ubuntu font-medium text-xs xl:text-sm text-greyBlack group-hover:text-greyBlack transition-all delay-100">Play Now</h1>
                                </div>

                            </div>

                            <div className="col-span-3  h-fit translate-x-7 -translate-y-2 rounded-3xl border-2 z-10 border-red-600" style={{
                                borderRadius: '32px'
                            }} >
                                <img src={item?.imageUrl} alt={item?.title} className="w-full h-20 rounded-2xl z-2 object-cover" style={{
                                    borderRadius: '30px'
                                }} />
                            </div>


                        </div>
                    </div>
                ))
            }
        </div>
    )
}
export default NewGames;