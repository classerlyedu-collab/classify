import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { CustomInput } from "../../customInput";
// import { CustomInput } from "../../../customInput";
// import { Post } from "../../../../config/apiMethods";
// import { displayMessage } from "../../../../config";

const AddChildern = () => {
  const [studentName, setStudentName] = useState<string>("");

  // Determine if the button should be enabled
  const isButtonEnabled = studentName?.length >= 1;
const handleAddStd = ()=>{
  Post('/teacher/addstudent',{
    "stdId":[studentName]
  })
  .then((d) => {     
    if (d.success) {
      displayMessage(d.message, "success");
      
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

      {/* lower div */}
    </div>
  );
};

export default AddChildern;
