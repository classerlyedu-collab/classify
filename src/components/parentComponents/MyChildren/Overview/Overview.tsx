// import {
//   buildStyles,
//   CircularProgressbarWithChildren,
// } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
// import { useNavigate } from "react-router-dom";

const Overview = ({ per, mystd }: any) => {
  let date = new Date();

  return (
    <div className="w-full">
      {/* report */}
      <div className="w-full py-1 px-2 md:px-8 flex justify-between items-center pb-6 md:pb-8">
        <div>
          <h1 className="text-base md:text-lg font-ubuntu font-semibold text-black">
            {mystd?.auth?.fullName.slice(0, 18)}
          </h1>
          <p className="text-xs md:text-base text-greyBlack font-ubuntu">
            {mystd?.grade?.grade} | Year {date.getFullYear()}-{date.getFullYear() + 1}
          </p>
          <p className="text-xs md:text-base text-greyBlack font-ubuntu">
            Student Code: {mystd?.code}
          </p>
        </div>
        {/* <div className="w-14 md:w-24 h-14 md:h-24">
          <CircularProgressbarWithChildren
            value={20}
            maxValue={100}
            minValue={0}
            strokeWidth={6}
            styles={buildStyles({
              strokeLinecap: "round",
              pathColor: `#FF8300`,
              trailColor: "#8C8C8C",
              backgroundColor: "#3e98c7",
            })}
          >
            <div className="flex flex-col justify-center items-center ">
              <h1 className="font-ubuntu text-sm md:text-base lg:text-xl font-bold text-greyBlack">{`${20} %`}</h1>
              <h1 className="font-ubuntu text-xs md:text-sm lg:text-sm font-normal text-greyBlack">
                overall
              </h1>
            </div>
          </CircularProgressbarWithChildren>
        </div> */}
      </div>
    </div>
  );
};

export default Overview;