import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { useEffect, useState } from "react";
import { getRandomColor } from "../../../utils/randomColorGenerator";
import { Get, Post } from "../../../config/apiMethods";
import { RouteName } from "../../../routes/RouteNames";
import { displayMessage } from "../../../config";
import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import { IoClose } from "react-icons/io5";
import { FaStar } from "react-icons/fa";

// Define the type for each subject within the grade
type SubjectType = {
  _id: string;
  name: string;
  image: string;
};

// Define the type for the grade, including an array of subjects
type GradeType = {
  _id: string;
  grade: string;
  subjects: SubjectType[];
};

// Define the type for the auth object
type AuthType = {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  fullAddress: string;
  image: string;
};

// Define the type for parent
type ParentType = {
  _id: string;
  auth: AuthType;
};

// Define the main type that includes auth and grade
type MainType = {
  _id: string;
  auth: AuthType;
  grade: GradeType;
  quiz: any,
  subjects: any,
  parent?: ParentType;
};

interface ParentFeedback {
  _id: string;
  teacherId: string;
  parentId: string;
  studentId: string;
  comment: string;
  stars: number;
  createdAt: string;
}

const StudentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [std, setStd] = useState<MainType | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [existingFeedback, setExistingFeedback] = useState<ParentFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (std != null) {
      Get(`/getMyChildsubjectdata/${std._id}`).then((d) => {
        if (d.success) {
          setSubjects(d.data);
        }
      });
    }
  }, [std]);

  const handleSubjectClick = (id: string) => {
    Get(`/mychildbysubject/${std?._id}?subject=${id}`)
      .then((d) => {
        if (d?.success) {
          localStorage.setItem('childResult', JSON.stringify(d.data));
          localStorage.setItem('resultHeaderTitle', `${std?.auth?.fullName ?? 'Student'} Result`);
          navigate(RouteName.CHILD_RESULT_SCREEN);
        } else {
          displayMessage('Something went wrong! Please try again later.');
        }
      })
      .catch((e) => {
        displayMessage(e.message);
      });
  };

  useEffect(() => {
    setStd(location.state);
  }, []);

  const fetchExistingFeedback = async () => {
    if (!std?.parent?._id || !std?._id) return;

    try {
      const response = await Get(`/teacher/parent-feedback/${std._id}/${std.parent._id}`);
      if (response.success) {
        setExistingFeedback(response.data);
        // setRating(response.data.stars);
        // setFeedback(response.data.comment);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    }
  };

  const handleOpenFeedback = () => {
    setShowFeedback(true);
    fetchExistingFeedback();
  };

  const handleSubmitFeedback = async () => {
    if (!rating) {
      displayMessage("Please select a rating", "error");
      return;
    }
    if (!feedback.trim()) {
      displayMessage("Please enter feedback", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        parentId: std?.parent?._id,
        studentId: std?._id,
        comment: feedback,
        stars: rating
      };

      const response = await Post("/teacher/parent-feedback", payload);
      if (response.success) {
        displayMessage("Feedback submitted successfully", "success");
        setShowFeedback(false);
        setExistingFeedback(response.data);
        setRating(0);
        setFeedback('');
      } else {
        displayMessage(response.message || "Failed to submit feedback", "error");
      }
    } catch (error) {
      displayMessage("Failed to submit feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Navbar title="Student Details" />
        </div>

        {/* center */}
        <div className="flex flex-col items-start md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit">
          <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 2xl:w-1/3 bg-white flex flex-col rounded-md pt-3">
            <img
              className="w-24 h-24 lg:w-32 lg:h-32  rounded-full self-center mb-2"
              src={std?.auth?.image}
              alt={std?.auth?.fullName || "Student"}
            />

            <div className="w-full flex flex-row items-center justify-between px-4 border-b border-gray-400 py-2">
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                Name
              </h3>
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                {std?.auth?.fullName}
              </h3>
            </div>
            <div className="w-full flex flex-row items-center justify-between px-4 border-b border-gray-400 py-2">
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                Email
              </h3>
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                {std?.auth?.email}
              </h3>
            </div>
            <div className="w-full flex flex-row items-center justify-between px-4 border-b border-gray-400 py-2">
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                Address
              </h3>
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                {std?.auth?.fullAddress ?? '-'}
              </h3>
            </div>
            <div className="w-full flex flex-row items-center justify-between px-4 border-b border-gray-400 py-2">
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                Parent
              </h3>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm md:text-base font-medium">
                  {std?.parent?.auth?.fullName ?? 'N/A'}
                </h3>
                {std?.parent && (
                  <button
                    onClick={handleOpenFeedback}
                    className="bg-primary text-white px-3 py-1 rounded-md text-xs hover:bg-primary/90"
                  >
                    Leave Feedback
                  </button>
                )}
              </div>
            </div>
            <div className="w-full flex flex-row items-center justify-between px-4 py-2">
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                Grade
              </h3>
              <h3 className="text-xs sm:text-sm md:text-base font-medium">
                {std?.grade?.grade}
              </h3>
            </div>

          </div>

          <div className="w-full px-5 mb-10">
            <h1 className="font-ubuntu text-sm md:text-base lg:text-xl font-medium text-greyBlack">Courses</h1>
            <div className="grid grid-cols-1 gap-3 mt-4">

              <div className="grid grid-cols-1 gap-3 lg:gap-5 lg:grid-cols-2 2xl:grid-cols-3 px-2 lg:col-span-6 relative" >
                {
                  subjects?.map((item: any, index: any) => (
                    <div
                      onClick={() => handleSubjectClick(item?._id)}
                      id={index?.toString()}
                      className="col-span-1 px-5 pt-5 pb-2 bg-white flex flex-col rounded-md md:rounded-lg shadow-md shadow-purple hover:shadow-greyBlack flex-wrap cursor-pointer"
                    >
                      <div className="w-full flex flex-row justify-between items-center pb-3 md:pb-6 flex-wrap" >
                        <div className="flex flex-row w-3/5 items-center" >
                          <h1 className="font-ubuntu text-sm md:text-base font-medium text-greyBlack" >{item?.name?.toUpperCase()}</h1>
                        </div>
                        <div className="w-2/5 h-full flex flex-row items-center justify-end flex-wrap" >
                          <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" >
                            <CircularProgressbarWithChildren
                              value={item.result}
                              maxValue={100}
                              minValue={0}
                              strokeWidth={8}
                              styles={buildStyles({
                                strokeLinecap: 'round',
                                pathColor: getRandomColor('dark', index),
                                trailColor: '#8C8C8C',
                                backgroundColor: '#3e98c7',
                              })}
                            >
                              <h1 className="font-ubuntu text-sm md:text-base lg:text-xl font-medium text-greyBlack" >{`${item.progress}%`}</h1>
                            </CircularProgressbarWithChildren>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))
                }
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Leave Feedback for Parent</h2>
              <button onClick={() => setShowFeedback(false)} className="text-gray-500 hover:text-gray-700">
                <IoClose size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <FaStar
                      size={24}
                      className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>

            {existingFeedback && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">Previous Feedback</h3>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={20}
                      className={star <= existingFeedback.stars ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{existingFeedback.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Given on {new Date(existingFeedback.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
