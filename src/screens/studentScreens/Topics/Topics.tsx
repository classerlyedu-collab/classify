import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { RouteName } from "../../../routes/RouteNames";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineSparkles,
  HiOutlinePencilSquare,
  HiOutlineRocketLaunch,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineFire,
  HiOutlinePlay,
} from "react-icons/hi2";

interface Topic {
  name: string;
  image?: string;
  lessons: any[];
  quizes: any[];
  practices: any[];
  difficulty?: string;
  read?: number;
  status?: string;
  _id: any;
}

const TONES = [
  { bg: "from-pink-400 to-rose-500", soft: "from-pink-100 to-rose-100", chip: "bg-pink-100 text-pink-700", emoji: "🎨" },
  { bg: "from-sky-400 to-blue-500", soft: "from-sky-100 to-blue-100", chip: "bg-sky-100 text-sky-700", emoji: "🔬" },
  { bg: "from-amber-400 to-orange-500", soft: "from-amber-100 to-orange-100", chip: "bg-amber-100 text-amber-700", emoji: "📐" },
  { bg: "from-emerald-400 to-teal-500", soft: "from-emerald-100 to-teal-100", chip: "bg-emerald-100 text-emerald-700", emoji: "📖" },
  { bg: "from-violet-400 to-purple-500", soft: "from-violet-100 to-purple-100", chip: "bg-violet-100 text-violet-700", emoji: "🌍" },
  { bg: "from-fuchsia-400 to-pink-500", soft: "from-fuchsia-100 to-pink-100", chip: "bg-fuchsia-100 text-fuchsia-700", emoji: "🎵" },
  { bg: "from-cyan-400 to-blue-500", soft: "from-cyan-100 to-blue-100", chip: "bg-cyan-100 text-cyan-700", emoji: "🚀" },
  { bg: "from-lime-400 to-green-500", soft: "from-lime-100 to-green-100", chip: "bg-lime-100 text-lime-700", emoji: "🌱" },
];
const tone = (i: number) => TONES[i % TONES.length];

const difficultyChip = (d?: string) => {
  const lower = d?.toLowerCase() || "";
  if (lower === "beginner")
    return { label: "Beginner", className: "bg-emerald-100 text-emerald-700 ring-emerald-200", emoji: "🌱" };
  if (lower === "medium" || lower === "intermediate")
    return { label: "Medium", className: "bg-amber-100 text-amber-700 ring-amber-200", emoji: "🔥" };
  if (lower === "advanced" || lower === "hard")
    return { label: "Hard", className: "bg-rose-100 text-rose-700 ring-rose-200", emoji: "🚀" };
  return { label: d || "Any", className: "bg-violet-100 text-violet-700 ring-violet-200", emoji: "✨" };
};

const progressFromStatus = (status?: string) => {
  const m = status?.match(/(\d+)%/);
  return m ? parseInt(m[1]) : 0;
};

