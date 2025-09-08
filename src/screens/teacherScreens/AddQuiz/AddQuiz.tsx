import { useEffect, useState } from "react";
import { CustomInput, DropDown, Navbar, SideDrawer } from "../../../components";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { Quiz } from "../../../components/teacherComponents/Quiz";

const Courses = () => {
  const [questionName, setQuestionName] = useState<string>("");
  const [optionA, setOptionA] = useState<string>("");
  const [optionB, setOptionB] = useState<string>("");
  const [optionC, setOptionC] = useState<string>("");
  const [optionD, setOptionD] = useState<string>("");
  const [gradedata, setGradeData] = useState<any[]>([]);
  const [subjectdata, setSubjectData] = useState<any[]>([]);
  const [topicdata, setTopicData] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lesson, setLesson] = useState<string | number | null>(null)
  const [topic, setTopic] = useState<string | number | null>(null);
  const [subject, setSubject] = useState<string | number | null>(null);
  const [grade, setGrade] = useState<string | number | null>(null);
  const [quizType, setQuizType] = useState<string | number | null>('Private');
  const [gradeError, setGradeError] = useState<string>("");
  const [subjectError, setSubjectError] = useState<string>("");
  const [topicError, setTopicError] = useState<string>("");

  const [correctQuestion, setCorrectQuestion] = useState<
    string | number | null
  >(null);

  const [score, setScore] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);

  // Quiz start and end times (time only)
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const navigate = useNavigate();


  // Separate Errors
  const [questionError, setQuestionError] = useState<string>("");
  const [optionAError, setOptionAError] = useState<string>("");
  const [optionBError, setOptionBError] = useState<string>("");
  const [optionCError, setOptionCError] = useState<string>("");
  const [optionDError, setOptionDError] = useState<string>("");
  const [correctQuestionError, setCorrectQuestionError] = useState<string>("");
  const [scoreError, setScoreError] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");
  const [isEdit, setIsEdit] = useState(false)

  const correctQuestionData = [
    { label: "Option A", value: 1 },
    { label: "Option B", value: 2 },
    { label: "Option C", value: 3 },
    { label: "Option D", value: 4 },
  ];

  const handleAddQuestion = () => {
    // Reset errors
    setQuestionError("");
    setOptionAError("");
    setOptionBError("");
    setOptionCError("");
    setOptionDError("");
    setCorrectQuestionError("");
    setScoreError("");

    if (!grade) {
      setGradeError("Please select Grade");
    }
    if (!subject) {
      setSubjectError("Please select Subject");
    }
    if (!topic) {
      setTopicError("Please select Topic");
    }
    // Validation: Ensure all fields are filled
    if (!questionName) {
      setQuestionError("Please fill out the question.");
      return;
    }
    if (!optionA) {
      setOptionAError("Please fill out option A.");
      return;
    }
    if (!optionB) {
      setOptionBError("Please fill out option B.");
      return;
    }
    if (!optionC) {
      setOptionCError("Please fill out option C.");
      return;
    }
    if (!optionD) {
      setOptionDError("Please fill out option D.");
      return;
    }
    if (!correctQuestion) {
      setCorrectQuestionError("Please select the correct answer.");
      return;
    }
    if (!score) {
      setScoreError("Please enter the question score.");
      return;
    }

    // Add the new question to the list
    const newQuestion = {
      questionName,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      correctQuestion,
      score: parseInt(score, 10),
    };

    setQuestions([...questions, newQuestion]);
    setTotalScore(totalScore + parseInt(score, 10)); // Update total score

    // Reset fields
    setQuestionName("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectQuestion(null);
    setScore("");
  };
  useEffect(() => {
    Get("/grade")
      .then((d) => {
        if (d.success) {
          setGradeData(d.data);
        } else {
          displayMessage(d.message);
        }
      })
      .catch((e) => {
        displayMessage(e.message);
      });
  }, []);

  useEffect(() => {
    if (grade != null) {
      Get("/subject/grade", grade).then((d) => {
        if (d.success) {
          setSubjectData(d.data);
        } else {
          displayMessage(d.message, "error");
        }
      });
    }
  }, [grade]);

  useEffect(() => {
    if (subject != null) {
      Get(`/topic?subject=${subject}`).then((d) => {
        if (d.success) {
          setTopicData(d.data);
        } else {
          displayMessage(d.message);
        }
      });
    }
  }, [subject]);

  useEffect(() => {
    if (topic != null) {
      Get(`/topic/lesson/${topic}`).then((d) => {

        if (d.success) {

          setLessons(d.data)
        } else {
          displayMessage(d.message);
        }
      });
    }
  }, [topic])

  const handleTimeValidation = () => {
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        setTimeError("End time must be later than start time.");
        return false;
      }
    }
    setTimeError("");
    return true;
  };

  const handleUploadQuiz = () => {
    // Convert time strings to Date objects for today
    const today = new Date();
    const startDateTime = startTime ? new Date(`${today.toDateString()} ${startTime}`) : null;
    const endDateTime = endTime ? new Date(`${today.toDateString()} ${endTime}`) : null;

    // Implement upload logic here
    Post("/quiz/teacher", {
      grade,
      subject,
      topic,
      lesson,
      startsAt: startDateTime,
      endsAt: endDateTime,
      questions: questions.map((i) => {
        let option = Object.values(i.options);
        return {
          question: i.questionName,
          options: option,
          answer: option[i.correctQuestion - 1],
          score: i.score,
        };
      }),
    })
      .then((d) => {
        if (d.success) {
          displayMessage(d.message, "success")
          navigate(RouteName.MY_QUIZZES)
        } else {
          displayMessage(d.message, "error")
        }

      })
      .catch((e) => {
        displayMessage(e.message, "error")

      });
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
          <Navbar title="Add Quiz" hideSearchBar />
        </div>

        {/* center */}
        <div className="w-full flex-col gap-5 px-5 mb-2 md:mb-6 bg-mainBg h-fit pb-10">
          {/* Quiz start date/time and ending date/time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 bg-white rounded-md py-3 px-3 2xl:w-3/4">
            <div className="flex items-center justify-center gap-3">
              <label className="text-sm md:text-base font-semibold text-greyBlack">
                Quiz Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border py-1 px-2 rounded-md text-sm"
                placeholder="Select start time"
              />
            </div>
            <div className="flex items-center justify-center gap-3">
              <label className="text-sm md:text-base font-semibold text-greyBlack">
                Quiz End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border py-1 px-2 rounded-md text-sm"
                placeholder="Select end time"
              />
            </div>

            <div className="col-span-1 flex flex-row items-center justify-center gap-3">
              <h3 className="text-sm md:text-base font-semibold text-greyBlack">
                Total Score:{" "}
              </h3>
              {totalScore}
              {/* <CustomInput
                value={questionName}
                setValue={setQuestionName}
                placeholder="e.g How many planets in our solar system?"
                error={questionError}
                setError={setQuestionError}
                style={{
                  wrapper: "mb-5 md:mb-5",
                }}
              /> */}
            </div>

            <div className="col-span-1 flex flex-row items-center justify-center gap-3">
              <h3 className="text-sm md:text-base font-semibold text-greyBlack">
                Select Grade:{" "}
              </h3>

              <DropDown
                value={grade}
                setValue={setGrade}
                data={gradedata.map((i) => {
                  return {
                    value: i._id,
                    label: i.grade,
                  };
                })}
                placeholder="Select Grade"
                error={gradeError}
                setError={setGradeError}
              />
            </div>
            <div className="col-span-1 flex flex-row items-center justify-center gap-3">
              <h3 className="text-sm md:text-base font-semibold text-greyBlack">
                Select Subject:{" "}
              </h3>

              <DropDown
                value={subject}
                setValue={setSubject}
                data={subjectdata.map((i) => {
                  return {
                    value: i._id,
                    label: i.name,
                  };
                })}
                placeholder="Select Subject"
                error={subjectError}
                setError={setSubjectError}
              />
            </div>
            <div className="col-span-1 flex flex-row items-center justify-center gap-3">
              <h3 className="text-sm md:text-base font-semibold text-greyBlack">
                Select Topic:{" "}
              </h3>

              <DropDown
                value={topic}
                setValue={setTopic}
                data={topicdata.map((i) => {
                  return {
                    value: i._id,
                    label: i.name,
                  };
                })}
                placeholder="Select Topic"
                error={topicError}
                setError={setTopicError}
              />
            </div>
            <div className="col-span-1 flex flex-row items-center justify-center gap-3">
              <h3 className="text-sm md:text-base font-semibold text-greyBlack">
                Select Lesson:{" "}
              </h3>

              <DropDown
                value={lesson}
                setValue={setLesson}
                data={lessons.map((i) => {
                  return {
                    value: i._id,
                    label: i.name,
                  };
                })}
                placeholder="Select Lesson"
                error={topicError}
                setError={setTopicError}
              />

            </div>
            <div className="col-span-1 flex flex-row items-center justify-center gap-3">
              <h3 className="text-sm md:text-base font-semibold text-greyBlack">
                Quiz Type:{" "}
              </h3>

              <DropDown
                value={quizType}
                setValue={setQuizType}
                data={
                  [
                    {
                      value: 'Private',
                      label: 'Private Quiz',
                    },
                    {
                      value: 'Universal',
                      label: 'Universal Quiz',
                    },
                  ]
                }
                placeholder="e.g Private"
                error={topicError}
                setError={setTopicError}
              />

            </div>

            {/* Add topic and subject */}
          </div>
          {timeError && <p className="text-red-500">{timeError}</p>}

          {/* Display Added Questions */}
          <div
            className={`${questions?.length > 0 ? "py-5 px-4 bg-white rounded-md mt-5 " : ""
              }`}
          >
            {questions.map((q, index) => (
              <div key={index} className="w-full border-b border-gray-300 py-5">
                <h4 className="font-semibold text-sm md:text-base">
                  Question {index + 1}: {q.questionName}
                </h4>
                <ul className="list-disc pl-5">
                  <li>Option A: {q.options.A}</li>
                  <li>Option B: {q.options.B}</li>
                  <li>Option C: {q.options.C}</li>
                  <li>Option D: {q.options.D}</li>
                </ul>
                <p className="mt-2">
                  Correct Answer: Option {q.correctQuestion}
                </p>
                <p>Score: {q.score}</p>
              </div>
            ))}
          </div>

          {/* Add New Question */}
          <div className="w-full border-b border-gray-300 py-5">
            <div className="xl:w-3/4">
              <CustomInput
                value={questionName}
                setValue={setQuestionName}
                placeholder="e.g How many planets in our solar system?"
                label={`Question ${questions?.length + 1}`}
                error={questionError}
                setError={setQuestionError}
                style={{
                  wrapper: "mb-5 md:mb-5",
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                <CustomInput
                  value={optionA}
                  setValue={setOptionA}
                  placeholder="Option A"
                  error={optionAError}
                  setError={setOptionAError}
                  style={{
                    wrapper: "mb-0 md:mb-0",
                  }}
                />
                <CustomInput
                  value={optionB}
                  setValue={setOptionB}
                  placeholder="Option B"
                  error={optionBError}
                  setError={setOptionBError}
                  style={{
                    wrapper: "mb-0 md:mb-0",
                  }}
                />
                <CustomInput
                  value={optionC}
                  setValue={setOptionC}
                  placeholder="Option C"
                  error={optionCError}
                  setError={setOptionCError}
                  style={{
                    wrapper: "mb-0 md:mb-0",
                  }}
                />
                <CustomInput
                  value={optionD}
                  setValue={setOptionD}
                  placeholder="Option D"
                  error={optionDError}
                  setError={setOptionDError}
                  style={{
                    wrapper: "mb-0 md:mb-0",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-3">
                <DropDown
                  value={correctQuestion}
                  setValue={setCorrectQuestion}
                  data={correctQuestionData}
                  placeholder="Select Correct Answer"
                  error={correctQuestionError}
                  setError={setCorrectQuestionError}
                />
                <CustomInput
                  value={score}
                  type="number"
                  setValue={setScore}
                  placeholder="Question Score"
                  error={scoreError}
                  setError={setScoreError}
                  style={{
                    wrapper: "mb-0 md:mb-0",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center justify-between w-full 2xl:w-3/4">
            <button
              className="py-2 mt-5 px-2 w-fit h-fit bg-slate-500 text-white rounded-lg hover:bg-slate-700 transition-colors delay-100"
              onClick={() => {
                handleAddQuestion();
              }}
              disabled={questions?.length >= 100} // Disable when the max limit is reached
            >
              Add Question
            </button>
            <button
              className={`py-2 mt-5 px-2 w-fit h-fit bg-primary text-white rounded-lg hover:opacity-60 transition-all delay-100`}
              onClick={() => {
                if (handleTimeValidation()) {
                  handleUploadQuiz();
                }
              }}
              disabled={questions?.length >= 100} // Disable when the max limit is reached
            >
              {
                isEdit ? "Update Quiz" : "Upload Quiz"
              }

            </button>
          </div>
          {questions?.length >= 100 && (
            <p className="text-red-500 mt-2">
              Maximum of 100 questions reached.
            </p>
          )}
        </div>

        <div className="">
          <Quiz setIsEdit={setIsEdit} setQuestions={setQuestions} />
        </div>
      </div>

    </div>
  );
};

export default Courses;
