import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, SideDrawer } from "../../../components";
import { useEffect, useState } from "react";
import { Get, Post } from "../../../config/apiMethods";
import { RouteName } from "../../../routes/RouteNames";
import { displayMessage } from "../../../config";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import {
  HiOutlineArrowLeft,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineChatAlt2,
  HiOutlineArrowRight,
  HiOutlineX,
  HiOutlineStar,
} from "react-icons/hi";
import { FaStar } from "react-icons/fa";

type SubjectType = { _id: string; name: string; image: string };
type GradeType = { _id: string; grade: string; subjects: SubjectType[] };
type AuthType = {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  fullAddress: string;
  image: string;
};
type ParentType = { _id: string; auth: AuthType };
type MainType = {
  _id: string;
  auth: AuthType;
  grade: GradeType;
  quiz: any;
  subjects: any;
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

const PROGRESS_GRADIENTS = [
  ["#A557F5", "#7102FF"], // primary → secondary
  ["#4A51F2", "#062FF0"], // fadeBlue → bluecolor
  ["#4BBDBD", "#219562"], // seagreen → green
  ["#F2994A", "#F95152"], // orange → red
  ["#9791D0", "#B05AF7"], // lightPurple → purple
];

const initialsFrom = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "S";

const StudentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [std, setStd] = useState<MainType | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [existingFeedback, setExistingFeedback] = useState<ParentFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStd(location.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!std?._id) return;
    setLoadingSubjects(true);
    Get(`/getMyChildsubjectdata/${std._id}`)
      .then((d) => {
        if (d?.success) setSubjects(d.data || []);
      })
      .finally(() => setLoadingSubjects(false));
  }, [std]);

  const handleSubjectClick = (id: string) => {
    Get(`/mychildbysubject/${std?._id}?subject=${id}`)
      .then((d) => {
        if (d?.success) {
          localStorage.setItem("childResult", JSON.stringify(d.data));
          localStorage.setItem(
            "resultHeaderTitle",
            `${std?.auth?.fullName ?? "Student"} Result`
          );
          navigate(RouteName.CHILD_RESULT_SCREEN);
        } else {
          displayMessage("Something went wrong! Please try again later.", "error");
        }
      })
      .catch((e) => displayMessage(e.message, "error"));
  };

  const fetchExistingFeedback = async () => {
    if (!std?.parent?._id || !std?._id) return;
    try {
      const res = await Get(
        `/teacher/parent-feedback/${std._id}/${std.parent._id}`
      );
      if (res?.success) setExistingFeedback(res.data);
    } catch {
      /* ignore */
    }
  };

  const handleOpenFeedback = () => {
    setShowFeedback(true);
    fetchExistingFeedback();
  };

  const handleSubmitFeedback = async () => {
    if (!rating) return displayMessage("Please select a rating.", "error");
    if (!feedback.trim()) return displayMessage("Please enter feedback.", "error");

    setIsSubmitting(true);
    try {
      const res = await Post("/teacher/parent-feedback", {
        parentId: std?.parent?._id,
        studentId: std?._id,
        comment: feedback,
        stars: rating,
      });
      if (res?.success) {
        displayMessage("Feedback submitted successfully", "success");
        setShowFeedback(false);
        setExistingFeedback(res.data);
        setRating(0);
        setFeedback("");
      } else {
        displayMessage(res?.message || "Failed to submit feedback", "error");
      }
    } catch {
      displayMessage("Failed to submit feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const name = std?.auth?.fullName || "Student";
  const email = std?.auth?.email || "—";
  const address = std?.auth?.fullAddress || "—";
  const parentName = std?.parent?.auth?.fullName || "—";
  const grade = std?.grade?.grade || "—";

  return (
    <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
      <SideDrawer />

      <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
        {/* Sticky navbar */}
        <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
          <div className="px-4 md:px-8 py-3">
            <Navbar title="Student Details" />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline mb-4"
          >
            <HiOutlineArrowLeft size={14} />
            Back
          </button>

          {/* Profile hero */}
          <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-7 shadow-[0_20px_60px_-20px_rgba(113,2,255,0.35)]">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                {std?.auth?.image ? (
                  <img
                    src={std.auth.image}
                    alt=""
                    className="h-20 w-20 md:h-24 md:w-24 rounded-2xl object-cover ring-2 ring-white/40"
                  />
                ) : (
                  <span className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white text-secondary text-2xl font-semibold flex items-center justify-center ring-2 ring-white/40">
                    {initialsFrom(name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-white/70">
                    Student
                  </p>
                  <h1 className="font-trykker text-2xl md:text-3xl leading-tight truncate">
                    {name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-white/15 ring-1 ring-white/20 px-2 py-1">
                      <HiOutlineAcademicCap size={11} />
                      Grade {grade}
                    </span>
                    {std?.auth?.userName && (
                      <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-white/15 ring-1 ring-white/20 px-2 py-1">
                        @{std.auth.userName}
                      </span>
                    )}
                    {existingFeedback && (
                      <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-white/15 ring-1 ring-white/20 px-2 py-1">
                        <FaStar size={10} className="text-orangeBrown" />
                        {existingFeedback.stars} / 5
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {std?.parent && (
                <button
                  type="button"
                  onClick={handleOpenFeedback}
                  className="self-start md:self-auto inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white text-secondary text-sm font-semibold hover:bg-white/95 transition shadow-sm"
                >
                  <HiOutlineChatAlt2 size={16} />
                  {existingFeedback ? "Update parent feedback" : "Leave parent feedback"}
                </button>
              )}
            </div>
          </section>

          {/* Info + Stats */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            {/* Info card */}
            <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5">
              <header className="mb-4">
                <h2 className="font-trykker text-lg text-black">Information</h2>
                <p className="text-xs text-grey">Personal & contact details.</p>
              </header>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <InfoRow icon={HiOutlineUser} label="Full name" value={name} />
                <InfoRow icon={HiOutlineMail} label="Email" value={email} mono />
                <InfoRow
                  icon={HiOutlineLocationMarker}
                  label="Address"
                  value={address}
                />
                <InfoRow
                  icon={HiOutlineUser}
                  label="Parent"
                  value={parentName}
                />
                <InfoRow
                  icon={HiOutlineAcademicCap}
                  label="Grade"
                  value={`Grade ${grade}`}
                />
              </dl>
            </div>

            {/* Quick stat */}
            <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5 flex flex-col">
              <header className="mb-3">
                <h2 className="font-trykker text-lg text-black">Snapshot</h2>
                <p className="text-xs text-grey">High-level performance.</p>
              </header>
              <div className="flex-1 flex items-center justify-around">
                <Mini
                  label="Subjects"
                  value={loadingSubjects ? "—" : String(subjects.length)}
                />
                <Mini
                  label="Avg progress"
                  value={
                    loadingSubjects || !subjects.length
                      ? "—"
                      : `${Math.round(
                          subjects.reduce(
                            (a, s) => a + (Number(s.progress) || 0),
                            0
                          ) / subjects.length
                        )}%`
                  }
                />
              </div>
            </div>
          </section>

          {/* Courses */}
          <section className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5 mb-8">
            <header className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-trykker text-lg text-black">Courses</h2>
                <p className="text-xs text-grey">
                  Tap a course to see lesson-level results.
                </p>
              </div>
              {!loadingSubjects && subjects.length > 0 && (
                <span className="text-[11px] uppercase tracking-wider text-grey font-semibold">
                  {subjects.length} total
                </span>
              )}
            </header>

            {loadingSubjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-mainBg animate-pulse"
                  />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-inputBorder/70 p-6 text-center">
                <span className="inline-flex h-12 w-12 rounded-full bg-mainBg items-center justify-center mb-2">
                  <HiOutlineAcademicCap className="text-grey" size={20} />
                </span>
                <p className="text-sm font-medium text-black">No courses yet</p>
                <p className="text-xs text-grey mt-1">
                  This student hasn't been enrolled in any courses.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {subjects.map((item: any, idx: number) => {
                  const grad = PROGRESS_GRADIENTS[idx % PROGRESS_GRADIENTS.length];
                  const id = `student-progress-${idx}`;
                  return (
                    <button
                      key={item?._id ?? idx}
                      type="button"
                      onClick={() => handleSubjectClick(item?._id)}
                      className="group relative overflow-hidden text-left rounded-2xl ring-1 ring-inputBorder/60 hover:ring-primary/40 hover:shadow-md p-4 bg-white transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0">
                          <svg width="0" height="0" className="absolute">
                            <defs>
                              <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={grad[0]} />
                                <stop offset="100%" stopColor={grad[1]} />
                              </linearGradient>
                            </defs>
                          </svg>
                          <CircularProgressbarWithChildren
                            value={Number(item.progress) || 0}
                            maxValue={100}
                            minValue={0}
                            strokeWidth={9}
                            styles={buildStyles({
                              strokeLinecap: "round",
                              pathColor: `url(#${id})`,
                              trailColor: "#ECF4F7",
                            })}
                          >
                            <span className="text-[11px] font-semibold text-black">
                              {Math.round(Number(item.progress) || 0)}%
                            </span>
                          </CircularProgressbarWithChildren>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
                            Course
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-black truncate">
                            {item?.name}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-secondary font-medium">
                            View results
                            <HiOutlineArrowRight size={12} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowFeedback(false)}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm font-ubuntu"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden ring-1 ring-black/5 animate-[modalIn_220ms_ease-out]"
          >
            <style>{`@keyframes modalIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

            <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-inputBorder/40">
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                aria-label="Close"
                className="absolute top-3 right-3 h-8 w-8 rounded-full text-greyBlack hover:text-black hover:bg-white flex items-center justify-center"
              >
                <HiOutlineX size={15} />
              </button>
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-sm">
                  <HiOutlineStar size={18} />
                </span>
                <div>
                  <h2 className="font-trykker text-lg text-black leading-none">
                    Feedback for parent
                  </h2>
                  <p className="text-xs text-greyBlack mt-1">
                    Share how {name.split(" ")[0]}'s parent can support learning.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              <p className="text-xs font-medium text-label mb-2">Rating</p>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      className="focus:outline-none"
                    >
                      <FaStar
                        size={26}
                        className={
                          filled ? "text-orangeBrown" : "text-inputBorder"
                        }
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-medium text-label mb-2">Comment</p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What's going well? What could the parent help with?"
                className="w-full min-h-[110px] rounded-xl border border-inputBorder bg-white px-3 py-2 text-sm placeholder:text-inputPlaceholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="px-5 pb-5 pt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="h-10 px-4 rounded-xl text-sm font-medium text-greyBlack hover:text-black hover:bg-mainBg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className={`h-10 px-4 rounded-xl text-sm font-medium text-white inline-flex items-center gap-2 transition ${isSubmitting
                  ? "bg-gradient-to-r from-primary to-secondary opacity-60 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/20"
                  }`}
              >
                {isSubmitting && (
                  <span
                    aria-hidden
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  />
                )}
                {isSubmitting ? "Submitting…" : "Submit feedback"}
              </button>
            </div>

            {existingFeedback && (
              <div className="border-t border-inputBorder/40 bg-mainBg/40 px-5 py-4">
                <p className="text-[10px] uppercase tracking-wider text-grey font-semibold mb-1">
                  Previous feedback
                </p>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      size={14}
                      className={
                        s <= existingFeedback.stars
                          ? "text-orangeBrown"
                          : "text-inputBorder"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-greyBlack">
                  {existingFeedback.comment}
                </p>
                <p className="text-[11px] text-grey mt-1">
                  {new Date(existingFeedback.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3 py-2 border-b border-inputBorder/30 last:border-b-0">
    <span className="mt-0.5 h-7 w-7 rounded-lg bg-mainBg flex items-center justify-center shrink-0">
      <Icon className="text-secondary" size={14} />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
        {label}
      </p>
      <p
        className={`text-sm text-black leading-snug break-words ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  </div>
);

const Mini = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="font-trykker text-2xl text-black">{value}</p>
    <p className="text-[11px] uppercase tracking-wider text-grey font-medium mt-1">
      {label}
    </p>
  </div>
);

export default StudentDetails;
