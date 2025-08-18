
import { useEffect, useState } from "react";
import { CustomInput } from "../../../customInput";
import { DropDown } from "../../../customDropdown";
import { gradeObject } from "../../../../constants/register";
import { FormControlLabel } from "@mui/material";
import { IOSSwitch } from "../../../../utils/settings";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const Email = () => {
    let user = JSON.parse(localStorage.getItem("user") || "");

    // data states
    const [emailNotifications, setEmailNotifications] = useState<boolean>(user?.emailNotification);
    const [profileImage, setProfileImage] = useState(user?.image);

    useEffect(() => {
        
        if (
            user.emailNotification!= emailNotifications
        ) {
          Post("/auth/updateuser", {
            emailNotification: emailNotifications,
          }).then((res) => {
            if (res.success) {
              localStorage.setItem("token", res.data.token);
              delete res.data.token;
    
              localStorage.setItem("user", JSON.stringify(res.data.data));
            }
            displayMessage(res.message, "success");
          });
        }
      }, [emailNotifications]);
    

    return (
        <div className="w-full h-full px-2 md:pl-4 md:pr-8 lg:pr-12 xl:pr-16 2xl:pr-20" >

            {/* profile picture  */}
            <div className="pt-4 pb-4 lg:pt-10 lg:pb-6 w-full flex items-center justify-center border-b border-t md:border-t-0 border-grey">
                <img src={profileImage || require('../../../../images/settings/profile.png')} className="w-10 rounded-full h-10 md:w-14 md:h-14 mr-4 md:mr-6" alt="Profile" />
                <h6 className="font-ubuntu font-medium text-greyBlack text-sm md:text-base py-1 lg:py-1.5">{user?.userName}</h6>
            </div>

            {/*  Opinion Emails */}
            <div className="py-4 lg:py-7 w-full flex items-center justify-between border-b border-[#B1B7B9]" >
                <div>
                    <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium">Enable or Disable email notifications from Classerly.com</h6>
                </div>
                <FormControlLabel
                    control={<IOSSwitch sx={{ m: 1 }} 
                    defaultChecked
                    checked={emailNotifications}
                    />}
                    label=''
                    onChange={(e) => {
                        setEmailNotifications(!emailNotifications);
                      }}
                    value={emailNotifications}
                />

            </div>

        </div>
    )
};

export default Email;