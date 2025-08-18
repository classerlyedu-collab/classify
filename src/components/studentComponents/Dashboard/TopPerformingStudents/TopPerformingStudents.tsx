import React from 'react';
import { TopPerformers } from "../../../../constants/student/Dashboard";
import { getRandomColor } from '../../../../utils/randomColorGenerator';
import { getInitialsLetters } from '../../../../utils/FirstLetterExtractor';



// Define the type for the TopPerformingStudents component
interface TopPerformersType {
  Title: string;
  Points: number;
}

const TopPerformingStudents: React.FC = () => {
  return (
    <div className="w-full bg-white h-full py-5 sm:pl-4 sm:pr-0 md:px-4 rounded-2xl flex flex-row flex-wrap max-h-96 md:overflow-y-auto">

      <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack mb-2">
        Top Performing Students
      </h1>

      <div className="w-full mt-2 flex md:flex-wrap items-start justify-start gap-3 overflow-x-auto">

        {TopPerformers?.map((item: TopPerformersType, index: number) => (

          <div id={index?.toString()} className="flex min-w-52 md:min-w-full flex-row justify-start items-center rounded-3xl p-4 w-3/4 sm:w-1/2 md:w-full" style={{
            background: getRandomColor('dark', index)
          }}>

            <div className="flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full " style={{
              background: getRandomColor('dark', index+3)
            }}>
              <p className="text-md md:text-xl font-semibold text-white">{getInitialsLetters(item?.Title)}</p>
            </div>

            <div className='flex flex-col ml-2 md:ml-5'>
              <h1 className="font-ubuntu font-medium text-white text-sm md:text-base">{item?.Title}</h1>
              <h1 className="font-ubuntu font-medium md:text-sm text-xs text-mainBg">{item?.Points}/10 Points</h1>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default TopPerformingStudents;
