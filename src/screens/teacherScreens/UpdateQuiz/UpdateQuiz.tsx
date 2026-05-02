import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { FloatingInput, FloatingSelect } from "../../../components/FloatingInput";
import { Get, Post, Put } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlineSparkles,
    HiOutlinePlus,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineTrash,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineLockClosed,
    HiOutlineGlobeAlt,
    HiOutlineCheck,
    HiOutlinePencilSquare,
    HiOutlineXMark,
} from "react-icons/hi2";

const OPTION_LETTERS = ["A", "B", "C", "D"];
const OPTION_TONES = [
    { bg: "from-pink-400 to-rose-500" },
    { bg: "from-sky-400 to-blue-500" },
    { bg: "from-amber-400 to-orange-500" },
    { bg: "from-emerald-400 to-teal-500" },
];

const timeFromDate = (raw: any): string => {
    if (!raw) return "";
    if (typeof raw === "string" && /^\d{2}:\d{2}$/.test(raw)) return raw;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    return d.toTimeString().slice(0, 5);
};

const UpdateQuiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initial: any = location?.state || null;
    const isEdit = !!initial?._id;

    const [gradedata, setGradeData] = useState<any[]>([]);
    const [subjectdata, setSubjectData] = useState<any[]>([]);
    const [topicdata, setTopicData] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);

    const [loadingGrades, setLoadingGrades] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(!!initial?.grade?._id);
    const [loadingTopics, setLoadingTopics] = useState(!!initial?.subject?._id);
    const [loadingLessons, setLoadingLessons] = useState(!!initial?.topic?._id);

    const [grade, setGrade] = useState<string | number | null>(initial?.grade?._id ?? null);
    const [subject, setSubject] = useState<string | number | null>(initial?.subject?._id ?? null);
    const [topic, setTopic] = useState<string | number | null>(initial?.topic?._id ?? null);
    const [lesson, setLesson] = useState<string | number | null>(initial?.lesson?._id ?? null);
    const [quizType, setQuizType] = useState<string | number | null>(initial?.type ?? "Private");

    const [startTime, setStartTime] = useState<string>(timeFromDate(initial?.startsAt));
    const [endTime, setEndTime] = useState<string>(timeFromDate(initial?.endsAt));

    // Builder state
    const [questionName, setQuestionName] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [optionC, setOptionC] = useState("");
    const [optionD, setOptionD] = useState("");
    const [correctQuestion, setCorrectQuestion] = useState<string | number | null>(null);
    const [score, setScore] = useState<string>("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Question list (transformed)
    const [questions, setQuestions] = useState<any[]>(() => {
        const list = initial?.questions || [];
        return list.map((i: any) => ({
            questionName: i.question,
            options: {
                A: i.options?.[0] ?? "",
                B: i.options?.[1] ?? "",
                C: i.options?.[2] ?? "",
                D: i.options?.[3] ?? "",
            },
            correctQuestion: (i.options?.indexOf?.(i?.answer) ?? -1) + 1 || 1,
            score: i.score,
        }));
    });

    // Errors
    const [gradeError, setGradeError] = useState("");
    const [subjectError, setSubjectError] = useState("");
    const [topicError, setTopicError] = useState("");
    const [questionError, setQuestionError] = useState("");
    const [optionAError, setOptionAError] = useState("");
    const [optionBError, setOptionBError] = useState("");
    const [optionCError, setOptionCError] = useState("");
    const [optionDError, setOptionDError] = useState("");
    const [correctQuestionError, setCorrectQuestionError] = useState("");
    const [scoreError, setScoreError] = useState("");
    const [timeError, setTimeError] = useState("");

    const [saving, setSaving] = useState(false);
    const [deletingQuestionIdx, setDeletingQuestionIdx] = useState<number | null>(null);

    const correctQuestionOptions = [
        { label: "Option A", value: 1 },
        { label: "Option B", value: 2 },
        { label: "Option C", value: 3 },
        { label: "Option D", value: 4 },
    ];

    const totalScore = useMemo(
        () => questions.reduce((sum: number, q: any) => sum + (Number(q.score) || 0), 0),
        [questions]
    );

    // Load grades + cascade. Allow preserving prefilled selections.
    useEffect(() => {
        setLoadingGrades(true);
        Get("/grade")
            .then((d) => (d.success ? setGradeData(d.data || []) : displayMessage(d.message)))
            .catch((e) => displayMessage(e.message))
            .finally(() => setLoadingGrades(false));
    }, []);

    useEffect(() => {
        if (!grade) return;
        setLoadingSubjects(true);
        Get("/subject/grade", grade as any)
            .then((d) => {
                if (d.success) setSubjectData(d.data || []);
                else displayMessage(d.message, "error");
            })
            .finally(() => setLoadingSubjects(false));
    }, [grade]);

    useEffect(() => {
        if (!subject) return;
        setLoadingTopics(true);
        Get(`/topic?subject=${subject}`)
            .then((d) => {
                if (d.success) setTopicData(d.data || []);
                else displayMessage(d.message);
            })
            .finally(() => setLoadingTopics(false));
    }, [subject]);

    useEffect(() => {
        if (!topic) return;
        setLoadingLessons(true);
        Get(`/topic/lesson/${topic}`)
            .then((d) => {
                if (d.success) setLessons(d.data || []);
                else displayMessage(d.message);
            })
            .finally(() => setLoadingLessons(false));
    }, [topic]);

    const resetBuilder = () => {
        setQuestionName("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setCorrectQuestion(null);
        setScore("");
        setEditingIndex(null);
        setQuestionError("");
        setOptionAError("");
        setOptionBError("");
        setOptionCError("");
        setOptionDError("");
        setCorrectQuestionError("");
        setScoreError("");
    };

    const validateBuilder = () => {
        let blocked = false;
        if (!questionName) { setQuestionError("Enter the question."); blocked = true; }
        if (!optionA) { setOptionAError("Enter option A"); blocked = true; }
        if (!optionB) { setOptionBError("Enter option B"); blocked = true; }
        if (!optionC) { setOptionCError("Enter option C"); blocked = true; }
        if (!optionD) { setOptionDError("Enter option D"); blocked = true; }
        if (!correctQuestion) { setCorrectQuestionError("Pick the correct answer"); blocked = true; }
        if (!score) { setScoreError("Enter a score"); blocked = true; }
        return !blocked;
    };

    const handleAddQuestion = () => {
        if (!validateBuilder()) return;
        const newQuestion = {
            questionName,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correctQuestion,
            score: parseInt(score, 10),
        };
        setQuestions((prev) => [...prev, newQuestion]);
        resetBuilder();
    };

    const handleUpdateQuestion = () => {
        if (editingIndex === null) return;
        if (!validateBuilder()) return;
        const updated = {
            questionName,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correctQuestion,
            score: parseInt(score, 10),
        };
        setQuestions((prev) => prev.map((q, i) => (i === editingIndex ? updated : q)));
        resetBuilder();
    };

    const handleEditQuestion = (idx: number) => {
        const q = questions[idx];
        setQuestionName(q.questionName);
        setOptionA(q.options.A);
        setOptionB(q.options.B);
        setOptionC(q.options.C);
        setOptionD(q.options.D);
        setCorrectQuestion(q.correctQuestion);
        setScore(String(q.score ?? ""));
        setEditingIndex(idx);
        // Smooth-scroll to the builder card
        setTimeout(() => {
            const el = document.getElementById("question-builder");
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
    };

    const handleDeleteQuestion = (idx: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== idx));
        if (editingIndex === idx) resetBuilder();
        else if (editingIndex !== null && idx < editingIndex) {
            setEditingIndex(editingIndex - 1);
        }
        setDeletingQuestionIdx(null);
    };

    const validateTime = () => {
        if (startTime && endTime) {
            const [sh, sm] = startTime.split(":").map(Number);
            const [eh, em] = endTime.split(":").map(Number);
            if (sh * 60 + sm >= eh * 60 + em) {
                setTimeError("End time must be later than start time.");
                return false;
            }
        }
        setTimeError("");
        return true;
    };

    const handleSaveQuiz = () => {
        if (!validateTime()) return;
        if (!grade || !subject || !topic) {
            if (!grade) setGradeError("Pick a grade");
            if (!subject) setSubjectError("Pick a subject");
            if (!topic) setTopicError("Pick a topic");
            displayMessage("Quiz settings are incomplete", "error");
            return;
        }
        if (questions.length === 0) {
            displayMessage("Add at least one question", "error");
            return;
        }

        const today = new Date();
        const startDateTime = startTime ? new Date(`${today.toDateString()} ${startTime}`) : null;
        const endDateTime = endTime ? new Date(`${today.toDateString()} ${endTime}`) : null;

        const payload = {
            grade,
            subject,
            topic,
            lesson,
            type: quizType,
            startsAt: startDateTime,
            endsAt: endDateTime,
            questions: questions.map((q) => {
                const opts = Object.values(q.options);
                return {
                    question: q.questionName,
                    options: opts,
                    answer: opts[(q.correctQuestion as number) - 1],
                    score: q.score,
                };
            }),
        };

        setSaving(true);
        const promise = isEdit
            ? Put(`/quiz/teacher/${initial?._id}`, payload)
            : Post("/quiz/teacher", payload);

        promise
            .then((d: any) => {
                if (d.success) {
                    displayMessage(d.message || (isEdit ? "Quiz updated" : "Quiz created"), "success");
                    navigate(RouteName.MY_QUIZZES);
                } else {
                    displayMessage(d.message, "error");
                }
            })
            .catch((e: any) => displayMessage(e.message, "error"))
            .finally(() => setSaving(false));
    };

    const settingsValid = !!grade && !!subject && !!topic;
    const canAddQuestion =
        questionName && optionA && optionB && optionC && optionD && correctQuestion && score;
    const isEditingQuestion = editingIndex !== null;

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title={isEdit ? "Edit quiz" : "Add quiz"} hideSearchBar />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1100px] w-full mx-auto pb-32">
                    {/* Back link */}
                    <button
                        type="button"
                        onClick={() => navigate(RouteName.MY_QUIZZES)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline mb-3"
                    >
                        <HiOutlineArrowLeft size={14} />
                        Back to my quizzes
                    </button>

                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(113,2,255,0.35)]">
                        <div
                            aria-hidden
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            }}
                        />
                        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                            <div className="max-w-xl">
                                <p className="text-xs uppercase tracking-wider text-white/70 inline-flex items-center gap-1.5">
                                    <HiOutlinePencilSquare size={12} />
                                    {isEdit ? "Editing" : "New quiz"}
                                </p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                                    {isEdit ? "Update your quiz" : "Build a quiz"}
                                </h1>
                                <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                                    {isEdit
                                        ? "Make changes to settings, edit questions, then save."
                                        : "Pick a class, write questions, and share with your students."}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 self-start md:self-auto">
                                <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                                    <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                                        <HiOutlineDocumentText size={18} />
                                    </span>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-white/70">Questions</p>
                                        <p className="text-sm font-semibold leading-tight">{questions.length}</p>
                                    </div>
                                </div>
                                <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                                    <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                                        <HiOutlineSparkles size={18} />
                                    </span>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-white/70">Total score</p>
                                        <p className="text-sm font-semibold leading-tight">{totalScore}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Step 1 — Quiz settings */}
                    <section className="rounded-2xl bg-white ring-1 ring-inputBorder/50 mb-5">
                        <header className="px-5 py-4 border-b border-inputBorder/40 flex items-center gap-3">
                            <span className={`h-9 w-9 rounded-xl flex items-center justify-center font-trykker text-sm transition ${
                                settingsValid
                                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md"
                                    : "bg-gradient-to-br from-primary to-secondary text-white shadow-md"
                            }`}>
                                {settingsValid ? <HiOutlineCheck size={16} strokeWidth={3} /> : "1"}
                            </span>
                            <div>
                                <h2 className="font-trykker text-lg text-black leading-tight">Quiz settings</h2>
                                <p className="text-xs text-grey">Where this quiz lives.</p>
                            </div>
                        </header>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <FloatingSelect
                                    label="Grade"
                                    value={grade ?? ""}
                                    setValue={setGrade}
                                    options={gradedata.map((i) => ({ value: i._id, label: i.grade }))}
                                    error={gradeError}
                                    setError={setGradeError}
                                    loading={loadingGrades}
                                    required
                                />
                                <FloatingSelect
                                    label="Subject"
                                    value={subject ?? ""}
                                    setValue={setSubject}
                                    options={subjectdata.map((i) => ({ value: i._id, label: i.name }))}
                                    error={subjectError}
                                    setError={setSubjectError}
                                    loading={loadingSubjects}
                                    required
                                />
                                <FloatingSelect
                                    label="Topic"
                                    value={topic ?? ""}
                                    setValue={setTopic}
                                    options={topicdata.map((i) => ({ value: i._id, label: i.name }))}
                                    error={topicError}
                                    setError={setTopicError}
                                    loading={loadingTopics}
                                    required
                                />
                                <FloatingSelect
                                    label="Lesson"
                                    value={lesson ?? ""}
                                    setValue={setLesson}
                                    options={lessons.map((i) => ({ value: i._id, label: i.name }))}
                                    loading={loadingLessons}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-grey font-semibold mb-1.5 ml-1">Quiz type</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setQuizType("Private")}
                                            className={`h-12 rounded-xl ring-1 transition flex items-center justify-center gap-1.5 text-xs font-semibold ${
                                                String(quizType).toLowerCase() === "private"
                                                    ? "bg-gradient-to-br from-primary/10 to-secondary/10 ring-secondary text-secondary"
                                                    : "bg-white ring-inputBorder/60 text-greyBlack hover:ring-secondary/40"
                                            }`}
                                        >
                                            <HiOutlineLockClosed size={13} />
                                            Private
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuizType("Universal")}
                                            className={`h-12 rounded-xl ring-1 transition flex items-center justify-center gap-1.5 text-xs font-semibold ${
                                                String(quizType).toLowerCase() === "universal"
                                                    ? "bg-gradient-to-br from-primary/10 to-secondary/10 ring-secondary text-secondary"
                                                    : "bg-white ring-inputBorder/60 text-greyBlack hover:ring-secondary/40"
                                            }`}
                                        >
                                            <HiOutlineGlobeAlt size={13} />
                                            Universal
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-grey font-semibold mb-1.5 ml-1">Start time</p>
                                    <div className="relative">
                                        <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-grey pointer-events-none" size={14} />
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => {
                                                setStartTime(e.target.value);
                                                if (timeError) setTimeError("");
                                            }}
                                            className="w-full h-12 pl-9 pr-3 rounded-xl border border-inputBorder bg-white text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-grey font-semibold mb-1.5 ml-1">End time</p>
                                    <div className="relative">
                                        <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-grey pointer-events-none" size={14} />
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => {
                                                setEndTime(e.target.value);
                                                if (timeError) setTimeError("");
                                            }}
                                            className="w-full h-12 pl-9 pr-3 rounded-xl border border-inputBorder bg-white text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {timeError && (
                                <p className="text-xs text-orangeBrown ml-1 flex items-center gap-1">
                                    <HiOutlineExclamationTriangle size={12} />
                                    {timeError}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Existing questions list */}
                    {questions.length > 0 && (
                        <section className="rounded-2xl bg-white ring-1 ring-inputBorder/50 mb-5 overflow-hidden">
                            <header className="px-5 py-4 border-b border-inputBorder/40 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md">
                                        <HiOutlineCheckCircle size={16} />
                                    </span>
                                    <div>
                                        <h2 className="font-trykker text-lg text-black leading-tight">
                                            Questions
                                        </h2>
                                        <p className="text-xs text-grey">
                                            {questions.length} total · {totalScore} points
                                        </p>
                                    </div>
                                </div>
                            </header>
                            <ul className="divide-y divide-inputBorder/30">
                                {questions.map((q, idx) => {
                                    const isEditingThis = editingIndex === idx;
                                    return (
                                        <li
                                            key={idx}
                                            className={`p-5 transition ${isEditingThis ? "bg-primary/5" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-trykker text-xs flex-shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-black leading-snug">
                                                            {q.questionName}
                                                        </p>
                                                        <p className="text-[11px] text-grey mt-0.5">
                                                            Score: <span className="font-bold text-greyBlack">{q.score}</span>
                                                            {isEditingThis && (
                                                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                                                                    · Editing now
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditQuestion(idx)}
                                                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${
                                                            isEditingThis
                                                                ? "bg-secondary text-white"
                                                                : "hover:bg-mainBg text-grey hover:text-secondary"
                                                        }`}
                                                        title="Edit question"
                                                    >
                                                        <HiOutlinePencilSquare size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingQuestionIdx(idx)}
                                                        className="h-8 w-8 rounded-lg hover:bg-orangeBrown/10 flex items-center justify-center text-grey hover:text-orangeBrown transition"
                                                        title="Delete question"
                                                    >
                                                        <HiOutlineTrash size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 ml-11">
                                                {(["A", "B", "C", "D"] as const).map((letter, i) => {
                                                    const correct = Number(q.correctQuestion) === i + 1;
                                                    return (
                                                        <div
                                                            key={letter}
                                                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                                                                correct
                                                                    ? "bg-emerald-50 ring-1 ring-emerald-200 text-emerald-800 font-semibold"
                                                                    : "bg-mainBg/60 text-greyBlack"
                                                            }`}
                                                        >
                                                            <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                                                correct ? "bg-emerald-500 text-white" : "bg-white ring-1 ring-inputBorder/60 text-greyBlack"
                                                            }`}>
                                                                {letter}
                                                            </span>
                                                            <span className="truncate">{q.options[letter]}</span>
                                                            {correct && <HiOutlineCheckCircle size={12} className="text-emerald-600 ml-auto flex-shrink-0" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    {/* Builder card */}
                    <section
                        id="question-builder"
                        className={`rounded-2xl bg-white ring-1 mb-5 transition ${
                            isEditingQuestion ? "ring-secondary/40 shadow-md shadow-secondary/10" : "ring-inputBorder/50"
                        }`}
                    >
                        <header className="px-5 py-4 border-b border-inputBorder/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span
                                    className={`h-9 w-9 rounded-xl text-white flex items-center justify-center font-trykker text-sm shadow-md ${
                                        isEditingQuestion
                                            ? "bg-gradient-to-br from-bluecolor to-fadeBlue"
                                            : "bg-gradient-to-br from-primary to-secondary"
                                    }`}
                                >
                                    {isEditingQuestion ? (
                                        <HiOutlinePencilSquare size={16} />
                                    ) : (
                                        <span className="text-lg leading-none">+</span>
                                    )}
                                </span>
                                <div>
                                    <h2 className="font-trykker text-lg text-black leading-tight">
                                        {isEditingQuestion
                                            ? `Edit question ${(editingIndex as number) + 1}`
                                            : `Question ${questions.length + 1}`}
                                    </h2>
                                    <p className="text-xs text-grey">
                                        {isEditingQuestion
                                            ? "Update the fields and tap save."
                                            : "Write the question, options, and pick the correct answer."}
                                    </p>
                                </div>
                            </div>
                            {isEditingQuestion && (
                                <button
                                    type="button"
                                    onClick={resetBuilder}
                                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-grey/40 transition"
                                >
                                    <HiOutlineXMark size={12} />
                                    Cancel
                                </button>
                            )}
                        </header>

                        <div className="p-5 space-y-4">
                            <FloatingInput
                                label="Question text"
                                value={questionName}
                                setValue={setQuestionName}
                                error={questionError}
                                setError={setQuestionError}
                                required
                            />

                            <p className="text-[11px] uppercase tracking-wider text-grey font-semibold ml-1">
                                Answer options
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { val: optionA, set: setOptionA, err: optionAError, setErr: setOptionAError },
                                    { val: optionB, set: setOptionB, err: optionBError, setErr: setOptionBError },
                                    { val: optionC, set: setOptionC, err: optionCError, setErr: setOptionCError },
                                    { val: optionD, set: setOptionD, err: optionDError, setErr: setOptionDError },
                                ].map((opt, i) => {
                                    const t = OPTION_TONES[i];
                                    const isCorrect = Number(correctQuestion) === i + 1;
                                    return (
                                        <div key={i} className="flex items-stretch gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCorrectQuestion(i + 1);
                                                    if (correctQuestionError) setCorrectQuestionError("");
                                                }}
                                                title={isCorrect ? "Correct answer" : "Mark as correct"}
                                                className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center font-trykker text-base transition ${
                                                    isCorrect
                                                        ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md ring-2 ring-emerald-200"
                                                        : `bg-gradient-to-br ${t.bg} text-white shadow-md hover:scale-105`
                                                }`}
                                            >
                                                {isCorrect ? <HiOutlineCheck size={18} strokeWidth={3} /> : OPTION_LETTERS[i]}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <FloatingInput
                                                    label={`Option ${OPTION_LETTERS[i]}`}
                                                    value={opt.val}
                                                    setValue={opt.set}
                                                    error={opt.err}
                                                    setError={opt.setErr}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <FloatingSelect
                                    label="Correct answer"
                                    value={correctQuestion ?? ""}
                                    setValue={setCorrectQuestion}
                                    options={correctQuestionOptions}
                                    error={correctQuestionError}
                                    setError={setCorrectQuestionError}
                                    required
                                />
                                <FloatingInput
                                    label="Score for this question"
                                    type="number"
                                    value={score}
                                    setValue={setScore}
                                    error={scoreError}
                                    setError={setScoreError}
                                    required
                                />
                            </div>

                            {isEditingQuestion ? (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={resetBuilder}
                                        className="flex-1 h-11 rounded-xl text-sm font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-grey/40 transition flex items-center justify-center gap-2"
                                    >
                                        <HiOutlineXMark size={14} />
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUpdateQuestion}
                                        disabled={!canAddQuestion}
                                        className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-bluecolor to-primary hover:shadow-md hover:shadow-bluecolor/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <HiOutlineCheck size={14} />
                                        Save question
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    disabled={!canAddQuestion || questions.length >= 100}
                                    className="w-full h-11 rounded-xl text-sm font-semibold text-secondary bg-mainBg ring-1 ring-secondary/30 hover:bg-secondary hover:text-white hover:ring-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <HiOutlinePlus size={16} />
                                    Add question
                                </button>
                            )}
                            {questions.length >= 100 && (
                                <p className="text-xs text-orangeBrown text-center">Maximum of 100 questions reached.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Sticky save bar */}
            <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-[min(560px,calc(100vw-340px))] z-40 pointer-events-none">
                <div className="pointer-events-auto rounded-2xl bg-white/95 backdrop-blur ring-1 ring-inputBorder/60 shadow-lg p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            settingsValid && questions.length > 0
                                ? "bg-lightGreen2/15 text-lightGreen2"
                                : "bg-orangeBrown/10 text-orangeBrown"
                        }`}>
                            {settingsValid && questions.length > 0 ? (
                                <HiOutlineCheckCircle size={16} />
                            ) : (
                                <HiOutlineExclamationTriangle size={16} />
                            )}
                        </span>
                        <p className="text-xs font-semibold text-greyBlack truncate">
                            {!settingsValid
                                ? "Pick grade, subject, and topic"
                                : questions.length === 0
                                    ? "Add at least one question"
                                    : `Ready · ${questions.length} Qs · ${totalScore} pts`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(RouteName.MY_QUIZZES)}
                            className="h-9 px-3 rounded-xl text-xs font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-grey/40 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveQuiz}
                            disabled={saving || !settingsValid || questions.length === 0}
                            className="h-9 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving
                                </>
                            ) : (
                                <>
                                    <HiOutlineSparkles size={13} />
                                    {isEdit ? "Save changes" : "Upload quiz"}
                                    <HiOutlineArrowRight size={13} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete-question confirmation */}
            {deletingQuestionIdx !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setDeletingQuestionIdx(null)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-orangeBrown/10 ring-1 ring-orangeBrown/20 text-orangeBrown flex items-center justify-center flex-shrink-0">
                                    <HiOutlineExclamationTriangle size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-trykker text-lg text-black">Delete question?</h3>
                                    <p className="text-sm text-grey mt-1 leading-relaxed">
                                        Question <span className="font-semibold text-greyBlack">#{deletingQuestionIdx + 1}</span>{" "}
                                        will be removed from this quiz. You can add it back manually.
                                    </p>
                                    <p className="mt-2 text-xs text-greyBlack/80 italic line-clamp-2">
                                        "{questions[deletingQuestionIdx]?.questionName || ""}"
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-mainBg flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDeletingQuestionIdx(null)}
                                className="h-10 px-4 rounded-xl text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 hover:ring-grey/40 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteQuestion(deletingQuestionIdx)}
                                className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-orangeBrown hover:bg-orangeBrown/90 transition flex items-center justify-center gap-2"
                            >
                                <HiOutlineTrash size={14} />
                                Yes, delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateQuiz;
