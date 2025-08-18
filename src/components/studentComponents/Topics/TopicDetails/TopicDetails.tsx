import { useState, useEffect } from "react"; // Importing useState and useEffect hooks
// import { topicsSliderData } from "../../../../constants/student/Subjects"; // Importing topics slider data

import { Get } from "../../../../config/apiMethods";
import { displayMessage } from "../../../../config";
const TopicDetails = ({topic}:any) => {
    const [currentIndex, setCurrentIndex] = useState(0); // State to keep track of the current topic index
    
    const topicsSliderData = [
        {
            title: topic[0]?.name||'Photography Course',
            Description: 'The course is for beginners. it will intrest for people who like photography. ',
            image: require('../../../../images/students/topics/slider1.jpg')
        },
        {
            title:topic[1]?.name||'Practice Mathematics',
            Description: 'The course is for beginners. it will intrest for people who like photography. ',
            image: require('../../../../images/students/topics/slider2.jpg')
        },
        {
            title: topic[2]?.name||'Solve Algebra',
            Description: 'The course is for beginners. it will intrest for people who like photography. ',
            image: require('../../../../images/students/topics/slider3.webp')
        },
    ];

    
    // const [searchParams] = useSearchParams();
    
const [subject,setSubject]= useState<any>({})
    useEffect(() => {
      
        // const subject = searchParams.get('subject');
        let sub:any=localStorage.getItem("subject")
        setSubject(JSON.parse(sub))

        
        // Get(`/subject/grade/${subject}`).then((d)=>{
        //     if(d.success){
        //         // setTopics(d.data)
        //     }else{
        //         displayMessage(d.message)
        //     }
        // })
        // Function to update the current index every 4 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % topicsSliderData?.length);
        }, 4000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const currentTopic = topicsSliderData[currentIndex]; // Get the current topic data

    return (
        <div className="w-full rounded-xl pb-6">
            {/* Container for the entire component */}

            <h1 className="font-ubuntu pb-3 font-medium text-base md:text-xl text-greyBlack mb-2">
                {subject.name}
            </h1>
            {/* Header for the component */}

            <div className="w-full h-full">
                {/* Container for the image and text overlay */}

                <div className="relative">
                    {/* Relative container to position the text overlay */}

                    <img src={currentTopic?.image} alt="images" className="w-full rounded-lg" />
                    {/* Image for the current topic */}

                    <div className="absolute top-4 left-4 p-4 w-full lg:w-4/5 2xl:w-3/5 pr-2">
                        {/* Absolute container for the text overlay */}

                        <h1 className="text-3xl md:text-2xl xl:text-4xl font-ubuntu font-extrabold text-white">
                            {currentTopic?.title}
                        </h1>
                        <p className="text-lg md:text-base lg:text-lg font-ubuntu font-normal text-white">
                            {currentTopic?.Description}
                        </p>
                    </div>
                </div>

                {/* dots */}
                <div className="w-full items-start flex justify-center gap-3 mt-4">
                    {
                        topicsSliderData?.map((item, index) => (
                            <div className={`${index===currentIndex ? 'w-8 bg-purple' : 'bg-lightPurple w-3' }  transition-all delay-100 h-3 rounded-full `} />
                        ))
                    }
                </div>

            </div>
        </div>
    );
};

export default TopicDetails;
