import { useMemo, useState } from "react";
import { ChildResultType } from "../../../../types/parent/ChildOverview";
import {
    HiOutlineBookOpen,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineChevronDown,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
} from "react-icons/hi2";

interface PropsTypes {
    result: ChildResultType[] | null;
}

const TOPICS_PER_PAGE = 5;
const ESTIMATED_MIN_PER_LESSON = 20;

const LessonStatus = ({ result }: PropsTypes) => {
    const [openTopicIndex, setOpenTopicIndex] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const totalPages = result ? Math.ceil(result.length / TOPICS_PER_PAGE) : 0;
    const startIndex = (currentPage - 1) * TOPICS_PER_PAGE;
    const endIndex = startIndex + TOPICS_PER_PAGE;
    const currentTopics = result ? result.slice(startIndex, endIndex) : [];

    const overall = useMemo(() => {
        if (!result || result.length === 0) {
            return { topics: 0, completed: 0, total: 0, percent: 0 };
        }
        let total = 0;
        let completed = 0;
        result.forEach((t) => {
            total += t.lessons?.length || 0;
            completed += t.lessons?.filter((l: any) => l?.read).length || 0;
        });
        return {
            topics: result.length,
            completed,
            total,
            percent: total ? Math.round((completed / total) * 100) : 0,
        };
    }, [result]);

    const handlePage = (p: number) => {
        setCurrentPage(p);
        setOpenTopicIndex(null);
    };

    if (!result || result.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-inputBorder/70 p-8 text-center font-ubuntu">
                <span className="inline-flex h-12 w-12 rounded-full bg-mainBg items-center justify-center mb-2">
                    <HiOutlineBookOpen className="text-grey" size={20} />
                </span>
                <p className="text-sm font-semibold text-black">No topics yet</p>
                <p className="text-xs text-grey mt-1">
                    Topics will appear once they're added to the course.
                </p>
            </div>
        );
    }

    return (
        <div className="font-ubuntu">
            {/* Course summary strip */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-secondary/8 ring-1 ring-secondary/15 p-4 mb-4 flex items-center gap-4">
                <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shrink-0">
                    <HiOutlineBookOpen size={18} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
                        Course progress
                    </p>
                    <p className="text-sm font-semibold text-black">
                        {overall.completed} of {overall.total} lessons completed across{" "}
                        {overall.topics} topic{overall.topics === 1 ? "" : "s"}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-trykker text-2xl text-secondary leading-none">
                        {overall.percent}%
                    </p>
                </div>
            </div>

            {/* Topic list */}
            <ul className="flex flex-col gap-3">
                {currentTopics.map((topic, i) => {
                    const topicIndex = startIndex + i;
                    const total = topic.lessons?.length || 0;
                    const completed =
                        topic.lessons?.filter((l: any) => l?.read).length || 0;
                    const percent = total ? Math.round((completed / total) * 100) : 0;
                    const open = openTopicIndex === topicIndex;
                    const ringId = `lesson-ring-${topicIndex}`;

                    return (
                        <li
                            key={topicIndex}
                            className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/60 hover:ring-primary/30 hover:shadow-sm transition"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenTopicIndex(open ? null : topicIndex)
                                }
                                aria-expanded={open}
                                className="w-full flex items-center gap-4 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            >
                                <span className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold flex items-center justify-center">
                                    {topicIndex + 1}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
                                        Topic
                                    </p>
                                    <h3 className="text-sm md:text-base font-semibold text-black truncate">
                                        {topic?.name ?? "Untitled topic"}
                                    </h3>
                                    <p className="text-[11px] text-grey mt-0.5">
                                        {completed} of {total} lessons completed
                                    </p>
                                </div>

                                <div className="hidden sm:block h-12 w-12 shrink-0">
                                    <svg width="0" height="0" className="absolute">
                                        <defs>
                                            <linearGradient
                                                id={ringId}
                                                x1="0%"
                                                y1="0%"
                                                x2="100%"
                                                y2="100%"
                                            >
                                                <stop offset="0%" stopColor="#A557F5" />
                                                <stop offset="100%" stopColor="#7102FF" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <svg
                                        viewBox="0 0 36 36"
                                        className="-rotate-90 h-12 w-12"
                                    >
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#ECF4F7"
                                            strokeWidth="3.5"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke={`url(#${ringId})`}
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeDasharray={`${percent}, 100`}
                                        />
                                    </svg>
                                    <div className="-mt-12 h-12 w-12 flex items-center justify-center text-[11px] font-semibold text-black">
                                        {percent}%
                                    </div>
                                </div>

                                <span
                                    aria-hidden
                                    className={`h-8 w-8 shrink-0 rounded-full bg-mainBg text-greyBlack flex items-center justify-center transition-transform ${open ? "rotate-180" : ""
                                        }`}
                                >
                                    <HiOutlineChevronDown size={14} />
                                </span>
                            </button>

                            {open && (
                                <div className="border-t border-inputBorder/40 bg-mainBg/40 px-4 py-4">
                                    <p className="text-[10px] uppercase tracking-wider text-grey font-semibold mb-2">
                                        Lessons
                                    </p>
                                    <ul className="flex flex-col gap-2">
                                        {topic?.lessons?.map((lesson: any, lIdx: number) => {
                                            const done = !!lesson?.read;
                                            const minutes = done ? ESTIMATED_MIN_PER_LESSON : 0;
                                            return (
                                                <li
                                                    key={lIdx}
                                                    className="flex items-center gap-3 rounded-xl bg-white ring-1 ring-inputBorder/40 px-3 py-2.5"
                                                >
                                                    <span
                                                        className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${done
                                                            ? "bg-lightGreen2/15 text-lightGreen2"
                                                            : "bg-mainBg text-grey"
                                                            }`}
                                                    >
                                                        {done ? (
                                                            <HiOutlineCheckCircle size={16} />
                                                        ) : (
                                                            <span className="text-xs font-semibold">
                                                                {lIdx + 1}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={`text-sm truncate ${done
                                                                ? "text-black font-medium"
                                                                : "text-greyBlack"
                                                                }`}
                                                        >
                                                            {lesson?.name ?? "Untitled lesson"}
                                                        </p>
                                                        <p className="text-[11px] text-grey inline-flex items-center gap-1 mt-0.5">
                                                            <HiOutlineClock size={11} />
                                                            {minutes} min
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 shrink-0 ${done
                                                            ? "bg-lightGreen2/10 text-lightGreen2"
                                                            : "bg-mainBg text-greyBlack"
                                                            }`}
                                                    >
                                                        {done ? "Done" : "Pending"}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* Pagination */}
            {result.length > TOPICS_PER_PAGE && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40 px-3 py-2">
                    <p className="text-xs text-grey">
                        {startIndex + 1}–{Math.min(endIndex, result.length)} of{" "}
                        {result.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handlePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                            className="h-8 w-8 rounded-lg border border-inputBorder bg-white text-greyBlack hover:text-secondary hover:border-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <HiOutlineChevronLeft size={14} />
                        </button>
                        <span className="text-xs font-medium text-greyBlack px-2">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => handlePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                            className="h-8 w-8 rounded-lg border border-inputBorder bg-white text-greyBlack hover:text-secondary hover:border-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <HiOutlineChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonStatus;
