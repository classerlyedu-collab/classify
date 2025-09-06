import { useEffect, useMemo, useState } from "react";
import { DropDown } from "../../../components";
import { FaStar, FaComments } from "react-icons/fa";
import { Get, Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";

const RATING_LABELS = ["Needs improvement", "Okay", "Good", "Very good", "Excellent"] as const;
const getRatingLabel = (value: number | null) => {
  if (!value || value < 1 || value > 5) return "No rating selected";
  return RATING_LABELS[value - 1];
};

const StudentFeedback = () => {
  const [feedback, setFeedback] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string | number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"give" | "receive">("give");
  const [feedbackError, setFeedbackError] = useState<string>("");
  let navigate = useNavigate();

  // Local state for custom teacher dropdown
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [teacherQuery, setTeacherQuery] = useState("");

  // Build sorted, unique teacher options once teachers are loaded
  const teacherOptions = useMemo(() => {
    const map = new Map<string, string>();
    (teachers || []).forEach((t: any) => {
      const value = t?._id;
      const label = (t?.auth?.userName || "Teacher").toString().trim();
      if (value && !map.has(value)) map.set(value, label);
    });
    return Array.from(map, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const q = teacherQuery.toLowerCase();
    if (!q) return teacherOptions;
    return teacherOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [teacherOptions, teacherQuery]);

  const selectedTeacherLabel = useMemo(() => {
    const found = teacherOptions.find((o) => o.value === selectedTeacher);
    return found?.label || "Select your teacher";
  }, [teacherOptions, selectedTeacher]);

  useEffect(() => {
    Get("/student/myteachers")
      .then((d) => {
        if (d.success) {
          setTeachers(d.data);
        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      });

    Get("/student/feedback")
      .then((d) => {
        if (d.success) {
          setReceivedFeedback(d.data || []);
        }
      })
      .catch(() => { });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "T";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const submitFeedback = () => {
    if (!selectedTeacher) {
      displayMessage("Please select a teacher", "error");
      return;
    }
    if (!feedback.trim()) {
      setFeedbackError("Please write your feedback");
      return;
    }
    if (!rating) {
      displayMessage("Please select a star rating", "error");
      return;
    }

    setLoading(true);
    Post("/student/feedback", {
      teacher: selectedTeacher,
      feedback,
      star: rating,
    })
      .then((d) => {
        if (d.success) {
          displayMessage("Feedback submitted successfully", "success");
          setFeedback("");
          setRating(null);
          setHoverRating(null);
          setSelectedTeacher(null);
          navigate(RouteName.STUDENT_FEEDBACK);
        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">Feedback Center</h1>
          <p className="text-base md:text-lg text-white/90 mt-2 max-w-2xl">
            Share your thoughts with your teachers and keep track of their feedback.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="inline-flex rounded-xl bg-white p-1 shadow-sm border">
          <button
            onClick={() => setActiveTab("give")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "give" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            Give Feedback
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "receive" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            My Feedback
          </button>
        </div>
      </div>

      {/* Give Feedback */}
      {activeTab === "give" && (
        <div className="max-w-6xl mx-auto px-4 mt-8 mb-16">
          <div className="bg-white rounded-2xl border shadow-sm">
            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Write Feedback</h2>
              <p className="text-sm text-gray-600 mt-1">Choose a teacher, write your message, and pick a star rating.</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Teacher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                <div className="relative max-w-md">
                  <button
                    type="button"
                    onClick={() => setIsTeacherOpen((o) => !o)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    aria-haspopup="listbox"
                    aria-expanded={isTeacherOpen}
                  >
                    <span className={`text-sm ${selectedTeacher ? "text-gray-900" : "text-gray-500"}`}>
                      {selectedTeacherLabel}
                    </span>
                    <svg className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isTeacherOpen && (
                    <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg p-2">
                      <input
                        value={teacherQuery}
                        onChange={(e) => setTeacherQuery(e.target.value)}
                        placeholder="Search teacher"
                        className="w-full px-3 py-2 mb-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <ul role="listbox" className="max-h-56 overflow-auto rounded-lg">
                        {filteredTeachers.length === 0 ? (
                          <li className="px-3 py-2 text-sm text-gray-500">No results</li>
                        ) : (
                          filteredTeachers.map((opt) => (
                            <li key={opt.value}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTeacher(opt.value);
                                  setIsTeacherOpen(false);
                                  setTeacherQuery("");
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${selectedTeacher === opt.value ? "bg-indigo-50 text-indigo-700" : "text-gray-800"
                                  }`}
                                role="option"
                                aria-selected={selectedTeacher === opt.value}
                              >
                                {opt.label}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                      <div className="mt-2 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setIsTeacherOpen(false)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Close
                        </button>
                        {selectedTeacher && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTeacher(null);
                              setTeacherQuery("");
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your feedback here (be kind and helpful)."
                  className={`w-full max-w-3xl px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${feedbackError ? "border-red-500" : "border-gray-300"
                    }`}
                  rows={4}
                  onFocus={() => {
                    if (feedbackError) setFeedbackError("");
                  }}
                />
                {feedbackError && (
                  <p className="mt-2 text-sm text-red-600">{feedbackError}</p>
                )}
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Star Rating</label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRating(index + 1)}
                      onMouseEnter={() => setHoverRating(index + 1)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="focus:outline-none"
                      aria-label={`Rate ${index + 1} star${index ? "s" : ""}`}
                    >
                      <FaStar
                        className={`h-8 w-8 transition ${((hoverRating ?? rating) ?? 0) > index ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-700">
                    {getRatingLabel(hoverRating ?? rating)}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  onClick={submitFeedback}
                  disabled={loading || !selectedTeacher || !feedback.trim() || !rating}
                  className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold shadow-sm transition ${loading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receive Feedback */}
      {activeTab === "receive" && (
        <div className="max-w-6xl mx-auto px-4 mt-8 mb-16">
          <div className="bg-white rounded-2xl border shadow-sm">
            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-semibold text-gray-900">My Feedback</h2>
              <p className="text-sm text-gray-600 mt-1">Feedback from your teachers will appear here.</p>
            </div>

            <div className="p-6">
              {receivedFeedback.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FaComments className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No feedback yet</h3>
                  <p className="text-sm text-gray-600">Keep learning and your teachers will add feedback soon.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedFeedback.map((item: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl border p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                            {getInitials(item?.from?.auth?.userName)}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {item?.from?.auth?.userName || "Teacher"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(item?.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <FaStar
                              key={starIndex}
                              className={`h-4 w-4 ${starIndex < (item?.star || 0)
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        {item.feedback || "No feedback provided"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeedback;