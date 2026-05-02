import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FiMenu,
    FiBell,
    FiSearch,
    FiChevronRight,
    FiSettings,
    FiLogOut,
    FiUser,
} from "react-icons/fi";
import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineCalendar,
    HiOutlineCog6Tooth,
    HiOutlineAcademicCap,
    HiOutlineDocumentText,
    HiOutlineSparkles,
    HiOutlineChatBubbleLeftRight,
    HiOutlineGift,
    HiOutlineCreditCard,
} from "react-icons/hi2";
import { UseStateContext } from "../../../context/ContextProvider";
import { RouteName } from "../../../routes/RouteNames";
import { NotificationsModal } from "../NotificationsModal";
import { CommandPalette } from "../../CommandPalette";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

type NavbarProps = {
    title?: string;
    hideTitle?: boolean;
    hideSearchBar?: boolean;
    mystd?: any;
};

const ROUTE_META: Record<string, { icon: React.ComponentType<any>; label: string; section: string }> = {
    [RouteName.DASHBOARD_SCREEN]: { icon: HiOutlineHome, label: "Dashboard", section: "Overview" },
    [RouteName.DASHBOARD_SCREEN_TEACHER]: { icon: HiOutlineHome, label: "Dashboard", section: "Overview" },
    [RouteName.DASHBOARD_SCREEN_STUDENT]: { icon: HiOutlineHome, label: "Dashboard", section: "Overview" },
    [RouteName.MYCHILDREN_SCREEN]: { icon: HiOutlineUsers, label: "My Children", section: "Family" },
    [RouteName.CHILD_RESULT_SCREEN]: { icon: HiOutlineDocumentText, label: "Child results", section: "Family" },
    [RouteName.CALENDAR_SCREEN]: { icon: HiOutlineCalendar, label: "Calendar", section: "Plan" },
    [RouteName.SETTING_SCREEN]: { icon: HiOutlineCog6Tooth, label: "Settings", section: "Account" },
    [RouteName.SUBSCRIPTION]: { icon: HiOutlineCreditCard, label: "Subscription", section: "Account" },
    [RouteName.COUPON]: { icon: HiOutlineGift, label: "Coupons", section: "Account" },
    [RouteName.MY_QUIZZES]: { icon: HiOutlineSparkles, label: "Quizzes", section: "Teach" },
    [RouteName.STUDENTS_SCREEN]: { icon: HiOutlineAcademicCap, label: "Students", section: "Teach" },
    [RouteName.FEEDBACK_SCREEN]: { icon: HiOutlineChatBubbleLeftRight, label: "Feedback", section: "Teach" },
};

const dateLabel = () => {
    try {
        return new Date().toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "";
    }
};

