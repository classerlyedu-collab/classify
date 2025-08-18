import { TiStar } from "react-icons/ti";
import { RatingData } from "../../../../constants/Teacher/MyStudents";
import { Container, Progress } from "rsuite";
const TeacherRating = () => {
    
    let user = JSON.parse(localStorage.getItem("user") || "{}");

    
    // Safely access counts or provide default values
    let counts = user?.profile?.feedback?.counts || {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
    };
    
    let total = counts["1"] + counts["2"] + counts["3"] + counts["4"] + counts["5"];
    
    let ratings = [
        {
            stars: '5 Stars',
            percentage: counts["5"],
        },
        {
            stars: '4 Stars',
            percentage: counts["4"],
        },
        {
            stars: '3 Stars',
            percentage: counts["3"],
        },
        {
            stars: '2 Stars',
            percentage: counts["2"], // fixed this one, was using ["3"] again before
        },
        {
            stars: '1 Star',
            percentage: counts["1"],
        },
    ];
    

    return (
        <div className="bg-white flex flex-col justify-center items-center rounded-2xl pt-4" >
            {/* for heading */}
            <div className="flex justify-center items-center border-b border-greyBlack w-11/12">
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2 md:mb-2">Your Profile Ratings</h1>
            </div>
            {/* div for stars */}
            <div className="flex flex-row justify-center items-center flex-wrap rounded-full bg-[#F5F8FF] w-11/12 mt-4 py-3">
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-300 text-3xl" />
                <TiStar className="text-yellow-200 text-3xl" />
                <h3 className="font-ubuntu font-medium text-sm text-greyBlack">
                    {user?.profile?.feedback?.average ?? 'N/A'} out of 5
                    </h3>            
                </div>

            <h1 className="font-ubuntu font-medium text-xs md:text-sm text-greyBlack mb-2 md:mb-2 pt-2">{total}+ Students Reviews</h1>

            {/* div for ratings */}
            <div className="w-full px-3 pb-3" >

                {
                    ratings?.map((items, index) => (
                        <div className="flex flex-row justify-between w-full items-center mb-2 flex-wrap">
                            <h3 className="font-ubuntu font-medium text-xs text-[#0674F8]">{items.stars}</h3>
                            <Container>
                                <Progress.Line
                                    percent={items?.percentage}
                                    strokeColor="#13D360"
                                    color="#E7FBEF"
                                    strokeWidth={12}
                                    trailColor="#E7FBEF"
                                />
                            </Container>
                        </div>
                    ))
                }

                {/* <h3 className="font-ubuntu font-medium text-sm text-[#0674F8] w-full text-center mt-3 cursor-pointer">How do we calculate ratings?</h3> */}

            </div>
        </div>
    )
}
export default TeacherRating