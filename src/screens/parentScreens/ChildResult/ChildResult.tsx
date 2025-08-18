import { Navbar, SideDrawer } from "../../../components";
import "react-datepicker/dist/react-datepicker.css";
import { ChildResultType } from "../../../types/parent/ChildOverview";
import { useEffect, useState } from "react";
import { LessonStatus, QuizResults } from "../../../components/parentComponents/ChildResult";

const ChildResult = () => {
  const [result, setResult] = useState<ChildResultType[] | null>(null);
  const [title, setTitle] = useState<string>('Result');

  useEffect(() => {
    let ch: any = localStorage.getItem('childResult');
    let title: any = localStorage.getItem('resultHeaderTitle');
    setTitle(title);
    ch = JSON.parse(ch);
    ch=ch.map((i:any)=>{
i.read = ((i.lessons.filter((j:any)=>{return j.read}).length / i.lessons.length)*100).toFixed(2)
return i 

    })
    setResult(ch);
  }, [])

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* for left side */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6 md:pr-16 bg-mainBg">
        {/* 1st Navbar */}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
          <Navbar title={title} hideSearchBar />
        </div>

        {/* center */}
        <div className="w-full flex-col gap-5 px-5 mb-2 md:mb-6 bg-mainBg h-fit pb-10">

          <LessonStatus result={result} />
          <QuizResults result={result} />

        </div>
      </div>

    </div>
  );
};

export default ChildResult;
