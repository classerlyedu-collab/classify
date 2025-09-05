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
  const [randomQuestions, setRandomQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Select random 10 questions when component mounts
  useEffect(() => {
    if (quizdata?.questions && quizdata.questions.length > 0) {
      // Shuffle and select random 10 questions
      const shuffled = [...quizdata.questions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 10);
      setRandomQuestions(selectedQuestions);
      setIsLoading(false);
    }
  }, [quizdata]);

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

    // Find the original index of the current random question in the original questions array
    const currentRandomQuestion = randomQuestions[currentQuestion];
    const originalIndex = quizdata.questions?.findIndex((q: any) => q._id === currentRandomQuestion._id) || currentQuestion;

    Post(`/quiz/student/a/${quizdata._id}`, {
      answer: selectedAnswer,
      index: originalIndex,
    }).then((d) => {
      if (d.success) {
        setSelectedAnswer(null);
        //   navigate(RouteName?.SOLO_QUIZ,{state:quizdata})
      } else {
        displayMessage(d.message);
      }
    });

    if (currentQuestion < randomQuestions?.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeRemaining(questionTime); // Reset timer for next question
    } else {
      Post(`/quiz/student/${quizdata._id}?status=end`).then((d) => {
        if (d.success) {
          // Navigate to result page with quiz data and results
          navigate(RouteName?.QUIZ_RESULT, {
            state: {
              marks: d.data?.marks,
              score: d.data?.score,
              result: d.data?.result,
              quizData: quizdata,
              totalQuestions: d.data?.totalQuestions,
              totalQuizQuestions: d.data?.totalQuizQuestions
            }
          });
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

  // Show loading screen while selecting random questions
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Preparing Your Quiz</h2>
          <p className="text-gray-600">Selecting 10 random questions for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 select-none gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit bg-white rounded-2xl p-5 xl:p-8 2xl:p-14">
      {/* header */}
      <div className="col-span-1">
        <HeaderSoloQuiz
          currentQuestion={currentQuestion}
          totalQuestions={randomQuestions?.length || 0}
          timeRemaining={timeRemaining}
        />
      </div>

      {/* body */}
      <div className="col-span-1">
        <BodySoloQuiz
          currentQuestionData={randomQuestions?.length > 0 ? randomQuestions[currentQuestion] : []}
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          quizQuestionsData={randomQuestions}
          handleSelectAnswer={handleSelectAnswer}
          handleNextQuestion={handleNextQuestion}
          dataLength={randomQuestions?.length || 0}
        />
      </div>

      {/* footer */}
      <div className="col-span-1">
        <FooterSoloQuiz
          currentQuestion={currentQuestion}
          totalQuestions={randomQuestions?.length || 0}
        />
      </div>
    </div>
  );
};

export default SoloQuiz;
