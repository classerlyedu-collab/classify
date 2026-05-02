import { Navbar, SideDrawer } from "../../../components";
import { Calendar as BigCalendar, momentLocalizer, Views, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useMemo, useState } from "react";
import { Get, Post, Put, Delete } from "../../../config/apiMethods";
import { UseStateContext } from "../../../context/ContextProvider";
import { displayMessage } from "../../../config";
import {
    HiOutlineCalendarDays,
    HiOutlineClock,
    HiOutlinePlus,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineXMark,
    HiOutlineSparkles,
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
} from "react-icons/hi2";
import { FiTrendingUp } from "react-icons/fi";

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

const getEventId = (event: Event): string | undefined => event.id || event._id;

const TYPE_COLORS: Record<string, { bg: string; ring: string; label: string }> = {
    Teacher: { bg: '#22C55E', ring: '#16A34A', label: 'Teacher' },
    Parent:  { bg: '#7102FF', ring: '#5B00CC', label: 'Parent' },
    Student: { bg: '#F59E0B', ring: '#D97706', label: 'Student' },
    Default: { bg: '#3B82F6', ring: '#2563EB', label: 'Other' },
};

const getEventStyle = (event: Event) => {
    const c = TYPE_COLORS[event.userType || ''] || TYPE_COLORS.Default;
    return {
        style: {
            backgroundColor: c.bg,
            borderRadius: '8px',
            color: 'white',
            border: 'none',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 500,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        }
    };
};

