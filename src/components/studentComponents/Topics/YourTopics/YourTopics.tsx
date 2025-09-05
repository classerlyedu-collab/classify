import { useNavigate } from "react-router-dom";
import { yourTopicsData } from "../../../../constants/student/Subjects"; // Importing topics data from the constants
import { getRandomColor } from "../../../../utils/randomColorGenerator"; // Importing a utility function to get a random color
import { RouteName } from "../../../../routes/RouteNames";
import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";
import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

// interface topictypeORM {
//   name: String;
//   image: string;
//   lessons: any;
//   quizes: any;
//   practices: any;
//   difficulty: String;
//   _id: any;
// }

const YourTopics = ({ topic }: any) => {
  const navigate = useNavigate();

  const studentHeaderArray = [
    "Topic Name",
    "Difficulty",
    "Lessons",
    "Practice",
    "Quizzes",
    "Status",
  ];

  const headerArray = [
    "Topic Name",
    "Difficulty",
    "Lessons",
    "Practice",
    "Quizzes"
  ];
  // const [topic, setTopics] = useState<topictypeORM[]>([]);
  // const [searchParams] = useSearchParams();

  // useEffect(() => {
  //   const subject = searchParams.get("subject");

  //   Get(`/topic?subject=${subject}`).then((d) => {

  //     if (d.success) {
  //       setTopics(d.data);
  //     } else {
  //       displayMessage(d.message);
  //     }
  //   });
  //   // Function to update the current index every 4 seconds

  //   // Cleanup interval on component unmount
  //   // return () => clearInterval(interval);
  // }, []);

  let user = JSON.parse(localStorage.getItem("user") || "");


  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-md">
      {/* Container for the entire component */}

      <h1 className="font-ubuntu font-medium text-base md:text-xl ml-5 py-4 text-greyBlack">
        Your Topics
      </h1>
      {/* Header for the component */}

      <div className="flex flex-col w-full py-3 gap-0 px-5 overflow-x-auto">
        {/* Grid container for the column headers */}

        {/* for header */}
        <div className="w-full grid grid-cols-7 px-2 min-w-[45rem]">
          {user.userType === 'Student' && studentHeaderArray?.map((item, index) => (
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
          {user.userType !== 'Student' && headerArray?.map((item, index) => (
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
          {topic?.length == 0 && (
            <div
              className="col-span-5 flex items-center pl-2"

            >

              <h4>No any topic Found</h4>
            </div>
          )}
          {
            topic?.length > 0 && topic?.map((item: any, index: any) => (
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
                    element.style.background = getRandomColor("dark", index, 0.5);
                  }
                }}
                onMouseLeave={() => {
                  const element = document.getElementById(`body-${index}`);
                  if (element) {
                    element.style.background = getRandomColor("dark", index, 0.3);
                  }
                }}
              >
                {/* Grid container for each topic item */}

                {/* Container for the topic image and name */}
                <div
                  className="col-span-2 flex items-center pl-2"
                  onClick={() =>
                    navigate(`${RouteName?.LESSONS_STUDENT}?topic=${item._id}`)
                  }
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
                    {item.name?.substring(0, 2)}
                  </div>

                  {/* Topic name */}
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold ml-2">
                    {item.name}
                  </h6>
                </div>

                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold">
                    {item.difficulty}
                  </h6>
                </div>
                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold">
                    {item.lessons?.length || 0}
                  </h6>
                </div>
                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold">
                    {item.practices?.length || 0}
                  </h6>
                </div>
                <div className="col-span-1">
                  <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold">
                    {item.quizes?.length || 0}
                  </h6>
                </div>
                {
                  user.userType === 'Student' && (
                    <div className="col-span-1">
                      <h6 className="text-xs sm:text-sm text-greyBlack font ubuntu font-bold">
                        {/* {yourTopicsData[index % yourTopicsData?.length].status} */}
                        {item.status}
                      </h6>
                    </div>
                  )
                }

                {user.userType === "Student" &&
                  (
                    <div className="col-span-1 flex items-start justify-start">
                      {item.quizes?.length > 0 && item?.quizes[0]?._id && (
                        <button
                          className="px-2 py-2 bg-white rounded-md group hover:bg-secondary transition-all delay-100 cursor-pointer"
                          onClick={() => {
                            navigate(
                              `${RouteName?.QUIZ_CONFIRMATION}?topic=${item._id}`
                            );
                          }}
                        >
                          <h6 className="text-xs sm:text-sm text-black font ubuntu group-hover:text-white font-medium transition-all delay-100">
                            Start Quiz
                          </h6>
                        </button>
                      )}
                    </div>
                  )
                }
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default YourTopics;
