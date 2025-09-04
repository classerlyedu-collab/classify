
import {
    Navbar,
    SideDrawer,
    AnalyticsComponent,
    PendingHomework,
    Courses,
    TasksComponent,
    UpcomingEvents,
    UpcomingEventsTeachers,
    Lessons,
    Schedule,
    Notifications
} from "../../../components";

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
                <div className="grid grid-cols-1 sm:grid-cols-10 gap-3 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit" >

                    {/* analytics */}
                    <div className="col-span-1 sm:col-span-10" >
                        <AnalyticsComponent />
                    </div>

                    {/* pending homework, courses, tasks */}
                    <div className="grid grid-cols-1 sm:grid-cols-10 col-span-1 sm:col-span-10 xl:col-span-6 gap-3 sm:gap-5 h-fit" >

                        {/* pending Homework */}
                        {/* <div className="col-span-1 sm:col-span-10 lg:col-span-8 xl:col-span-10 h-fit" >
                            <PendingHomework />
                        </div> */}

                        {/* Courses*/}
                        {/* <div className="col-span-1 sm:col-span-4 xl:col-span-4 h-fit" >
                            <Courses />

                        </div> */}

                        {/* Tasks */}
                        {/* <div className="col-span-1 sm:col-span-6 h-fit" >
                            <TasksComponent />
                        </div> */}

                    </div>

                    {/* schedule, notifications & upcoming events */}
                    <div className="grid grid-cols-1 md:grid-cols-2 col-span-1 sm:col-span-10 xl:col-span-4 gap-3 sm:gap-5 h-fit" >

                        {/* Notifications */}
                        <div className="col-span-1 xl:col-span-4 h-fit" >
                            <Notifications maxNotifications={3} />
                        </div>

                        {/* schedule */}
                        {/* <div className="col-span-1 xl:col-span-4" >
                            <Schedule />
                        </div> */}

                        {/* schedule */}
                        <div className="col-span-1 xl:col-span-4 h-fit" >
                            {/* <Lessons/> */}
                        </div>

                        {/* upcoming events */}
                        {/* <div className="col-span-1 xl:col-span-4 border h-fit" >
                            <UpcomingEventsTeachers />
                        </div> */}

                    </div>

                </div>

            </div>

        </div>
    )
};

export default Dashboard;
