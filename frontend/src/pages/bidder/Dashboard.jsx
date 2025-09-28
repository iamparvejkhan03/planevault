import { useEffect } from "react";
import { LoadingSpinner, QuickActions, RecentActivity, StatCard, TopPerformers, BidderContainer, BidderHeader, BidderSidebar } from "../../components";
import toast from "react-hot-toast";
import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { TrendingUp, TrendingDown, Users, Gavel, Award, Heart, DollarSign, BarChart3, Clock, Eye, Bookmark, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { about } from "../../assets";
import { useStats } from "../../hooks/useStats";
// import useRefreshToken from "../../hooks/useRefreshToken";
// import { updateUser } from "../../features/forms/UserAuthSlice.js";
// import cleanFileName from "../../hooks/CleanFileName.jsx";

// Mock data for bidder-specific components
const recentAuctions = [
    {
        id: "AV267400",
        title: "Vintage Boeing 747 Control Panel",
        currentBid: 18500,
        yourBid: 17500,
        status: "outbid",
        timeLeft: "2h 15m",
        image: about
    },
    {
        id: "AV351289",
        title: "Pratt & Whitney JT9D Engine",
        currentBid: 42750,
        yourBid: 42750,
        status: "winning",
        timeLeft: "1d 4h",
        image: about
    },
    {
        id: "AV498712",
        title: "Rare WWII P-51 Mustang Propeller",
        currentBid: 22500,
        yourBid: 22000,
        status: "outbid",
        timeLeft: "6h 45m",
        image: about
    }
];

const watchlistItems = [
    {
        id: "AV672341",
        title: "Vintage Pilot Uniform Collection",
        currentBid: 3200,
        timeLeft: "3d 2h",
        bids: 12,
        image: about
    },
    {
        id: "AV783452",
        title: "Aircraft Navigation System",
        currentBid: 8900,
        timeLeft: "1d 8h",
        bids: 8,
        image: about
    }
];

function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [activeBids, setActiveBids] = useState(12);
    const [watchlistCount, setWatchlistCount] = useState(8);
    const { stats } = useStats();

    const statsData = [
    {
        title: "Active Bids",
        value: stats.myActiveBids,
        change: "On Active Auctions",
        icon: <Gavel size={24} />,
        trend: "up"
    },
    {
        title: "Watchlist Items",
        value: "8",
        change: "+2",
        icon: <Bookmark size={24} />,
        trend: "up"
    },
    {
        title: "Total Spent",
        value: "14,250",
        change: "+2,150",
        icon: <DollarSign size={24} />,
        trend: "up",
        currency: "$"
    },
    {
        title: "Auctions Won",
        value: stats.myWinningAuctions,
        change: "All Time",
        icon: <Award size={24} />,
        trend: "up"
    },
    {
        title: "Bidding Success Rate",
        value: stats.bidSuccessRate,
        change: "All Time",
        icon: <TrendingUp size={24} />,
        trend: "up",
        suffix: "%"
    },
    {
        title: "Outbid Notifications",
        value: "18",
        change: "-3",
        icon: <Bell size={24} />,
        trend: "down"
    },
    {
        title: "Ending Soon",
        value: stats.endingSoon,
        change: "In Next 24 Hours",
        icon: <Clock size={24} />,
        trend: "down"
    }
];

    // useEffect(() => {
    //   // Fetch bidder data
    //   const fetchBidderData = async () => {
    //     setLoading(true);
    //     try {
    //       // API calls would go here
    //       setTimeout(() => {
    //         setLoading(false);
    //       }, 1000);
    //     } catch (error) {
    //       toast.error("Failed to load dashboard data");
    //       setLoading(false);
    //     }
    //   };
    //   
    //   fetchBidderData();
    // }, []);

    return (
        <section className="flex min-h-[70vh]">
            <BidderSidebar />

            <div className="w-full relative">
                <BidderHeader />

                <BidderContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Bidder Dashboard</h2>
                        <p className="text-secondary">Track your bidding activity and find new aviation auctions.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {statsData.map(stat => (
                                    <StatCard key={stat.title} {...stat} />
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                                {/* Recent Bidding Activity */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Recent Bidding Activity</h3>
                                        <Link to="/bidder/bids" className="text-sm text-blue-600 hover:underline">
                                            View All
                                        </Link>
                                    </div>
                                    <div className="space-y-4">
                                        {recentAuctions.map(auction => (
                                            <div key={auction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center">
                                                    <img src={auction.image} alt={auction.title} className="w-12 h-12 rounded-md object-cover mr-3" />
                                                    <div>
                                                        <p className="font-medium text-sm">{auction.title}</p>
                                                        <p className="text-xs text-gray-500">Your bid: ${auction.yourBid.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                        auction.status === 'winning' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {auction.status === 'winning' ? 'Winning' : 'Outbid'}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">{auction.timeLeft} left</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Watchlist Preview */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Your Watchlist</h3>
                                        <Link to="/bidder/watchlist" className="text-sm text-blue-600 hover:underline">
                                            View All
                                        </Link>
                                    </div>
                                    <div className="space-y-4">
                                        {watchlistItems.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center">
                                                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-md object-cover mr-3" />
                                                    <div>
                                                        <p className="font-medium text-sm">{item.title}</p>
                                                        <p className="text-xs text-gray-500">{item.bids} bids</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-sm">${item.currentBid.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{item.timeLeft} left</p>
                                                </div>
                                            </div>
                                        ))}
                                        {watchlistItems.length === 0 && (
                                            <div className="text-center py-6">
                                                <Bookmark size={32} className="mx-auto text-gray-300 mb-2" />
                                                <p className="text-gray-500">Your watchlist is empty</p>
                                                <Link to="/bidder/auctions/active" className="text-blue-600 hover:underline text-sm">
                                                    Browse auctions
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions for Bidders */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Link to="/bidder/auctions/active" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                                        <Gavel size={24} className="mx-auto mb-2 text-blue-600" />
                                        <p className="text-sm font-medium">Browse Auctions</p>
                                    </Link>
                                    <Link to="/bidder/watchlist" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                                        <Bookmark size={24} className="mx-auto mb-2 text-blue-600" />
                                        <p className="text-sm font-medium">View Watchlist</p>
                                    </Link>
                                    <Link to="/bidder/bids" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                                        <TrendingUp size={24} className="mx-auto mb-2 text-blue-600" />
                                        <p className="text-sm font-medium">My Bids</p>
                                    </Link>
                                    <Link to="/bidder/auctions/won" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                                        <Award size={24} className="mx-auto mb-2 text-blue-600" />
                                        <p className="text-sm font-medium">Won Auctions</p>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default Dashboard;