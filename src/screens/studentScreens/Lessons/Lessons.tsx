import { AboutLessons, ChooseLessons } from "../../../components";

const Lessons = () => {

    return (
        <div className="grid grid-cols-10 gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit" >

            <div className="col-span-10 md:col-span-10 h-fit" >
                <ChooseLessons />
            </div>

            {/* <div className="col-span-10 md:col-span-4 h-fit" >
                <AboutLessons />
            </div> */}

        </div>
    )
};

export default Lessons;
