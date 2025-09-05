import { useEffect, useState } from "react";
import { TeacherAnalyticsData } from "../../../../constants/Teacher/Dashboard";
import { getRandomColor } from "../../../../utils/randomColorGenerator";
import { Get } from "../../../../config/apiMethods";
import { FcManager, FcPodiumWithSpeaker, FcPuzzle, FcReading, FcRules } from "react-icons/fc";
import { RouteName } from "../../../../routes/RouteNames";
import { useNavigate } from "react-router-dom";

const AnalyticsComponent = () => {
  const navigate = useNavigate();
  const teacherdata = [
    {
      label: 'Total Students',
      value: 0,
      icon: <FcManager className="text-5xl md:text-6xl lg:text-7xl" />,
      color: '#7F49F2',
      RouteName: RouteName?.STUDENTS_SCREEN
    },
    {
      label: 'Total Subjects',
      value: 0,
      icon: <FcReading className="text-5xl md:text-6xl lg:text-7xl" />,
      color: '#E9C030',
      RouteName: RouteName?.STUDENTS_SCREEN
    },
    {
      label: 'Total Quizzes',
      value: 0,
      icon: <FcRules className="text-5xl md:text-6xl lg:text-7xl" />,
      color: '#EA794A',
      RouteName: RouteName?.MY_QUIZZES
    },
    // {
    //   label: 'Total Games',
    //   value: 0,
    //   icon: <FcPuzzle className="text-5xl md:text-6xl lg:text-7xl" />,
    //   color: '#63CB82',
    //   RouteName: null
    // },
    // {
    //     label: 'Total Classess',
    //     value: 90,
    //     icon: <FcPodiumWithSpeaker className="text-5xl md:text-6xl lg:text-7xl" />,
    //     color: '#3BC6DF'
    // },
  ]
  const [teacher, setTeacher] = useState<any[]>(
    []
  );
  useEffect(() => { }, [teacher])
  useEffect(() => {
    Get("/teacher/dashboard")
      .then((d) => {
        if (d.success) {

          let data = [...teacherdata]

          data[0].value = d.data.students
          data[1].value = d.data.subject
          data[2].value = d.data.quizes
          // data[3].value = d.data.games

          setTeacher(data);
        }
      })
      .catch((e) => {
        //   displayMessage(e.message);
      });
  }, []);
  return (
    <div className="w-full h-full flex items-center justify-between sm:justify-start flex-wrap  overflow-y-auto max-h-56 md:max-h-72">
      {teacher?.map((item, index) => (
        <div
          id={index?.toString()}
          onClick={() => item?.RouteName && navigate(item?.RouteName)}
          className={`cursor-pointer flex items-center justify-center px-2 xl:px-4 py-2 sm:py-3 md:py-4 xl:py-6 rounded-lg md:rounded-xl lg:rounded-2xl sm:mr-3 mt-3 min-w-40 sm:min-w-0`}
          style={{
            background: getRandomColor("dark", index),
          }}
        >
          {item.icon}
          <div className="ml-2 lg:ml-3 flex flex-col items-center justify-center">
            <h6 className="text-mainBg font-ubuntu font-semibold text-base md:text-xl">
              {item.value}
            </h6>
            <h6 className="text-mainBg font-ubuntu text-xs md:text-sm lg:text-base font-medium">
              {item.label}
            </h6>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsComponent;