const dateFull = () =>
    new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<Event, object>) => {
    const views: Array<{ key: string; label: string }> = [
        { key: Views.MONTH, label: 'Month' },
        { key: Views.WEEK, label: 'Week' },
        { key: Views.DAY, label: 'Day' },
        { key: Views.AGENDA, label: 'Agenda' },
    ];
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1 pb-4 mb-4 border-b border-inputBorder/40">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onNavigate('TODAY')}
                    className="h-9 px-3 text-xs font-semibold text-greyBlack bg-mainBg ring-1 ring-inputBorder/60 rounded-xl hover:ring-primary/40 transition"
                >
                    Today
                </button>
                <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl overflow-hidden">
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="h-9 w-9 flex items-center justify-center hover:bg-white transition"
                        aria-label="Previous"
                    >
                        <HiOutlineChevronLeft className="text-greyBlack" size={16} />
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="h-9 w-9 flex items-center justify-center hover:bg-white transition border-l border-inputBorder/60"
                        aria-label="Next"
                    >
                        <HiOutlineChevronRight className="text-greyBlack" size={16} />
                    </button>
                </div>
                <h2 className="ml-2 font-trykker text-lg md:text-xl text-black">{label}</h2>
            </div>
            <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl p-1">
                {views.map(v => (
                    <button
                        key={v.key}
                        onClick={() => onView(v.key as any)}
                        className={`h-7 px-3 text-xs font-semibold rounded-lg transition ${
                            view === v.key
                                ? 'bg-white text-secondary shadow-sm'
                                : 'text-grey hover:text-greyBlack'
                        }`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        </div>
    );
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
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    useEffect(() => {
        Get('/teacher/calendar/events').then((d) => {
            if (d.success) setEvents(d.data);
        }).catch(error => {
            console.error('Error fetching events:', error);
        }).finally(() => {
            setIsLoadingEvents(false);
        });
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const upcoming = events.filter(e => new Date(e.startDate) >= now).length;
        const thisMonth = events.filter(e => {
            const d = new Date(e.startDate);
            return d >= startOfMonth && d <= endOfMonth;
        }).length;
        const today = events.filter(e => {
            const d = new Date(e.startDate);
            return d.toDateString() === now.toDateString();
        }).length;
        return { total: events.length, upcoming, thisMonth, today };
    }, [events]);

    const upcomingList = useMemo(() => {
        const now = new Date();
        return [...events]
            .filter(e => new Date(e.startDate) >= now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 4);
    }, [events]);

    const handleAddEvent = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setNewEvent({ title: '', startDate: new Date(), endDate: new Date(), agenda: '' });
    };
    const handleCloseEditModal = () => { setShowEditModal(false); setEditingEvent(null); };
    const handleCloseDeleteModal = () => { setShowDeleteModal(false); setDeletingEventId(null); };
    const handleCloseActionModal = () => { setShowActionModal(false); setSelectedEvent(null); };

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

    const handleEditEvent = (event: Event) => { setEditingEvent(event); setShowEditModal(true); };

    const handleUpdateEvent = async () => {
        const eventId = getEventId(editingEvent!);
        if (!eventId) return;
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

    const handleDeleteEvent = (eventId: string) => { setDeletingEventId(eventId); setShowDeleteModal(true); };

    const handleConfirmDelete = async () => {
        if (!deletingEventId) return;
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

    const handleEventClick = (event: Event) => { setSelectedEvent(event); setShowActionModal(true); };
    const handleActionEdit = () => { if (selectedEvent) { handleEditEvent(selectedEvent); handleCloseActionModal(); } };
    const handleActionDelete = () => {
        const eventId = getEventId(selectedEvent!);
        if (eventId) { handleDeleteEvent(eventId); handleCloseActionModal(); }
    };

    const canEdit = role === "Teacher" || role === "Parent" || role === "Student";
    const selectedTypeColor = selectedEvent ? (TYPE_COLORS[selectedEvent.userType || ''] || TYPE_COLORS.Default) : TYPE_COLORS.Default;

    const statCards = [
        {
            label: "Total Events",
            value: String(stats.total),
            Icon: HiOutlineCalendarDays,
            tone: "from-primary/15 to-secondary/15 text-secondary",
        },
        {
            label: "This Month",
            value: String(stats.thisMonth),
            Icon: FiTrendingUp,
            tone: "from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2",
        },
        {
            label: "Today",
            value: String(stats.today),
            Icon: HiOutlineSparkles,
            tone: "from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown",
        },
        {
            label: "Upcoming",
            value: String(stats.upcoming),
            Icon: HiOutlineClock,
            tone: "from-fadeBlue/15 to-bluecolor/10 text-bluecolor",
        },
    ];

    return (
        <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
            <SideDrawer />

            <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
                {/* Sticky navbar */}
                <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
                    <div className="px-4 md:px-8 py-3">
                        <Navbar title="Calendar" />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(113,2,255,0.35)]">
                        <div
                            aria-hidden
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                        />
                        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                            <div className="max-w-xl">
                                <p className="text-xs uppercase tracking-wider text-white/70">{dateFull()}</p>
                                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                                    Your calendar.
                                </h1>
                                {isLoadingEvents ? (
                                    <div className="mt-2 h-4 w-72 rounded bg-white/20 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                                        {stats.upcoming === 0
                                            ? "No upcoming events. Plan something new today."
                                            : `You have ${stats.upcoming} upcoming event${stats.upcoming > 1 ? "s" : ""} on your schedule.`}
                                    </p>
                                )}
                                {canEdit && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddEvent}
                                            className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white text-secondary text-sm font-semibold hover:bg-white/95 transition focus:outline-none focus:ring-2 focus:ring-white/60"
                                        >
                                            <HiOutlinePlus size={16} />
                                            New event
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Snapshot */}
                            <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                                <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                                    <HiOutlineCalendarDays size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-white/70">Today</p>
                                    {isLoadingEvents ? (
                                        <div className="mt-1 h-4 w-24 rounded bg-white/20 animate-pulse" />
                                    ) : (
                                        <p className="text-sm font-semibold leading-tight">
                                            {stats.today > 0
                                                ? `${stats.today} event${stats.today > 1 ? "s" : ""}`
                                                : "Nothing scheduled"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats grid */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                        {statCards.map((s) => {
                            const Icon = s.Icon as any;
                            return (
                                <div
                                    key={s.label}
                                    className="text-left group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 hover:ring-primary/40 hover:shadow-md transition"
                                >
                                    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tone} opacity-30 blur-xl pointer-events-none`} />
                                    <span className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.tone} flex items-center justify-center`}>
                                        <Icon size={16} />
                                    </span>
                                    <p className="mt-3 text-[11px] uppercase tracking-wider text-grey font-medium">{s.label}</p>
                                    {isLoadingEvents ? (
                                        <div className="mt-1.5 h-7 w-12 rounded-md bg-mainBg animate-pulse" />
                                    ) : (
                                        <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    {/* Calendar + Upcoming */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {/* Calendar */}
                        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5 flex flex-col min-h-[640px]">
                            {isLoadingEvents ? (
                                <div className="flex-1 flex flex-col">
                                    {/* Toolbar skeleton */}
                                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-inputBorder/40">
                                        <div className="flex items-center gap-2">
                                            <div className="h-9 w-16 rounded-xl bg-mainBg animate-pulse" />
                                            <div className="h-9 w-20 rounded-xl bg-mainBg animate-pulse" />
                                            <div className="ml-2 h-6 w-40 rounded bg-mainBg animate-pulse" />
                                        </div>
                                        <div className="h-9 w-64 rounded-xl bg-mainBg animate-pulse hidden md:block" />
                                    </div>
                                    {/* Day-of-week header */}
                                    <div className="grid grid-cols-7 gap-px bg-inputBorder/30 rounded-t-xl overflow-hidden">
                                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-mainBg/60 px-2 py-2.5 flex justify-center">
                                                <div className="h-2.5 w-8 rounded bg-mainBg animate-pulse" />
                                            </div>
                                        ))}
                                    </div>
                                    {/* 5-row month grid */}
                                    <div className="grid grid-cols-7 grid-rows-5 gap-px bg-inputBorder/30 rounded-b-xl overflow-hidden flex-1">
                                        {Array.from({ length: 35 }).map((_, idx) => (
                                            <div key={idx} className="bg-white p-1.5 min-h-[80px] flex flex-col gap-1.5">
                                                <div className="h-2.5 w-5 rounded bg-mainBg animate-pulse" />
                                                {/* Stagger event bars on a few cells */}
                                                {(idx % 7 === 1 || idx % 5 === 0) && (
                                                    <div className="h-3 rounded-md bg-mainBg animate-pulse" />
                                                )}
                                                {idx % 11 === 3 && (
                                                    <div className="h-3 w-3/4 rounded-md bg-mainBg animate-pulse" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <BigCalendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="startDate"
                                    endAccessor="endDate"
                                    eventPropGetter={getEventStyle}
                                    onSelectEvent={handleEventClick}
                                    components={{ toolbar: CustomToolbar }}
                                    style={{ width: '100%', flex: 1, minHeight: 560 }}
                                    className="classerly-calendar"
                                />
                            )}
                        </div>

                        {/* Side panel */}
                        <div className="flex flex-col gap-4">
                            {/* Upcoming */}
                            <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5">
                                <header className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="font-trykker text-lg text-black">Upcoming</h2>
                                        <p className="text-xs text-grey">Your next few events.</p>
                                    </div>
                                    {stats.upcoming > 0 && (
                                        <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full bg-gradient-to-r from-primary to-secondary text-white px-2 py-0.5">
                                            {stats.upcoming}
                                        </span>
                                    )}
                                </header>

                                {isLoadingEvents ? (
                                    <ul className="flex flex-col gap-1.5">
                                        {[0, 1, 2, 3].map((i) => (
                                            <li key={i} className="flex items-start gap-2 px-2 py-2">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-mainBg animate-pulse shrink-0" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-3 w-3/4 rounded bg-mainBg animate-pulse" />
                                                    <div className="h-2.5 w-1/2 rounded bg-mainBg animate-pulse" />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : upcomingList.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <span className="inline-flex h-10 w-10 rounded-full bg-mainBg items-center justify-center mb-2">
                                            <HiOutlineCalendarDays className="text-grey" size={16} />
                                        </span>
                                        <p className="text-xs text-grey">No upcoming events.</p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-1.5">
                                        {upcomingList.map((e, i) => {
                                            const c = TYPE_COLORS[e.userType || ''] || TYPE_COLORS.Default;
                                            return (
                                                <li key={i}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEventClick(e)}
                                                        className="w-full flex items-start gap-2 rounded-xl px-2 py-2 hover:bg-mainBg/60 text-left transition"
                                                    >
                                                        <span
                                                            className="mt-1 h-2 w-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: c.bg }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-medium text-black truncate">{e.title}</p>
                                                            <p className="text-[10px] text-grey mt-0.5">
                                                                {moment(e.startDate).format('MMM D · h:mm A')}
                                                            </p>
                                                        </div>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5">
                                <h2 className="font-trykker text-lg text-black mb-3">Legend</h2>
                                <ul className="flex flex-col gap-2">
                                    {Object.values(TYPE_COLORS).filter(c => c.label !== 'Other').map(c => (
                                        <li key={c.label} className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full ring-2 ring-white" style={{ backgroundColor: c.bg, boxShadow: `0 0 0 1px ${c.ring}` }} />
                                            <span className="text-xs text-greyBlack">{c.label} events</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-ubuntu">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-fadeBlue p-5 rounded-t-3xl">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                            <div className="relative flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <HiOutlinePlus size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-trykker text-xl">New Event</h2>
                                        <p className="text-xs text-white/80 mt-0.5">Schedule something on your calendar</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="text-white/80 hover:text-white">
                                    <HiOutlineXMark size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="e.g. Parent–Teacher Meeting"
                                    className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">Start</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(newEvent.startDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({ ...newEvent, startDate: new Date(e.target.value) })}
                                        className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">End</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(newEvent.endDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({ ...newEvent, endDate: new Date(e.target.value) })}
                                        className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">Agenda / Notes</label>
                                <textarea
                                    value={newEvent.agenda || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, agenda: e.target.value })}
                                    rows={3}
                                    placeholder="Add agenda items or notes for this event..."
                                    className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition resize-none"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-mainBg rounded-b-3xl flex justify-end gap-2">
                            <button
                                onClick={handleCloseModal}
                                disabled={loading}
                                className="h-10 px-4 text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 rounded-xl hover:ring-grey/40 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                disabled={loading || !newEvent.title}
                                className="h-10 px-5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-md hover:shadow-secondary/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving
                                    </>
                                ) : 'Save event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {showEditModal && editingEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-ubuntu">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="relative overflow-hidden bg-gradient-to-br from-bluecolor via-fadeBlue to-primary p-5 rounded-t-3xl">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                            <div className="relative flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <HiOutlinePencilSquare size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-trykker text-xl">Edit Event</h2>
                                        <p className="text-xs text-white/80 mt-0.5">Update the details</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseEditModal} className="text-white/80 hover:text-white">
                                    <HiOutlineXMark size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={editingEvent.title}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                    className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">Start</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(editingEvent.startDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, startDate: new Date(e.target.value) })}
                                        className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">End</label>
                                    <input
                                        type="datetime-local"
                                        value={moment(editingEvent.endDate).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, endDate: new Date(e.target.value) })}
                                        className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-grey font-semibold mb-1.5">Agenda / Notes</label>
                                <textarea
                                    value={editingEvent.agenda || ''}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, agenda: e.target.value })}
                                    rows={3}
                                    className="block w-full rounded-xl ring-1 ring-inputBorder/60 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition resize-none"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-mainBg rounded-b-3xl flex justify-end gap-2">
                            <button
                                onClick={handleCloseEditModal}
                                disabled={loading}
                                className="h-10 px-4 text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 rounded-xl hover:ring-grey/40 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateEvent}
                                disabled={loading}
                                className="h-10 px-5 text-sm font-semibold text-white bg-gradient-to-r from-bluecolor to-primary rounded-xl hover:shadow-md hover:shadow-bluecolor/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating
                                    </>
                                ) : 'Update event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-ubuntu">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-orangeBrown/10 ring-1 ring-orangeBrown/20 flex items-center justify-center flex-shrink-0">
                                    <HiOutlineTrash className="text-orangeBrown" size={22} />
                                </div>
                                <div>
                                    <h2 className="font-trykker text-lg text-black">Delete event?</h2>
                                    <p className="text-sm text-grey mt-1">This action cannot be undone. The event will be permanently removed from your calendar.</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-mainBg rounded-b-3xl flex justify-end gap-2">
                            <button
                                onClick={handleCloseDeleteModal}
                                disabled={loading}
                                className="h-10 px-4 text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 rounded-xl hover:ring-grey/40 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={loading}
                                className="h-10 px-5 text-sm font-semibold text-white bg-orangeBrown rounded-xl hover:bg-orangeBrown/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting
                                    </>
                                ) : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {showActionModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-ubuntu">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div
                            className="relative overflow-hidden p-5"
                            style={{ background: `linear-gradient(135deg, ${selectedTypeColor.bg}, ${selectedTypeColor.ring})` }}
                        >
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                            <div className="relative flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/25 text-white backdrop-blur-sm">
                                    {selectedTypeColor.label}
                                </span>
                                <button onClick={handleCloseActionModal} className="text-white/80 hover:text-white">
                                    <HiOutlineXMark size={20} />
                                </button>
                            </div>
                            <h3 className="relative font-trykker text-xl text-white mt-3">{selectedEvent.title}</h3>
                            <p className="relative text-sm text-white/85 mt-1">
                                {moment(selectedEvent.startDate).format('ddd, MMM D · h:mm A')} – {moment(selectedEvent.endDate).format('h:mm A')}
                            </p>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-xl bg-mainBg flex items-center justify-center flex-shrink-0">
                                    <HiOutlineClock className="text-grey" size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-grey font-semibold">Starts</p>
                                    <p className="text-sm font-medium text-black">{moment(selectedEvent.startDate).format('MMM DD, YYYY · h:mm A')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-xl bg-mainBg flex items-center justify-center flex-shrink-0">
                                    <HiOutlineCheckCircle className="text-grey" size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-grey font-semibold">Ends</p>
                                    <p className="text-sm font-medium text-black">{moment(selectedEvent.endDate).format('MMM DD, YYYY · h:mm A')}</p>
                                </div>
                            </div>
                            {selectedEvent.agenda && (
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-mainBg flex items-center justify-center flex-shrink-0">
                                        <HiOutlineDocumentText className="text-grey" size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-grey font-semibold">Agenda</p>
                                        <p className="text-sm text-greyBlack whitespace-pre-wrap leading-relaxed">{selectedEvent.agenda}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-mainBg flex justify-end gap-2">
                            <button
                                onClick={handleCloseActionModal}
                                className="h-10 px-4 text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 rounded-xl hover:ring-grey/40"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleActionEdit}
                                className="h-10 px-4 text-sm font-semibold text-white bg-gradient-to-r from-bluecolor to-primary rounded-xl hover:shadow-md hover:shadow-bluecolor/20 flex items-center gap-1.5"
                            >
                                <HiOutlinePencilSquare size={15} />
                                Edit
                            </button>
                            <button
                                onClick={handleActionDelete}
                                className="h-10 px-4 text-sm font-semibold text-white bg-orangeBrown rounded-xl hover:bg-orangeBrown/90 flex items-center gap-1.5"
                            >
                                <HiOutlineTrash size={15} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .classerly-calendar { font-family: inherit; }
                .classerly-calendar .rbc-month-view,
                .classerly-calendar .rbc-time-view,
                .classerly-calendar .rbc-agenda-view {
                    border: 1px solid rgba(226, 232, 240, 0.6);
                    border-radius: 16px;
                    overflow: hidden;
                }
                .classerly-calendar .rbc-header {
                    padding: 10px 6px;
                    font-weight: 600;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #94A3B8;
                    background: #F8FAFC;
                    border-bottom: 1px solid rgba(226, 232, 240, 0.7);
                }
                .classerly-calendar .rbc-month-row + .rbc-month-row,
                .classerly-calendar .rbc-day-bg + .rbc-day-bg,
                .classerly-calendar .rbc-header + .rbc-header,
                .classerly-calendar .rbc-time-header,
                .classerly-calendar .rbc-time-content,
                .classerly-calendar .rbc-time-content > * + * > *,
                .classerly-calendar .rbc-timeslot-group {
                    border-color: rgba(226, 232, 240, 0.6);
                }
                .classerly-calendar .rbc-today {
                    background: rgba(113, 2, 255, 0.05);
                }
                .classerly-calendar .rbc-off-range-bg {
                    background: #FAFAFB;
                }
                .classerly-calendar .rbc-date-cell {
                    padding: 6px 8px;
                    font-size: 12px;
                    color: #475569;
                }
                .classerly-calendar .rbc-date-cell.rbc-now {
                    color: #7102FF;
                    font-weight: 700;
                }
                .classerly-calendar .rbc-event {
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .classerly-calendar .rbc-event:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.12);
                }
                .classerly-calendar .rbc-show-more {
                    color: #7102FF;
                    font-weight: 600;
                    font-size: 11px;
                    background: transparent;
                }
                .classerly-calendar .rbc-current-time-indicator {
                    background-color: #7102FF;
                    height: 2px;
                }
                .classerly-calendar .rbc-agenda-table {
                    font-size: 13px;
                }
                .classerly-calendar .rbc-agenda-table.table thead > tr > th {
                    background: #F8FAFC;
                    color: #94A3B8;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.06em;
                }
            `}</style>
        </div>
    );
};

export default Calendar;
