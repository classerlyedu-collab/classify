import {
    Navbar,
    SideDrawer
} from "../../../components";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from "react";
import { Get, Post, Put, Delete } from "../../../config/apiMethods";
import { UseStateContext } from "../../../context/ContextProvider";
import { displayMessage } from "../../../config";

interface Event {
    title: string;
    startDate: Date;
    endDate: Date;
    id?: string;
    _id?: string;
    userType?: string;
    agenda?: string;
}

const localizer = momentLocalizer(moment);

// Helper function to get the correct event ID
const getEventId = (event: Event): string | undefined => {
    return event.id || event._id;
};

// Add event styling function
const getEventStyle = (event: Event) => {
    let backgroundColor = '#3174ad'; // default color

    switch (event.userType) {
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
    const { role } = UseStateContext();

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [newEvent, setNewEvent] = useState<Event>({
        title: '',
        startDate: new Date(),
        endDate: new Date(),
        agenda: ''
    });
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Get('/teacher/calendar/events').then((d) => {
            if (d.success) {
                setEvents(d.data)
            }
        }).catch(error => {
            console.error('Error fetching events:', error);
        })
    }, [])

    const handleAddEvent = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewEvent({
            title: '',
            startDate: new Date(),
            endDate: new Date(),
            agenda: ''
        });
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingEvent(null);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingEventId(null);
    };

    const handleCloseActionModal = () => {
        setShowActionModal(false);
        setSelectedEvent(null);
    };

    const handleSaveEvent = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setShowEditModal(true);
    };

    const handleUpdateEvent = async () => {
        const eventId = getEventId(editingEvent!);
        if (!eventId) {
            return;
        }

        setLoading(true);
        try {
            const response = await Put(`/teacher/calendar/events/${eventId}`, editingEvent);
            if (response.success) {
                setEvents(events.map(e => getEventId(e) === eventId ? response.data : e));
                handleCloseEditModal();
                displayMessage('Event updated successfully!', 'success');
            } else {
                displayMessage(response.message || 'Failed to update event', 'error');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            displayMessage('Failed to update event. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = (eventId: string) => {
        setDeletingEventId(eventId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingEventId) {
            return;
        }

        setLoading(true);
        try {
            const response = await Delete(`/teacher/calendar/events/${deletingEventId}`);
            if (response.success || response.status === 200) {
                setEvents(events.filter(e => getEventId(e) !== deletingEventId));
                handleCloseDeleteModal();
                displayMessage('Event deleted successfully!', 'success');
            } else {
                displayMessage(response.message || 'Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            displayMessage('Failed to delete event. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setShowActionModal(true);
    };

    const handleActionEdit = () => {
        if (selectedEvent) {
            handleEditEvent(selectedEvent);
            handleCloseActionModal();
        }
    };

    const handleActionDelete = () => {
        const eventId = getEventId(selectedEvent!);
        if (eventId) {
            handleDeleteEvent(eventId);
            handleCloseActionModal();
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
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg flex items-center font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
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
                        onSelectEvent={handleEventClick}
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
                        <div className="bg-white p-6 rounded-lg w-96 shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-xl font-semibold text-gray-900">Add New Event</h2>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(newEvent.startDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({ ...newEvent, startDate: new Date(e.target.value) })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(newEvent.endDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({ ...newEvent, endDate: new Date(e.target.value) })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Agenda/Notes</label>
                                    <textarea
                                        value={newEvent.agenda || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, agenda: e.target.value })}
                                        rows={3}
                                        placeholder="Add agenda items or notes for this event..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseModal}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEvent}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Event Modal */}
                {showEditModal && editingEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={editingEvent.title}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(editingEvent.startDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, startDate: new Date(e.target.value) })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(editingEvent.endDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, endDate: new Date(e.target.value) })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Agenda/Notes</label>
                                    <textarea
                                        value={editingEvent.agenda || ''}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, agenda: e.target.value })}
                                        rows={3}
                                        placeholder="Add agenda items or notes for this event..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseEditModal}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateEvent}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-xl font-semibold text-gray-900">Delete Event</h2>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this event? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseDeleteModal}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Event Action Modal */}
                {showActionModal && selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-xl font-semibold text-gray-900">Event Actions</h2>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedEvent.title}</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-medium">Start:</span> {moment(selectedEvent.startDate).format('MMM DD, YYYY h:mm A')}</p>
                                    <p><span className="font-medium">End:</span> {moment(selectedEvent.endDate).format('MMM DD, YYYY h:mm A')}</p>
                                    {selectedEvent.agenda && (
                                        <p><span className="font-medium">Agenda:</span> {selectedEvent.agenda}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseActionModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleActionEdit}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Event
                                </button>
                                <button
                                    onClick={handleActionDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Event
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
