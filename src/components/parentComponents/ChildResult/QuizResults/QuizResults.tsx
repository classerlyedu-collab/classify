import { ChildResultType } from "../../../../types/parent/ChildOverview";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

interface PropsTypes {
    result: ChildResultType[] | null
};

const QuizResults = ({
    result
}: PropsTypes) => {


    let cusomindex = 1;

    return (
        <div className={`w-full py-5 px-3 rounded-lg bg-white mb-4 md:mb-6`}>
            <h3 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack py-3 mb-2">
                Quizzes Result
            </h3>

            <div className={`w-full flex flex-col items-center justify-between`} >
                {/* Header */}
                <div className={`flex flex-row items-center justify-between w-full mb-2`}>

                </div>
                <div className={`flex flex-col items-center justify-between w-full mb-2`}>
                    <div
                        className="flex flex-row items-center justify-between px-3 py-3 mb-2 rounded-lg w-full"
                    >

                        <p className={`text-sm md:text-base w-1/4 p-greyBlack p-start font-ubuntu font-bold`}>
                            Topic
                        </p>

                        <p className={`text-sm md:text-base w-1/4 p-greyBlack p-start font-ubuntu font-bold`}>
                            Obtained Marks
                        </p>

                        <p className={`text-sm md:text-base w-1/4 p-greyBlack p-start font-ubuntu font-bold`}>
                            Total Marks
                        </p>

                        <p className={`text-sm md:text-base w-1/4 p-greyBlack p-start font-ubuntu font-bold`}>
                            Status
                        </p>


                    </div>
                    {
                        result?.length === 0 && (<p className="mt-2 text-sm sm:text-md md:text-lg text-greyBlack">Nothing to see yet!</p>)
                    }
                    {
                        result?.map((outerItem, outerIndex) => (
                            <>
                                {/* Body */}
                                {outerItem?.quizes?.map((middleItem, middleIndex) => (
                                    <>
                                        {
                                            middleItem?.studentQuizData?.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-row items-center justify-between px-3 py-3 mb-2 rounded-lg w-full gap-2 md:gap-4"
                                                    style={{ background: getRandomColor('dark', cusomindex, 0.3) }}
                                                >

                                                    <p className={`text-xs md:text-sm w-1/4 p-greyBlack p-start font-ubuntu font-bold`}>
                                                        {outerItem?.name ?? 'N/A'}
                                                    </p>

                                                    <p className={`text-xs md:text-sm w-1/4 p-greyBlack p-start font-ubuntu font-bold`}>
                                                        {item?.marks ?? 'N/A'}
                                                    </p>

                                                    <p className={`text-xs md:text-sm w-1/4 p-greyBlack p-start font-ubuntu font-bold`}>
                                                        {item?.score ?? 'N/A'}
                                                    </p>

                                                    <p className={`text-xs md:text-sm w-1/4 p-greyBlack p-start font-ubuntu font-bold `}>
                                                        {item?.result === 'pass' ? 'Passed' : 'Failed'}
                                                    </p>

                                                </div>
                                            ))
                                        }
                                    </>
                                ))}
                            </>
                        ))
                    }

                </div>



            </div>
        </div>
    )
};

export default QuizResults;