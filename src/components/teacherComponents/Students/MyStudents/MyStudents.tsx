import { StudentsData } from "../../../../constants/Teacher/MyStudents";
import { CiClock2 } from "react-icons/ci";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { useEffect, useState, useRef } from "react";
import { Get, Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { UseStateContext } from "../../../../context/ContextProvider";

interface Comment {
  _id: string;
  text: string;
  subject?: {
    _id: string;
    name: string;
  };
  user: {
    _id: string;
    fullName: string;
  };
  userType: "Teacher" | "Student";
  recipient: {
    _id: string;
    fullName: string;
  };
  recipientType: "Teacher" | "Student";
  createdAt: string;
}

export const MyStudents = () => {
  const [mystd, setMyStd] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const { role } = UseStateContext();
  const navigate = useNavigate();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showComments) {
      scrollToBottom();
    }
  }, [showComments, comments]);

  useEffect(() => {
    Get("/teacher/mystudents")
      .then((d) => {
        if (d.success) {
          setMyStd(d.data);
        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      });
  }, []);

  console.log(selectedStudent);

  const handleOpenComments = async (student: any) => {
    setSelectedStudent(student);
    setShowComments(true);
    setIsLoading(true);
    setIsSubjectsLoading(true);
    
    // Fetch comments for this student
    try {
      const response = await Get(`/teacher/comments/${student.auth._id}`);
      if (response.success) {
        setComments(response.data);
      } else {
        displayMessage(response.message, "error");
      }
    } catch (error) {
      displayMessage("Failed to load comments", "error");
    } finally {
      setIsLoading(false);
    }

    // If teacher, fetch student's subjects
    if (role === "Teacher") {
      try {
        const subjectsResponse = await Get(`/subject/student/${student.auth._id}/subjects`);
        if (subjectsResponse.success) {
          setStudentSubjects(subjectsResponse.data);
        }
      } catch (error) {
        displayMessage("Failed to load subjects", "error");
      } finally {
        setIsSubjectsLoading(false);
      }
    } else {
      setIsSubjectsLoading(false);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedStudent(null);
    setNewComment("");
    setSelectedSubject("");
    setComments([]);
    setStudentSubjects([]);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      displayMessage("Please enter a comment", "error");
      return;
    }

    if (role === "Teacher" && !selectedSubject) {
      displayMessage("Please select a subject", "error");
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        text: newComment,
        recipientId: selectedStudent.auth._id,
        recipientType: "Student",
        ...(role === "Teacher" && { subject: selectedSubject })
      };

      const response = await Post("/teacher/comments", payload);
      if (response.success) {
        // Find the selected subject from studentSubjects
        const selectedSubjectData = studentSubjects.find(sub => sub._id === selectedSubject);
        
        // Create a new comment object with the subject data and current user info
        const newCommentData = {
          ...response.data,
          subject: selectedSubjectData ? {
            _id: selectedSubjectData._id,
            name: selectedSubjectData.name
          } : undefined,
          user: {
            _id: currentUser._id,
            fullName: currentUser.fullName
          },
          userType: "Teacher"
        };
        
        setComments([...comments, newCommentData]);
        setNewComment("");
        setSelectedSubject("");
        displayMessage("Comment sent successfully", "success");
      } else {
        displayMessage(response.message, "error");
      }
    } catch (error) {
      displayMessage("Failed to send comment", "error");
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-around 2xl:justify-start items-stretch w-full h-full overflow-y-auto maxh-h-96  md:max-h-screen">
        {mystd?.map((item, index) => (
          <div
            id={index.toString()}
            className="border border-greyBlack flex flex-col w-full max-w-80 lg:w-80 rounded-lg lg:rounded-md bg-transparent mb-5 2xl:mr-3"
          >
            {/* upper div */}
            <div className="grid grid-cols-3 items-start justify-between w-full px-2 md:px-5 py-2 md:py-5">
              <div className="col-span-2 flex h-full flex-col items-start justify-end gap-2">
                <h1 className="font-ubuntu font-semibold text-sm lg:text-base text-[#262626]">
                  {item?.auth?.fullName}
                </h1>
                <h1 className="font-ubuntu font-semibold text-sm lg:text-base text-[#262626]">
                  {item?.grade?.grade}
                </h1>
                <h1 className="font-ubuntu font-semibold text-sm lg:text-base text-[#262626]">
                  Roll Number: {item?.code}
                </h1>
                <h1 className="font-ubuntu font-semibold text-sm lg:text-base text-[#262626]">
                  Parent: {item?.parent?.auth?.fullName || "N/A"}
                </h1>
                <div className="flex gap-2 mt-5">
                  <div
                    onClick={() => navigate(RouteName.STUDENT_DETAILS_SCREEN, { state: item })}
                    className="bg-secondary rounded-md flex items-center justify-center py-0.5 lg:py-1 px-4 lg:px-8 hover:opacity-80 min-w-[120px] whitespace-nowrap">
                    <h6 className="font-ubuntu font-medium text-white cursor-pointer text-xs md:text-sm">
                      View Details
                    </h6>
                  </div>
                  <div
                    onClick={() => handleOpenComments(item)}
                    className="bg-primary rounded-md flex items-center justify-center py-0.5 lg:py-1 px-4 lg:px-8 hover:opacity-80 min-w-[120px] whitespace-nowrap">
                    <h6 className="font-ubuntu font-medium text-white cursor-pointer text-xs md:text-sm">
                      Comments
                    </h6>
                  </div>
                </div>
              </div>

              <div className="col-span-1 flex flex-row items-center justify-center">
                <img
                  className="w-16 lg:w-20 h-16 lg:h-20 rounded-full"
                  src={item?.auth?.image || StudentsData[0].image}
                  alt="img"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Dialog */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Comments - {selectedStudent?.auth?.fullName}</h2>
              <button onClick={handleCloseComments} className="text-gray-500 hover:text-gray-700">
                <IoClose size={24} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-lg font-medium">No comments yet</p>
                  <p className="text-sm mt-1">Start the conversation by sending a message</p>
                </div>
              ) : (
                <>
                  {comments.map((comment) => {
                    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                    const isCurrentUser = comment.user._id === currentUser._id;
                    
                    return (
                      <div key={comment._id} className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          isCurrentUser ? "bg-primary text-white" : "bg-gray-100"
                        }`}>
                          {comment.subject && (
                            <p className="text-xs mb-1 opacity-80">Subject: {comment.subject.name}</p>
                          )}
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs mt-1 opacity-70">{new Date(comment.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={commentsEndRef} />
                </>
              )}
            </div>

            {/* Input Section */}
            <div className="border-t p-4">
              <div className="flex flex-col gap-3">
                {role === "Teacher" && (
                  isSubjectsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : studentSubjects.length === 0 ? (
                    <div className="text-center text-gray-500 py-2">
                      <p>No subjects available</p>
                    </div>
                  ) : (
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Subject</option>
                      {studentSubjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  )
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={handleSendComment}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyStudents;
