import { CompletionData } from "../../../../constants/student/Dashboard";
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
const CompletionProgress = () => {
  return (
    <div className="w-full bg-white h-full py-5 px-4 rounded-2xl max-h-96 overflow-y-auto">
      <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack  mb-2">
        Completion Progress
      </h1>
      <div>
        {CompletionData?.map((item, index) => (
          <div id={index?.toString()} className="flex justify-between items-center">
            <div className="flex flex-col pb-5">
              <h1 className="font-ubuntu font-semibold text-base text-black">
                {item?.Title}
              </h1>
              <h1 className="font-ubuntu font-medium md:text-sm text-xs text-greyBlack">
                {item?.Chapter}
              </h1>
            </div>
            <div className="flex justify-center items-center w-10 h-10 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 my-2 mx-3 ">
              <CircularProgressbarWithChildren
                value={item.percentage}
                maxValue={100}
                minValue={0}
                strokeWidth={7}
                styles={buildStyles({
                  strokeLinecap: 'round',
                  pathColor: '#4E48DF',
                  trailColor: '#E9E3FF',
                  backgroundColor: '#8A70D6',
                })}
              >
                {/* Progress percentage */}
                <h1 className="font-ubuntu text-xs font-base text-greyBlack group-hover:text-white">{item.percentage}%</h1>
              </CircularProgressbarWithChildren>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CompletionProgress;
