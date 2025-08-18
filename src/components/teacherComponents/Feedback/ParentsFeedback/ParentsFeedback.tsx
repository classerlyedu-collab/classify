import { TeaherRemarksobj } from "../../../../constants/parent/myChildren";
  
const ParentsFeedback = ({feedbacks}:any) => {
    return (
        <div className="w-full h-full bg-mainBg rounded-2xl">
            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2 md:mb-4">Students Feedback</h1>
            <div >
                {
                    feedbacks?.map((item:any, index:any) => (
                        <div className="flex flex-row flex-wrap w-full justify-between items-center mb-3 md:mb-3 bg-white shadow-md shadow-gray-500 py-2 md:py-6 rounded-md px-2 md:px-4" >
                            <div className="flex items-center justify-center flex-wrap" >
                                <div className="flex justify-center items-center mr-2 md:mr-4">
                                    <img src={item?.from?.auth?.image||"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOv_u8GVtyFUAmcyf-CYkzQLm1F8eLCAZpEw&s"} className="w-20 rounded-full" />
                                </div>
                                <div className="flex flex-col justify-start items-start" >
                                    <div className="flex flex-row justify-start items-center">

                                        <div className="flex flex-col justify-center justify-items-center">
                                            <h1 className="font-ubuntu font-medium text-purple-600 text-base md:text-lg text-purple ">{item?.from?.auth?.userName}</h1>
                                            <h1 className="font-medium text-xs md:text-sm ">{item?.createdAt.split(".")[0].split("T").join(" ")}</h1>
                                        </div>
                                    </div>

                                    <div className="flex flex-row h-full w-full md:w-auto items-end mt-3 md:mt-0">
                                        {Array.from({ length: item?.star}).map((_, index) => (
                                            <img
                                                key={index}
                                                src={require('../../../../images/myChildren/star.png')}
                                                className="h-4 w-4 md:h-6 md:w-6"
                                                alt="star"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-center items-center h-full text-greyBlack mt-3 lg:mt-0 mx-auto w-full lg:w-1/2 2xl:w-2/3">
                                <h1 className="font-ubuntu font-semibold text-sm text-gray-600 text-center">" {item.feedback} "</h1>
                            </div>

                        </div>
                    ))
                }
            </div>
        </div>
    )
}
export default ParentsFeedback