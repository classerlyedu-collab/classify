
import {
    Challenges,
    FeaturedCategories,
    FeaturedGame,
    MotivationNotice,
    RecentResults,
} from "../../../components";

const Subjects = () => {

    return (
        <div className="flex flex-col h-full w-full bg-mainBg" >




            {/* MotivationNotice, featured categories, Recent Result, Challenge & Featured Game */}
            <div className="grid grid-cols-10 gap-3 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-auto" >

                {/* Motivation Notice */}
                <div className="col-span-10 xl:col-span-9 h-auto" >
                    <MotivationNotice />
                </div>

                {/* Featured Categories */}
                <div className="col-span-10 xl:col-span-9 h-auto" >
                    <FeaturedCategories />
                </div>

                {/* Recent Result*/}
                {/* <div className="col-span-10 xl:col-span-9 h-auto" >
                    <RecentResults />
                </div> */}

                {/* Challenge & Featured Game */}
                <div className="grid grid-cols-10 gap-3 md:gap-5 col-span-10 h-auto" >

                    {/* Challenge */}
                    {/* <div className="col-span-10 sm:col-span-3 h-auto" >
                        <Challenges />
                    </div> */}

                    {/* Featured Game */}
                    <div className="col-span-10 sm:col-span-7 row-start-1 sm:row-start-auto h-auto" >
                        <FeaturedGame />
                    </div>

                </div>

            </div>

        </div>
    )
};

export default Subjects;
