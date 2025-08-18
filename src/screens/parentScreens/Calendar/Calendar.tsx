import {
    Navbar,
    SideDrawer
} from "../../../components";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from "react";
import { Get, Post } from "../../../config/apiMethods";
import { UseStateContext } from "../../../context/ContextProvider";
import { displayMessage } from "../../../config";

interface Event {
    title: string;
    startDate: Date;
    endDate: Date;
    id?: string;
    userType?: string;
}

const localizer = momentLocalizer(moment);

// Add event styling function
const getEventStyle = (event: Event) => {
    let backgroundColor = '#3174ad'; // default color
    
    switch(event.userType) {
        case 'Teacher':
            backgroundColor = '#4CAF50'; // green
            break;
        case 'Parent':
            backgroundColor = '#9C27B0'; // purple
            break;
        case 'Student':
            backgroundColor = '#FF9800'; // orange
            break;
    }
    
    return {
        style: {
            backgroundColor,
            borderRadius: '3px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        }
    };
};

const Calendar = () => {
    const {role} = UseStateContext();

    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [newEvent, setNewEvent] = useState<Event>({
        title: '',
        startDate: new Date(),
        endDate: new Date()
    });

    useEffect(()=>{
        Get('/teacher/calendar/events').then((d)=>{
            if(d.success){
                setEvents(d.data)
            }
        })
    },[])

    const handleAddEvent = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewEvent({
            title: '',
            startDate: new Date(),
            endDate: new Date()
        });
    };

    const handleSaveEvent = async () => {
        try {
            const response = await Post('/teacher/calendar/events', newEvent);
            if (response.success) {
                setEvents([...events, response.data]);
                handleCloseModal();
                displayMessage('Event added successfully!', 'success');
            } else {
                displayMessage(response.message || 'Failed to add event', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            displayMessage('Failed to add event. Please try again.', 'error');
        }
    };

    return (
        <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap" >

            {/* for left side  */}
            <div className="lg:w-1/6 h-full bg-transparent">
                <SideDrawer />
            </div>

            {/* for right side */}
            <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg" >

                {/* 1st Navbar*/}
                <div className="w-full h-fit bg-mainBg mb-2 md:mb-6" >
                    <Navbar title="Calendar" />
                </div>

                {/* center */}
                <div className=" w-full mb-2 md:mb-6 flex flex-col justify-start items-center bg-mainBg h-screen" >
                    {(role === "Teacher" || role === "Parent" || role === "Student") && (
                        <div className="w-full flex flex-col items-end mb-4">
                            <button 
                                onClick={handleAddEvent}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Add Event
                            </button>
                        </div>
                    )}
                    <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="startDate"
                        endAccessor="endDate"
                        eventPropGetter={getEventStyle}
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                        className="bg-white pt-5 px-2"
                    />
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(newEvent.startDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({...newEvent, startDate: new Date(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(newEvent.endDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({...newEvent, endDate: new Date(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEvent}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default Calendar;
