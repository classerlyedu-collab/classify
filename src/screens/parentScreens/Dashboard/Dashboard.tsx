import {
  WelcomeNotice,
  UpcomingEvents,
  EnrolledStudents,
  UpcomingMeetings,
  News,
  Documents,
  Navbar,
  SideDrawer,
} from "../../../components";

const Dashboard = () => {
  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* for left side  */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg">
        {/* 1st Navbar*/}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
          <Navbar title="Dashboard" />
        </div>

        {/* center */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg">
          <div className="col-span-2 md:col-span-10 min-h-[500px]">
            <WelcomeNotice />
          </div>
        </div>
        {/* <div className="col-span-12 min-h-52">
          <UpcomingEvents />
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;

{
  /* <> */
}
{
  /* welcome, hire now & Latest News */
}
{
  /* <div className="grid grid-cols-2 md:grid-cols-10 col-span-12 xl:col-span-9 gap-5" > */
}

{
  /* welcome */
}
{
  /* <div className="col-span-2 md:col-span-10" > */
}
{
  /* <WelcomeNotice /> */
}
{
  /* </div> */
}

{
  /* hire now */
}
{
  /* <div className="col-span-2 sm:col-span-1 md:col-span-4  sm:max-h-80 md:max-h-96" > */
}
{
  /* <EnrolledStudents /> */
}
{
  /* </div> */
}

{
  /* latest news */
}
{
  /* <div className="col-span-2 sm:col-span-1 md:col-span-6 max-h-80 md:max-h-96" > */
}
{
  /* <News /> */
}
{
  /* </div> */
}

{
  /* </div> */
}

{
  /* upcoming meetings & Documents */
}
{
  /* <div className="grid grid-cols-2 lg:grid-cols-10 col-span-12 md:col-span-12 xl:col-span-3 gap-5 md:gap-5" > */
}

{
  /* upcoming meetings */
}
{
  /* <div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-4 xl:col-span-10 max-h-72 xl:max-h-96" > */
}
{
  /* <UpcomingMeetings /> */
}
{
  /* </div> */
}

{
  /* documents */
}
{
  /* <div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-6 xl:col-span-10 max-h-72 xl:max-h-96" > */
}
{
  /* <Documents /> */
}
{
  /* </div> */
}

{
  /* </div> */
}

{
  /* upcoming events */
}
{
  /* <div className="col-span-12 min-h-52" > */
}
{
  /* <UpcomingEvents /> */
}
{
  /* </div> */
}
{
  /* </> */
}
