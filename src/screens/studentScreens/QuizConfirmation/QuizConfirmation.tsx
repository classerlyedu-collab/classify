import { useNavigate, useSearchParams } from "react-router-dom";
import { GiTeacher } from "react-icons/gi";
import { RouteName } from "../../../routes/RouteNames";
import { useEffect, useState } from "react";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

const QuizConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quizdata, setQuizData] = useState<any>({})
  const [quizes, setQuizes] = useState<any[]>([])


  useEffect(() => {

    const quiz = searchParams.get('quiz');
    const topic = searchParams.get('topic');
    const lesson = searchParams.get('lesson');
    Get(`/quiz?_id=${quiz}&topic=${topic}&lesson=${lesson}`).then((d) => {
      if (d.success) {
        setQuizes(d.data)
        setQuizData(d.data[0])
      } else {
        displayMessage(d.message)
      }
    })
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit bg-mainBg rounded-2xl p-5 xl:p-8 2xl:p-10">
      {/* Lessons */}
      <div className="col-span-1 flex flex-row justify-between items-center p-4 shadow-lg bg-white">
        {quizes.length > 1 &&
          <div className="border border-greyBlack rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-bluecolor group hover:border-transparent transition-all delay-100">
            <h1 className="font-ubuntu font-medium md:text-base text-xs text-greyBlack group-hover:text-white transition-all delay-100" onClick={(e) => {
              let i = quizes.findIndex((j: any) => { return j._id === quizdata._id })

              if (i !== 0) {
                setQuizData(quizes[i - 1])
              }
            }}>
              Prev Lesson
            </h1>
          </div>
        }

        <div className="w-1/2 sm:w-auto">
          <h1 className="font-ubuntu font-medium md:text-base text-xs text-greyBlack">
            Lesson : {quizdata?.lesson?.name}
          </h1>
        </div>
        {quizes.length > 1 &&
          <div className="border border-greyBlack rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-bluecolor group hover:border-transparent transition-all delay-100">
            <h1 className="font-ubuntu font-medium md:text-base text-xs text-greyBlack group-hover:text-white transition-all delay-100" onClick={(e) => {
              let i = quizes.findIndex((j: any) => { return j._id === quizdata._id })
              if (i !== quizes.length - 1) {
                setQuizData(quizes[i + 1])
              }
            }}>
              Next Lesson
            </h1>
          </div>
        }

      </div>

      {/* Confirmation */}
      <div className="col-span-1 bg-white h-full py-10">
        <div className="flex flex-col justify-center items-center w-full">
          <GiTeacher className="w-32 h-32 md:w-40 md:h-40 mb-4 text-grey" />

          <div className="flex flex-col justify-center items-center w-full">
            <h1 className="font-ubuntu font-medium md:text-xl text-base text-black text-center">
              Ready For Quiz
            </h1>
            <h1 className="font-ubuntu font-medium md:text-sm text-xs text-greyBlack text-center max-w-64">
              Test yourself in this course and increase your knowledge for what
              you already know.
            </h1>
            <h1 className="font-ubuntu font-medium md:text-sm text-xs text-black pt-3 text-center">
              {quizdata?.questions?.length} Questions
              <span className="pl-2">{quizdata?.questions?.length * 30
                //               .reduce((accumulator: any, currentObject: { time: any; }) => {
                //   return accumulator + currentObject.time;
                // }, 0)/60
              } Seconds</span>
            </h1>
            <div className="rounded-md cursor-pointer bg-[#FF8000] px-3 py-2 mt-2 hover:opacity-80">
              <h1 className="font-ubuntu font-medium text-sm text-white"
                onClick={() => {
                  Post(`/quiz/student/${quizdata._id}?status=start`).then((d) => {

                    if (d.success) {

                      navigate(RouteName?.SOLO_QUIZ, { state: quizdata })
                    } else {
                      displayMessage(d.message, "error")
                    }
                  })
                  // localStorage.setItem("quiz",JSON.stringify(quizdata))
                }
                }
              >
                Let's Start
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizConfirmation;
