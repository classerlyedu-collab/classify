import { QuizTopicsData } from "../../../../constants/student/Dashboard";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { useEffect, useState } from "react";
import { Get, ImageLink } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

interface quiztypeORM {
  createdAt: String;
  createdBy: any;
  endsAt: String;
  grade: any;
  image:string,
  questions: any;
  score: String;
  startsAt: String;
  status: String;
  subject: any;
  topic: any;
  updatedAt: any;
  _id:String
}

const QuizTopics = () => {
  const navigate = useNavigate();
  const [quizes, setQuizes] = useState<quiztypeORM[]>([]);

  const [loading, setLoading] = useState(false);

  let user = JSON.parse(localStorage.getItem("user") || "");
  useEffect(() => {
    setLoading(true);
    Get("/quiz", null, {
        grade:user?.profile?.grade?._id,
    
    limit:3,
    page:0

    //   grade: "666b510e00af65249616e24a",
    }).then((d) => {
      
      if (d.success) {
        setQuizes(d.data);
        setLoading(false);
      } else {
        // displayMessage(d.message, "error");
      }
    });
  }, []);
  return (
    <div className="w-full h-full flex flex-col md:overflow-y-auto  max-h-96">
      <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
        Recent Quizzes
      </h1>
      <div className="flex flex-row gap-3 xl:gap-5 cursor-pointer w-full overflow-x-auto md:overflow-x-hidden md:flex-wrap">
        {quizes?.map((items, index) => (
          <div
            key={index}
            onClick={
              ()=>
              {
              
                navigate(`${RouteName?.QUIZ_CONFIRMATION}?quiz=${items._id}`)
              }
            }
            className="py-4 flex flex-col justify-center items-center rounded-3xl min-w-[10rem] sm:min-w-[12rem] md:w-40 lg:max-w-40 xl:w-44 hover:opacity-75 transition-all delay-100"
            style={{
              background: getRandomColor("dark", index),
            }}
          >
            <img className="w-1/3 mb-4" src={items.image||QuizTopicsData[index%QuizTopicsData?.length]?.image} alt="image" />

            <h1 className="font-ubuntu font-medium md:text-sm text-sm text-center px-2 text-white">
              {items?.subject?.name} ({items?.topic?.name})
            </h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizTopics;
