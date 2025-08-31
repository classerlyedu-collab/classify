import React from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { CustomInput } from "../../customInput";
interface MyChildernModalProps {
  isVisible: boolean;
  onClose: () => void;
  studentName: any;
  setStudentName: any;
}

const MyChildernsModal: React.FC<MyChildernModalProps> = ({
  isVisible,
  onClose,
  studentName,
  setStudentName,
}) => {
  if (!isVisible) return null;

  // Determine if the button should be enabled
  const isButtonEnabled = studentName?.length >= 1;
  const handleAddStd = () => {
    Post("/addchild", {
      stdid: studentName,
    })
      .then((d) => {
        if (d.success) {
          displayMessage(d.message, "success");
          setStudentName("")
          onClose()
        } else {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-end pt-12 pr-5">
      <div className="bg-white z-40 rounded-lg p-4 w-4/5 sm:w-3/5 lg:w-2/5">
        <div className="flex flex-row items-center justify-between mb-3">

          <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">
            Add childern
          </h1>
          <div
            onClick={onClose}
            className="border rounded-lg border-[#6A6E6F] cursor-pointer hover:bg-bluecolor group hover:border-transparent transition-all delay-100"
          >
            <h1 className="font-ubuntu font-medium w-fit text-sm text-[#6A6E6F] px-2 py-1 group-hover:text-white">
              Close
            </h1>
          </div>
        </div>

        <div className="flex flex-col justify-start items-center pt-4 bg-white rounded-xl shadow-md w-full">
          <div className="flex w-auto mt-5 px-4">
            <CustomInput
              value={studentName}
              setValue={setStudentName}
              placeholder="e.g 1052-44"
              label="Enter child code"
            />
          </div>

          <div
            className={`flex flex-row justify-center items-center py-2 px-6 rounded-3xl mb-4 cursor-pointer transition duration-300 ${isButtonEnabled
                ? "bg-gradient-to-r from-primary to-secondary text-opacity-60 text-white hover:text-opacity-100"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            <h1
              className="text-sm sm:text-base md:text-lg font-ubuntu font-medium pr-2"
              onClick={handleAddStd}
            >
              Add
            </h1>
            <FiPlusCircle size={18} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyChildernsModal;
