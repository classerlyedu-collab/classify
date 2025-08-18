import { assessmentResultData } from "../../../../constants/parent/myChildren";
// import { LuPenSquare } from "react-icons/lu";
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { useEffect, useState } from "react";
import { displayMessage } from "../../../../config";
import { Get } from "../../../../config/apiMethods";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";

const Grades = ({ mystd }: any) => {

    const navigate = useNavigate();
const [subjects,setSubjects] = useState([])

useEffect(()=>{
    Get(`/getMyChildsubjectdata/${mystd._id}`).then((d)=>{
      if(d.success){
        setSubjects(d.data)
      }
    })
},[mystd])
    const handleSubjectClick = (id: string) => {
        Get(`/mychildbysubject/${mystd._id}?subject=${id}`)
            .then((d) => {
                if (d?.success) {
                    
                    localStorage.setItem('childResult', JSON.stringify(d.data));
                    localStorage.setItem('resultHeaderTitle', `${mystd?.auth?.fullName ?? 'Child'} Result`);
                    navigate(RouteName.CHILD_RESULT_SCREEN);
                } else {
                    displayMessage('Something went wrong! Please try again later.');
                }
            })
            .catch((e) => {
                displayMessage(e.message);
            });
    };
    

    return (
        <div className="w-full px-5">
            <h1 className="font-ubuntu text-sm md:text-base lg:text-xl font-medium text-greyBlack">Courses</h1>
            <div className="grid grid-cols-1 gap-3 mt-4">

                <div className="grid grid-cols-1 gap-3 lg:gap-5 lg:grid-cols-2 2xl:grid-cols-3 px-2 bg-white lg:col-span-6 relative" >
                    {
                        // mystd?.
                        subjects?.map((item: any, index: any) => (
                            <div
                            key={index}
                                onClick={() => handleSubjectClick(item?._id)}
                                id={index?.toString()}
                                className="col-span-1 px-5 pt-5 pb-2 bg-white flex flex-col rounded-md md:rounded-lg shadow-md shadow-purple hover:shadow-greyBlack flex-wrap cursor-pointer"
                            >
                                <div className="w-full flex flex-row justify-between items-center pb-3 md:pb-6 flex-wrap" >
                                    <div className="flex flex-row w-3/5 items-center" >
                                        {/* <img
                                            className="w-14 lg:w-20 h-14 lg:h-20 mb-4"
                                            src={item?.image}
                                            alt="Subject"
                                        /> */}
                                        <h1 className="font-ubuntu text-sm md:text-base font-medium text-greyBlack" >{item?.name?.toUpperCase()}</h1>
                                    </div>
                                    <div className="w-2/5 h-full flex flex-row items-center justify-end flex-wrap" >
                                        <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" >
                                            <CircularProgressbarWithChildren
                                                value={parseInt(item.result)}
                                                maxValue={100}
                                                minValue={0}
                                                strokeWidth={8}
                                                styles={buildStyles({
                                                    strokeLinecap: 'round',
                                                    pathColor: getRandomColor('dark', index),
                                                    trailColor: '#8C8C8C',
                                                    backgroundColor: '#3e98c7',
                                                })}
                                            >
                                                <h1 className="font-ubuntu text-sm md:text-base lg:text-xl font-medium text-greyBlack" >{ `${item.progress}%`}</h1>
                                            </CircularProgressbarWithChildren>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))
                    }
                </div>

            </div>
        </div>
    )
};

export default Grades;