import { useEffect, useState } from "react";
import {
  Navbar,
  ParentsFeedback,
  SideDrawer,
  TeacherProfile,
  TeacherRating,
} from "../../../components";
import { displayMessage } from "../../../config";
import { Get } from "../../../config/apiMethods";

const Feedback = () => {
  const [feedbacks, setFeedback] = useState();
  useEffect(() => {
    Get("/teacher/feedback").then((d) => {
      
        if (d.success) {
        setFeedback(d.data);
      } else {

        displayMessage(d.message, "error");
      }
    });
  }, []);
  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* for left side  */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg">
        {/* 1st Navbar*/}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
          <Navbar title="Feedback" />
        </div>

        {/* center */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 md:gap-5 w-full mb-2 md:mb-6 border2 border-black h-fit">
          <div className="col-span-1 grid grid-cols-1 gap-3 md:gap-5 sm:grid-cols-2 md:grid-cols-1  md:col-span-3 h-fit">
            {/* Profile */}
            <div className=" col-span-1 h-fit">
              <TeacherProfile />
            </div>

            {/* Rating */}
            <div className="py-10 col-span-1 h-fit">
              <TeacherRating />
            </div>
          </div>

          {/* Feedback */}
          <div className="col-span-1 md:col-span-8 h-fit">
            <ParentsFeedback feedbacks={feedbacks}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
