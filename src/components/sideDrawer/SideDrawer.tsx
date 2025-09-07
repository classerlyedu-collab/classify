import { AiFillGift, AiOutlineClose, AiOutlineHome } from "react-icons/ai";
import {
  MdOutlineCalendarMonth,
  MdOutlineFeedback,
} from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import { FaChildren } from "react-icons/fa6";
import { UseStateContext } from "../../context/ContextProvider";
import { useEffect } from "react";
import { RouteName } from "../../routes/RouteNames";
import { useLocation, useNavigate } from "react-router-dom";
import { IoBookOutline } from "react-icons/io5";
import { PiBooksDuotone, PiStudentFill } from "react-icons/pi";
import { RiFileList3Line } from "react-icons/ri";
import { IoMdLogOut } from "react-icons/io";
import { Post } from "../../config/apiMethods";
import { displayMessage } from "../../config";
import { MdOutlineSubscriptions } from "react-icons/md";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";

// Define interface for menu items
interface MenuItem {
  icon: React.ReactElement;
  text: string;
  route?: string;
  onClick?: () => void;
}

const SideDrawer = () => {
  const {
    role,
    hasChanges,
    setIsModalOpen,
    setHasChanges
  } = UseStateContext();

  const { isSubscribed, loading } = useSubscriptionStatus();

  const location = useLocation();
  const navigate = useNavigate();

  // Create a URLSearchParams object to extract the query parameters
  const searchParams = new URLSearchParams(location.search);

  // Get the value of the 'childern' query parameter
  const childernValue = searchParams.get("childern");
  const { showSideBar, setShowSideBar } = UseStateContext();

  const handleSubscriptionPortal = () => {
    navigate(RouteName.SUBSCRIPTION);
  };

  const handleNavigate = (itemRoute: string | undefined, onClick?: (() => void) | undefined) => {
    try {
      // Check if user is subscribed for protected routes
      if (itemRoute && itemRoute !== RouteName.SUBSCRIPTION && itemRoute !== RouteName.COUPON && !isSubscribed && role !== 'Student') {
        // Debug logging for navigation
        const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
        console.log('SideDrawer: Redirecting to subscription', {
          itemRoute,
          isSubscribed,
          role,
          userType: userFromStorage?.userType
        });

        // Redirect to subscription page for non-subscribed users
        navigate(RouteName.SUBSCRIPTION);
        setShowSideBar(false);
        return;
      }

      if (hasChanges) {
        setIsModalOpen(true);
      } else {
        if (onClick) {
          onClick();
        } else if (itemRoute) {
          navigate(itemRoute);
        }
      }
      setShowSideBar(false);
    } catch (error) {
      if (onClick) {
        onClick();
      } else if (itemRoute) {
        navigate(itemRoute);
      }
      setShowSideBar(false);
      setHasChanges(false);
    }
  };

  const isCurrentRoute = (itemRoute: string | undefined) => {
    if (!itemRoute) return false;
    if (itemRoute === RouteName.SUBJECTS_SCREEN) {
      return subjectRoutes.some((route) => location.pathname.startsWith(route));
    }
    return location.pathname.startsWith(itemRoute);
  };

  const parentMenuItems: MenuItem[] = [
    {
      icon: <AiOutlineHome className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Dashboard",
      route: RouteName.DASHBOARD_SCREEN,
    },
    {
      icon: <FaChildren className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "My Children",
      route: RouteName.MYCHILDREN_SCREEN,
    },
    {
      icon: (
        <MdOutlineCalendarMonth className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Calendar",
      route: RouteName.CALENDAR_SCREEN,
    },
    {
      icon: (
        <MdOutlineSubscriptions className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Subscription",
      route: RouteName.SUBSCRIPTION,
      onClick: handleSubscriptionPortal,
    },
    {
      icon: (
        <AiOutlineSetting className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Settings",
      route: RouteName.SETTING_SCREEN,
    },
    {
      icon: (
        <AiFillGift className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Create Coupon",
      route: RouteName.COUPON,
    },
  ];

  const teacherMenuItems: MenuItem[] = [
    {
      icon: <AiOutlineHome className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Dashboard",
      route: RouteName.DASHBOARD_SCREEN_TEACHER,
    },
    {
      icon: <IoBookOutline className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Quizzes",
      route: RouteName.MY_QUIZZES,
    },
    {
      icon: <PiStudentFill className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Students",
      route: RouteName.STUDENTS_SCREEN,
    },
    {
      icon: (
        <MdOutlineSubscriptions className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Subscription",
      route: RouteName.SUBSCRIPTION,
      onClick: handleSubscriptionPortal,
    },
    {
      icon: (
        <MdOutlineFeedback className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Feedback",
      route: RouteName.FEEDBACK_SCREEN,
    },
    {
      icon: (
        <MdOutlineCalendarMonth className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Calendar",
      route: RouteName.CALENDAR_SCREEN,
    },
    {
      icon: (
        <AiOutlineSetting className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Settings",
      route: RouteName.SETTING_SCREEN,
    },
    {
      icon: (
        <AiFillGift className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Create Coupon",
      route: RouteName.COUPON,
    },
  ];

  const studentMenuItems: MenuItem[] = [
    {
      icon: <AiOutlineHome className="mr-4 text-md md:text-base lg:text-2xl" />,
      text: "Dashboard",
      route: RouteName.DASHBOARD_SCREEN_STUDENT,
    },
    {
      icon: (
        <PiBooksDuotone className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Courses",
      route: RouteName.SUBJECTS_SCREEN,
    },
    {
      icon: (
        <RiFileList3Line className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Results",
      route: RouteName.RESULTS_SCREEN,
    },
    {
      icon: (
        <MdOutlineCalendarMonth className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Calendar",
      route: RouteName.CALENDAR_SCREEN,
    },
    {
      icon: (
        <MdOutlineFeedback className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Feedback",
      route: RouteName.STUDENT_FEEDBACK,
    },
    {
      icon: (
        <AiOutlineSetting className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Settings",
      route: RouteName.SETTING_SCREEN,
    },
    {
      icon: (
        <AiFillGift className="mr-4 text-md md:text-base lg:text-2xl" />
      ),
      text: "Create Coupon",
      route: RouteName.COUPON,
    },
  ];

  const getMenuItems = (): MenuItem[] | null => {
    switch (role) {
      case "Student":
        return studentMenuItems;
      case "Teacher":
        return teacherMenuItems;
      case "Parent":
        return parentMenuItems;

      default:
        return null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (showSideBar) {
        setShowSideBar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showSideBar, setShowSideBar]);

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

  const handleSignout = () => {
    try {
      if (hasChanges) {
        setIsModalOpen(true);
      } else {
        navigate(RouteName?.AUTH_SCREEN, { replace: true });
      }
      setShowSideBar(false);
    } catch (error) {
      navigate(RouteName?.AUTH_SCREEN, { replace: true });
      setShowSideBar(false);
      setHasChanges(false);

    }
  };

  return (
    <div
      className={`${showSideBar
        ? "fixed top-0 left-0 h-screen w-4/6 md:w-1/4 z-50"
        : "hidden"
        }  lg:flex lg:fixed top-0 left-0 flex-col w-1/6 h-screen bg-navBg z-50`}
    >
      <AiOutlineClose
        onClick={() => setShowSideBar(false)}
        size={30}
        className="absolute right-4 top-4 cursor-pointer text-white lg:hidden"
      />

      <div
        onClick={() => setShowSideBar(false)}
        className={`${showSideBar ? "sm:flex lg:hidden hidden sm:w-1/3 md:w-3/4" : "hidden"
          } bg-black/80 fixed w-screen h-screen z-10 top-0 right-0`}
      />

      <div>
        <h2
          className="text-sm md:text-base lg:text-md p-4 font-ubuntu font-semibold text-white text-center cursor-pointer"
          onClick={() => {
            if (role === "Student") {
              handleNavigate(studentMenuItems[0]?.route);
            }
            if (role === "Teacher") {
              handleNavigate(teacherMenuItems[0]?.route);
            }
            if (role === "Parent") {
              handleNavigate(parentMenuItems[0]?.route);
            }
          }}
        >
          Classerly.com
        </h2>
        <nav>
          <ul className="flex flex-col py-4 text-gray-800">
            {getMenuItems()?.map((item, index) => {
              // Check if this item should be disabled
              const isProtectedRoute = item.route &&
                item.route !== RouteName.SUBSCRIPTION &&
                item.route !== RouteName.COUPON;
              const isDisabled = isProtectedRoute && !isSubscribed && role !== 'Student';

              // Debug logging for menu items
              if (item.route && isProtectedRoute) {
                console.log('SideDrawer: Menu item status', {
                  route: item.route,
                  text: item.text,
                  isProtectedRoute,
                  isSubscribed,
                  role,
                  isDisabled
                });
              }

              return (
                <div className="w-full h-full" key={index}>
                  <div
                    className={`py-4 ${isCurrentRoute(item.route)
                      ? "border-l-4 border-yellow-200 bg-gradient-to-r from-whiteTransparent to-navBg"
                      : isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-l-4 border-transparent bg-transparent"
                      }`}
                    onClick={() => !isDisabled && handleNavigate(item.route, item.onClick)}
                  >
                    <li className={`text-xl text-white flex mx-auto px-4 flex-row justify-start items-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}>
                      {item.icon}
                      <p className="text-sm md:text-base lg:text-md font-ubuntu text-white">
                        {item.text}
                      </p>
                    </li>
                  </div>
                </div>
              );
            })}

            <div className="w-full absolute bottom-10 right-0">
              <div
                className="text-xl text-white flex cursor-pointer mx-auto px-4 flex-row justify-start items-center"
                onClick={handleSignout}
              >
                <IoMdLogOut className="mr-4 text-md md:text-base lg:text-2xl text-orange-600" />

                <p className="text-sm md:text-base lg:text-md text-orange-600 font-semibold font-ubuntu">
                  Sign Out
                </p>
              </div>
            </div>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideDrawer;
