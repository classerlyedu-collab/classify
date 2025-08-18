import { PieChart } from "@mui/x-charts";
import { FaCalendarAlt } from "react-icons/fa";

const ClassProgress = () => {

    return (
        <div className="w-full bg-white py-5 h-72 px-4 rounded-2xl flex flex-col justify-center items-center">

            <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-3 w-full">Class Progress</h1>

            {/* <div className="w-full h-40" > */}
            <PieChart
                series={[
                    {
                        data: [
                            { id: 0, value: 75, label: 'In Progress' },
                            { id: 1, value: 25, label: 'Completed',  },
                        ],
                    },
                ]}
                width={400}
                height={200}
            />
            {/* </div> */}

            <div className="border-2 border-[#F9AF4E] bg-[#FFF4E9] py-2 px-3 mt-5 flex items-center justify-center rounded-md w-full mx-auto max-w-72" >
                <FaCalendarAlt className="text-md mr-3 text-[#F9AF4E]" />
                <h1 className="font-ubuntu font-medium text-xs md:text-sm text-[#F9AF4E]">143 days left in 3rd grade</h1>
            </div>

        </div>
    )
}
export default ClassProgress;