import { useEffect } from "react";
import { LoadingSpinner, AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useState } from "react";
import { TrendingUp, Users, Gavel, DollarSign, Settings, Crown, Heart, MessageCircle, Hand, Store, UserCog, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";

function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        totalAuctions: 0,
        totalRevenue: 0,
        pendingModeration: 0,
        activeAuctions: 0,
        successRate: 0,
    });

    const fetchAdminStats = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/v1/admin/stats');
            if (data.success) {
                setAdminStats(data.data);
            }
        } catch (err) {
            console.error('Fetch admin stats error:', err);
            toast.error("Failed to load admin dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const statsData = [
        {
            title: "Total Users",
            value: adminStats.totalUsers?.toLocaleString(),
            change: `+${adminStats.recentUsers || 0} this week`,
            icon: <Users size={24} />,
            trend: "up",
            description: "Registered Users"
        },
        {
            title: "Total Bidders",
            value: adminStats?.userTypeStats?.bidder?.toLocaleString(),
            change: `+${adminStats.recentUsers || 0} this week`,
            icon: <Hand size={24} />,
            trend: "up",
            description: "Registered Bidders"
        },
        {
            title: "Total Sellers",
            value: adminStats?.userTypeStats?.seller?.toLocaleString(),
            change: `+${adminStats.recentUsers || 0} this week`,
            icon: <Store size={24} />,
            trend: "up",
            description: "Registered Sellers"
        },
        {
            title: "Total Admins",
            value: adminStats?.userTypeStats?.admin?.toLocaleString(),
            change: `+${adminStats.recentUsers || 0} this week`,
            icon: <UserCog size={24} />,
            trend: "up",
            description: "Registered Admins"
        },
        {
            title: "Total Auctions",
            value: adminStats.totalAuctions,
            change: `${adminStats.auctionsEndingToday || 0} ending today`,
            icon: <Gavel size={24} />,
            trend: "up",
            description: "Total Auctions"
        },
        {
            title: "Active Auctions",
            value: adminStats.activeAuctions,
            change: `${adminStats.auctionsEndingToday || 0} ending today`,
            icon: <Gavel size={24} />,
            trend: "up",
            description: "Live Auctions"
        },
        {
            title: "Sold Auctions",
            value: adminStats?.totalSoldAuctions,
            change: `${adminStats.auctionsEndingToday || 0} ending today`,
            icon: <Gavel size={24} />,
            trend: "up",
            description: "Won By Bidders"
        },
        {
            title: "Pending Auctions",
            value: adminStats?.pendingModeration,
            change: `${adminStats.auctionsEndingToday || 0} ending today`,
            icon: <CheckSquare size={24} />,
            trend: "down",
            description: "Needs Approval"
        },
        {
            title: "Total Sales",
            value: adminStats.totalRevenue?.toLocaleString(),
            change: `Today: $${adminStats.todayRevenue?.toLocaleString() || 0}`,
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$",
            description: "All-time platform revenue"
        },
        {
            title: "Today Sales",
            value: adminStats?.todayRevenue?.toLocaleString(),
            change: `Today: $${adminStats.todayRevenue?.toLocaleString() || 0}`,
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$ ",
            description: "Today's Platform Revenue"
        },
        {
            title: "Highest Sale",
            value: adminStats.highestSaleAmount?.toLocaleString(),
            change: "Record sale",
            icon: <Crown size={24} />,
            trend: "up",
            currency: "$",
            description: adminStats.highestSaleAuction?.title || "No sales yet"
        },
        {
            title: "Average Sale",
            value: adminStats?.averageSalePrice?.toLocaleString(),
            change: "Record sale",
            icon: <Crown size={24} />,
            trend: "up",
            currency: "$",
            description: `${adminStats?.totalSoldAuctions} Sold Auctions`
        },
        {
            title: "Total Bids",
            value: adminStats?.totalBids?.toLocaleString(),
            change: "Record sale",
            icon: <Hand size={24} />,
            trend: "up",
            description: `On ${adminStats?.totalAuctions} Auctions`
        },
        {
            title: "Total Comments",
            value: adminStats?.totalComments?.toLocaleString(),
            change: "Record sale",
            icon: <MessageCircle size={24} />,
            trend: "up",
            description: `By The Users`
        },
        {
            title: "Watchlist",
            value: adminStats?.totalWatchlists?.toLocaleString(),
            change: "Record sale",
            icon: <Heart size={24} />,
            trend: "up",
            description: `Saved to Watch Later`
        },
        {
            title: "Success Rate",
            value: adminStats.successRate,
            change: `${adminStats.totalSoldAuctions || 0} sold`,
            icon: <TrendingUp size={24} />,
            trend: "up",
            suffix: "%",
            description: "Auction success rate"
        },
    ];

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Crown size={32} className="text-blue-600" />
                            <h2 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h2>
                        </div>
                        <p className="text-gray-600">Monitor platform performance and manage system operations</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {statsData.map(stat => (
                                    <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500">{stat.title}</p>
                                                <h3 className="text-2xl font-bold mt-1">
                                                    {stat.currency && <span>{stat.currency}</span>}
                                                    {stat.value}
                                                    {stat.suffix && <span>{stat.suffix}</span>}
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                                            </div>
                                            <div className={`p-3 rounded-lg ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                        {/* <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change}
                                        </p> */}
                                    </div>
                                ))}
                            </div>

                            {/* Highest Sale Highlight Card */}
                            {adminStats.highestSaleAuction && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm border border-purple-200 mb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Crown size={20} className="text-purple-600" />
                                                <h3 className="text-lg font-semibold text-purple-800">Highest Sale Record</h3>
                                            </div>
                                            <p className="text-2xl font-bold text-purple-900">
                                                ${adminStats.highestSaleAmount?.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-purple-600 mt-1">{adminStats.highestSaleAuction.title}</p>
                                            <div className="flex gap-4 mt-2 text-xs text-purple-700">
                                                <span>Seller: {adminStats.highestSaleAuction.seller}</span>
                                                <span>Buyer: {adminStats.highestSaleAuction.winner}</span>
                                                <span>Date: {new Date(adminStats.highestSaleAuction.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="hidden md:block bg-purple-100 p-3 rounded-lg">
                                            <Crown size={32} className="text-purple-600" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
                                {/* Quick Actions */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link to="/admin/users" className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors group">
                                            <Users size={24} className="mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm font-medium text-blue-800">User Management</p>
                                        </Link>
                                        <Link to="/admin/auctions/all" className="bg-green-50 border border-green-200 rounded-lg p-4 text-center hover:bg-green-100 transition-colors group">
                                            <Gavel size={24} className="mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm font-medium text-green-800">Auction Oversight</p>
                                        </Link>
                                        <Link to="/admin/transactions" className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors group">
                                            <DollarSign size={24} className="mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm font-medium text-purple-800">Transactions</p>
                                        </Link>
                                        <Link to="/admin/commissions" className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors group">
                                            <Settings size={24} className="mx-auto mb-2 text-gray-600 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm font-medium text-gray-800">Commission</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default Dashboard;