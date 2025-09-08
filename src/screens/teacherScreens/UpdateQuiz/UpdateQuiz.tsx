import { useEffect, useState } from "react";
import { CustomInput, DropDown, Navbar, SideDrawer } from "../../../components";
import { Get, Post, Put } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { Quiz } from "../../../components/teacherComponents/Quiz";

const UpdateQuiz = () => {
  const location = useLocation();


  const [questionName, setQuestionName] = useState<string>("");
  const [optionA, setOptionA] = useState<string>("");
  const [optionB, setOptionB] = useState<string>("");
  const [optionC, setOptionC] = useState<string>("");
  const [optionD, setOptionD] = useState<string>("");
  const [gradedata, setGradeData] = useState<any[]>([]);
  const [subjectdata, setSubjectData] = useState<any[]>([]);
  const [topicdata, setTopicData] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lesson, setLesson] = useState<string | number | null>(location?.state?.lesson?._id ?? null)
  const [topic, setTopic] = useState<string | number | null>(location?.state?.topic?._id ?? null);
  const [subject, setSubject] = useState<string | number | null>(location?.state?.subject?._id ?? null);
  const [grade, setGrade] = useState<string | number | null>(location?.state?.grade?._id ?? null);
  const [gradeError, setGradeError] = useState<string>("");
  const [subjectError, setSubjectError] = useState<string>("");
  const [topicError, setTopicError] = useState<string>("");
  const [lessonError, setLessonError] = useState<string>("");
  const [quizType, setQuizType] = useState<string | number | null>(location?.state?.type);

  const [correctQuestion, setCorrectQuestion] = useState<
    string | number | null
  >(null);

  const [score, setScore] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>(
    location?.state?.questions
      .map((i: any) => {
        return {
          questionName: i.question,
          options: { A: i.options[0], B: i.options[1], C: i.options[2], D: i.options[3] },
          correctQuestion: i.options?.indexOf(i?.answer) + 1,

          score: i.score,

        }
      })
    ?? []);

  const [totalScore, setTotalScore] = useState<number>(
    location?.state?.questions?.reduce((sum: number, q: any) => sum + (q.score || 0), 0) || 0
  );

  // Quiz start and end times (time only)
  const [startTime, setStartTime] = useState<string>(() => {
    if (location?.state?.startsAt) {
      const date = new Date(location.state.startsAt);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 5); // Extract HH:MM format
      }
    }
    return "";
  });
  const [endTime, setEndTime] = useState<string>(() => {
    if (location?.state?.endsAt) {
      const date = new Date(location.state.endsAt);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 5); // Extract HH:MM format
      }
    }
    return "";
  });
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
  const [isEdit, setIsEdit] = useState(!!location?.state?._id)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)

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
    if (!lesson) {
      setLessonError("Please select Lesson");
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

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setQuestionName(question.questionName);
    setOptionA(question.options.A);
    setOptionB(question.options.B);
    setOptionC(question.options.C);
    setOptionD(question.options.D);
    setCorrectQuestion(question.correctQuestion);
    setScore(question.score.toString());
    setEditingQuestionIndex(index);
  };

  const handleUpdateQuestion = () => {
    // Reset errors
    setQuestionError("");
    setOptionAError("");
    setOptionBError("");
    setOptionCError("");
    setOptionDError("");
    setCorrectQuestionError("");
    setScoreError("");

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

    // Update the question in the list
    const updatedQuestion = {
      questionName,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      correctQuestion,
      score: parseInt(score, 10),
    };

    const updatedQuestions = [...questions];
    updatedQuestions[editingQuestionIndex!] = updatedQuestion;
    setQuestions(updatedQuestions);

    // Recalculate total score
    const newTotalScore = updatedQuestions.reduce((sum, q) => sum + q.score, 0);
    setTotalScore(newTotalScore);

    // Reset fields and editing state
    setQuestionName("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectQuestion(null);
    setScore("");
    setEditingQuestionIndex(null);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);

    // Recalculate total score
    const newTotalScore = updatedQuestions.reduce((sum, q) => sum + q.score, 0);
    setTotalScore(newTotalScore);
  };

  const handleCancelEdit = () => {
    setQuestionName("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectQuestion(null);
    setScore("");
    setEditingQuestionIndex(null);
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
    // Basic validation
    if (!grade) {
      setGradeError("Please select a grade");
      return;
    }
    if (!subject) {
      setSubjectError("Please select a subject");
      return;
    }
    if (!topic) {
      setTopicError("Please select a topic");
      return;
    }
    if (!lesson) {
      setLessonError("Please select a lesson");
      return;
    }
    if (questions.length === 0) {
      displayMessage("Please add at least one question", "error");
      return;
    }

    // Convert time strings to Date objects for today
    const today = new Date();
    const startDateTime = startTime ? new Date(`${today.toDateString()} ${startTime}`) : null;
    const endDateTime = endTime ? new Date(`${today.toDateString()} ${endTime}`) : null;

    // Implement upload logic here
    if (!isEdit) {

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
    } else {
      Put(`/quiz/teacher/${location.state?._id}`, {
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
    }
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
          <Navbar title={isEdit ? "Edit Quiz" : "Add Quiz"} hideSearchBar />
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
                error={lessonError}
                setError={setLessonError}
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
                      value: 'private',
                      label: 'Private Quiz',
                    },
                    {
                      value: 'universal',
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
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm md:text-base">
                    Question {index + 1}: {q.questionName}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(index)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
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

          {/* Add/Edit Question */}
          <div className="w-full border-b border-gray-300 py-5">
            <div className="xl:w-3/4">
              <h3 className="text-lg font-semibold mb-4">
                {editingQuestionIndex !== null ? `Edit Question ${editingQuestionIndex + 1}` : `Add Question ${questions?.length + 1}`}
              </h3>
              <CustomInput
                value={questionName}
                setValue={setQuestionName}
                placeholder="e.g How many planets in our solar system?"
                label="Question"
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
            {editingQuestionIndex !== null ? (
              <>
                <button
                  className="py-2 mt-5 px-2 w-fit h-fit bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors delay-100"
                  onClick={handleUpdateQuestion}
                >
                  Update Question
                </button>
                <button
                  className="py-2 mt-5 px-2 w-fit h-fit bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors delay-100"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              </>
            ) : (
              <button
                className="py-2 mt-5 px-2 w-fit h-fit bg-slate-500 text-white rounded-lg hover:bg-slate-700 transition-colors delay-100"
                onClick={handleAddQuestion}
                disabled={questions?.length >= 100} // Disable when the max limit is reached
              >
                Add Question
              </button>
            )}
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

export default UpdateQuiz;
