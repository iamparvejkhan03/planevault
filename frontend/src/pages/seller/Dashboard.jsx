import { useEffect } from "react";
import { QuickActions, StatCard, SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import { useState } from "react";
import { TrendingUp, Gavel, Award, Heart, DollarSign, Clock, Eye } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

function Dashboard() {
    const [stats, setStats] = useState({});

    const fetchUserStats = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/users/stats/seller');
            if (data.success) {
                setStats(data.data.statistics);
            }
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    };

    useEffect(() => {
        fetchUserStats();
    }, []);

    const statsData = [
        {
            title: "Total Revenue",
            value: stats?.totalRevenue?.toLocaleString(),
            change: "All Time",
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "Active Auctions",
            value: stats?.activeAuctions,
            change: "Active Right Now",
            icon: <Clock size={24} />,
            trend: "up"
        },
        {
            title: "Items Sold",
            value: stats?.soldAuctions,
            change: "Previously Sold",
            icon: <Award size={24} />,
            trend: "up"
        },
        {
            title: "Success Rate",
            value: stats && stats?.successRate,
            change: "Sold%Ended",
            icon: <TrendingUp size={24} />,
            trend: "up",
            suffix: "%"
        },
        {
            title: "Total Bids",
            value: stats?.totalBidsReceived,
            change: "All Time",
            icon: <Gavel size={24} />,
            trend: "up"
        },
        {
            title: "Avg. Sale Price",
            value: stats?.avgSalePrice?.toLocaleString(),
            change: "Per Item Sold",
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "Watchlist Items",
            value: stats?.totalWatchlists,
            change: "Saved To Watchlist",
            icon: <Heart size={24} />,
            trend: "up"
        },
        {
            title: "Total Views",
            value: stats?.totalViews,
            change: "All Auctions Views",
            icon: <Eye size={24} />,
            trend: "up"
        },
    ];

    return (
        <section className="flex min-h-[70vh]">
            <SellerSidebar />

            <div className="w-full relative">
                <SellerHeader />

                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Seller Dashboard</h2>
                        <p className="text-secondary">Easily track your auctions in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {
                            statsData.map(stat => (
                                <StatCard key={stat.title} {...stat} />
                            ))
                        }
                    </div>

                    <div className="space-y-6 mb-16">
                        <QuickActions />
                    </div>
                </SellerContainer>
            </div>
        </section>
    );
}

export default Dashboard;