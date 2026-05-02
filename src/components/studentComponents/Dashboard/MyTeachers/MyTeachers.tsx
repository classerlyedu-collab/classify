import { useEffect, useState, useRef } from "react";
import { Get, Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { IoClose } from "react-icons/io5";

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

const MyTeachers = () => {
  const [myTeacher, setmyTeachers] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showComments) {
      scrollToBottom();
    }
  }, [showComments, comments]);

  const getTeachers = () => {
    Get("/student/myteachers").then((d) => {
      if (d.data?.length > 0) {
        setmyTeachers(d.data);
      }
    });
  };

  useEffect(() => {
    getTeachers();
  }, []);

  const handleOpenComments = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowComments(true);
    setIsLoading(true);
    setIsSubjectsLoading(true);
    
    // Fetch comments for this teacher
    try {
      const response = await Get(`/teacher/comments/${teacher.auth._id}`);
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

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Fetch student's own subjects
    try {
      const subjectsResponse = await Get(`/subject/student/${user._id}/subjects`);
      if (subjectsResponse.success) {
        setStudentSubjects(subjectsResponse.data);
      }
    } catch (error) {
      displayMessage("Failed to load subjects", "error");
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedTeacher(null);
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

    if (!selectedSubject) {
      displayMessage("Please select a subject", "error");
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        text: newComment,
        recipientId: selectedTeacher.auth._id,
        recipientType: "Teacher",
        subject: selectedSubject
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
          userType: "Student"
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
      <div className="w-full bg-white h-full py-5 px-4 rounded-2xl max-h-96 overflow-y-auto mt-2">
        <div className="flex flex-row justify-between items-center mb-2">
          <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack animate-pulse">
            My teachers
          </h1>
        </div>

        <div className="rounded-lg bg-white mt-2">
          {myTeacher.map((item: any) => (
            <div key={item._id} className="border-b mx-3 flex items-center justify-between py-2 last:border-none">
              <div className="flex items-center gap-3">
                <h1 className="font-ubuntu font-medium text-sm md:text-base text-greyBlack">
                  {item?.auth?.userName}
                </h1>
                <button
                  onClick={() => handleOpenComments(item)}
                  className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/90"
                >
                  Comments
                </button>
              </div>
              <div className="flex flex-row justify-between">
                <img
                  src={item?.auth?.image || require("../../../../images/settings/profile.png")}
                  width="50px"
                  height="50px"
                  style={{
                    borderRadius: '30px'
                  }}
                  alt="teacher"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Dialog */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Comments - {selectedTeacher?.auth?.userName}</h2>
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
                {isSubjectsLoading ? (
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

export default MyTeachers;
