import { useEffect, useRef, useState } from "react";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { UseStateContext } from "../../../../context/ContextProvider";
import { HiOutlineEnvelope } from "react-icons/hi2";

const Email = () => {
  const { updateUser } = UseStateContext();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initial = useRef<boolean>(!!user?.emailNotification);
  const [enabled, setEnabled] = useState<boolean>(initial.current);

  useEffect(() => {
    if (enabled === initial.current) return;
    Post("/auth/updateuser", { emailNotification: enabled }).then((res) => {
      if (res.success) {
        if (res.data?.token) localStorage.setItem("token", res.data.token);
        delete res.data.token;
        updateUser(res.data.data);
        initial.current = enabled;
        displayMessage(enabled ? "Email notifications enabled" : "Email notifications disabled", "success");
      } else {
        setEnabled(initial.current);
        displayMessage(res.message || "Failed to update", "error");
      }
    }).catch(() => {
      setEnabled(initial.current);
      displayMessage("Failed to update", "error");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-inputBorder/40">
        <h2 className="font-trykker text-lg text-black">Email notifications</h2>
        <p className="text-xs text-grey mt-0.5">Choose what we send to your inbox.</p>
      </div>

      <div className="divide-y divide-inputBorder/30">
        <SettingRow
          title="Receive email notifications"
          desc={
            <>
              Updates and announcements sent to{" "}
              <span className="font-semibold text-greyBlack">{user?.email || "your email"}</span>.
            </>
          }
          icon={<HiOutlineEnvelope size={18} />}
          checked={enabled}
          onChange={setEnabled}
        />
      </div>

      <div className="px-5 py-4 border-t border-inputBorder/30 bg-mainBg/40">
        <p className="text-[11px] text-grey leading-relaxed">
          When enabled, we'll email you about course announcements, assignment reminders, grade notifications, and important system updates. You can change this anytime.
        </p>
      </div>
    </div>
  );
};

const SettingRow = ({
  title,
  desc,
  icon,
  checked,
  onChange,
}: {
  title: string;
  desc: React.ReactNode;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center gap-4 px-5 py-4">
    <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-black">{title}</p>
      <p className="text-[12px] text-grey mt-0.5 leading-snug">{desc}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-gradient-to-r from-primary to-secondary" : "bg-inputBorder"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default Email;
