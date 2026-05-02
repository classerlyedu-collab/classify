import { useEffect, useMemo, useState } from "react";
import { Get, Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { useNavigate } from "react-router-dom";
import { UseStateContext } from "../../../../context/ContextProvider";
import { FloatingInput, FloatingSelect, FloatingMultiSelect } from "../../../FloatingInput";
import {
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const AVATARS = [
  "https://i.ibb.co/BfcNQ6Q/avatar1.png",
  "https://i.ibb.co/513Q6K6/avatar5.png",
  "https://i.ibb.co/80XP2t4/avatar4.png",
  "https://i.ibb.co/6Z0Rskw/avatar3.png",
  "https://i.ibb.co/F8XNjdS/avatar2.png",
];

const getInitials = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "C";

const Information = () => {
  const navigate = useNavigate();
  const { setHasChanges, isModalOpen, setIsModalOpen, updateUser } = UseStateContext();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [userName, setUserName] = useState<string>(user?.userName || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [grade, setGrade] = useState<any>("");
  const [gradet, setGradet] = useState<any>([]);

  const [profileImage, setProfileImage] = useState(user?.image);
  const [profileimagechange, setprofileimagechange] = useState(false);
  const [image, setimage] = useState(user?.image);
  const [imageMetadata, setImageMetadata] = useState(user?.imageMetadata);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [userNameError, setUserNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [gradeData, setGradeData] = useState([]);

  const isStudent = user.userType === "Student";
  const isTeacher = user.userType === "Teacher";

  const dirty = useMemo(() => {
    const arraysMatch = (a: any, b: any) => {
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    };
    const username = userName !== user?.userName;
    const gradeS = isStudent && grade !== user?.profile?.grade?._id;
    const img = profileImage !== user?.image;
    const gradeT = isTeacher && !arraysMatch(gradet, user?.profile?.grade?.map((i: any) => i._id) ?? []);
    const mail = email !== user?.email;
    return username || gradeS || img || gradeT || mail;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, email, grade, gradet, profileImage]);

  useEffect(() => {
    setHasChanges(dirty);
  }, [dirty, setHasChanges]);

  const handleDiscardClick = () => {
    setUserName(user?.userName || "");
    setEmail(user?.email || "");
    setProfileImage(user?.image);
    setGrade(user?.profile?.grade?._id);
    setGradet(user?.profile?.grade?.map?.((i: any) => i._id) || []);
    setprofileimagechange(false);
    setHasChanges(false);
    setIsModalOpen(false);
  };

  const handleSaveClick = () => {
    handleUpdateClick();
    setIsModalOpen(false);
  };

  const handleUploadClick = () => {
    if (isUploading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file: any = target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        displayMessage("File size must be less than 5MB", "error");
        return;
      }
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowed.includes(file.type)) {
        displayMessage("Please select a valid image (JPEG, PNG, GIF, WEBP)", "error");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const data = new FormData();
        data.append("file", file);
        Post("/uploadimage", data, null, {
          headers: { "Content-Type": "multipart/form-data" },
        })
          .then((d) => {
            if (!d.success) {
              displayMessage(d.message || "Upload failed", "error");
              setIsUploading(false);
              return;
            }
            setimage(d.file);
            setImageMetadata({
              url: d.file,
              publicId: d.public_id,
              filename: d.filename,
              uploadedAt: d.uploadedAt,
            });
            setprofileimagechange(true);
            setProfileImage(reader.result as any);
            Post("/auth/updateuser", {
              image: d.file,
              imageMetadata: {
                url: d.file,
                publicId: d.public_id,
                filename: d.filename,
                uploadedAt: d.uploadedAt,
              },
            })
              .then((res) => {
                if (res.success) {
                  updateUser(res.data.data);
                  displayMessage("Profile photo updated", "success");
                }
                setIsUploading(false);
              })
              .catch(() => setIsUploading(false));
          })
          .catch((err) => {
            displayMessage(err.message || "Upload failed", "error");
            setIsUploading(false);
          });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleUpdateClick = () => {
    const reqbody: any = {};
    if (email !== user?.email) reqbody.email = email;
    if (userName !== user?.userName) reqbody.userName = userName;
    if (isTeacher) reqbody.grade = gradet;
    else reqbody.grade = grade;
    if (profileimagechange) {
      if (!profileImage) {
        reqbody.image = "";
        reqbody.imageMetadata = null;
      } else {
        reqbody.image = image;
        reqbody.imageMetadata = imageMetadata;
      }
    }
    if (Object.keys(reqbody).length === 0) {
      displayMessage("No changes to save", "info");
      return;
    }
    setIsSaving(true);
    Post("/auth/updateuser", reqbody)
      .then((res) => {
        if (res.success) {
          localStorage.setItem("token", res.data.token);
          delete res.data.token;
          updateUser(res.data.data);
          if (res.data.data.image) {
            setProfileImage(res.data.data.image);
            setimage(res.data.data.image);
          }
          if (res.data.data.imageMetadata) setImageMetadata(res.data.data.imageMetadata);
          setprofileimagechange(false);
          setHasChanges(false);
          displayMessage("Profile updated", "success");
        } else {
          displayMessage(res.message || "Update failed", "error");
        }
      })
      .catch((err) => displayMessage(err.message || "Update failed", "error"))
      .finally(() => setIsSaving(false));
  };

  useEffect(() => {
    if (isTeacher) {
      if (Array.isArray(user?.profile?.grade)) {
        if (user.profile.grade[0] && typeof user.profile.grade[0] === "object" && user.profile.grade[0]._id) {
          setGradet(user.profile.grade.map((i: any) => i._id));
        } else {
          setGradet(user.profile.grade || []);
        }
      } else setGradet([]);
    } else {
      setGrade(user?.profile?.grade?._id);
    }

    Get("/grade")
      .then((d) => (d.success ? setGradeData(d.data) : displayMessage(d.message)))
      .catch((e) => displayMessage(e.message));

    if (gradet?.join(",") === undefined) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gradeOptions = gradeData?.map((i: any) => ({ value: i._id, label: i.grade }));

  return (
    <div className="space-y-4 pb-28">
      <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50">
        <div className="px-5 py-4 border-b border-inputBorder/40">
          <h2 className="font-trykker text-lg text-black">Personal information</h2>
          <p className="text-xs text-grey mt-0.5">Update your photo and personal details.</p>
        </div>

        {/* Photo row */}
        <div className="px-5 py-5 border-b border-inputBorder/40">
          <div className="flex items-center gap-4">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-inputBorder/60 flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-trykker text-lg flex-shrink-0">
                {getInitials(userName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black">Profile photo</p>
              <p className="text-[11px] text-grey mt-0.5">
                {isStudent ? "Pick an avatar below or upload your own." : "JPG, PNG, GIF or WEBP. Max 5MB."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="h-9 px-3 rounded-xl text-xs font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-secondary/40 transition flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
            >
              <HiOutlineCamera size={13} />
              {isUploading ? "Uploading…" : profileImage ? "Change" : "Upload"}
            </button>
          </div>

          {isStudent && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-grey font-semibold mr-1">Avatars</span>
              {AVATARS.map((src, i) => {
                const active = profileImage === src;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setProfileImage(src);
                      setimage(src);
                      setprofileimagechange(true);
                    }}
                    className={`h-10 w-10 rounded-xl overflow-hidden transition ${
                      active
                        ? "ring-2 ring-secondary ring-offset-2 ring-offset-white"
                        : "ring-1 ring-inputBorder/60 hover:ring-secondary/40"
                    }`}
                  >
                    <img src={src} className="w-full h-full object-cover" alt={`Avatar ${i + 1}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatingInput
              label="Username"
              value={userName}
              setValue={setUserName}
              error={userNameError}
              setError={setUserNameError}
              required
            />
            <FloatingInput
              label="Email address"
              type="email"
              value={email}
              setValue={setEmail}
              error={emailError}
              setError={setEmailError}
              required
            />
          </div>

          {isStudent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div className="relative h-12 rounded-xl border border-inputBorder bg-mainBg/60">
                <span className="pointer-events-none absolute left-3 top-1 text-[10px] font-medium font-ubuntu text-label">
                  Student code
                </span>
                <span className="absolute left-3 right-3 bottom-1 truncate text-sm font-mono font-semibold text-black">
                  {user?.profile?.code || "Not assigned"}
                </span>
              </div>
              <FloatingSelect
                label="Grade"
                value={grade ?? ""}
                setValue={setGrade}
                options={gradeOptions}
              />
            </div>
          )}

          {isTeacher && (
            <FloatingMultiSelect
              label="Teaching grades"
              value={gradet || []}
              setValue={setGradet}
              options={gradeOptions}
            />
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-[min(560px,calc(100vw-340px))] z-40 pointer-events-none">
        <div
          className={`pointer-events-auto rounded-2xl bg-white/95 backdrop-blur ring-1 ring-inputBorder/60 shadow-lg p-3 flex items-center justify-between gap-3 transition-all ${
            dirty ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-8 w-8 rounded-lg bg-orangeBrown/10 text-orangeBrown flex items-center justify-center flex-shrink-0">
              <HiOutlineExclamationTriangle size={16} />
            </span>
            <p className="text-xs font-semibold text-greyBlack truncate">You have unsaved changes</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDiscardClick}
              className="h-9 px-3 rounded-xl text-xs font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-grey/40 transition flex items-center gap-1"
            >
              <HiOutlineXMark size={13} />
              Discard
            </button>
            <button
              type="button"
              onClick={handleUpdateClick}
              disabled={isSaving}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition disabled:opacity-50 flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving
                </>
              ) : (
                <>
                  <HiOutlineCheck size={13} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Unsaved-changes modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orangeBrown/10 ring-1 ring-orangeBrown/20 text-orangeBrown flex items-center justify-center flex-shrink-0">
                  <HiOutlineExclamationTriangle size={22} />
                </div>
                <div>
                  <h3 className="font-trykker text-lg text-black">Unsaved changes</h3>
                  <p className="text-sm text-grey mt-1">
                    You have unsaved changes. Save them before switching, or discard to continue.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-mainBg flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={handleDiscardClick}
                className="h-10 px-4 rounded-xl text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 hover:ring-grey/40 transition"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Information;
