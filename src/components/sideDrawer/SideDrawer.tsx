import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiFillGift, AiOutlineHome, AiOutlineSetting } from "react-icons/ai";
import { MdOutlineCalendarMonth, MdOutlineFeedback, MdOutlineSubscriptions } from "react-icons/md";
import { FaChildren } from "react-icons/fa6";
import { IoBookOutline } from "react-icons/io5";
import { PiBooksDuotone, PiStudentFill } from "react-icons/pi";
import { RiFileList3Line } from "react-icons/ri";
import { IoMdLogOut } from "react-icons/io";
import { FiX, FiLock } from "react-icons/fi";
import { UseStateContext } from "../../context/ContextProvider";
import { RouteName } from "../../routes/RouteNames";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";

type MenuItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  text: string;
  route?: string;
  onClick?: () => void;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const subjectRoutes = [
  RouteName.SUBJECTS_SCREEN,
  RouteName.TOPICS_SUBJECTS,
  RouteName.LESSONS_STUDENT,
  RouteName.MATERIAL_STUDENT,
  RouteName.GAMES,
  RouteName.DAILY_QUIZ_ROOT,
  RouteName.DAILY_QUIZ,
  RouteName.QUIZ_CONFIRMATION,
  RouteName.SOLO_QUIZ,
  RouteName.MULTIPLAYER_QUIZ,
];

