import { TextEditor, TopicInfo, Chatbot } from "../../../components";

const Material = () => {

    return (
        <div className="grid grid-cols-1 gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit" >

            {/* Topic Info */}
            <div className="col-span-1 h-fit" >
                <TopicInfo />
            </div>

            {/* Text Editor */}
            <div className="col-span-1 h-fit" >
                <TextEditor />
            </div>

            {/* AI Chatbot */}
            <Chatbot />

        </div>
    )
};

export default Material;
