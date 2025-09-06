import { useNavigate, useSearchParams } from "react-router-dom";
import { PremiumTopics, TopicDetails, YourTopics } from "../../../components";
import { useEffect, useState } from "react";
import { Get } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

interface topictypeORM {
  name: String;
  image: string;
  lessons: any;
  quizes: any;
  practices: any;
  difficulty: String;
  _id: any;
}

const Topics = () => {
  const [topic, setTopics] = useState<topictypeORM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const subject = searchParams.get("subject");
    setLoading(true);

    Get(`/topic?subject=${subject}`).then(async (d) => {
      if (d.success) {
        //    setTopics
        //  (  d.data
        //    )
        let mn = await d.data.map((i: any) => {
          let s = 0, m = 0, p = 0;

          // Ensure quizes is an array
          const quizes = Array.isArray(i.quizes) ? i.quizes : [];

          // Flatten studentQuizData safely
          let q = quizes
            .map((j: any) => j?.studentQuizData || [])
            .flat();

          const read = parseFloat(i?.read) || 0; // Fallback to 0 if read is null/undefined

          // === STATUS CONDITIONS ===
          if (q.length === 0 && quizes.length > 0 && quizes[0]?._id && read === 0) {
            i.status = "incomplete (0%)";
          } else if (q.length === 0 && read === 1) {
            i.status = "complete (100%)";
          } else {
            i.status = `incomplete (${Math.round(read * 100)}%)`;
          }

          // === QUIZ SCORE PROCESSING ===
          q.forEach((j: any, index: number) => {
            s += j?.score || 0;
            m += j?.marks || 0;

            if (index === q.length - 1) {
              if (m === 0) {
                i.status = `incomplete (${Math.round(read * 100)}%)`;
              } else {
                const quizRatio = s > 0 ? m / s : 0;
                const avgProgress = ((quizRatio + read) / 2) * 100;

                if (avgProgress === 100) {
                  i.status = `complete (100%)`;
                } else {
                  i.status = `incomplete (${Math.round(avgProgress)}%)`;
                }
              }
            }
          });

          return i;
        });
        setTopics(mn)
        // setTopics(d.data);
      } else {
        displayMessage(d.message);
      }
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching topics:", error);
      displayMessage("Failed to load topics. Please try again.");
      setLoading(false);
    });
    // Function to update the current index every 4 seconds

    // Cleanup interval on component unmount
    // return () => clearInterval(interval);
  }, []);
  return (
    <div className="w-full mb-2 md:mb-6 h-fit space-y-6">
      {/* Full-width Slider */}
      <div className="w-full h-fit">
        <TopicDetails topic={topic} loading={loading} />
      </div>

      {/* Premium Topics */}
      {/* <div className="col-span-10 md:col-span-6 h-fit" >
                <PremiumTopics />
            </div> */}

      {/* Your Topics */}
      <div className="w-full h-fit">
        <YourTopics topic={topic} loading={loading} />
      </div>
    </div>
  );
};

export default Topics;
