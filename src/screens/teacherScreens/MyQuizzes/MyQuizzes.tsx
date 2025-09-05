import { Navbar, SideDrawer } from "../../../components";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get, Delete } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

const MyQuizzes = () => {

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
  const [dummyQuizzes, setdummyQuizzes] = useState<any[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; quizId: string | null; quizTitle: string }>({
    show: false,
    quizId: null,
    quizTitle: ""
  })

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

  useEffect(() => {

    Get(`/quiz?createdBy=${user.profile._id}`).then((d) => {


      if (d.success) {
        setdummyQuizzes(d.data
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
  }, [])

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    setDeleteConfirm({
      show: true,
      quizId,
      quizTitle: quizTitle || "this quiz"
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.quizId) return;

    try {
      const response = await Delete(`/quiz/teacher/${deleteConfirm.quizId}`);
      if (response.success) {
        displayMessage("Quiz deleted successfully", "success");
        // Refresh the quiz list
        const user = JSON.parse(localStorage.getItem("user") || "");
        Get(`/quiz?createdBy=${user.profile._id}`).then((d) => {
          if (d.success) {
            setdummyQuizzes(d.data);
          }
        });
      } else {
        displayMessage(response.message || "Failed to delete quiz", "error");
      }
    } catch (error) {
      displayMessage("Failed to delete quiz", "error");
    } finally {
      setDeleteConfirm({ show: false, quizId: null, quizTitle: "" });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, quizId: null, quizTitle: "" });
  };

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
          <Navbar title="Quizzes" hideSearchBar />
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
              {dummyQuizzes?.map((item, index) => (
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
                  <div className="col-span-1 flex gap-1">
                    <div className="bg-blue-500 px-2 py-1 rounded-md hover:opacity-80 cursor-pointer"
                      onClick={() => navigate(RouteName.UPDATE_QUIZ, { state: item })}
                    >
                      <p className="text-xs sm:text-sm font-semibold text-white">Edit</p>
                    </div>
                    <div className="bg-red-500 px-2 py-1 rounded-md hover:opacity-80 cursor-pointer"
                      onClick={() => handleDeleteQuiz(item._id, item.title || `${item.subject?.name} - ${item.topic?.name}`)}
                    >
                      <p className="text-xs sm:text-sm font-semibold text-white">Delete</p>
                    </div>
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.quizTitle}"</strong>?
              This action cannot be undone and will also delete all student attempts for this quiz.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyQuizzes;
