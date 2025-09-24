import { useState, Suspense, lazy } from "react";
import { MessageSquare, Gavel, Notebook } from "lucide-react";

const LoadingSpinner = lazy(() => import("./LoadingSpinner"));
const CommentSection = lazy(() => import("./CommentSection"));
const BidHistory = lazy(() => import("./BidHistory"));
const Description = lazy(() => import("./Description"));

const TabSection = ({ref}) => {
  const [activeTab, setActiveTab] = useState("comments");

  const tabs = [
    {
      id: "comments",
      label: "Comments",
      icon: <MessageSquare size={18} />,
      component: <CommentSection />,
    },
    {
      id: "bids",
      label: "Bid History",
      icon: <Gavel size={18} />,
      component: <BidHistory />,
    },
    {
      id: "description",
      label: "Descripton",
      icon: <Notebook size={18} />,
      component: <Description />,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-6 py-4 text-base md:text-lg font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary hover:border-gray-300"
                }
              `}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div ref={ref} className="p-4 sm:p-6">
        <Suspense fallback={<LoadingSpinner />}>
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </Suspense>
      </div>
    </div>
  );
};

export default TabSection;
