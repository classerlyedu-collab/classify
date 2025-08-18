import { useState, useEffect } from "react";
import {
  BodySoloQuiz,
  FooterSoloQuiz,
  HeaderSoloQuiz,
} from "../../../components";
import { quizQuestionsData } from "../../../constants/student/Quiz";
import { useLocation, useNavigate } from "react-router-dom";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";

const SoloQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(15);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const questionTime = 30;
  const location = useLocation();
  const [quizdata, setQuizData] = useState<any>(location.state);
//   useEffect(() => {
//     const data = location.state;

//     // let q: any = localStorage.getItem("quiz");

//     setQuizData(data);

//   }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          handleNextQuestion();
          return questionTime; // Reset timer for next question
        }
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup the timer
  }, [currentQuestion]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    setSelectedAnswers((prev) => [
      ...prev,
      selectedAnswer ? selectedAnswer : "",
    ]);
    
    Post(`/quiz/student/a/${quizdata._id}`, {
      answer: selectedAnswer,
      index: currentQuestion,
    }).then((d) => {
      if (d.success) {
        setSelectedAnswer(null);
        //   navigate(RouteName?.SOLO_QUIZ,{state:quizdata})
      } else {
        displayMessage(d.message);
      }
    });

    if (currentQuestion < quizdata.questions?.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeRemaining(questionTime); // Reset timer for next question
    } else {
      Post(`/quiz/student/${quizdata._id}?status=end`).then((d) => {
        if (d.success) {
            alert(`You scored ${d.data?.marks} out of ${d.data?.score}`);
            navigate(RouteName?.DASHBOARD_SCREEN_STUDENT,{state:quizdata})
        } else {
          displayMessage(d.message);
        }
      });
      // Calculate score and alert result
    //   const score = selectedAnswers.reduce((total, answer, index) => {
    //     const question = quizQuestionsData[index];
    //     if (question && answer === question.correctAnswer) {
    //       return total + 1;
    //     }
    //     return total;
    //   }, 0);
    }
  };

  return (
    <div className="grid grid-cols-1 select-none gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit bg-white rounded-2xl p-5 xl:p-8 2xl:p-14">
      {/* header */}
      <div className="col-span-1">
        <HeaderSoloQuiz
          currentQuestion={currentQuestion}
          totalQuestions={quizdata?.length}
          timeRemaining={timeRemaining}
        />
      </div>

      {/* body */}
      <div className="col-span-1">
        <BodySoloQuiz
          currentQuestionData={quizdata.questions?.length>0? quizdata.questions[currentQuestion]:[]}
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          quizQuestionsData={quizdata.questions}
          handleSelectAnswer={handleSelectAnswer}
          handleNextQuestion={handleNextQuestion}
          dataLength={quizdata.questions?.length}
        />
      </div>

      {/* footer */}
      <div className="col-span-1">
        <FooterSoloQuiz
          currentQuestion={currentQuestion}
          totalQuestions={quizdata.questions?.length}
        />
      </div>
    </div>
  );
};

export default SoloQuiz;
