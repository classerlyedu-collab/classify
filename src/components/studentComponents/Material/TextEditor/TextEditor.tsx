


import {  useSearchParams } from 'react-router-dom';
import { ImageLink } from '../../../../config/apiMethods';
const TextEditor = () => {
    const [searchParams] = useSearchParams();
    const content= searchParams.get('content');
    
    return (
        <div className="w-full bg-white py-5 px-4 rounded-2xl flex flex-col justify-center items-center">
{/* 
        <iframe
            loading="lazy"
            className='w-full h-screen'
            src={`${ImageLink}/${content}`}
            // src="https://docs.google.com/document/d/1zHwhdfU3VeuKPVrPg4-xPCJcNJO-SAVRTGbZIQKhCGQ/edit?usp=sharing"
            allow="fullscreen">  
            </iframe>
        */}
          <iframe
                loading="lazy"
                className='w-full h-screen'
                src={`${content}`}
                allow="fullscreen">

            </iframe>

       
    </div>

    )
}
export default TextEditor;