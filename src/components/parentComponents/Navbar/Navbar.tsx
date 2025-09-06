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
                <div className="w-full flex flex-col items-center lg:flex-row-reverse lg:justify-between">
                    {/* 1st */}
                    <div className="mt-2 md:mt-0 mb-3 md:mb-5 lg:mt-0 flex justify-between lg:justify-start w-full lg:w-auto items-center">
                        <IoMenuOutline
                            className="lg:hidden text-black mr-1 md:mr-2 text-xl md:text-2xl"
                            onClick={() => setShowSideBar(true)}
                        />

                        <div className="flex flex-row items-center justify-end">
                            {/* Notifications Icon */}
                            <button
                                onClick={handleAddChildernClick}
                                className="border border-greyBlack mr-2 rounded-md hover:border-none hover:bg-secondary px-1.5 py-1.5 hover:text-white transition-all delay-100 ml-10"
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
                                <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={`${user?.image}`} alt="Profile" onClick={() => {

                                    handleNavigate(RouteName.SETTING_SCREEN)
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* 2nd */}
                    <div className={`flex justify-center lg:justify-between items-center mb-3 md:mb-5 lg:mb-0 w-full lg:w-auto flex-wrap`}>
                        <div className="flex items-center justify-start bg-transparent">
                            <div className="bg-white rounded-full flex items-center justify-start pr-2 md:pr-3 relative">
                                <div className="flex items-center justify-start pr-2 md:pr-3 rounded-full  py-2 md:py-3 shadow-[8px_0_15px_-5px_rgba(0,0,0,0.4)] mr-3">
                                    <img
                                        className="w-10 md:h-14 h-10 md:w-14 rounded-full absolute"
                                        src={mystd?.auth?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"}
                                        alt="profile"
                                        onClick={() => {

                                            handleNavigate(RouteName.MYCHILDREN_SCREEN + `?childern=${mystd.profile._id}`)
                                        }}
                                    />

                                    <h1 className="font-ubuntu font-medium text-xs md:text-sm text-greyBlack ml-12 md:ml-16">{mystd?.auth?.fullName?.slice(0, 18)}</h1>
                                </div>

                                {/* <div className="w-32">
                                    <RoundedDropDown
                                        value={selectedCourse}
                                        setValue={setSelectedCourse}
                                        data={subjects.map((i) => {
                                            return {
                                                label: i.auth.userName.slice(0, 12),
                                                value: i._id,
                                                image: i.auth.image||"https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"
                                            };
                                        })}
                                        // imagePath={require('../../../images/myChildren/courses.png')}
                                        placeholder="Childs"
                                        style={{
                                            inputWrapper: 'bg-white',
                                            listWrapper: 'bg-white shadow-lg'
                                        }}
                                    />
                                </div> */}
                            </div>
                            {/*                             
                            <h1 className="font-ubuntu font-medium text-xs md:text-sm text-greyBlack pl-2 md:pl-3">
                                {returnMatchingLabel({ arrayOfObject: coursesDropdown, value: selectedCourse })}
                            </h1> */}
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
                            <img className="w-9 h-9 md:h-10 md:w-10 rounded-md" src={`${user?.image}`} alt="Profile"
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