const SideDrawer = () => {
  const {
    role,
    user,
    hasChanges,
    setIsModalOpen,
    setHasChanges,
    showSideBar,
    setShowSideBar,
  } = UseStateContext();

  const { isSubscribed, loading: subLoading } = useSubscriptionStatus();
  const subResolved = !subLoading;
  const location = useLocation();
  const navigate = useNavigate();

  const goSubscription = () => navigate(RouteName.SUBSCRIPTION);

  const handleNavigate = (
    itemRoute: string | undefined,
    onClick?: (() => void) | undefined
  ) => {
    try {
      if (
        itemRoute &&
        itemRoute !== RouteName.SUBSCRIPTION &&
        subResolved &&
        !isSubscribed &&
        role !== "Student"
      ) {
        navigate(RouteName.SUBSCRIPTION);
        setShowSideBar(false);
        return;
      }

      if (hasChanges) {
        setIsModalOpen(true);
      } else if (onClick) {
        onClick();
      } else if (itemRoute) {
        navigate(itemRoute);
      }
      setShowSideBar(false);
    } catch {
      if (onClick) onClick();
      else if (itemRoute) navigate(itemRoute);
      setShowSideBar(false);
      setHasChanges(false);
    }
  };

  const isCurrentRoute = (itemRoute: string | undefined) => {
    if (!itemRoute) return false;
    if (itemRoute === RouteName.SUBJECTS_SCREEN) {
      return subjectRoutes.some((r) => location.pathname.startsWith(r));
    }
    return location.pathname.startsWith(itemRoute);
  };

  const groups: MenuGroup[] = useMemo(() => {
    if (role === "Parent") {
      return [
        {
          label: "Main",
          items: [
            { icon: AiOutlineHome, text: "Dashboard", route: RouteName.DASHBOARD_SCREEN },
            { icon: FaChildren, text: "My Children", route: RouteName.MYCHILDREN_SCREEN },
            { icon: MdOutlineCalendarMonth, text: "Calendar", route: RouteName.CALENDAR_SCREEN },
          ],
        },
        {
          label: "Account",
          items: [
            { icon: MdOutlineSubscriptions, text: "Subscription", route: RouteName.SUBSCRIPTION, onClick: goSubscription },
            { icon: AiFillGift, text: "Coupons", route: RouteName.COUPON },
            { icon: AiOutlineSetting, text: "Settings", route: RouteName.SETTING_SCREEN },
          ],
        },
      ];
    }
    if (role === "Teacher") {
      return [
        {
          label: "Main",
          items: [
            { icon: AiOutlineHome, text: "Dashboard", route: RouteName.DASHBOARD_SCREEN_TEACHER },
            { icon: IoBookOutline, text: "Quizzes", route: RouteName.MY_QUIZZES },
            { icon: PiStudentFill, text: "Students", route: RouteName.STUDENTS_SCREEN },
            { icon: MdOutlineCalendarMonth, text: "Calendar", route: RouteName.CALENDAR_SCREEN },
            { icon: MdOutlineFeedback, text: "Feedback", route: RouteName.FEEDBACK_SCREEN },
          ],
        },
        {
          label: "Account",
          items: [
            { icon: MdOutlineSubscriptions, text: "Subscription", route: RouteName.SUBSCRIPTION, onClick: goSubscription },
            { icon: AiFillGift, text: "Coupons", route: RouteName.COUPON },
            { icon: AiOutlineSetting, text: "Settings", route: RouteName.SETTING_SCREEN },
          ],
        },
      ];
    }
    if (role === "Student") {
      return [
        {
          label: "Main",
          items: [
            { icon: AiOutlineHome, text: "Dashboard", route: RouteName.DASHBOARD_SCREEN_STUDENT },
            { icon: PiBooksDuotone, text: "Courses", route: RouteName.SUBJECTS_SCREEN },
            { icon: RiFileList3Line, text: "Results", route: RouteName.RESULTS_SCREEN },
            { icon: MdOutlineCalendarMonth, text: "Calendar", route: RouteName.CALENDAR_SCREEN },
            { icon: MdOutlineFeedback, text: "Feedback", route: RouteName.STUDENT_FEEDBACK },
          ],
        },
        {
          label: "Account",
          items: [
            { icon: AiOutlineSetting, text: "Settings", route: RouteName.SETTING_SCREEN },
          ],
        },
      ];
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    const onResize = () => {
      if (showSideBar) setShowSideBar(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showSideBar, setShowSideBar]);

  const handleHomeClick = () => {
    if (groups[0]?.items[0]?.route) handleNavigate(groups[0].items[0].route);
  };

  const handleSignout = () => {
    try {
      if (hasChanges) setIsModalOpen(true);
      else navigate(RouteName?.AUTH_SCREEN, { replace: true });
      setShowSideBar(false);
    } catch {
      navigate(RouteName?.AUTH_SCREEN, { replace: true });
      setShowSideBar(false);
      setHasChanges(false);
    }
  };

  const fullName: string =
    user?.profile?.fullName || user?.fullName || user?.profile?.userName || user?.userName || "Welcome";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase())
    .join("");

  const renderItem = (item: MenuItem, idx: number) => {
    const Icon = item.icon;
    const isProtected =
      item.route && item.route !== RouteName.SUBSCRIPTION;
    const isDisabled = subResolved && !!isProtected && !isSubscribed && role !== "Student";
    const active = isCurrentRoute(item.route);

    return (
      <li key={idx}>
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => !isDisabled && handleNavigate(item.route, item.onClick)}
          aria-current={active ? "page" : undefined}
          className={`group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-ubuntu transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${active
            ? "bg-white text-secondary shadow-sm font-medium"
            : isDisabled
              ? "text-white/40 cursor-not-allowed"
              : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
        >
          {active && (
            <span
              aria-hidden
              className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-primary to-secondary"
            />
          )}
          <Icon
            size={18}
            className={`shrink-0 ${active ? "text-secondary" : ""}`}
          />
          <span className="flex-1 text-left truncate">{item.text}</span>
          {isDisabled && <FiLock size={12} className="shrink-0 opacity-70" />}
        </button>
      </li>
    );
  };

  const panel = (
    <aside
      className="relative flex h-screen w-full flex-col bg-navBg text-white"
      aria-label="Primary"
    >
      {/* gradient accent at top */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/40 via-secondary/30 to-transparent pointer-events-none"
      />

      {/* Mobile close */}
      <button
        type="button"
        onClick={() => setShowSideBar(false)}
        aria-label="Close menu"
        className="lg:hidden absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
      >
        <FiX size={16} />
      </button>

      {/* Brand */}
      <div className="relative px-5 pt-6 pb-5">
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex items-center gap-3 focus:outline-none"
        >
          <div className="h-10 w-10 rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md flex items-center justify-center">
            <img
              src={require("../../images/settings/sm-Logo-Transparent-PNG-942x1024 (1).png")}
              alt=""
              className="h-7 w-7 object-contain"
            />
          </div>
          <div className="text-left">
            <p className="font-trykker text-lg leading-none">Classerly</p>
            {role && (
              <p className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/90 ring-1 ring-white/20">
                {role}
              </p>
            )}
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:thin]">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-2 mb-1.5 text-[10px] uppercase tracking-wider text-white/50 font-medium">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item, idx) => renderItem(item, idx))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="relative border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-semibold ring-2 ring-white/15">
            {initials || "C"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{fullName}</p>
            <p className="text-[11px] text-white/60 truncate">
              {user?.profile?.email || user?.email || ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignout}
            aria-label="Sign out"
            className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <IoMdLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      {showSideBar && (
        <div
          aria-hidden
          onClick={() => setShowSideBar(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* Mobile sliding panel */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-72 max-w-[80vw] transform transition-transform duration-300 ${showSideBar ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {panel}
      </div>

      {/* Desktop static panel */}
      <div className="hidden lg:block fixed top-0 left-0 z-40 h-screen w-1/6">
        {panel}
      </div>
    </>
  );
};

export default SideDrawer;
