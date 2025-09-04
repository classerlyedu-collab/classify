import { useEffect, useState } from "react";
import { CustomInput } from "../../../customInput";
import { DropDown } from "../../../customDropdown";
import { Get, Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { MultiDropDown } from "../../../multiselectDropdown";
import { useNavigate } from "react-router-dom";
import { UseStateContext } from "../../../../context/ContextProvider";

const Information = () => {
  const navigate = useNavigate();

  const {
    setHasChanges,
    isModalOpen,
    setIsModalOpen,
    hasChanges
  } = UseStateContext();

  const avatarsArray = [
    'https://i.ibb.co/BfcNQ6Q/avatar1.png',
    'https://i.ibb.co/513Q6K6/avatar5.png',
    'https://i.ibb.co/80XP2t4/avatar4.png',
    'https://i.ibb.co/6Z0Rskw/avatar3.png',
    'https://i.ibb.co/F8XNjdS/avatar2.png',
  ];

  // data states
  let user = JSON.parse(localStorage.getItem("user") || "");
  const [userName, setUserName] = useState<string>(user?.userName);
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email);
  const [grade, setGrade] = useState<any>("");
  const [gradet, setGradet] = useState<any>(
    []
  );

  const [profileImage, setProfileImage] = useState(user?.image);
  const [profileimagechange, setprofileimagechange] = useState(false);
  const [image, setimage] = useState(user?.image);

  // error states
  const [userNameError, setUserNameError] = useState<string>("");
  const [surnameError, setSurnameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [gradeData, setGradeData] = useState([]);

  const checkForChanges = () => {
    try {
      // Helper function to compare two arrays (order-sensitive)
      const arraysMatch = (arr1: any, arr2: any) => {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) {
            return false;
          }
        }
        return true;
      };

      if (userName !== user?.userName) {
        setHasChanges(true);
        return true;
      } else if ((grade !== user?.profile?.grade?._id) && user?.userType === 'Student') {
        setHasChanges(true);
        return true;
      } else if (profileImage !== user?.image) {
        setHasChanges(true);
        return true;
      } else if (!arraysMatch(gradet, user?.profile?.grade ?? ['']) && user?.userType === 'Teacher') {
        setHasChanges(true);
        return true;
      } else {
        setHasChanges(false);
        return false;
      }
    } catch (error) {
      setHasChanges(false);
      return false;
    }
  };

  useEffect(() => {
    checkForChanges();
  }, [email, userName, grade, profileImage, gradet, gradeData]);

  const handleDiscardClick = () => {
    try {
      setUserName(user?.userName);
      setProfileImage(user?.image);
      setGrade(user?.profile?.grade?._id);
      setGradet(user?.profile?.grade?.map((i: any) => {
        return i._id;
      }));
      setHasChanges(false);
      setIsModalOpen(false);
    } catch (error) {

      setHasChanges(false);
      setIsModalOpen(false);
    }
  };

  const handleSaveClick = () => {
    try {
      handleUpdateClick();
      setHasChanges(false);
      setIsModalOpen(false);
    } catch (error) {
      setHasChanges(false);
      setIsModalOpen(false);

    }
  }

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file: any = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          let data = new FormData();
          data.append("file", file);
          Post("/uploadimage", data, null, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }).then((d) => {
            setimage(d.file);
          });
          setprofileimagechange(true);
          setProfileImage(reader.result as any);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDeleteClick = () => {
    setprofileimagechange(true);
    setProfileImage("");

  };

  const handleUpdateClick = () => {
    let reqbody: any = {};
    if (email != user?.email) {
      reqbody.email = email;
    }
    if (userName != user?.userName) {
      reqbody.userName = userName;
    }
    if (user?.userType == "Teacher") {
      reqbody.grade = gradet;
    } else {
      reqbody.grade = grade;
    }

    if (profileimagechange) {
      if (profileImage == null || profileImage == "") {
        reqbody.image = "";
      } else {
        reqbody.image = image;
      }
    }
    Post("/auth/updateuser", reqbody).then((res) => {
      if (res.success) {

        localStorage.setItem("token", res.data.token);
        delete res.data.token;

        localStorage.setItem("user", JSON.stringify(res.data.data));
      }
      displayMessage(res.message, "success");
    });
  };

  useEffect(() => {

    if (user?.userType === "Teacher") {
      setGradet(user?.profile?.grade?.map((i: any) => {
        return i._id;
      }))
    } else {
      setGrade(user?.profile?.grade?._id)
    }

    Get("/grade")
      .then((d) => {
        if (d.success) {
          setGradeData(d.data);
        } else {
          displayMessage(d.message);
        }
      })
      .catch((e) => {
        displayMessage(e.message);
      });
    if (gradet?.join(",") == undefined) {
      navigate("/")
    }
    // if(user?.userType=="Teacher"){

    //   Get(`/subject/grade/${user?.profile?.grade?.map((i: any) => {
    //     return i._id;
    //   })?.join(",")}`)
    //     .then((d) => {
    //       if (d.success) {
    //         setCourseData(d.data);
    //       } else {
    //         displayMessage(d.message);
    //       }
    //     })
    //     .catch((e) => {
    //       displayMessage(e.message);
    //     });
    // }else{


    //   Get(`/subject/grade/${user?.profile?.grade?._id}`)
    //     .then((d) => {
    //       if (d.success) {
    //         setCourseData(d.data);
    //       } else {
    //         displayMessage(d.message);
    //       }
    //     })
    //     .catch((e) => {
    //       displayMessage(e.message);
    //     });
    // }
  }, []);


  return (
    <div className="w-full h-full px-2 md:pl-4 md:pr-8 lg:pr-12 xl:pr-16 2xl:pr-20">
      {/* profile picture  */}
      {
        user.userType === "Student" ?

          <div className="flex flex-col items-center justify-center w-full">
            <h6 className="font-ubuntu font-medium text-greyBlack text-xs md:text-sm w-full text-start mt-1 md:mt-2">
              Current Avatar
            </h6>
            <div className="pt-4 pb-4 lg:pt-10 lg:pb-6 w-full flex items-center justify-center border-b border-t md:border-t-0 border-grey">
              <img
                src={
                  `${profileImage ?? avatarsArray[0]}`
                }
                className="w-12 rounded-full h-12 md:w-16 md:h-16 mr-4 md:mr-6"
                alt="Profile"
              />
            </div>
            <h6 className="font-ubuntu font-medium text-greyBlack text-xs md:text-sm w-full text-start mt-1 md:mt-2">
              Choose Your New Avatar
            </h6>
            <div className="pt-4 pb-4 lg:pt-10 lg:pb-6 w-full flex items-center justify-center border-b border-t md:border-t-0 border-grey">
              {
                avatarsArray?.map((item) => (
                  <img
                    src={item}
                    className="w-10 rounded-full h-10 md:w-14 md:h-14 mr-4 md:mr-6 cursor-pointer"
                    alt="Profile"
                    onClick={() => {
                      setProfileImage(item)
                      setimage(item)
                      setprofileimagechange(true)
                    }}
                  />
                ))
              }
            </div>
          </div>

          :

          <div className="pt-4 pb-4 lg:pt-10 lg:pb-6 w-full flex items-center justify-center border-b border-t md:border-t-0 border-grey">
            <img
              src={
                `${user?.image == null || user?.image == "" ? "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg" : user.image}`
                // (profileImage!=""&&profileImage!=null) || require("../../../../images/settings/profile.png")
              }
              className="w-10 rounded-full h-10 md:w-14 md:h-14 mr-4 md:mr-6"
              alt="Profile"
            />
            <div
              onClick={handleDeleteClick}
              className="px-4 border border-grey rounded-md flex items-center justify-center cursor-pointer mr-2 md:mr-4"
            >
              <h6 className="font-ubuntu font-medium text-grey text-xs py-1 lg:py-1.5">
                Delete
              </h6>
            </div>
            <div
              onClick={handleUploadClick}
              className="px-4 bg-[#7000FF] rounded-md flex items-center justify-center cursor-pointer"
            >
              <h6 className="font-ubuntu font-medium text-mainBg text-xs py-1 lg:py-1.5">
                Upload
              </h6>
            </div>
          </div>

      }

      {/* {
        role === 'Student' && (
          <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium">
            ID: {user?.profile?.code}
          </h6>
        )
      } */}
      {/* username  */}
      <div className="py-4 lg:py-7 w-full flex items-center justify-start border-b border-[#B1B7B9]">

        <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-20">
          Username
        </h6>
        <CustomInput
          value={userName}
          setValue={setUserName}
          placeholder="e.g maryjackson123"
          error={userNameError}
          setError={setUserNameError}
          style={{
            wrapper: "mb-0 md:mb-0",
            input: "bg-transparent",
          }}
        />
      </div>

      {/* sur name  */}
      {/* <div className="py-4 lg:py-7 w-full flex items-center justify-start border-b border-[#B1B7B9]" >
                <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-20">Surname</h6>
                <CustomInput
                    value={surname}
                    setValue={setSurname}
                    placeholder="e.g maryjackson"
                    error={surnameError}
                    setError={setSurnameError}
                    style={{
                        wrapper: 'mb-0 md:mb-0',
                        input: 'bg-transparent'
                    }}
                />
            </div> */}

      {/* email  */}
      <div className="py-4 lg:py-7 w-full flex items-center justify-start border-b border-[#B1B7B9]">
        <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-20">
          Email
        </h6>
        <CustomInput
          value={email}
          type="email"
          setValue={setEmail}
          placeholder="e.gg user@gmail.com"
          error={emailError}
          setError={setEmailError}
          style={{
            wrapper: "mb-0 md:mb-0",
            input: "bg-transparent",
          }}
        />
      </div>
      {user.userType == "Student" && (
        <div className="py-4 lg:py-7 w-full flex items-center justify-start border-b border-[#B1B7B9]">
          <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-20">
            Student code
          </h6>
          <CustomInput
            value={user?.profile?.code}
            type="email"
            setValue={setEmail}
            placeholder="e.g user@gmail.com"
            error={emailError}
            setError={setEmailError}
            style={{
              wrapper: "mb-0 md:mb-0",
              input: "bg-transparent",
            }}
          />
        </div>
      )}

      {/* grade */}
      {user.userType == "Student" && (
        <div className="py-4 lg:py-7 w-full flex items-center justify-start">
          <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-20">
            Grade
          </h6>
          <DropDown
            value={grade}
            setValue={setGrade}
            style={{
              wrapper: "mb-0 w-full max-w-80",
              inputWrapper: "bg-transparent",
              listWrapper: "bg-white",
            }}
            placeholder="Select Grade"
            data={gradeData?.map((i: any) => {
              return {
                value: i._id,
                label: i.grade,
              };
            })}
          />
        </div>
      )}
      {user.userType == "Teacher" && (
        <div className="py-4 lg:py-7 w-full flex items-center justify-start">
          <h6 className="text-sm md:text-md font-ubuntu text-greyBlack font-medium mr-2 md:mr-12 lg:mr-28 xl:mr-32 w-20">
            Grade
          </h6>
          <MultiDropDown
            value={gradet}
            setValue={setGradet}
            style={{
              wrapper: "mb-0 w-full max-w-80",
              inputWrapper: "bg-transparent",
              listWrapper: "bg-white",
            }}
            placeholder="Select Grade"
            data={gradeData?.map((i: any) => {
              return {
                value: i._id,
                label: i.grade,
              };
            })}
          />
        </div>
      )}


      <div
        onClick={handleUpdateClick}
        className={`w-1/2 mx-auto my-4 lg:my-7 h-8 md:h-10  bg-gradient-to-r  from-primary to-secondary flex justify-center items-center rounded-md cursor-pointer`}
      >
        <p className="text-white text-sm md:text-base font-normal">Update</p>
      </div>

      {isModalOpen && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center px-5 py-10 bg-[rgba(0,0,0,0.3)]">
          <div className="w-full h-52 px-2 md:w-1/2 md:h-60 flex flex-col items-center justify-center bg-white rounded-lg">
            <p className="text-base md:text-lg font-medium text-black">You have unsaved changes. What would you like to do?</p>
            <button className="w-1/3 mt-4 md:mt-10 h-10 bg-primary rounded-md text-white font-medium" onClick={() => handleSaveClick()}>Save Changes</button>
            <button className="w-1/3 mt-2 md:mt-5 h-10 bg-transparent border-2 border-black rounded-md text-black font-medium" onClick={() => handleDiscardClick()}>Discard Changes</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Information;
