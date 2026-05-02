import { useMemo, useState } from "react";
import { ChildResultType } from "../../../../types/parent/ChildOverview";
import {
    HiOutlineSparkles,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineTrophy,
    HiOutlineChartBar,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
} from "react-icons/hi2";

interface PropsTypes {
    result: ChildResultType[] | null;
}

const TOPICS_PER_PAGE = 4;

const QuizResults = ({ result }: PropsTypes) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<"all" | "passed" | "failed">("all");

    const stats = useMemo(() => {
        if (!result || result.length === 0) {
            return { total: 0, passed: 0, totalMarks: 0, obtained: 0 };
        }
        let total = 0,
            passed = 0,
            totalMarks = 0,
            obtained = 0;
        result.forEach((topic) => {
            topic.quizes?.forEach((quiz) => {
                quiz.studentQuizData?.forEach((q) => {
                    total++;
                    if (q.result === "pass") passed++;
                    totalMarks += q.score || 0;
                    obtained += q.marks || 0;
                });
            });
        });
        return { total, passed, totalMarks, obtained };
    }, [result]);

    const passRate = stats.total ? Math.round((stats.passed / stats.total) * 100) : 0;
    const failed = stats.total - stats.passed;

    const totalPages = result ? Math.ceil(result.length / TOPICS_PER_PAGE) : 0;
    const startIndex = (currentPage - 1) * TOPICS_PER_PAGE;
    const endIndex = startIndex + TOPICS_PER_PAGE;
    const currentTopics = result ? result.slice(startIndex, endIndex) : [];

    if (!result || result.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-inputBorder/70 p-8 text-center font-ubuntu">
                <span className="inline-flex h-12 w-12 rounded-full bg-mainBg items-center justify-center mb-2">
                    <HiOutlineTrophy className="text-grey" size={20} />
                </span>
                <p className="text-sm font-semibold text-black">No quiz results yet</p>
                <p className="text-xs text-grey mt-1">
                    Once your child takes a quiz, the score will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="font-ubuntu">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <StatTile
                    icon={HiOutlineChartBar}
                    tone="from-primary/15 to-secondary/15 text-secondary"
                    label="Total quizzes"
                    value={String(stats.total)}
                />
                <StatTile
                    icon={HiOutlineCheckCircle}
                    tone="from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2"
                    label="Passed"
                    value={String(stats.passed)}
                />
                <StatTile
                    icon={HiOutlineXCircle}
                    tone="from-lightRed/15 to-lightRed/5 text-lightRed"
                    label="Failed"
                    value={String(failed)}
                />
                <StatTile
                    icon={HiOutlineTrophy}
                    tone="from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown"
                    label="Total score"
                    value={`${stats.obtained}/${stats.totalMarks || "—"}`}
                />
            </div>

            {/* Pass-rate banner */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-secondary/8 ring-1 ring-secondary/15 p-4 mb-5 flex items-center gap-4">
                <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shrink-0">
                    <HiOutlineSparkles size={18} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
                        Pass rate
                    </p>
                    <p className="text-sm font-semibold text-black">
                        {passRate >= 80
                            ? "Outstanding performance"
                            : passRate >= 50
                                ? "Solid progress"
                                : passRate > 0
                                    ? "Needs more practice"
                                    : "No quizzes attempted yet"}
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-mainBg overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                            style={{ width: `${passRate}%` }}
                        />
                    </div>
                </div>
                <p className="font-trykker text-2xl text-secondary leading-none shrink-0">
                    {passRate}%
                </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="inline-flex p-1 rounded-full bg-mainBg ring-1 ring-inputBorder/60">
                    {([
                        { k: "all", label: "All", count: stats.total },
                        { k: "passed", label: "Passed", count: stats.passed },
                        { k: "failed", label: "Failed", count: failed },
                    ] as const).map(({ k, label, count }) => {
                        const active = filter === k;
                        return (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setFilter(k)}
                                className={`h-8 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition ${active
                                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
                                    : "text-greyBlack hover:text-black"
                                    }`}
                            >
                                {label}
                                <span
                                    className={`text-[10px] font-semibold ${active ? "text-white/90" : "text-grey"
                                        }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Topics with quiz attempts */}
            <ul className="flex flex-col gap-3">
                {currentTopics.map((topic, i) => {
                    const topicIndex = startIndex + i;
                    const attempts = (topic?.quizes || []).flatMap(
                        (q: any) => q?.studentQuizData || []
                    );
                    const visible =
                        filter === "all"
                            ? attempts
                            : attempts.filter((a: any) =>
                                filter === "passed" ? a.result === "pass" : a.result !== "pass"
                            );
                    return (
                        <li
                            key={topicIndex}
                            className="rounded-2xl bg-white ring-1 ring-inputBorder/60 overflow-hidden"
                        >
                            <header className="flex items-center justify-between gap-3 px-4 py-3 bg-mainBg/40 border-b border-inputBorder/40">
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
                                        Topic
                                    </p>
                                    <h3 className="text-sm md:text-base font-semibold text-black truncate">
                                        {topic?.name ?? "Untitled topic"}
                                    </h3>
                                </div>
                                <span className="text-[11px] text-grey shrink-0">
                                    {attempts.length} attempt{attempts.length === 1 ? "" : "s"}
                                </span>
                            </header>

                            <div className="p-3">
                                {attempts.length === 0 ? (
                                    <div className="flex items-center justify-center py-3 rounded-xl bg-mainBg/50">
                                        <HiOutlineTrophy
                                            className="text-grey mr-2"
                                            size={14}
                                        />
                                        <span className="text-xs text-grey">
                                            No quizzes taken for this topic.
                                        </span>
                                    </div>
                                ) : visible.length === 0 ? (
                                    <div className="flex items-center justify-center py-3 rounded-xl bg-mainBg/50">
                                        <span className="text-xs text-grey">
                                            No {filter} attempts on this topic.
                                        </span>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-2">
                                        {visible.map((q: any, idx: number) => {
                                            const passed = q.result === "pass";
                                            const marks = q?.marks ?? 0;
                                            const total = q?.score ?? 0;
                                            const pct = total
                                                ? Math.round((Number(marks) / Number(total)) * 100)
                                                : 0;
                                            return (
                                                <li
                                                    key={idx}
                                                    className="flex items-center gap-3 rounded-xl ring-1 ring-inputBorder/40 px-3 py-2.5"
                                                >
                                                    <span
                                                        className={`h-9 w-9 rounded-xl shrink-0 flex items-center justify-center ${passed
                                                            ? "bg-lightGreen2/15 text-lightGreen2"
                                                            : "bg-lightRed/15 text-lightRed"
                                                            }`}
                                                    >
                                                        {passed ? (
                                                            <HiOutlineCheckCircle size={16} />
                                                        ) : (
                                                            <HiOutlineXCircle size={16} />
                                                        )}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-black truncate">
                                                            Quiz {idx + 1}
                                                        </p>
                                                        <p className="text-[11px] text-grey">
                                                            Scored {marks} of {total} ({pct}%)
                                                        </p>
                                                    </div>
                                                    <div className="hidden md:flex items-center gap-3 shrink-0">
                                                        <Pill label="Obtained" value={String(marks)} />
                                                        <Pill label="Total" value={String(total)} />
                                                    </div>
                                                    <span
                                                        className={`text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 shrink-0 ${passed
                                                            ? "bg-lightGreen2/10 text-lightGreen2"
                                                            : "bg-lightRed/10 text-lightRed"
                                                            }`}
                                                    >
                                                        {passed ? "Passed" : "Failed"}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
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
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                            onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
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

const StatTile = ({
    icon: Icon,
    tone,
    label,
    value,
}: {
    icon: any;
    tone: string;
    label: string;
    value: string;
}) => (
    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4">
        <div
            className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${tone} opacity-30 blur-xl pointer-events-none`}
        />
        <span
            className={`relative h-9 w-9 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center`}
        >
            <Icon size={16} />
        </span>
        <p className="relative mt-3 text-[11px] uppercase tracking-wider text-grey font-medium">
            {label}
        </p>
        <p className="relative mt-0.5 font-trykker text-2xl text-black">{value}</p>
    </div>
);

const Pill = ({ label, value }: { label: string; value: string }) => (
    <div className="text-center">
        <p className="text-[10px] uppercase tracking-wider text-grey font-medium">
            {label}
        </p>
        <p className="text-sm font-semibold text-black leading-none mt-0.5">
            {value}
        </p>
    </div>
);

export default QuizResults;
