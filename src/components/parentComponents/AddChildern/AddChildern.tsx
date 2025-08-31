import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { CustomInput } from "../../customInput";
import { useSubscriptionLimits } from "../../../hooks/useSubscriptionLimits";
import { UseStateContext } from "../../../context/ContextProvider";

const AddChildern = () => {
  const [studentName, setStudentName] = useState<string>("");
  const { role } = UseStateContext();
  const { canAddStudents, maxStudents, currentStudents, remainingStudents, planType, loading } = useSubscriptionLimits();

  // Determine if the button should be enabled
  const isButtonEnabled = studentName?.length >= 1 && canAddStudents;
  const handleAddStd = () => {
    // Check if user can add more students
    if (!canAddStudents) {
      displayMessage("You have reached your student limit. Please upgrade your subscription to add more students.", "error");
      return;
    }

    if (remainingStudents <= 0) {
      displayMessage("You have reached your student limit for this plan.", "error");
      return;
    }

    Post('/teacher/addstudent', {
      "stdId": [studentName]
    })
      .then((d) => {
        if (d.success) {
          displayMessage(d.message, "success");
          setStudentName(""); // Clear input after success
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

      {/* Subscription Status */}
      {!loading && (
        <div className="w-full px-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Plan: {planType}</span>
              <span className="text-xs text-blue-600">
                {currentStudents}/{maxStudents === 999 ? '∞' : maxStudents} students
              </span>
            </div>
            <div className="text-xs text-blue-700">
              {canAddStudents
                ? `You can add ${remainingStudents} more student${remainingStudents !== 1 ? 's' : ''}`
                : 'You have reached your student limit'
              }
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full flex flex-col items-center justify-center">
        {/* div for placeholder */}
        <div className="flex w-auto mt-5 px-4">
          <CustomInput
            value={studentName}
            setValue={setStudentName}
            placeholder="e.g 1052-44"
            label="Student Roll No"
          />
        </div>

        {/* Add button with conditional styles */}
        <div
          className={`flex flex-row justify-center items-center py-2 px-6 rounded-3xl mb-4 transition duration-300 ${isButtonEnabled
            ? "bg-gradient-to-r from-primary to-secondary text-opacity-60 text-white hover:text-opacity-100 cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          onClick={isButtonEnabled ? handleAddStd : undefined}
        >
          <h1 className="text-sm sm:text-base md:text-lg font-ubuntu font-medium pr-2">
            {canAddStudents ? 'Add' : 'Limit Reached'}
          </h1>
          <FiPlusCircle size={18} />
        </div>

        {/* Help text when limit is reached */}
        {!canAddStudents && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-600">
              Upgrade your subscription to add more students
            </p>
          </div>
        )}
      </div>

      {/* lower div */}
    </div>
  );
};

export default AddChildern;
