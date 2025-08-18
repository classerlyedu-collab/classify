
import {
    Navbar,
    SideDrawer,
    MyStudents,
    AddStudents,
    Subjects,

} from "../../../components";

const Students = () => {

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
                    <Navbar title="My Students" />
                </div>

                {/* center */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 md:gap-5 w-full mb-2 md:mb-6 bg-mainBg h-fit" >

                    {/* FOr studen names */}
                    <div className="grid col-span-2  md:col-span-12 lg:col-span-12 xl:col-span-8 h-fit">
                        <MyStudents />
                    </div>
                    {/* for AddStudents */}
                    <div className=" grid col-span-1 md:col-span-6 lg:col-span-6 xl:col-span-4 h-fit">
                        <AddStudents />
                    </div>
                </div>
                <div className="col-span-2 h-fit" >
                    <Subjects />
                </div>

            </div>

        </div>
    )
};

export default Students;
