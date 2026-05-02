// import { quizData } from "../../../constants/student/Dashboard";
import { getRandomColor } from "../../../utils/randomColorGenerator";
import { useEffect, useState } from "react";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

// interface subjecttypeORM {
//   createdAt: String;
//   grade: any;
//   image: string;
//   name: String;
//   topics:any;
//   updatedAt: any;
//   _id:any
// }

const Quiz = ({setIsEdit,setQuestions}:any) => {
  // const [quiz, setquiz] = useState([]);
  const [quiz, setQuiz] = useState<any[]>([]);

  const [, setLoading] = useState(false);

  let user = JSON.parse(localStorage.getItem("user") || "");
  useEffect(() => {
    setLoading(true);

    Get(`/quiz?createdBy=${user?.profile._id}`).then((d) => {
      if (d.success) {
        setQuiz(d.data);
        setLoading(false);
      } else {
        displayMessage(d.message, "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerArray = [
    "Subject",
    "Topic",

    "Lesson",
    "Questions",
    "Score",
    "",
    "",
    // "Quizzess",
    // "Status",
  ];
  return (
    <div className="w-full h-full py-5 px-4 rounded-2xl flex flex-col max-h-96 overflow-y-auto">
    
      <div className="flex flex-col w-full py-3 gap-0 px-5 overflow-x-auto">
        {/* Grid container for the column headers */}

        {/* for header */}
        <div className="w-full grid grid-cols-7 px-2 min-w-[45rem]">
          {headerArray?.map((item, index) => (
            <div
              id={`header-${index}`}
              key={index}
              className={`first:col-span-2 col-span-1`}
            >
              <h6 className="text-sm text-grey font-ubuntu font-light">
                {item}
              </h6>
            </div>
          ))}
        </div>

        {/* for body */}
        <div className="w-full grid grid-cols-7 min-w-[45rem]">
          {quiz?.length === 0 && (
            <div className="col-span-5 flex items-center pl-2">
              <h4>No any topic Found</h4>
            </div>
          )}
          {quiz?.length > 0 &&
            quiz?.map((item: any, index: any) => (
              <div
                id={`body-${index}`}
                key={index}
                className="grid mb-1 rounded-lg grid-cols-7 col-span-7 cursor-pointer mt-2 items-center p-2 transition-all delay-100"
                style={{
                  background: getRandomColor("dark", index, 0.3),
                }}
                onMouseEnter={() => {
                  const element = document.getElementById(`body-${index}`);
                  if (element) {
                    element.style.background = getRandomColor(
                      "dark",
                      index,
                      0.5
                    );
                  }
                }}
                onMouseLeave={() => {
                  const element = document.getElementById(`body-${index}`);
                  if (element) {
                    element.style.background = getRandomColor(
                      "dark",
                      index,
                      0.3
                    );
                  }
                }}
              >
                {/* Grid container for each topic item */}

                {/* Container for the topic image and name */}
                <div
                  className="col-span-2 flex items-center pl-2"
                  // onClick={() =>
                  //   navigate(`${RouteName?.LESSONS_STUDENT}?topic=${item._id}`)
                  // }
                >
                  {/* Image for the topic */}
                  {/* <img className="w-12 h-12 object-cover rounded-lg" src={
                                    item.image||
                                    yourTopicsData[index%yourTopicsData?.length].image} alt="image" /> */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      //   backgroundColor: '#ccc',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "10px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {item.subject?.name}
                  </div>

                  {/* Topic name */}
                </div>
                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold ml-2">
                    {item.topic?.name}
                  </h6>
                </div>
                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold ml-2">
                    {item.lesson?.name}
                  </h6>
                </div>

                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold">
                    {item.score}
                  </h6>
                </div>
                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold">
                    {item.questions?.length || 0}
                  </h6>
                </div>
               
                  <div className="col-span-1">
                    {/* <button
                      className="px-2 py-2 bg-white rounded-md group hover:bg-secondary transition-all delay-100 cursor-pointer"
                      onClick={() => {
                        
                        setIsEdit(true)
                        setQuestions(item.questions)
                      }}
                    >
                      <h6 className="text-xs sm:text-sm text-black font ubuntu group-hover:text-white font-medium transition-all delay-100">
                        Edit
                      </h6>
                    </button> */}
                  </div>
                  {/* <div className="col-span-1">
                    <button
                      className="px-2 py-2 bg-white rounded-md group hover:bg-secondary transition-all delay-100 cursor-pointer"
                      onClick={() => {
                        navigate(
                          `${RouteName?.QUIZ_CONFIRMATION}?topic=${item._id}`
                        );
                      }}
                    >
                      <h6 className="text-xs sm:text-sm text-black font ubuntu group-hover:text-white font-medium transition-all delay-100">
                        Delete
                      </h6>
                    </button>
                  </div> */}
              
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default Quiz;
