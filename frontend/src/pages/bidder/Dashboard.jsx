import { useEffect } from "react";
import { LoadingSpinner, StatCard, BidderContainer, BidderHeader, BidderSidebar } from "../../components";
// import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { TrendingUp, Gavel, Award, DollarSign, Bookmark, Hand } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

function Dashboard() {
    const [loading, setLoading] = useState(false);

    const [stats, setStats] = useState({});

    const fetchUserStats = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/users/stats');
            if (data.success) {
                setLoading(true);
                setStats(data.data.statistics);
            }
        } catch (err) {
            console.error('Fetch stats error:', err);
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserStats();
    }, []);

    const statsData = [
        {
            title: "Active Bids",
            value: stats?.activeBids?.toLocaleString(),
            change: "On Live Auctions",
            icon: <Gavel size={24} />,
            trend: "up"
        },
        {
            title: "Watchlist Items",
            value: stats?.watchlistCount?.toLocaleString(),
            change: "Saved For Later",
            icon: <Bookmark size={24} />,
            trend: "up"
        },
        {
            title: "Total Spent",
            value: stats?.totalSpent?.toLocaleString(),
            change: "Used To Purchase",
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "Auctions Won",
            value: stats?.wonAuctions?.toLocaleString(),
            change: "No. of Won Auctions",
            icon: <Award size={24} />,
            trend: "up"
        },
        {
            title: "Bidding Success Rate",
            value: stats?.successRate,
            change: "Won % To Bid",
            icon: <TrendingUp size={24} />,
            trend: "up",
            suffix: "%"
        },
        {
            title: "Average Bid Amount",
            value: stats?.avgBidAmount?.toLocaleString(),
            change: "Bid Amount / No. of Bids",
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "Total Participated Auctions",
            value: stats?.totalParticipatedAuctions?.toLocaleString(),
            change: "All Time",
            icon: <Hand size={24} />,
            trend: "up"
        },
        {
            title: "Currenly Winning Auctions",
            value: stats?.currentlyWinning?.toLocaleString(),
            change: "Leading In Auctions",
            icon: <Hand size={24} />,
            trend: "up"
        }
    ];

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