import { useNavigate } from "react-router-dom";
import { featuredArray } from "../../../../constants/student/Subjects";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { RouteName } from "../../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get, ImageLink } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

interface subjecttypeORM {
    createdAt: String;
    grade: any;
    image: string;
    name: String;
    topics: any;
    updatedAt: any;
    _id: any
}
const FeaturedCategories = () => {

    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<subjecttypeORM[]>([]);

    const [loading, setLoading] = useState(false);

    let user = JSON.parse(localStorage.getItem("user") || "");
    useEffect(() => {
        setLoading(true);
        let grade = ""


        if (user?.userType == "Teacher") {

            grade = user?.profile?.grade.map((i: any) => { return i._id }).join(",")

        } else {
            grade = user?.profile?.grade?._id

        }



        Get(`/subject/grade/${grade}`).then((d) => {
            if (d.success) {
                setSubjects(d.data);
                setLoading(false);
            } else {
                displayMessage(d.message, "error");
            }
        });
    }, []);
    return (
        <div className="rounded-2xl pl-4 w-full max-h-96 overflow-y-auto">
            <div className="flex flex-row items-center justify-between" >
                <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">Featured Categories</h1>
                <button
                    onClick={() => navigate(RouteName.STUDENT_FEEDBACK)}
                    className="border border-greyBlack mr-2 rounded-md hover:border-none hover:bg-secondary px-1.5 py-1.5 hover:text-white transition-all delay-100"
                >
                    Feedback
                </button>
            </div>
            <div className="flex flex-row w-full justify-start gap-8 pt-2 flex-wrap">
                {
                    subjects?.map((item, index) => (
                        <div
                            id={index?.toString()}
                            onClick={() => {
                                localStorage.setItem("subject", JSON.stringify(item))
                                navigate(`${RouteName?.TOPICS_SUBJECTS}?subject=${item._id}`)


                            }

                            }
                            className="flex flex-col group justify-center items-center cursor-pointer "
                        >
                            <div className="flex w-20 sm:w-28 h-20 sm:h-28 justify-center items-center rounded-3xl" style={{ background: getRandomColor('dark', index) }}>
                                <img className="w-4/5  object-contain"
                                    src={item.image || featuredArray[index % featuredArray?.length].img}
                                    alt="featured-category-image" />
                            </div>
                            <div className="pt-2">
                                <h6 className="font-ubuntu group-hover:text-purple text-greyBlack text-sm font-medium">{item.name?.length > 12 ? item.name.slice(0, 10) : item.name}</h6>
                            </div>
                        </div>

                    ))
                }
            </div>
        </div>
    )
}
export default FeaturedCategories;