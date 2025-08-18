import { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { CustomInput } from "../../../customInput";
import { Post, Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const AddStudents = () => {
  const [studentName, setStudentName] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [gradeData, setGradeData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch grades when component mounts
    Get("/grade")
      .then((d) => {
        if (d.success) {
          setGradeData(d.data);
        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((e) => {
        displayMessage(e.message, "error");
      });
  }, []);

  // Determine if the button should be enabled
  const isButtonEnabled = studentName?.length >= 1 && selectedGrade !== null;

  const handleAddStd = () => {
    Post('/teacher/addstudent', {
      "stdId": [studentName],
      "grade": selectedGrade
    })
      .then((d) => {     
        if (d.success) {
          displayMessage(d.message, "success");
          // Clear the form after successful addition
          setStudentName("");
          setSelectedGrade(null);
        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      });
  }

  return (
    <div className="flex flex-col justify-start items-center pt-4 bg-white rounded-xl shadow-md w-full">
      {/* upper div */}
      <div className="flex items-center w-full pl-4">
        <h1 className="text-sm sm:text-base md:text-xl font-ubuntu font-medium text-greyBlack">
          Add Student
        </h1>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center">
        {/* div for placeholder */}
        <div className="flex flex-col w-auto mt-5 px-4 space-y-2">
          <CustomInput
            value={studentName}
            setValue={setStudentName}
            placeholder="e.g 1052-44"
            label="Student Roll No"
          />
          
          {/* Grade Selection Dropdown */}
          <div className="flex flex-col mb-8">
            <label className="text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              value={selectedGrade || ""}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Grade</option>
              {gradeData.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add button with conditional styles */}
        <div
          className={`flex flex-row justify-center items-center py-2 px-6 rounded-3xl mb-4 cursor-pointer transition duration-300 ${
            isButtonEnabled
              ? "bg-gradient-to-r from-primary to-secondary text-opacity-60 text-white hover:text-opacity-100"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <h1 className="text-sm sm:text-base md:text-lg font-ubuntu font-medium pr-2" onClick={handleAddStd}>
            Add
          </h1>
          <FiPlusCircle size={18} />
        </div>
      </div>
    </div>
  );
};

export default AddStudents;
