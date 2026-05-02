import { useMemo, useState } from "react";
import {
    Navbar,
    SideDrawer,
    Information,
    Email,
    Password,
    Notification,
} from "../../../components";
import { UseStateContext } from "../../../context/ContextProvider";
import {
    HiOutlineUser,
    HiOutlineLockClosed,
    HiOutlineEnvelope,
    HiOutlineBell,
    HiOutlineChevronRight,
    HiOutlineSparkles,
} from "react-icons/hi2";

const TABS_ADULT = [
    { key: 0, title: "Personal Information", desc: "Profile photo, name & details", Icon: HiOutlineUser },
    { key: 1, title: "Password", desc: "Change your password", Icon: HiOutlineLockClosed },
    { key: 2, title: "Email", desc: "Email notification preferences", Icon: HiOutlineEnvelope },
    { key: 3, title: "Notifications", desc: "In-app alerts & updates", Icon: HiOutlineBell },
];

const TABS_KID = [
    { key: 0, title: "About me", desc: "My avatar, name & class", emoji: "🧑‍🚀", Icon: HiOutlineUser },
    { key: 1, title: "Password", desc: "Keep my account safe", emoji: "🔒", Icon: HiOutlineLockClosed },
    { key: 2, title: "Email pings", desc: "What lands in my inbox", emoji: "📬", Icon: HiOutlineEnvelope },
    { key: 3, title: "Notifications", desc: "Alerts inside the app", emoji: "🔔", Icon: HiOutlineBell },
];