const Navbar = ({ title, hideTitle, hideSearchBar }: NavbarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        setShowSideBar,
        hasChanges,
        setIsModalOpen,
        setHasChanges,
        user,
    } = UseStateContext();

    const [, setSubjects] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);

    const meta =
        ROUTE_META[location.pathname] ||
        Object.entries(ROUTE_META).find(([k]) => location.pathname.startsWith(k))?.[1];
    const HeaderIcon = meta?.icon || HiOutlineSparkles;
    const headerLabel = meta?.label || title || "Dashboard";
    const headerSection = meta?.section || "";

    const fullName: string =
        user?.profile?.fullName ||
        user?.fullName ||
        user?.profile?.userName ||
        user?.userName ||
        "";
    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join("");
    const email = user?.profile?.email || user?.email || "";
    const role = user?.userType || "";

    const safeNavigate = (route: string) => {
        try {
            if (hasChanges) setIsModalOpen(true);
            else navigate(route);
        } catch {
            navigate(route);
            setHasChanges(false);
        }
    };

    useEffect(() => {
        Get("/getNotification").then((d) => {
            if (d?.success) setNotifications(d.data);
        });
    }, []);

    useEffect(() => {
        if (user?.userType === "Parent") {
            Get("/mychilds")
                .then((d) => {
                    if (d?.success) setSubjects(d.data);
                    else if (d?.message) displayMessage(d.message, "error");
                })
                .catch((err) => displayMessage(err.message, "error"));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unreadCount = useMemo(() => {
        try {
            const cu = JSON.parse(localStorage.getItem("user") || "{}");
            const id = cu?._id || cu?.id;
            if (!id) return 0;
            return notifications.reduce((acc, n) => {
                if (!n.readBy) return acc + 1;
                const seen = n.readBy.some(
                    (r: any) => r.userId === id || r.userId?._id === id
                );
                return acc + (seen ? 0 : 1);
            }, 0);
        } catch {
            return 0;
        }
    }, [notifications]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!profileRef.current) return;
            if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsPaletteOpen((v) => !v);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 w-full">
                {/* Hamburger (mobile) */}
                <button
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setShowSideBar(true)}
                    className="lg:hidden h-10 w-10 rounded-xl border border-inputBorder bg-white text-greyBlack hover:text-black hover:border-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <FiMenu size={18} />
                </button>

                {/* Title block */}
                {!hideTitle && (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="hidden sm:flex h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-secondary/15 items-center justify-center">
                            <HeaderIcon className="text-secondary" size={18} />
                        </div>
                        <div className="min-w-0">
                            {headerSection && (
                                <p className="text-[10px] uppercase tracking-wider text-grey font-medium leading-none">
                                    {headerSection}
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <h1 className="font-ubuntu font-semibold text-base md:text-lg text-black truncate">
                                    {headerLabel}
                                </h1>
                                {title && headerLabel !== title && (
                                    <>
                                        <FiChevronRight className="text-grey shrink-0" size={14} />
                                        <span className="text-sm text-greyBlack truncate">{title}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search (desktop) */}
                {!hideSearchBar && (
                    <div className="hidden xl:flex flex-1 justify-center px-6 max-w-xl mx-auto">
                        <button
                            type="button"
                            onClick={() => setIsPaletteOpen(true)}
                            className="group w-full inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-inputBorder bg-white hover:border-primary text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <FiSearch className="text-greyBlack group-hover:text-secondary" size={16} />
                            <span className="text-sm text-inputPlaceholder flex-1">
                                Search across Classerly
                            </span>
                            <span className="hidden md:inline text-[10px] text-grey rounded-md border border-inputBorder bg-mainBg px-1.5 py-0.5 font-medium">
                                ⌘ K
                            </span>
                        </button>
                    </div>
                )}

                {/* Right cluster */}
                <div className="ml-auto flex items-center gap-2">
                    {/* Mobile search trigger */}
                    {!hideSearchBar && (
                        <button
                            type="button"
                            onClick={() => setIsPaletteOpen(true)}
                            aria-label="Search"
                            className="xl:hidden h-9 w-9 rounded-xl border border-inputBorder bg-white text-greyBlack hover:text-secondary hover:border-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <FiSearch size={16} />
                        </button>
                    )}
                    {/* Date pill */}
                    <span className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-mainBg text-greyBlack text-xs font-medium">
                        <HiOutlineCalendar size={14} className="text-secondary" />
                        {dateLabel()}
                    </span>

                    {/* Notifications */}
                    <button
                        type="button"
                        onClick={() => setIsNotifOpen(true)}
                        aria-label={
                            unreadCount > 0
                                ? `Notifications, ${unreadCount} unread`
                                : "Notifications"
                        }
                        className="relative h-9 w-9 rounded-xl border border-inputBorder bg-white text-greyBlack hover:text-secondary hover:border-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <FiBell size={16} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            type="button"
                            onClick={() => setProfileOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={profileOpen}
                            className="group flex items-center gap-2 h-9 pl-1 pr-2 sm:pr-3 rounded-full bg-white border border-inputBorder hover:border-primary transition focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt=""
                                    className="h-7 w-7 rounded-full object-cover"
                                />
                            ) : (
                                <span className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[11px] font-semibold flex items-center justify-center">
                                    {initials || "C"}
                                </span>
                            )}
                            <span className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-[12px] font-semibold text-black truncate max-w-[120px]">
                                    {fullName?.split(" ")[0] || "Profile"}
                                </span>
                                {role && (
                                    <span className="text-[10px] text-grey">{role}</span>
                                )}
                            </span>
                        </button>

                        {profileOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden z-30"
                            >
                                <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-inputBorder/40">
                                    <div className="flex items-center gap-3">
                                        {user?.image ? (
                                            <img
                                                src={user.image}
                                                alt=""
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold flex items-center justify-center">
                                                {initials || "C"}
                                            </span>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-black truncate">
                                                {fullName || "Welcome"}
                                            </p>
                                            <p className="text-[11px] text-greyBlack truncate">
                                                {email || role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            safeNavigate(RouteName.SETTING_SCREEN);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-greyBlack hover:bg-mainBg hover:text-black"
                                    >
                                        <FiUser size={15} className="text-secondary" />
                                        My profile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            safeNavigate(RouteName.SETTING_SCREEN);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-greyBlack hover:bg-mainBg hover:text-black"
                                    >
                                        <FiSettings size={15} className="text-secondary" />
                                        Settings
                                    </button>
                                </div>
                                <div className="border-t border-inputBorder/40 py-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            navigate(RouteName.AUTH_SCREEN, { replace: true });
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-lightRed hover:bg-lightRed/10"
                                    >
                                        <FiLogOut size={15} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NotificationsModal
                isVisible={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                onNotificationsUpdated={() => {
                    Get("/getNotification").then((d) => {
                        if (d?.success) setNotifications(d.data);
                    });
                }}
            />
            <CommandPalette
                isOpen={isPaletteOpen}
                onClose={() => setIsPaletteOpen(false)}
                role={user?.userType}
            />
        </div>
    );
};

export default Navbar;
