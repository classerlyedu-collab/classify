import { Toaster, pushToast } from "../components/Toast";

export const displayMessage = (msg, type) => {
    if (msg === undefined || msg === null) return;
    const t =
        type === "error" || type === "success" || type === "warning" || type === "info"
            ? type
            : "info";
    pushToast(String(msg), t);
};

export default function MasterContainer({ children }) {
    return (
        <>
            <Toaster />
            {children}
        </>
    );
}
