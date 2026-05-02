import { useEffect, useMemo, useState } from "react";
import { Get } from "../../../../config/apiMethods";
import { FaStar } from "react-icons/fa";
import {
    HiOutlineChatBubbleLeftRight,
    HiOutlineClock,
    HiOutlineSparkles,
    HiOutlineUsers,
} from "react-icons/hi2";

type Filter = "all" | "teacher" | "parent";
type Sort = "newest" | "rating";

const initialsFrom = (name?: string) =>
    (name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "T";

const formatDate = (s?: string) => {
    if (!s) return "";
    const d = new Date(s);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const timeAgo = (s?: string) => {
    if (!s) return "";
    const sec = Math.max(0, Math.floor((Date.now() - new Date(s).getTime()) / 1000));
    if (sec < 60) return "just now";
    const m = Math.floor(sec / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w < 5) return `${w}w ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}mo ago`;
    return `${Math.floor(d / 365)}y ago`;
};

const TeacherRemarks = ({ childernValue }: any) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<Sort>("newest");

    useEffect(() => {
        if (!childernValue) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const parentId =
            currentUser?.profile?._id || currentUser?._id || currentUser?.id;

        const reqs: Promise<any>[] = [
            Get(`/parent/feedback/${childernValue}`).then((r) => ({
                role: "teacher",
                data: r?.success ? r.data || [] : [],
            })),
        ];
        if (parentId) {
            reqs.push(
                Get(`/teacher/parent-feedbacks/${childernValue}/${parentId}`).then((r) => ({
                    role: "parent",
                    data: r?.success ? r.data || [] : [],
                }))
            );
        }
        Promise.all(reqs)
            .then((results) => {
                const combined: any[] = [];
                results.forEach(({ role, data }) => {
                    data.forEach((d: any) => combined.push({ ...d, _origin: role }));
                });
                setItems(combined);
            })
            .finally(() => setLoading(false));
    }, [childernValue]);

    const stats = useMemo(() => {
        const total = items.length;
        const avg = total
            ? items.reduce((acc, it) => acc + (it.stars || it.star || 0), 0) / total
            : 0;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeek = items.filter((it) => new Date(it.createdAt) > weekAgo).length;
        return { total, avg, thisWeek };
    }, [items]);

    const visible = useMemo(() => {
        let list = items;
        if (filter !== "all") list = list.filter((it) => it._origin === filter);
        if (sort === "newest") {
            list = [...list].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else {
            list = [...list].sort(
                (a, b) => (b.stars || b.star || 0) - (a.stars || a.star || 0)
            );
        }
        return list;
    }, [items, filter, sort]);

    const teacherCount = items.filter((i) => i._origin === "teacher").length;
    const parentCount = items.filter((i) => i._origin === "parent").length;

    if (loading) {
        return (
            <div className="space-y-3 font-ubuntu">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-28 rounded-2xl bg-mainBg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-inputBorder/70 p-10 text-center font-ubuntu">
                <span className="inline-flex h-14 w-14 rounded-full bg-mainBg items-center justify-center mb-3">
                    <HiOutlineChatBubbleLeftRight className="text-grey" size={22} />
                </span>
                <p className="text-sm font-semibold text-black">No remarks yet</p>
                <p className="text-xs text-grey mt-1 max-w-md mx-auto">
                    Teacher comments and your feedback will appear here. They help everyone
                    stay on the same page about your child's progress.
                </p>
            </div>
        );
    }

    return (
        <div className="font-ubuntu">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <StatTile
                    icon={HiOutlineUsers}
                    tone="from-primary/15 to-secondary/15 text-secondary"
                    label="Total remarks"
                    value={String(stats.total)}
                />
                <StatTile
                    icon={FaStar}
                    tone="from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown"
                    label="Average rating"
                    value={stats.avg ? stats.avg.toFixed(1) : "—"}
                    suffix={stats.avg ? "/ 5" : undefined}
                />
                <StatTile
                    icon={HiOutlineSparkles}
                    tone="from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2"
                    label="This week"
                    value={String(stats.thisWeek)}
                />
            </div>

            {/* Filter + sort */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="inline-flex p-1 rounded-full bg-mainBg ring-1 ring-inputBorder/60">
                    <FilterPill
                        active={filter === "all"}
                        onClick={() => setFilter("all")}
                        label="All"
                        count={items.length}
                    />
                    <FilterPill
                        active={filter === "teacher"}
                        onClick={() => setFilter("teacher")}
                        label="From teachers"
                        count={teacherCount}
                    />
                    <FilterPill
                        active={filter === "parent"}
                        onClick={() => setFilter("parent")}
                        label="From you"
                        count={parentCount}
                    />
                </div>
                <div className="inline-flex items-center gap-2 text-xs">
                    <label className="text-grey" htmlFor="remarks-sort">
                        Sort
                    </label>
                    <select
                        id="remarks-sort"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as Sort)}
                        className="h-8 rounded-lg border border-inputBorder bg-white pl-2 pr-7 text-xs text-greyBlack focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                        <option value="newest">Newest</option>
                        <option value="rating">Highest rated</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {visible.length === 0 ? (
                <div className="rounded-xl border border-dashed border-inputBorder/70 p-6 text-center">
                    <p className="text-xs text-grey">
                        No remarks match the current filter.
                    </p>
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {visible.map((item, idx) => (
                        <RemarkCard key={`${item._id ?? idx}-${idx}`} item={item} />
                    ))}
                </ul>
            )}
        </div>
    );
};

const StatTile = ({
    icon: Icon,
    tone,
    label,
    value,
    suffix,
}: {
    icon: any;
    tone: string;
    label: string;
    value: string;
    suffix?: string;
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
        <p className="relative mt-0.5 inline-flex items-baseline gap-1">
            <span className="font-trykker text-2xl text-black">{value}</span>
            {suffix && (
                <span className="text-xs text-grey font-medium">{suffix}</span>
            )}
        </p>
    </div>
);

const FilterPill = ({
    active,
    onClick,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
}) => (
    <button
        type="button"
        onClick={onClick}
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

const RemarkCard = ({ item }: { item: any }) => {
    const isFromTeacher = item._origin === "teacher";
    const author =
        item?.from?.auth?.fullName ||
        item?.teacherId?.auth?.fullName ||
        item?.from?.auth?.userName ||
        item?.teacherId?.auth?.userName ||
        (isFromTeacher ? "Teacher" : "You");
    const avatar = item?.from?.auth?.image || item?.teacherId?.auth?.image;
    const stars = Number(item.stars || item.star || 0);
    const comment = item.comment || item.feedback || "";

    return (
        <li className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 md:p-5 hover:ring-primary/30 hover:shadow-sm transition">
            <div
                aria-hidden
                className={`pointer-events-none absolute -left-1 top-0 bottom-0 w-1 ${isFromTeacher
                    ? "bg-gradient-to-b from-primary to-secondary"
                    : "bg-gradient-to-b from-lightGreen2 to-seagreen"
                    }`}
            />

            <div className="flex items-start gap-3 md:gap-4">
                {/* Avatar */}
                {avatar ? (
                    <img
                        src={avatar}
                        alt=""
                        className="h-11 w-11 md:h-12 md:w-12 rounded-2xl object-cover ring-1 ring-inputBorder/60 shrink-0"
                    />
                ) : (
                    <span
                        className={`h-11 w-11 md:h-12 md:w-12 rounded-2xl text-white text-sm font-semibold flex items-center justify-center shrink-0 ${isFromTeacher
                            ? "bg-gradient-to-br from-primary to-secondary"
                            : "bg-gradient-to-br from-lightGreen2 to-seagreen"
                            }`}
                    >
                        {initialsFrom(author)}
                    </span>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-black truncate">
                                {author}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                                <span
                                    className={`text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 ${isFromTeacher
                                        ? "bg-primary/10 text-secondary"
                                        : "bg-lightGreen2/10 text-lightGreen2"
                                        }`}
                                >
                                    {isFromTeacher ? "Teacher" : "Your feedback"}
                                </span>
                                <span className="text-[11px] text-grey inline-flex items-center gap-1">
                                    <HiOutlineClock size={11} />
                                    {timeAgo(item.createdAt)} · {formatDate(item.createdAt)}
                                </span>
                            </div>
                        </div>

                        {stars > 0 && (
                            <div className="shrink-0 flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <FaStar
                                        key={s}
                                        size={13}
                                        className={
                                            s <= stars ? "text-orangeBrown" : "text-inputBorder"
                                        }
                                    />
                                ))}
                                <span className="ml-1 text-xs font-semibold text-greyBlack">
                                    {stars.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Comment with quote glyph */}
                    <div className="relative mt-3 rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40 px-4 py-3">
                        <span
                            aria-hidden
                            className="absolute top-1 left-2 font-trykker text-3xl text-secondary/30 leading-none select-none"
                        >
                            “
                        </span>
                        <p className="text-sm text-greyBlack leading-relaxed pl-5">
                            {comment}
                        </p>
                    </div>
                </div>
            </div>
        </li>
    );
};

export default TeacherRemarks;
