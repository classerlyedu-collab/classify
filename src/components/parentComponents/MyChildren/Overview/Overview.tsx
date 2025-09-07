import { FaUser, FaGraduationCap, FaIdCard, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Get } from "../../../../config/apiMethods";
import { useNavigate } from "react-router-dom";
import { RouteName } from "../../../../routes/RouteNames";

const Overview = ({ per, mystd }: any) => {
  const [allChildren, setAllChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  let date = new Date();

  useEffect(() => {
    // Fetch all children for this parent
    Get("/mychilds")
      .then((response) => {
        if (response.success) {
          setAllChildren(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching children data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChildSelect = (child: any) => {
    // Store selected child in localStorage
    localStorage.setItem("mychildern", JSON.stringify(child));
    // Navigate to the same page with child parameter
    navigate(RouteName.MYCHILDREN_SCREEN + `?childern=${child._id}`);
    // Reload the page to update the selected child
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full">
          <FaUser className="text-blue-600 text-lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 font-ubuntu">Select a Child to View Progress</h1>
      </div>

      {/* Children Grid */}
      {allChildren && allChildren.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allChildren.map((child: any, index: number) => (
            <div
              key={index}
              onClick={() => handleChildSelect(child)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-blue-200 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <img
                    src={child?.auth?.image || "https://st2.depositphotos.com/3889193/6856/i/450/depositphotos_68564721-Beautiful-young-student-posing.jpg"}
                    alt={child?.auth?.fullName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 font-ubuntu text-lg">
                    {child?.auth?.fullName || "Student Name"}
                  </h3>
                  <p className="text-sm text-gray-500 font-ubuntu">
                    {child?.grade?.grade || "Grade"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaIdCard className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600 font-ubuntu">Student Code: {child?.code || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600 font-ubuntu">Year: {date.getFullYear()}-{date.getFullYear() + 1}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-blue-600 font-ubuntu text-center font-semibold">
                  Click to select this child and view their progress
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaUser className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 font-ubuntu mb-2">No Children Found</h3>
          <p className="text-gray-400 font-ubuntu">Children will appear here once they are registered.</p>
        </div>
      )}
    </div>
  );
};

export default Overview;