const getInitials = (name?: string) =>
    (name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "C";

const Settings = () => {
    const { hasChanges, setIsModalOpen } = UseStateContext();
    const [currentState, setCurrentState] = useState<number>(0);

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    const isStudent = user?.userType === "Student";
    const TABS = isStudent ? TABS_KID : TABS_ADULT;

    const handleClick = (index: number) => {
        try {
            if (hasChanges) setIsModalOpen(true);
            else setCurrentState(index);
        } catch {
            setCurrentState(index);
        }
    };

    const renderTab = () => {
        switch (currentState) {
            case 0: return <Information />;
            case 1: return <Password />;
            case 2: return <Email />;
            case 3: return <Notification />;
            default: return <Information />;
        }
    };

    const fullName: string = user?.profile?.fullName || user?.fullName || user?.userName || "Friend";
    const role = user?.userType || "Member";
    const grade = user?.profile?.grade?.grade;

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Settings" />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                    {/* HERO — kid version vs adult version */}
                    {isStudent ? (
                        <section className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white p-6 md:p-8 shadow-[0_25px_60px_-25px_rgba(217,70,239,0.55)]">
                            <div aria-hidden className="absolute inset-0 pointer-events-none">
                                <span className="absolute top-6 left-12 text-3xl animate-bounce" style={{ animationDuration: "3s" }}>⚙️</span>
                                <span className="absolute top-20 right-24 text-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>✨</span>
                                <span className="absolute bottom-8 left-32 text-2xl animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1.1s" }}>🌟</span>
                                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                                <div className="absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            </div>

                            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                <div className="flex items-center gap-4 min-w-0">
                                    {user?.image ? (
                                        <img
                                            src={user.image}
                                            alt=""
                                            className="h-20 w-20 md:h-24 md:w-24 rounded-3xl object-cover ring-4 ring-white/40 shadow-xl flex-shrink-0"
                                        />
                                    ) : (
                                        <span className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-white text-fuchsia-600 flex items-center justify-center font-trykker text-3xl shadow-xl ring-4 ring-white/40 flex-shrink-0">
                                            {getInitials(fullName)}
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">Your settings</p>
                                        <h1 className="font-trykker text-3xl md:text-4xl mt-0.5 leading-tight truncate">
                                            Hi, {fullName.split(" ")[0]}! 👋
                                        </h1>
                                        <p className="text-sm md:text-base text-white/90 mt-1.5 leading-relaxed">
                                            Make this place feel like yours.
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            <span className="px-2 py-0.5 rounded-full bg-white/20 ring-1 ring-white/25 backdrop-blur-sm text-[11px] font-bold">
                                                {role}
                                            </span>
                                            {grade && (
                                                <span className="px-2 py-0.5 rounded-full bg-white/20 ring-1 ring-white/25 backdrop-blur-sm text-[11px] font-bold">
                                                    Grade {grade}
                                                </span>
                                            )}
                                            {user?.email && (
                                                <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[11px] text-white/90 truncate max-w-[200px]">
                                                    {user.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:flex items-center justify-center h-24 w-24 rounded-3xl bg-white/15 ring-2 ring-white/30 backdrop-blur text-6xl shadow-xl">
                                    🚀
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(113,2,255,0.35)]">
                            <div
                                aria-hidden
                                className="absolute inset-0 opacity-[0.08]"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                                    backgroundSize: "28px 28px",
                                }}
                            />
                            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                <div className="flex items-center gap-4 min-w-0">
                                    {user?.image ? (
                                        <img
                                            src={user.image}
                                            alt=""
                                            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/30 shadow-lg flex-shrink-0"
                                        />
                                    ) : (
                                        <span className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30 text-white flex items-center justify-center font-trykker text-xl flex-shrink-0">
                                            {getInitials(fullName)}
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs uppercase tracking-wider text-white/70">Account</p>
                                        <h1 className="font-trykker text-2xl md:text-3xl mt-0.5 leading-tight truncate">
                                            {fullName}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                                            <span className="px-2 py-0.5 rounded-full bg-white/20 ring-1 ring-white/25 backdrop-blur-sm font-semibold">
                                                {role}
                                            </span>
                                            {user?.email && (
                                                <span className="text-white/85 truncate max-w-[260px]">{user.email}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Layout: tabs + content */}
                    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Tab rail */}
                        <aside className="lg:col-span-1">
                            <nav className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-2 lg:sticky lg:top-24">
                                <ul className="flex lg:flex-col flex-row gap-1 overflow-x-auto lg:overflow-visible">
                                    {TABS.map((tab) => {
                                        const active = currentState === tab.key;
                                        const Icon = tab.Icon as any;
                                        return (
                                            <li key={tab.key} className="flex-shrink-0 lg:flex-shrink lg:w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => handleClick(tab.key)}
                                                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left whitespace-nowrap lg:whitespace-normal ${
                                                        active
                                                            ? isStudent
                                                                ? "bg-gradient-to-r from-fuchsia-100 to-pink-100 ring-1 ring-fuchsia-200"
                                                                : "bg-gradient-to-r from-primary/10 to-secondary/10 ring-1 ring-secondary/20"
                                                            : "hover:bg-mainBg"
                                                    }`}
                                                >
                                                    {isStudent && (tab as any).emoji ? (
                                                        <span
                                                            className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition text-xl ${
                                                                active
                                                                    ? "bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-md shadow-fuchsia-500/30"
                                                                    : "bg-mainBg group-hover:bg-white"
                                                            }`}
                                                        >
                                                            {(tab as any).emoji}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                                                                active
                                                                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md shadow-secondary/20"
                                                                    : "bg-mainBg text-grey group-hover:text-secondary"
                                                            }`}
                                                        >
                                                            <Icon size={16} />
                                                        </span>
                                                    )}
                                                    <div className="min-w-0 flex-1 hidden lg:block">
                                                        <p
                                                            className={`text-sm font-bold leading-tight ${
                                                                active
                                                                    ? isStudent
                                                                        ? "text-fuchsia-700"
                                                                        : "text-black"
                                                                    : "text-greyBlack"
                                                            }`}
                                                        >
                                                            {tab.title}
                                                        </p>
                                                        <p className="text-[11px] text-grey mt-0.5 leading-snug">{tab.desc}</p>
                                                    </div>
                                                    <span
                                                        className={`hidden lg:inline lg:ml-2 ${
                                                            active
                                                                ? isStudent
                                                                    ? "text-fuchsia-500"
                                                                    : "text-secondary"
                                                                : "text-grey opacity-0 group-hover:opacity-100"
                                                        } transition`}
                                                    >
                                                        <HiOutlineChevronRight size={14} />
                                                    </span>
                                                    <span className="lg:hidden text-sm font-bold text-greyBlack">{tab.title}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {isStudent && (
                                    <div className="hidden lg:block mt-3 px-3 py-2.5 rounded-xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 text-amber-800">
                                        <p className="text-[11px] font-bold leading-snug inline-flex items-start gap-1">
                                            <HiOutlineSparkles size={12} className="mt-0.5 flex-shrink-0" />
                                            <span>Tap a tab to change something. Your changes save when you tap "Save."</span>
                                        </p>
                                    </div>
                                )}
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="lg:col-span-3">{renderTab()}</div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