const Topics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const subjectId = searchParams.get("subject");

  const subject = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("subject") || "{}");
    } catch {
      return {};
    }
  }, []);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isStudent = user?.userType === "Student";

  useEffect(() => {
    setLoading(true);
    Get(`/topic?subject=${subjectId}`)
      .then(async (d) => {
        if (!d.success) {
          displayMessage(d.message);
          return;
        }
        const enriched = (d.data || []).map((i: any) => {
          let s = 0,
            m = 0;
          const quizes = Array.isArray(i.quizes) ? i.quizes : [];
          const q = quizes.map((j: any) => j?.studentQuizData || []).flat();
          const read = parseFloat(i?.read) || 0;

          if (q.length === 0 && quizes.length > 0 && quizes[0]?._id && read === 0) {
            i.status = "incomplete (0%)";
          } else if (q.length === 0 && read === 1) {
            i.status = "complete (100%)";
          } else {
            i.status = `incomplete (${Math.round(read * 100)}%)`;
          }

          q.forEach((j: any, index: number) => {
            s += j?.score || 0;
            m += j?.marks || 0;
            if (index === q.length - 1) {
              if (m === 0) {
                i.status = `incomplete (${Math.round(read * 100)}%)`;
              } else {
                const quizRatio = s > 0 ? m / s : 0;
                const avgProgress = ((quizRatio + read) / 2) * 100;
                if (avgProgress === 100) i.status = `complete (100%)`;
                else i.status = `incomplete (${Math.round(avgProgress)}%)`;
              }
            }
          });
          return i;
        });
        setTopics(enriched);
      })
      .catch((err) => {
        console.error(err);
        displayMessage("Failed to load topics. Please try again.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const stats = useMemo(() => {
    const totalLessons = topics.reduce((sum, t) => sum + (t.lessons?.length || 0), 0);
    const totalQuizzes = topics.reduce((sum, t) => sum + (t.quizes?.length || 0), 0);
    const totalPractice = topics.reduce((sum, t) => sum + (t.practices?.length || 0), 0);
    const avgProgress =
      topics.length > 0
        ? Math.round(
            topics.reduce((sum, t) => sum + progressFromStatus(t.status), 0) / topics.length
          )
        : 0;
    return { totalLessons, totalQuizzes, totalPractice, avgProgress };
  }, [topics]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => (t.name || "").toLowerCase().includes(q));
  }, [topics, search]);

  // Pick the next "continue" topic — first incomplete, else first
  const continueTopic = useMemo(() => {
    if (!topics.length) return null;
    const inProgress = topics.find(
      (t) => progressFromStatus(t.status) > 0 && progressFromStatus(t.status) < 100
    );
    if (inProgress) return inProgress;
    const notStarted = topics.find((t) => progressFromStatus(t.status) === 0);
    return notStarted || topics[0];
  }, [topics]);

  const subjectName = subject?.name || "Topics";
  const heroTone = tone(0); // reused color block for hero accent

  const statCards = [
    {
      label: "Topics",
      value: String(topics.length),
      sticker: "🎯",
      tint: "from-pink-400 to-rose-500",
      Icon: HiOutlineSparkles,
    },
    {
      label: "Lessons",
      value: String(stats.totalLessons),
      sticker: "📚",
      tint: "from-violet-400 to-fuchsia-500",
      Icon: HiOutlineBookOpen,
    },
    {
      label: "Quizzes",
      value: String(stats.totalQuizzes),
      sticker: "🧠",
      tint: "from-amber-400 to-orange-500",
      Icon: HiOutlineRocketLaunch,
    },
    {
      label: isStudent ? "Your progress" : "Practice",
      value: isStudent ? `${stats.avgProgress}%` : String(stats.totalPractice),
      sticker: isStudent ? "⚡" : "✏️",
      tint: "from-emerald-400 to-teal-500",
      Icon: HiOutlineFire,
    },
  ];

  return (
    <div className="px-2 py-2 md:px-2 md:py-4">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate(RouteName.SUBJECTS_SCREEN)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline mb-3"
      >
        <HiOutlineArrowLeft size={14} />
        Back to subjects
      </button>

      {/* Hero with continue tile */}
      <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(217,70,239,0.55)]">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>📚</span>
          <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>🌟</span>
          <span className="absolute bottom-8 left-40 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>✨</span>
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4 max-w-xl">
            {subject?.image ? (
              <img
                src={subject.image}
                alt=""
                className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-contain bg-white/20 ring-2 ring-white/30 p-2 flex-shrink-0"
              />
            ) : (
              <span className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-4xl flex-shrink-0">
                {heroTone.emoji}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">Subject</p>
              <h1 className="font-trykker text-3xl md:text-4xl mt-0.5 leading-tight truncate">
                {subjectName}
              </h1>
              <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                {topics.length > 0
                  ? `${topics.length} topic${topics.length > 1 ? "s" : ""} packed with lessons, practice, and quizzes!`
                  : "Pick a topic to start your learning adventure."}
              </p>
            </div>
          </div>

          {/* Continue learning card */}
          {continueTopic && !loading && (
            <button
              type="button"
              onClick={() => navigate(`${RouteName.LESSONS_STUDENT}?topic=${continueTopic._id}`)}
              className="group relative w-full max-w-sm rounded-3xl bg-white/15 ring-1 ring-white/25 backdrop-blur p-4 text-left hover:bg-white/20 transition flex-shrink-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <HiOutlineFire size={10} />
                  {progressFromStatus(continueTopic.status) > 0 ? "Continue" : "Up next"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 ring-1 ring-white/25 px-2 py-0.5 rounded-full">
                  {continueTopic.lessons?.length || 0} lessons
                </span>
              </div>
              <p className="text-xl md:text-2xl font-trykker leading-tight mb-2 line-clamp-2">
                {continueTopic.name}
              </p>
              {isStudent && (
                <>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-white/85 font-bold">Progress</span>
                    <span className="font-bold">{progressFromStatus(continueTopic.status)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all"
                      style={{ width: `${progressFromStatus(continueTopic.status)}%` }}
                    />
                  </div>
                </>
              )}
              <div className="inline-flex items-center gap-1 text-xs font-bold bg-white text-fuchsia-600 px-3 py-1.5 rounded-full">
                <HiOutlinePlay size={12} />
                Start
                <HiOutlineArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        {statCards.map((s) => {
          const Icon = s.Icon as any;
          return (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 hover:scale-[1.02] hover:shadow-md transition-transform"
            >
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.tint} opacity-25 blur-xl pointer-events-none`} />
              <div className="flex items-center justify-between">
                <span className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${s.tint} text-white flex items-center justify-center shadow-md`}>
                  <Icon size={18} />
                </span>
                <span className="text-2xl">{s.sticker}</span>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-wider text-grey font-bold">{s.label}</p>
              {loading ? (
                <div className="mt-1 h-7 w-16 rounded-md bg-mainBg animate-pulse" />
              ) : (
                <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
              )}
            </div>
          );
        })}
      </section>

      {/* Topics list */}
      <section className="rounded-3xl bg-white ring-1 ring-inputBorder/50 p-5 md:p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="font-trykker text-lg md:text-xl text-black leading-tight">Your topics</h2>
              <p className="text-xs text-grey">Tap any topic to open lessons.</p>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 text-sm font-medium focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition"
            />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/30 overflow-hidden">
                <div className="h-2 w-full bg-mainBg animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-mainBg animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-3/4 rounded bg-mainBg animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-mainBg animate-pulse" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-xl bg-mainBg animate-pulse" />
                    <div className="h-12 rounded-xl bg-mainBg animate-pulse" />
                    <div className="h-12 rounded-xl bg-mainBg animate-pulse" />
                  </div>
                  <div className="h-10 rounded-xl bg-mainBg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-inputBorder/70 p-10 text-center">
            <span className="text-5xl block mb-2">{search ? "🔍" : "🌱"}</span>
            <p className="text-sm font-bold text-black">
              {search ? "No matches" : "No topics yet"}
            </p>
            <p className="text-xs text-grey mt-1 max-w-xs mx-auto">
              {search
                ? "Try a different topic name."
                : "Your teacher is preparing topics. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t: Topic, i) => {
              const tn = tone(i);
              const diff = difficultyChip(t.difficulty);
              const progress = progressFromStatus(t.status);
              const completed = progress >= 100;
              const lessonsCount = t.lessons?.length || 0;
              const practiceCount = t.practices?.length || 0;
              const quizzesCount = t.quizes?.length || 0;
              const hasQuiz = quizzesCount > 0 && t?.quizes[0]?._id;

              return (
                <div
                  key={t._id || i}
                  className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/40 hover:ring-fuchsia-300 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className={`h-2 w-full bg-gradient-to-r ${tn.bg}`} />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tn.bg} text-white flex items-center justify-center shadow-md text-2xl flex-shrink-0`}>
                        {tn.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-black leading-tight line-clamp-2">{t.name}</p>
                        <span
                          className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${diff.className}`}
                        >
                          <span>{diff.emoji}</span>
                          {diff.label}
                        </span>
                      </div>
                      {completed && (
                        <span className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                          <HiOutlineCheckCircle size={15} />
                        </span>
                      )}
                    </div>

                    {/* Content stat chips */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      <div className="rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40 p-2 text-center">
                        <div className="text-base">📚</div>
                        <div className="text-sm font-bold text-black">{lessonsCount}</div>
                        <div className="text-[10px] text-grey font-bold uppercase tracking-wider">Lessons</div>
                      </div>
                      <div className="rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40 p-2 text-center">
                        <div className="text-base">✏️</div>
                        <div className="text-sm font-bold text-black">{practiceCount}</div>
                        <div className="text-[10px] text-grey font-bold uppercase tracking-wider">Practice</div>
                      </div>
                      <div className="rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40 p-2 text-center">
                        <div className="text-base">🧠</div>
                        <div className="text-sm font-bold text-black">{quizzesCount}</div>
                        <div className="text-[10px] text-grey font-bold uppercase tracking-wider">Quizzes</div>
                      </div>
                    </div>

                    {/* Progress bar (students only) */}
                    {isStudent && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-grey font-bold uppercase tracking-wider">Progress</span>
                          <span className="font-bold text-black">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-mainBg overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              completed
                                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                : progress > 0
                                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                  : "bg-inputBorder"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`${RouteName.LESSONS_STUDENT}?topic=${t._id}`)}
                        className="flex-1 h-10 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-md hover:shadow-fuchsia-500/30 transition flex items-center justify-center gap-1.5"
                      >
                        <HiOutlineBookOpen size={14} />
                        Start learning
                      </button>
                      {isStudent && hasQuiz && (
                        <button
                          type="button"
                          onClick={() => navigate(`${RouteName.QUIZ_CONFIRMATION}?topic=${t._id}`)}
                          className="h-10 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-md hover:shadow-emerald-500/30 transition flex items-center gap-1.5"
                          aria-label="Take quiz"
                        >
                          <HiOutlinePencilSquare size={14} />
                          Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="pt-6 pb-4 text-center text-xs text-grey">
        Keep learning — you're getting smarter every day! 🌟
      </p>
    </div>
  );
};

export default Topics;
