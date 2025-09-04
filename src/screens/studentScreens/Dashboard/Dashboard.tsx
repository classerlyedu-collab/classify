
import {
    CompletionProgress,
    Navbar,
    QuizTopics,
    SideDrawer,
    Timeline,
    TopPerformingStudents,
    WelcomeNoticeStudent,
    Notifications
} from "../../../components";
import { MyTeachers } from "../../../components/studentComponents/Dashboard/MyTeachers";

const Dashboard = () => {

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6" >
                    <Navbar title="Dashboard" />
                </div>

                {/* center */}
                <div className="grid grid-cols-1 xl:grid-cols-10 gap-5 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit" >

                    {/* welcome, subjects, completion progress & top performing students */}
                    <div className="grid grid-cols-2 col-span-1 xl:col-span-6 gap-3 md:gap-5 h-fit " >

                        {/* welcome */}
                        <div className="col-span-2 h-fit" >
                            <WelcomeNoticeStudent />
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 col-span-2" >

                            {/* completion progress */}
                            {/* <div className="col-span-1 h-fit" >
                                <CompletionProgress />
                            </div> */}

                            {/* top performing students */}
                            {/* <div className="col-span-1 h-fit" >
                                <TopPerformingStudents />
                            </div> */}

                        </div>

                    </div>

                    {/* Quiz topics, notifications & timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3 md:gap-5 col-span-1 xl:col-span-4 h-fit" >

                        {/* Notifications */}
                        <div className="col-span-1 h-fit" >
                            <Notifications maxNotifications={3} />
                        </div>

                        {/* Quiz Topic */}
                        <div className="col-span-1 h-fit" >
                            <QuizTopics />
                        </div>

                        {/* Timeline */}
                        <div className="col-span-1 h-fit" >
                            <Timeline />
                            <MyTeachers />
                        </div>


                    </div>

                </div>

            </div>

        </div>
    )
};

export default Dashboard;
