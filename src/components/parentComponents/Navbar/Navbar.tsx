import { useEffect, useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoMenuOutline } from 'react-icons/io5';
import { UseStateContext } from '../../../context/ContextProvider';
// import { NavBarPropsType } from '../../../types/globalTypes';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteName } from '../../../routes/RouteNames';
// import { RoundedDropDown } from '../../roundedDropDown';
// import { coursesDropdown } from '../../../constants/parent/myChildren';
// import { returnMatchingLabel } from '../../../constants/register';
import { NotificationsModal } from '../NotificationsModal';
import { MyChildernsModal } from '../MyChildernModal';
import { Get } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';

const Navbar = ({ title, hideSearchBar, hideTitle, mystd }: any) => {
    const location = useLocation();
    const { showSideBar, setShowSideBar, hasChanges, setIsModalOpen, setHasChanges, user } = UseStateContext();
    const navigate = useNavigate()
    // const [selectedCourse, setSelectedCourse] = useState<number>(0);
    const [subjects, setSubjects] = useState<any[]>([]);
    // const [mystd, setMyStd] = useState<any>({});
    const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility
    const [notifications, setNotifications] = useState<any[]>([]); // State to store notifications

    // Check if there are unread notifications
    const hasUnreadNotifications = () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '');
            const currentUserId = currentUser?._id || currentUser?.id;

            if (!currentUserId) return false;

            return notifications.some(notification => {
                if (!notification.readBy) return true; // If no readBy array, it's unread
                return !notification.readBy.some((readEntry: any) =>
                    readEntry.userId === currentUserId || readEntry.userId._id === currentUserId
                );
            });
        } catch {
            return false;
        }
    };
    const [isChildernModalVisible, setisChildernModalVisible] = useState(false)
    const [studentName, setStudentName] = useState<string>("");

    const handleNavigate = (route: string) => {
        try {
            if (hasChanges) {
                setIsModalOpen(true);
            } else {
                navigate(route);
            }
        } catch (error) {
            navigate(route);
            setHasChanges(false);

        }
    }

    useEffect(() => {

        // Example: Load notifications from local storage or API
        // let storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        Get("/getNotification").then((d) => {
            if (d.success) {

                setNotifications(d.data);
            }
        })

    }, []);
    // const [childData, setChildData] = useState<any[]>([]);
    // useEffect(()=>{
    //     navigate(RouteName.MYCHILDREN_SCREEN+`?childern=${selectedCourse}`)

    // },[selectedCourse])
    useEffect(() => {
        if (user.userType === "Parent") {
            Get("/mychilds")
                .then((d) => {

                    if (d.success) {
                        setSubjects(d.data);
                        //   if(d.data?.length>0){
                        //     navigate(RouteName.MYCHILDREN_SCREEN+`?childern=${d.data[0]._id}`)
                        //     // localStorage.setItem("mychildern",JSON.stringify(d.data[0]))
                        //   }

                    } else {
                        displayMessage(d.message, "error");
                    }
                })
                .catch((err) => {
                    displayMessage(err.message, "error");
                });
        }
    }, []);

    const isMyChildrenRoute = () => {
        return location.pathname === RouteName?.MYCHILDREN_SCREEN;
    };

    const handleNotificationClick = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setisChildernModalVisible(false)
    };

    const handleAddChildernClick = () => {
        setisChildernModalVisible(true);
    };



    return (
        <div className="flex flex-row items-center justify-between w-full flex-wrap">
            {isMyChildrenRoute() ? (
                <div className="w-full flex flex-col lg:flex-row lg:justify-between">
                    {/* 1st - Title and Actions on Mobile, Title only on Desktop */}
                    <div className="mt-2 md:mt-0 mb-3 lg:mt-0 flex justify-between lg:justify-start w-full lg:w-auto items-center">
                        <div className="flex items-center">
                            <IoMenuOutline
                                className="lg:hidden text-black mr-1 md:mr-2 text-xl md:text-2xl"
                                onClick={() => setShowSideBar(true)}
                            />
                            <h1 className="font-ubuntu font-bold text-lg md:text-xl text-greyBlack ml-2 lg:ml-0">
                                My Child
                            </h1>
                        </div>

                        {/* Actions - Show on mobile, hide on desktop */}
                        <div className="flex flex-row items-center justify-end lg:hidden">
                            {/* Notifications Icon */}
                            <button
                                onClick={handleAddChildernClick}
                                className="border border-greyBlack mr-2 rounded-md hover:border-none hover:bg-secondary px-1.5 py-1.5 hover:text-white transition-all delay-100"
                            >
                                Add Children
                            </button>
                            <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                                <IoIosNotificationsOutline className="flex justify-center items-center text-2xl md:text-3xl" />
                                {hasUnreadNotifications() && (
                                    <div className={`w-2 h-2 bg-red-600 rounded-full absolute top-1 right-1 ${showSideBar ? 'sm:hidden md:flex' : 'flex'}`} />
                                )}
                            </div>
                            <div className="border border-bluecolor rounded-md p-0.5  ml-2 md:ml-3 cursor-pointer" >
                                <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={user?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"} alt="Profile" onClick={() => {

                                    handleNavigate(RouteName.SETTING_SCREEN)
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* 2nd - Actions Section - Desktop only */}
                    <div className="hidden lg:flex flex-row items-center justify-end">
                        {/* Notifications Icon */}
                        <button
                            onClick={handleAddChildernClick}
                            className="border border-greyBlack mr-2 rounded-md hover:border-none hover:bg-secondary px-1.5 py-1.5 hover:text-white transition-all delay-100"
                        >
                            Add Children
                        </button>
                        <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                            <IoIosNotificationsOutline className="flex justify-center items-center text-2xl md:text-3xl" />
                            {hasUnreadNotifications() && (
                                <div className={`w-2 h-2 bg-red-600 rounded-full absolute top-1 right-1 ${showSideBar ? 'sm:hidden md:flex' : 'flex'}`} />
                            )}
                        </div>
                        <div className="border border-bluecolor rounded-md p-0.5  ml-2 md:ml-3 cursor-pointer" >
                            <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={user?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"} alt="Profile" onClick={() => {

                                handleNavigate(RouteName.SETTING_SCREEN)
                            }} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* 1st */}
                    <div className="flex justify-start items-center">
                        <IoMenuOutline
                            className="lg:hidden text-black mr-1 md:mr-2 text-xl md:text-2xl"
                            onClick={() => setShowSideBar(true)}
                        />
                        {!hideTitle && <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack">{title}</h1>}
                    </div>

                    {/* 2nd */}
                    <div className={`flex justify-between items-center md:w-auto flex-wrap`}>
                        {/* Notifications Icon */}
                        {title === "Feedback" && user.userType === "Teacher" &&
                            <button
                                onClick={() => handleNavigate(RouteName.TEACHER_FEEDBACK)}
                                className="border border-greyBlack mr-2 rounded-md hover:border-none hover:bg-secondary px-1.5 py-1.5 hover:text-white transition-all delay-100 ml-10"
                            >
                                Add Feedback
                            </button>}
                        <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                            <IoIosNotificationsOutline className="flex justify-center items-center text-2xl md:text-3xl" />
                            {hasUnreadNotifications() && (
                                <div className={`w-2 h-2 bg-red-600 rounded-full absolute top-1 right-1 ${showSideBar ? 'sm:hidden md:flex' : 'flex'}`} />
                            )}
                        </div>

                        <div className="border border-bluecolor rounded-md p-0.5  ml-2 md:ml-3 cursor-pointer">
                            <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={user?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"} alt="Profile"
                                onClick={() => {

                                    handleNavigate(RouteName.SETTING_SCREEN)
                                }} />
                        </div>
                    </div>
                </>
            )}
            <MyChildernsModal isVisible={isChildernModalVisible} onClose={handleCloseModal} studentName={studentName} setStudentName={setStudentName} />
            {/* Notification Modal */}
            <NotificationsModal
                isVisible={isModalVisible}
                onClose={handleCloseModal}
                notifications={notifications}
                onNotificationsUpdated={() => {
                    // Refresh notifications when marked as read
                    Get("/getNotification").then((d) => {
                        if (d.success) {
                            setNotifications(d.data);
                        }
                    });
                }}
            />
        </div>
    );
};

export default Navbar;