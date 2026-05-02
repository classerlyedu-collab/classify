import { useMemo, useState } from "react";
import { Post } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
import { FloatingInput } from "../../../FloatingInput";
import {
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const Password = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [oldPasswordError, setOldPasswordError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const checks = useMemo(() => ({
    length: password.length >= 8,
    mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  }), [password, confirmPassword]);

  const score =
    (checks.length ? 1 : 0) +
    (checks.mixedCase ? 1 : 0) +
    (checks.number ? 1 : 0) +
    (checks.special ? 1 : 0);

  const strengthLabel =
    score === 0 ? "—" :
    score === 1 ? "Weak" :
    score === 2 ? "Fair" :
    score === 3 ? "Good" :
    "Strong";
  const strengthTone =
    score <= 2 ? "text-orangeBrown" :
    score === 3 ? "text-bluecolor" :
    "text-lightGreen2";

  const dirty = oldPassword.length > 0 || password.length > 0 || confirmPassword.length > 0;
  const canSubmit =
    oldPassword.length > 0 &&
    checks.length &&
    checks.mixedCase &&
    checks.number &&
    checks.special &&
    checks.match;

  const handleDiscard = () => {
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setOldPasswordError("");
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const handleChangePassword = () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    Post("/auth/changepassword", { oldPassword, password, confirmPassword })
      .then((res) => {
        if (res.success) {
          if (res.token) localStorage.setItem("token", res.token);
          displayMessage(res.message || "Password updated", "success");
          handleDiscard();
        } else {
          displayMessage(res.message || "Password update failed", "error");
        }
      })
      .catch((err) => displayMessage(err.message, "error"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-4 pb-28">
      <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-inputBorder/40">
          <h2 className="font-trykker text-lg text-black">Change password</h2>
          <p className="text-xs text-grey mt-0.5">Use a strong password you don't reuse elsewhere.</p>
        </div>

        <div className="p-5 space-y-4">
          <FloatingInput
            label="Current password"
            type="password"
            value={oldPassword}
            setValue={setOldPassword}
            error={oldPasswordError}
            setError={setOldPasswordError}
            required
            autoComplete="current-password"
          />

          <FloatingInput
            label="New password"
            type="password"
            value={password}
            setValue={setPassword}
            error={passwordError}
            setError={setPasswordError}
            required
            autoComplete="new-password"
          />

          {/* Inline strength meter */}
          {password.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-grey font-semibold">Strength</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${strengthTone}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => {
                  const filled = i < score;
                  const tone =
                    !filled ? "bg-mainBg" :
                    score <= 2 ? "bg-orangeBrown" :
                    score === 3 ? "bg-bluecolor" :
                    "bg-lightGreen2";
                  return (
                    <span
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${tone}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[
                  { ok: checks.length, label: "8+ chars" },
                  { ok: checks.mixedCase, label: "Aa" },
                  { ok: checks.number, label: "0–9" },
                  { ok: checks.special, label: "!@#" },
                ].map(({ ok, label }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                      ok
                        ? "bg-lightGreen2/10 text-lightGreen2 ring-1 ring-lightGreen2/25"
                        : "bg-mainBg text-grey ring-1 ring-inputBorder/60"
                    }`}
                  >
                    {ok ? <HiOutlineCheck size={10} strokeWidth={3} /> : <HiOutlineXMark size={10} strokeWidth={3} />}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <FloatingInput
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            error={confirmPasswordError}
            setError={setConfirmPasswordError}
            required
            autoComplete="new-password"
          />

          {confirmPassword.length > 0 && !checks.match && (
            <p className="text-xs text-orangeBrown ml-1">Passwords don't match</p>
          )}
        </div>
      </div>

      {/* Sticky save bar — same style as Personal Information */}
      <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-[min(560px,calc(100vw-340px))] z-40 pointer-events-none">
        <div
          className={`pointer-events-auto rounded-2xl bg-white/95 backdrop-blur ring-1 ring-inputBorder/60 shadow-lg p-3 flex items-center justify-between gap-3 transition-all ${
            dirty ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              canSubmit ? "bg-lightGreen2/15 text-lightGreen2" : "bg-orangeBrown/10 text-orangeBrown"
            }`}>
              {canSubmit ? <HiOutlineShieldCheck size={16} /> : <HiOutlineExclamationTriangle size={16} />}
            </span>
            <p className="text-xs font-semibold text-greyBlack truncate">
              {canSubmit ? "Ready to update" : "Complete all fields"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={loading}
              className="h-9 px-3 rounded-xl text-xs font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 hover:ring-grey/40 transition flex items-center gap-1 disabled:opacity-50"
            >
              <HiOutlineXMark size={13} />
              Discard
            </button>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={!canSubmit || loading}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating
                </>
              ) : (
                <>
                  <HiOutlineCheck size={13} />
                  Update password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;
