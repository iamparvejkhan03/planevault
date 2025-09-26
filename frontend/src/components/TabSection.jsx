import { useState, Suspense, lazy, useEffect, forwardRef } from "react";
import { MessageSquare, Gavel, Notebook } from "lucide-react";

const LoadingSpinner = lazy(() => import("./LoadingSpinner"));
const CommentSection = lazy(() => import("./CommentSection"));
const BidHistory = lazy(() => import("./BidHistory"));
const Description = lazy(() => import("./Description"));

const TabSection = forwardRef(({ description, bids, auction, activatedTab }, ref) => {
  // Internal state that syncs with the activatedTab prop
  const [activeTab, setActiveTab] = useState(activatedTab || "comments");

  // Sync internal state when activatedTab prop changes
  useEffect(() => {
    if (activatedTab) {
      setActiveTab(activatedTab);
    }
  }, [activatedTab]);

  const tabs = [
    {
      id: "comments",
      label: "Comments",
      icon: <MessageSquare size={18} />,
      component: <CommentSection auctionId={auction._id} />,
    },
    {
      id: "bids",
      label: "Bid History",
      icon: <Gavel size={18} />,
      component: <BidHistory bids={bids} auction={auction} />,
    },
    {
      id: "description",
      label: "Description",
      icon: <Notebook size={18} />,
      component: <Description description={description} />,
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
});

TabSection.displayName = "TabSection";

export default TabSection;