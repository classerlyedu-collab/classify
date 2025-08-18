import { useState } from "react";
import { Progress } from "rsuite";
import { ChildResultType } from "../../../../types/parent/ChildOverview";
import { getRandomColor } from "../../../../utils/randomColorGenerator";

interface PropsTypes {
    result: ChildResultType[] | null;
}

const LessonStatus = ({ result }: PropsTypes) => {
    const [openTopicIndex, setOpenTopicIndex] = useState<number | null>(null);

    const handleToggleLessons = (index: number) => {
        // Toggle the clicked topic, collapse others
        setOpenTopicIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <div className="w-full py-5 px-3 rounded-lg bg-white mb-3 md:mb-5 pr-10 md:pr-16">
            <h3 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack py-3 mb-2">
                Topics Progress
            </h3>

            <div className="w-full flex flex-col items-center justify-between">
                {/* Header */}
                <div className="flex flex-row items-center justify-between w-full mb-2"></div>
                <div className="flex flex-col items-center justify-between w-full mb-2">
                    <div className="grid grid-cols-12 gap-2 md:gap-5 items-center justify-between px-3 py-3 mb-2 rounded-lg w-full">
                        <p className="text-sm md:text-base col-span-1 p-greyBlack p-start font-ubuntu font-bold">#</p>
                        <p className="text-sm md:text-base col-span-5 p-greyBlack p-start font-ubuntu font-bold">Name</p>
                        <p className="text-sm md:text-base col-span-4 p-greyBlack p-start font-ubuntu font-bold">Progress</p>
                        <p className="text-sm md:text-base col-span-2 p-greyBlack p-start font-ubuntu font-bold">Action</p>
                    </div>

                    {result?.length === 0 && (
                        <p className="mt-2 text-sm sm:text-md md:text-lg text-greyBlack">Nothing to see yet!</p>
                    )}

                    {result?.map((outerItem, outerIndex) => (
                        <div key={outerIndex} className="w-full">
                            <div
                                className="grid grid-cols-12 gap-2 md:gap-5 items-center justify-between px-3 py-3 mb-2 rounded-lg w-full"
                                style={{ background: getRandomColor("dark", outerIndex, 0.3) }}
                            >
                                <p className="text-xs md:text-sm col-span-1 p-greyBlack p-start font-ubuntu font-bold">
                                    {outerIndex + 1}
                                </p>

                                <p className="text-xs md:text-sm col-span-5 p-greyBlack p-start font-ubuntu font-bold">
                                    {outerItem?.name ?? "N/A"}
                                </p>

                                <div className="col-span-4">
                                <Progress
                                    percent={
                                        outerItem.lessons && outerItem.lessons.length > 0
                                        ? Math.round(
                                            (outerItem.lessons.filter(
                                                (lesson) => lesson?.read === true
                                            ).length / outerItem.lessons.length) * 100
                                            )
                                        : 0
                                    }
                                    strokeColor={getRandomColor("dark", outerIndex, 1)}
                                    />
                                </div>

                                <p
                                    onClick={() => handleToggleLessons(outerIndex)}
                                    className="text-xs md:text-sm col-span-2 p-greyBlack p-start font-ubuntu font-bold cursor-pointer"
                                >
                                    {openTopicIndex === outerIndex ? "Hide Lessons" : "Show Lessons"}
                                </p>
                            </div>

                            {/* Lessons list, shown if this topic is active */}
                            {openTopicIndex === outerIndex &&
                                outerItem?.lessons?.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-12 ml-10 md:ml-16 gap-2 md:gap-5 items-center justify-between px-3 py-3 mb-2 rounded-lg w-8/12"
                                        style={{ background: getRandomColor("dark", outerIndex, 0.3) }}
                                    >
                                        <p className="text-xs md:text-sm col-span-1 p-greyBlack p-start font-ubuntu font-bold">
                                            {outerIndex + 1}.{index + 1}
                                        </p>

                                        <p className="text-xs md:text-sm col-span-4 p-greyBlack p-start font-ubuntu font-bold">
                                            {item?.name ?? "N/A"}
                                        </p>

                                        <p className="text-xs md:text-sm col-span-3 p-greyBlack p-start font-ubuntu">
                                           {item.read?"20":"0"} Minutes Spent
                                        </p>
                                        <div className="col-span-4">
                                            <Progress.Line
                                                strokeColor={getRandomColor("dark", outerIndex, 0.8)}
                                                percent={item.read?100:0}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LessonStatus;