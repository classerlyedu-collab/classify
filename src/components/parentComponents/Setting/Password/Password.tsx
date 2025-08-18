import { useState } from "react";
import { CustomInput } from "../../../customInput";
import { DropDown } from "../../../customDropdown";
import { gradeObject } from "../../../../constants/register";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const Password = () => {
  // data states
  let user = JSON.parse(localStorage.getItem("user") || "");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useState(user?.image);

  // error states
  const [oldPasswordError, setOldPasswordError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  const handleChangePasswordClick = () => {
    Post("/auth/changepassword", {
      oldPassword,
      password,
      confirmPassword,
    })
      .then((res) => {
        if (res.success) {
          localStorage.setItem("token", res.token);

          displayMessage(res.message, "success");
          setOldPassword("");
          setPassword("");
          setConfirmPassword("");
        } else {
          displayMessage(res.message, "error");
        }
      })
      .catch((err) => {
        displayMessage(err.message, "error");
      });
  };

  return (
    <div className="w-full h-full px-2 md:pl-4 md:pr-8 lg:pr-12 xl:pr-16 2xl:pr-20">
      {/* profile picture  */}
      <div className="pt-4 pb-4 lg:pt-10 lg:pb-6 w-full flex items-center justify-center border-b border-t md:border-t-0 border-grey">
        <img
          src={
            profileImage || require("../../../../images/settings/profile.png")
          }
          className="w-10 rounded-full h-10 md:w-14 md:h-14 mr-4 md:mr-6"
          alt="Profile"
        />
        <h6 className="font-ubuntu font-medium text-greyBlack text-sm md:text-base py-1 lg:py-1.5">
          {user?.userName}
        </h6>
      </div>

      {/* old Password  */}
      <div className="py-4 lg:py-7 w-full flex items-center justify-start border-b border-[#B1B7B9]">
        <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-32">
          Old Password
        </h6>
        <CustomInput
          value={oldPassword}
          setValue={setOldPassword}
          placeholder="e.g maryjackson123"
          error={oldPasswordError}
          setError={setOldPasswordError}
          style={{
            wrapper: "mb-0 md:mb-0",
            input: "bg-transparent",
          }}
        />
      </div>

      {/* sur name  */}
      <div className="py-4 lg:py-7 w-full flex items-center justify-start border-b border-[#B1B7B9]">
        <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-32">
          New Password
        </h6>
        <CustomInput
          value={password}
          setValue={setPassword}
          placeholder="e.g maryjackson"
          error={passwordError}
          setError={setPasswordError}
          style={{
            wrapper: "mb-0 md:mb-0",
            input: "bg-transparent",
          }}
        />
      </div>

      {/* email  */}
      <div className="py-4 lg:py-7 w-full flex items-center justify-start">
        <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-32">
          Confirm Password
        </h6>
        <CustomInput
          value={confirmPassword}
          type="email"
          setValue={setConfirmPassword}
          placeholder="e.g maryjackson@gmail.com"
          error={confirmPasswordError}
          setError={setConfirmPasswordError}
          style={{
            wrapper: "mb-0 md:mb-0",
            input: "bg-transparent",
          }}
        />
      </div>

      <div className="w-4/5 md:w-1/2 flex flex-col mx-auto my-4 lg:my-7">
        <div
          onClick={handleChangePasswordClick}
          className={`w-full h-8 md:h-10  bg-gradient-to-r  from-primary to-secondary flex justify-center items-center rounded-md cursor-pointer`}
        >
          <p className="text-white text-sm md:text-base font-normal">
            Change Password
          </p>
        </div>
        {/* <p className="text-secondary text-xs md:text-sm font-medium self-end mt-2 md:mt-3">
          Forget Password?
        </p> */}
      </div>
    </div>
  );
};

export default Password;
