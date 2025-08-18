import { useEffect, useState } from "react";
import { Get, Put } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";

const Timeline = () => {
  const [requests,setRequests] = useState<any[]>([])
  const [myTeachers,setmyTeachers] = useState<any[]>([])

  const getrequest = ()=>{

    Get("/student/myrequests").then((d)=>{
      if(d.data?.length>0){
        setRequests(d.data)
  
      }
    })
  }
const getTeachers= ()=>{
  Get("/student/myteachers").then((d)=>{
    if(d.data?.length>0){
      
      setmyTeachers(d.data)

    }
  })
}
  useEffect(()=>{
getTeachers()
    getrequest()
  },[requests])

  const updateRequest=(id:any,status:any)=>{
    Put(`/student/request/${id}`,{status}).then((d)=>{
      
      if(d.success){
        displayMessage(d.message,"success")

      }else{
        displayMessage(d.message,"error")

      }
      getrequest()

    })

  }
  return (
    <div className="w-full bg-white h-full py-5 px-4 rounded-2xl max-h-96 overflow-y-auto">
      <div className="flex flex-row justify-between items-center mb-2">
        <h1 className="font-ubuntu font-medium text-base md:text-xl text-greyBlack animate-pulse">
          Teacher Requests
        </h1>

      </div>

      <div className=" rounded-lg bg-white mt-2">
{
  requests.map((item)=>{
return(
        <div className="border-b mx-3 flex items-center justify-between py-2 border-greyBlack last:border-none" >
          <h1 className="font-ubuntu font-medium text-sm md:text-base text-greyBlack">Add to {item?.teacher?.auth?.userName} class ? </h1>
          <div className="flex flex-row justify-between">
            <button
              className="py-1 px-2 sm:px-6 bg-secondary text-white rounded-l-full text-sm font-semibold cursor-pointer hover:animate-pulse"
              onClick={()=>{
                updateRequest(item._id,"Completed")
              }}
              
            >Yes</button>
            <button
              className="py-1.5 px-2 sm:px-6 bg-red-600 text-white rounded-r-full text-sm font-semibold cursor-pointer hover:animate-pulse"
              onClick={()=>{
                updateRequest(item._id,"Rejected")
              }}
            >No</button>
          </div>

        </div>)
  })
}


{/*         
        <div className="border-b mx-3 flex items-center justify-between py-2 border-greyBlack last:border-none" >
          <h1 className="font-ubuntu font-medium text-sm md:text-base text-greyBlack">Add to Sir Williams class ? </h1>
          <div className="flex flex-row justify-between">
            <button
              className="py-1 px-2 sm:px-6 bg-secondary text-white rounded-l-full text-sm font-semibold cursor-pointer hover:animate-pulse"
              
            >Yes</button>
            <button
              className="py-1.5 px-2 sm:px-6 bg-red-600 text-white rounded-r-full text-sm font-semibold cursor-pointer hover:animate-pulse"
            >No</button>
          </div>

        </div> */}
      </div>

      
    </div>
  );
};
export default Timeline;
