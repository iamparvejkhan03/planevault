import { useEffect } from "react";
import { LoadingSpinner, AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import toast from "react-hot-toast";
import axios from "axios";
import { useState } from "react";
import { TrendingUp, Users, Gavel, Shield, DollarSign, Clock, AlertTriangle, CheckCircle, Settings, Activity, Zap, Crown, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { about } from "../../assets";

const statsData = [
    {
        title: "Total Users",
        value: "12,847",
        change: "+324",
        icon: <Users size={24} />,
        trend: "up",
        description: "Registered users"
    },
    {
        title: "Active Auctions",
        value: "289",
        change: "+12",
        icon: <Gavel size={24} />,
        trend: "up",
        description: "Live auctions"
    },
    {
        title: "Today's Revenue",
        value: "24,580",
        change: "+3,450",
        icon: <DollarSign size={24} />,
        trend: "up",
        currency: "$",
        description: "Platform revenue"
    },
    {
        title: "Pending Moderation",
        value: "47",
        change: "+8",
        icon: <Shield size={24} />,
        trend: "up",
        description: "Items needing review"
    },
    {
        title: "Success Rate",
        value: "86",
        change: "+2",
        icon: <TrendingUp size={24} />,
        trend: "up",
        suffix: "%",
        description: "Auction success"
    },
    {
        title: "Avg. Response Time",
        value: "2.3",
        change: "-0.4",
        icon: <Clock size={24} />,
        trend: "down",
        suffix: "h",
        description: "Support response"
    },
    {
        title: "System Health",
        value: "99.8",
        change: "+0.1",
        icon: <Activity size={24} />,
        trend: "up",
        suffix: "%",
        description: "Uptime"
    }
];

// Mock data for admin-specific components
const recentActivities = [
    {
        id: "ACT001",
        type: "user_registration",
        title: "New Seller Registered",
        description: "AeroVendors Inc. completed seller verification",
        user: "John Aerospace",
        company: "AeroVendors Inc.",
        timestamp: "2023-12-19T15:30:00",
        priority: "low",
        status: "completed"
    },
    {
        id: "ACT002",
        type: "auction_created",
        title: "High-Value Auction Listed",
        description: "New auction: Vintage Boeing 747 Engine - $45,000 starting bid",
        user: "Aviation Heritage",
        value: 45000,
        timestamp: "2023-12-19T14:15:00",
        priority: "medium",
        status: "pending_review"
    },
    {
        id: "ACT003",
        type: "dispute_reported",
        title: "Payment Dispute Filed",
        description: "Buyer filed dispute for transaction #TX784512",
        users: ["Sarah Johnson", "Robert Kim"],
        amount: 3200,
        timestamp: "2023-12-19T13:45:00",
        priority: "high",
        status: "action_required"
    },
    {
        id: "ACT004",
        type: "suspicious_activity",
        title: "Suspicious Bidding Pattern",
        description: "Multiple accounts bidding from same IP address",
        user: "Multiple accounts",
        auction: "Rare WWII Propeller",
        timestamp: "2023-12-19T12:20:00",
        priority: "high",
        status: "investigating"
    }
];

const moderationQueue = [
    {
        id: "MOD001",
        type: "auction_approval",
        title: "Vintage Aircraft Radio Equipment",
        user: "TechRestorations Ltd.",
        submitted: "2 hours ago",
        category: "Aircraft Parts",
        value: 2500,
        status: "pending"
    },
    {
        id: "MOD002",
        type: "user_verification",
        title: "Seller Account Verification",
        user: "Global Air Services",
        submitted: "5 hours ago",
        documents: 3,
        status: "pending"
    },
    {
        id: "MOD003",
        type: "content_report",
        title: "Reported Listing Images",
        user: "Vintage Aviation Co.",
        reportedBy: "2 users",
        reason: "Inappropriate content",
        status: "pending"
    },
    {
        id: "MOD004",
        type: "refund_request",
        title: "Item Not as Described",
        user: "Michael Chen",
        amount: 1850,
        auction: "Aviation Books Collection",
        status: "pending"
    }
];

const systemAlerts = [
    {
        id: "ALERT001",
        type: "performance",
        title: "Database Response Time Increased",
        severity: "medium",
        description: "Average query time increased by 40% in last hour",
        timestamp: "15 minutes ago",
        status: "monitoring"
    },
    {
        id: "ALERT002",
        type: "security",
        title: "Multiple Failed Login Attempts",
        severity: "high",
        description: "15 failed login attempts from unknown IP",
        timestamp: "30 minutes ago",
        status: "investigating"
    },
    {
        id: "ALERT003",
        type: "payment",
        title: "Payment Gateway Latency",
        severity: "low",
        description: "Stripe API response time above threshold",
        timestamp: "1 hour ago",
        status: "resolved"
    }
];

function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [platformStats, setPlatformStats] = useState({
        totalUsers: 12847,
        activeAuctions: 289,
        todayRevenue: 24580,
        pendingModeration: 47
    });

    // useEffect(() => {
    //   const fetchAdminData = async () => {
    //     setLoading(true);
    //     try {
    //       // API calls would go here
    //       setTimeout(() => {
    //         setLoading(false);
    //       }, 1000);
    //     } catch (error) {
    //       toast.error("Failed to load admin dashboard data");
    //       setLoading(false);
    //     }
    //   };
    //   
    //   fetchAdminData();
    // }, []);

    const getPriorityBadge = (priority) => {
        const styles = {
            high: "bg-red-100 text-red-800 border-red-200",
            medium: "bg-amber-100 text-amber-800 border-amber-200",
            low: "bg-green-100 text-green-800 border-green-200"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
                {priority} priority
            </span>
        );
    };

    const getStatusIcon = (status) => {
        const icons = {
            completed: <CheckCircle size={16} className="text-green-500" />,
            pending_review: <Clock size={16} className="text-amber-500" />,
            action_required: <AlertTriangle size={16} className="text-red-500" />,
            investigating: <Zap size={16} className="text-blue-500" />,
            pending: <Clock size={16} className="text-amber-500" />,
            monitoring: <Activity size={16} className="text-blue-500" />,
            resolved: <CheckCircle size={16} className="text-green-500" />
        };
        return icons[status] || <Clock size={16} className="text-gray-500" />;
    };

    const getSeverityBadge = (severity) => {
        const styles = {
            high: "bg-red-500 text-white",
            medium: "bg-amber-500 text-white",
            low: "bg-blue-500 text-white"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[severity]}`}>
                {severity}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours}h ago`;
        return activityTime.toLocaleDateString();
    };

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
                                            <div className={`p-3 rounded-lg ${
                                                stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                        <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change} from yesterday
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    {/* Recent Activities */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold">Recent Activities</h3>
                                                <Link to="/admin/activities" className="text-sm text-blue-600 hover:underline">
                                                    View All
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {recentActivities.map(activity => (
                                                    <div key={activity.id} className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                                        <div className="flex-shrink-0 mt-1">
                                                            {getStatusIcon(activity.status)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-sm">{activity.title}</span>
                                                                {getPriorityBadge(activity.priority)}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                                <span>{formatTime(activity.timestamp)}</span>
                                                                {activity.value && (
                                                                    <span className="font-medium">{formatCurrency(activity.value)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    {/* Moderation Queue */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="p-6 border-b border-gray-200 bg-amber-50">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-amber-800">Moderation Queue</h3>
                                                <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs">{moderationQueue.length} pending</span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {moderationQueue.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <Shield size={18} className="text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{item.title}</p>
                                                                <p className="text-xs text-gray-500">By {item.user} • {item.submitted}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {item.value && (
                                                                <p className="text-sm font-medium text-green-600">{formatCurrency(item.value)}</p>
                                                            )}
                                                            <button className="text-xs text-blue-600 hover:underline mt-1">
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <Link to="/admin/moderation" className="w-full bg-amber-100 text-amber-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors text-center block">
                                                    Process All Pending Items
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Link to="/admin/users" className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors group">
                                                <Users size={24} className="mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                                                <p className="text-sm font-medium text-blue-800">User Management</p>
                                            </Link>
                                            <Link to="/admin/auctions" className="bg-green-50 border border-green-200 rounded-lg p-4 text-center hover:bg-green-100 transition-colors group">
                                                <Gavel size={24} className="mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                                                <p className="text-sm font-medium text-green-800">Auction Oversight</p>
                                            </Link>
                                            <Link to="/admin/financial" className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors group">
                                                <DollarSign size={24} className="mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                                                <p className="text-sm font-medium text-purple-800">Financial Reports</p>
                                            </Link>
                                            <Link to="/admin/settings" className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors group">
                                                <Settings size={24} className="mx-auto mb-2 text-gray-600 group-hover:scale-110 transition-transform" />
                                                <p className="text-sm font-medium text-gray-800">System Settings</p>
                                            </Link>
                                        </div>
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