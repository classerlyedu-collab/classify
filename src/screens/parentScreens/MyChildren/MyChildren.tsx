import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RouteName } from "../../../routes/RouteNames";
import { displayMessage } from "../../../config";
import { Get, Delete } from "../../../config/apiMethods";
import SideDrawer from "../../../components/sideDrawer/SideDrawer";
import Navbar from "../../../components/parentComponents/Navbar/Navbar";
import { MyChildernsModal } from "../../../components/parentComponents/MyChildernModal";
import Grades from "../../../components/parentComponents/MyChildren/Grades/Grades";
import TeacherRemarks from "../../../components/parentComponents/MyChildren/TeacherRemarks/TeacherRemarks";
import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineIdentification,
  HiOutlineCalendarDays,
  HiOutlineArrowLeft,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookOpen,
  HiOutlineArrowRight,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FiPlus } from "react-icons/fi";

type Tab = { key: number; title: string; icon: React.ComponentType<any> };

const TABS: Tab[] = [
  { key: 0, title: "Courses", icon: HiOutlineBookOpen },
  { key: 1, title: "Teacher Remarks", icon: HiOutlineChatBubbleLeftRight },
];

const getInitials = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "C";

const MyChildren = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const childernValue = searchParams.get("childern");

  const [activeTab, setActiveTab] = useState<number>(0);
  const [mystd, setMyStd] = useState<any>({});
  const [childData, setChildData] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showChildCards, setShowChildCards] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>("");
  const [confirmRemove, setConfirmRemove] = useState<any | null>(null);
  const [removing, setRemoving] = useState<boolean>(false);

  const cachedChild = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("mychildern") || "null");
    } catch {
      return null;
    }
  }, []);

  const fetchChildren = (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    return Get("/mychilds")
      .then((d) => {
        if (d?.success) {
          setChildData(d.data || []);
          if (childernValue) {
            const found = d.data?.find((c: any) => c._id === childernValue);
            if (found) {
              setSelectedChild(found);
              setMyStd(found);
              setShowChildCards(false);
            }
          } else if (cachedChild?._id) {
            setSelectedChild(cachedChild);
            setMyStd(cachedChild);
          }
        } else if (d?.message) {
          displayMessage(d.message, "error");
        }
      })
      .catch((err) => displayMessage(err.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (childernValue) {
      const found = childData.find((c: any) => c._id === childernValue);
      if (found) {
        setSelectedChild(found);
        setMyStd(found);
        setShowChildCards(false);
      }
    } else if (cachedChild?._id) {
      setSelectedChild(cachedChild);
      setMyStd(cachedChild);
    } else {
      setSelectedChild(null);
      setMyStd({});
      setShowChildCards(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childernValue, childData]);

  const handleChildSelect = (child: any) => {
    setSelectedChild(child);
    setMyStd(child);
    setShowChildCards(false);
    localStorage.setItem("mychildern", JSON.stringify(child));
    navigate(RouteName.MYCHILDREN_SCREEN + `?childern=${child._id}`);
  };

  const handleRemoveChild = (child: any) => {
    if (!child?._id || removing) return;
    setRemoving(true);
    Delete(`/removechild/${child._id}`)
      .then((res: any) => {
        if (res?.success) {
          displayMessage(res.message || "Child removed", "success");
          setChildData((prev) => prev.filter((c) => c._id !== child._id));
          // If we just removed the currently-selected child, return to grid.
          if (selectedChild?._id === child._id) {
            setSelectedChild(null);
            setMyStd({});
            setShowChildCards(true);
            localStorage.removeItem("mychildern");
            navigate(RouteName.MYCHILDREN_SCREEN);
          }
          setConfirmRemove(null);
        } else {
          displayMessage(res?.message || "Could not remove child", "error");
        }
      })
      .catch((err) => displayMessage(err.message, "error"))
      .finally(() => setRemoving(false));
  };

  const handleBack = () => {
    setShowChildCards(true);
    setSelectedChild(null);
    setMyStd({});
    localStorage.removeItem("mychildern");
    navigate(RouteName.MYCHILDREN_SCREEN);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 0:
        return <Grades mystd={mystd} />;
      case 1:
        return <TeacherRemarks childernValue={childernValue} />;
      default:
        return <Grades mystd={mystd} />;
    }
  };

  const renderChildCard = (child: any, idx: number) => {
    const name = child?.auth?.fullName || child?.auth?.userName || "Student";
    const grade = child?.grade?.grade ?? "—";
    const code = child?.code || "—";
    const img = child?.auth?.image;
    return (
      <div
        key={child?._id ?? idx}
        className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5 hover:ring-primary/40 hover:shadow-lg transition"
      >
        <div
          aria-hidden
          className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-secondary/10 blur-2xl pointer-events-none"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmRemove(child);
          }}
          aria-label={`Remove ${name}`}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white text-greyBlack ring-1 ring-inputBorder hover:text-lightRed hover:ring-lightRed flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
        >
          <HiOutlineTrash size={14} />
        </button>

        <button
          type="button"
          onClick={() => handleChildSelect(child)}
          className="text-left w-full focus:outline-none"
        >
        <div className="relative flex items-center gap-3 mb-4">
          {img ? (
            <img
              src={img}
              alt=""
              className="h-14 w-14 rounded-2xl object-cover ring-1 ring-inputBorder/60"
            />
          ) : (
            <span className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white text-base font-semibold flex items-center justify-center">
              {getInitials(name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-black truncate">
              {name}
            </p>
            <p className="text-xs text-grey mt-0.5 inline-flex items-center gap-1">
              <HiOutlineAcademicCap size={12} />
              Grade {grade}
            </p>
          </div>
        </div>

        <dl className="relative space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <dt className="text-grey inline-flex items-center gap-1.5">
              <HiOutlineIdentification size={13} />
              Student code
            </dt>
            <dd className="font-mono text-greyBlack">{code}</dd>
          </div>
          <div className="flex items-center justify-between text-xs">
            <dt className="text-grey inline-flex items-center gap-1.5">
              <HiOutlineCalendarDays size={13} />
              Year
            </dt>
            <dd className="text-greyBlack">
              {new Date().getFullYear()}–{new Date().getFullYear() + 1}
            </dd>
          </div>
        </dl>

        <div className="relative mt-4 pt-3 border-t border-inputBorder/40 flex items-center justify-between">
          <span className="text-xs font-medium text-secondary">
            View progress
          </span>
          <HiOutlineArrowRight
            className="text-grey group-hover:text-secondary transition"
            size={14}
          />
        </div>
        </button>
      </div>
    );
  };

  const selectedName =
    selectedChild?.auth?.fullName ||
    selectedChild?.auth?.userName ||
    "Student";
  const selectedGrade = selectedChild?.grade?.grade ?? "—";
  const selectedCode = selectedChild?.code || "—";
  const selectedImg = selectedChild?.auth?.image;

  return (
    <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
      <SideDrawer />

      <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
        {/* Sticky navbar */}
        <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
          <div className="px-4 md:px-8 py-3">
            <Navbar title="My Children" mystd={mystd} />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
          {/* DETAIL SKELETON: when loading directly into a child via URL */}
          {loading && childernValue && (
            <>
              <div className="h-3 w-32 rounded bg-mainBg animate-pulse mb-4" />
              <section className="rounded-3xl mb-5 bg-white ring-1 ring-inputBorder/50 p-6 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-mainBg animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="h-3 w-16 rounded bg-mainBg animate-pulse" />
                      <div className="h-7 w-56 rounded bg-mainBg animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full bg-mainBg animate-pulse" />
                        <div className="h-6 w-24 rounded-full bg-mainBg animate-pulse" />
                        <div className="h-6 w-28 rounded-full bg-mainBg animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-28 rounded-xl bg-mainBg animate-pulse" />
                    <div className="h-10 w-24 rounded-xl bg-mainBg animate-pulse" />
                  </div>
                </div>
              </section>
              <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
                <div className="flex border-b border-inputBorder/40">
                  {[0, 1].map((i) => (
                    <div key={i} className="flex-1 flex items-center justify-center gap-2 px-4 py-3">
                      <div className="h-4 w-4 rounded bg-mainBg animate-pulse" />
                      <div className="h-3 w-24 rounded bg-mainBg animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="p-5 md:p-6 space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-mainBg animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-1/3 rounded bg-mainBg animate-pulse" />
                        <div className="h-2.5 w-1/2 rounded bg-mainBg animate-pulse" />
                      </div>
                      <div className="h-3 w-12 rounded bg-mainBg animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CHILD GRID VIEW */}
          {showChildCards && !(loading && childernValue) && (
            <>
              {/* Header */}
              <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-grey font-medium">
                    Family
                  </p>
                  <h1 className="font-trykker text-2xl md:text-3xl text-black mt-1">
                    My Children
                  </h1>
                  <p className="text-sm text-greyBlack mt-1">
                    Pick a child to see grades, courses, and teacher remarks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium shadow-sm hover:shadow-md hover:shadow-secondary/20 transition self-start md:self-auto"
                >
                  <FiPlus size={14} />
                  Add child
                </button>
              </header>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-5"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-mainBg animate-pulse flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-mainBg animate-pulse" />
                          <div className="h-2.5 w-1/2 rounded bg-mainBg animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="h-2.5 w-24 rounded bg-mainBg animate-pulse" />
                          <div className="h-2.5 w-16 rounded bg-mainBg animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-2.5 w-12 rounded bg-mainBg animate-pulse" />
                          <div className="h-2.5 w-20 rounded bg-mainBg animate-pulse" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-inputBorder/40 flex items-center justify-between">
                        <div className="h-3 w-24 rounded bg-mainBg animate-pulse" />
                        <div className="h-3 w-3 rounded bg-mainBg animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : childData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {childData.map(renderChildCard)}
                </div>
              ) : (
                <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 p-10 text-center">
                  <span className="inline-flex h-14 w-14 rounded-full bg-mainBg items-center justify-center mb-3">
                    <HiOutlineUsers className="text-grey" size={22} />
                  </span>
                  <h2 className="text-base font-semibold text-black">
                    No children linked yet
                  </h2>
                  <p className="text-sm text-grey mt-1 max-w-md mx-auto">
                    Add your child using the code shown on their student profile
                    to start tracking their learning here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:shadow-md hover:shadow-secondary/20"
                  >
                    <FiPlus size={14} />
                    Add a child
                  </button>
                </div>
              )}
            </>
          )}

          {/* CHILD DETAIL VIEW */}
          {selectedChild && !showChildCards && (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline mb-4"
              >
                <HiOutlineArrowLeft size={14} />
                Back to children
              </button>

              {/* Profile hero */}
              <section className="relative overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-7">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    {selectedImg ? (
                      <img
                        src={selectedImg}
                        alt=""
                        className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover ring-2 ring-white/40"
                      />
                    ) : (
                      <span className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white text-secondary text-xl font-semibold flex items-center justify-center ring-2 ring-white/40">
                        {getInitials(selectedName)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-white/70">
                        Student
                      </p>
                      <h2 className="font-trykker text-2xl md:text-3xl leading-tight truncate">
                        {selectedName}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-white/15 ring-1 ring-white/20 px-2 py-1">
                          <HiOutlineAcademicCap size={11} />
                          Grade {selectedGrade}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-white/15 ring-1 ring-white/20 px-2 py-1">
                          <HiOutlineIdentification size={11} />
                          {selectedCode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-white/15 ring-1 ring-white/20 px-2 py-1">
                          <HiOutlineCalendarDays size={11} />
                          {new Date().getFullYear()}–{new Date().getFullYear() + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {childData.length > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 bg-white/15 ring-1 ring-white/20 text-white text-sm font-medium hover:bg-white/25 transition"
                      >
                        <HiOutlineUsers size={15} />
                        Switch child
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(selectedChild)}
                      aria-label="Remove child"
                      className="inline-flex items-center gap-1.5 h-10 rounded-xl px-3 bg-white/10 ring-1 ring-white/20 text-white text-sm font-medium hover:bg-lightRed hover:ring-transparent transition"
                    >
                      <HiOutlineTrash size={15} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Tabs */}
              <div className="rounded-2xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
                <div className="flex border-b border-inputBorder/40">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = activeTab === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm transition ${active
                          ? "text-secondary font-semibold"
                          : "text-greyBlack hover:text-black"
                          }`}
                      >
                        <Icon size={16} />
                        <span>{t.title}</span>
                        {active && (
                          <span
                            aria-hidden
                            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary to-secondary"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="p-5 md:p-6">{renderActiveTab()}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <MyChildernsModal
        isVisible={addOpen}
        onClose={() => setAddOpen(false)}
        studentName={studentName}
        setStudentName={setStudentName}
        onAdded={() => fetchChildren({ silent: true })}
      />

      {confirmRemove && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Remove child"
          onClick={() => !removing && setConfirmRemove(null)}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-[modalIn_220ms_ease-out]"
          >
            <style>{`@keyframes modalIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

            <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-lightRed/10 to-lightRed/5 border-b border-inputBorder/40">
              <button
                type="button"
                onClick={() => !removing && setConfirmRemove(null)}
                aria-label="Close"
                className="absolute top-3 right-3 h-8 w-8 rounded-full text-greyBlack hover:text-black hover:bg-white flex items-center justify-center"
              >
                <HiOutlineXMark size={15} />
              </button>
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-xl bg-lightRed/15 text-lightRed flex items-center justify-center">
                  <HiOutlineExclamationTriangle size={20} />
                </span>
                <div>
                  <h2 className="font-trykker text-lg text-black leading-none">
                    Remove this child?
                  </h2>
                  <p className="text-xs text-greyBlack mt-1">
                    {(confirmRemove?.auth?.fullName ||
                      confirmRemove?.auth?.userName ||
                      "This child")}{" "}
                    will be unlinked from your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 text-sm text-greyBlack leading-relaxed">
              You can re-add them later using their student code. Their lessons,
              quiz history, and grades stay intact — only the link to your parent
              account is removed.
            </div>

            <div className="px-5 pb-5 pt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                disabled={removing}
                className="h-10 px-4 rounded-xl text-sm font-medium text-greyBlack hover:text-black hover:bg-mainBg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRemoveChild(confirmRemove)}
                disabled={removing}
                aria-busy={removing}
                className={`h-10 px-4 rounded-xl text-sm font-medium text-white inline-flex items-center gap-2 transition ${removing
                  ? "bg-lightRed opacity-60 cursor-not-allowed"
                  : "bg-lightRed hover:shadow-md hover:shadow-lightRed/30"
                  }`}
              >
                {removing && (
                  <span
                    aria-hidden
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  />
                )}
                <HiOutlineTrash size={14} />
                {removing ? "Removing…" : "Remove child"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyChildren;
