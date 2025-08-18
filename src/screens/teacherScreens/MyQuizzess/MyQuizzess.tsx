import { Navbar, SideDrawer } from "../../../components";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

const MyQuizzess = () => {

  const navigate = useNavigate();

  const headerArray = [
    "#",
    "Grade",
    "Type",
    "Subject",
    "Topic",
    "Lesson",
    "Action",
  ];
const [dummyQuizzess,setdummyQuizzess] = useState<any[]>([])
  
// const dummyQuizzess = [
//     {
//       grade: 9,
//       subject: 'Science',
//       Topic: 'Topic Name',
//       Lesson: 'Lesson name'
//     },
//     {
//       grade: 9,
//       subject: 'Science',
//       Topic: 'Topic Name',
//       Lesson: 'Lesson name'
//     },
//     {
//       grade: 9,
//       subject: 'Science',
//       Topic: 'Topic Name',
//       Lesson: 'Lesson name'
//     },
//     {
//       grade: 9,
//       subject: 'Science',
//       Topic: 'Topic Name',
//       Lesson: 'Lesson name'
//     },
//   ];
  let user = JSON.parse(localStorage.getItem("user") || "");

  useEffect(()=>{

    Get(`/quiz?createdBy=${user.profile._id}`).then((d) => {
      
      
        if (d.success) {
        setdummyQuizzess(d.data
        //   .map((i:any)=>{
        //   return {grade: i?.grade?.grade,
        //         subject: i?.subject?.name,
        //         Topic: i?.topic?.name,
        //         Lesson: i?.lesson?.name,type:i.type,...i}
        // })
        );
      } else {

        displayMessage(d.message, "error");
      }
    });
  },[])

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* for left side */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-mainBg">
        {/* 1st Navbar */}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
          <Navbar title="Quizzess" hideSearchBar />
        </div>

        {/* center */}
        <div className="grid grid-cols-10 flex-col gap-5 px-1 md:px-5 mb-2 md:mb-6 bg-mainBg h-fit pb-10">

          <div className="col-span-10 gap-3 flex flex-col items-center justify-between">
            <div className="w-full grid grid-cols-12 flex-row items-center justify-between">
              {headerArray?.map((item, index) => (
                <div
                  id={`header-${index}`}
                  key={index}
                  className={`first:col-span-1 col-span-2 last:col-span-1`}
                >
                  <h6 className="text-sm text-grey font-ubuntu font-light">
                    {item}
                  </h6>
                </div>
              ))}
            </div>

            <div className="w-full flex flex-col gap-2">
              {dummyQuizzess?.map((item, index) => (
                <div className="w-full flex-row grid grid-cols-12 items-center justify-between">
                  <h6 className="text-xs sm:text-sm text-greyBlack col-span-1 font-ubuntu font-light">
                    {index + 1}
                  </h6>
                  <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                    {item?.grade?.grade}
                  </h6>
                  <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                    {item?.type}
                  </h6>
                  <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                    {item?.subject?.name}
                  </h6>
                  <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                    {item?.topic?.name}
                  </h6>
                  <h6 className="text-xs sm:text-sm text-greyBlack col-span-2 font-ubuntu font-light">
                    {item?.lesson?.name}
                  </h6>
                  <div className="bg-primary px-2 py-1 col-span-1 max-w-16 rounded-md hover:opacity-80 cursor-pointer"
                    onClick={() => navigate(RouteName.UPDATE_QUIZ,{state:item})}
                  >
                    <p className="text-xs sm:text-sm font-semibold text-white">Details</p>
                  </div>
                </div>
              ))}
            </div>

          </div>


          <div className="absolute md:bottom-10 right-5 bottom-5 md:right-10 sm:col-span-5 row-start-1 md:row-start-auto md:col-span-2 flex flex-row items-start justify-center" >
            <div className="bg-secondary px-4 py-2 rounded-md hover:opacity-80 cursor-pointer"
              onClick={() => navigate(RouteName.ADD_QUIZ)}
            >
              <p className="text-sm md:text-base font-semibold text-white">Add Quiz</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MyQuizzess;
