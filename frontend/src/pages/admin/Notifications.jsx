import { useState } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import { Bell, BellOff, Settings, Filter, Check, X, Archive, Trash2, Eye, Users, AlertTriangle, Shield, TrendingUp, MessageCircle, Zap, Info, CreditCard, Gavel, UserCheck, UserX, Download, Upload } from "lucide-react";

// Mock admin notifications data
const adminNotificationsData = [
    {
        id: "ADM001",
        type: "suspicious_activity",
        title: "Suspicious Bidding Activity Detected",
        message: "Multiple accounts from same IP address placing bids on auction AV267400. Possible shill bidding attempt.",
        relatedItem: "Auction AV267400",
        severity: "high",
        timestamp: "2023-12-19T15:32:00",
        read: false,
        actionRequired: true,
        category: "Security"
    },
    {
        id: "ADM002",
        type: "auction_approval",
        title: "New Auction Awaiting Approval",
        message: "Seller 'AeroCollectibles' has submitted a new auction 'Vintage Aircraft Radio Equipment' for review.",
        relatedItem: "Auction AV905674",
        severity: "medium",
        timestamp: "2023-12-19T14:15:00",
        read: true,
        actionRequired: true,
        category: "Moderation"
    },
    {
        id: "ADM003",
        type: "payment_issue",
        title: "Payment Processing Failure",
        message: "Failed to process payout for seller 'Global Air Services'. Transaction ID: TXN784512. Amount: $12,450.",
        relatedItem: "Transaction TXN784512",
        severity: "high",
        timestamp: "2023-12-19T13:45:00",
        read: false,
        actionRequired: true,
        category: "Finance"
    },
    {
        id: "ADM004",
        type: "new_user",
        title: "Premium Seller Registration",
        message: "New premium seller 'Aviation Heritage Ltd' registered with business verification. Plan: Enterprise.",
        relatedItem: "User U784512",
        severity: "low",
        timestamp: "2023-12-19T12:00:00",
        read: true,
        actionRequired: false,
        category: "Users"
    },
    {
        id: "ADM005",
        type: "user_report",
        title: "User Report Received",
        message: "User 'bidder123' reported auction AV351289 for misleading description. Requires investigation.",
        relatedItem: "Report RPT4512",
        severity: "medium",
        timestamp: "2023-12-19T10:30:00",
        read: true,
        actionRequired: true,
        category: "Moderation"
    },
    {
        id: "ADM006",
        type: "system_alert",
        title: "Server Performance Alert",
        message: "API response times increased by 45% in last hour. Current average: 780ms. Threshold: 500ms.",
        relatedItem: "Server US-EAST-1",
        severity: "high",
        timestamp: "2023-12-19T09:15:00",
        read: false,
        actionRequired: true,
        category: "System"
    },
    {
        id: "ADM007",
        type: "performance",
        title: "Weekly Platform Performance",
        message: "Platform activity increased by 23% this week. 142 new auctions, 2,847 bids placed, $1.2M in transactions.",
        severity: "low",
        timestamp: "2023-12-19T08:00:00",
        read: true,
        actionRequired: false,
        category: "Analytics"
    },
    {
        id: "ADM008",
        type: "maintenance",
        title: "Scheduled Maintenance Tonight",
        message: "Database maintenance scheduled for 2:00 AM - 4:00 AM EST. Expected downtime: 15 minutes.",
        severity: "medium",
        timestamp: "2023-12-18T16:20:00",
        read: true,
        actionRequired: false,
        category: "System"
    }
];

function Notifications() {
    const [notifications, setNotifications] = useState(adminNotificationsData);
    const [filter, setFilter] = useState("all");
    const [showSettings, setShowSettings] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const highSeverityCount = notifications.filter(n => n.severity === "high" && !n.read).length;
    const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

    const filteredNotifications = notifications.filter(notification => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        if (filter === "high_severity") return notification.severity === "high";
        if (filter === "action_required") return notification.actionRequired;
        return notification.type === filter;
    });

    const markAsRead = (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({
            ...notification,
            read: true
        })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    };

    const archiveSelected = () => {
        setNotifications(notifications.filter(notification => 
            !selectedNotifications.includes(notification.id)
        ));
        setSelectedNotifications([]);
    };

    const toggleSelect = (id) => {
        setSelectedNotifications(prev =>
            prev.includes(id)
                ? prev.filter(notificationId => notificationId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            suspicious_activity: <Shield className="text-red-500" size={20} />,
            auction_approval: <Gavel className="text-blue-500" size={20} />,
            payment_issue: <CreditCard className="text-amber-500" size={20} />,
            new_user: <UserCheck className="text-green-500" size={20} />,
            user_report: <AlertTriangle className="text-orange-500" size={20} />,
            system_alert: <Zap className="text-purple-500" size={20} />,
            performance: <TrendingUp className="text-emerald-500" size={20} />,
            maintenance: <Info className="text-gray-500" size={20} />
        };
        return icons[type] || <Bell className="text-gray-500" size={20} />;
    };

    const getSeverityBadge = (severity) => {
        const styles = {
            high: "bg-red-100 text-red-800 border-red-200",
            medium: "bg-amber-100 text-amber-800 border-amber-200",
            low: "bg-gray-100 text-gray-800 border-gray-200"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[severity]}`}>
                {severity} severity
            </span>
        );
    };

    const getCategoryBadge = (category) => {
        const styles = {
            Security: "bg-red-50 text-red-700 border-red-200",
            Moderation: "bg-blue-50 text-blue-700 border-blue-200",
            Finance: "bg-green-50 text-green-700 border-green-200",
            Users: "bg-purple-50 text-purple-700 border-purple-200",
            System: "bg-gray-50 text-gray-700 border-gray-200",
            Analytics: "bg-indigo-50 text-indigo-700 border-indigo-200"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[category]}`}>
                {category}
            </span>
        );
    };

    const getActionButton = (notification) => {
        if (!notification.actionRequired) return null;

        switch (notification.type) {
            case "suspicious_activity":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        <Shield size={14} />
                        Investigate
                    </button>
                );
            case "auction_approval":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        <Gavel size={14} />
                        Review Auction
                    </button>
                );
            case "payment_issue":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">
                        <CreditCard size={14} />
                        Resolve Payment
                    </button>
                );
            case "user_report":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                        <AlertTriangle size={14} />
                        Review Report
                    </button>
                );
            case "system_alert":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                        <Zap size={14} />
                        Check System
                    </button>
                );
            default:
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
                        <Eye size={14} />
                        View Details
                    </button>
                );
        }
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffMs = now - notificationTime;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notificationTime.toLocaleDateString();
    };

    // Statistics for admin dashboard
    const notificationStats = {
        total: notifications.length,
        unread: unreadCount,
        highSeverity: notifications.filter(n => n.severity === "high").length,
        actionRequired: notifications.filter(n => n.actionRequired).length
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            
            <div className="w-full relative">
                <AdminHeader />
                
                <AdminContainer>
                    {/* Header Section */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Bell className="text-blue-600" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold my-5">Admin Notifications</h2>
                                    <p className="text-gray-600">Platform alerts, system updates, and moderation tasks</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4 md:mt-0">
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {unreadCount} unread
                                    </span>
                                )}
                                <button 
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-white"
                                >
                                    <Settings size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{notificationStats.total}</div>
                            <div className="text-sm text-gray-500">Total Notifications</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-red-600">{notificationStats.unread}</div>
                            <div className="text-sm text-gray-500">Unread</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-amber-600">{notificationStats.highSeverity}</div>
                            <div className="text-sm text-gray-500">High Severity</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">{notificationStats.actionRequired}</div>
                            <div className="text-sm text-gray-500">Action Required</div>
                        </div>
                    </div>

                    {/* Notification Settings Panel */}
                    {showSettings && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Security Alerts</p>
                                            <p className="text-sm text-gray-500">Suspicious activity and fraud detection</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Moderation Tasks</p>
                                            <p className="text-sm text-gray-500">Auction approvals and user reports</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">System Alerts</p>
                                            <p className="text-sm text-gray-500">Performance issues and maintenance</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Analytics Reports</p>
                                            <p className="text-sm text-gray-500">Weekly performance summaries</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters and Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => setFilter("all")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    All Notifications
                                </button>
                                <button 
                                    onClick={() => setFilter("unread")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === "unread" ? "bg-red-100 text-red-800 border border-red-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Unread ({unreadCount})
                                </button>
                                <button 
                                    onClick={() => setFilter("high_severity")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === "high_severity" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    High Severity ({highSeverityCount})
                                </button>
                                <button 
                                    onClick={() => setFilter("action_required")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === "action_required" ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Action Required ({actionRequiredCount})
                                </button>
                            </div>
                            
                            <div className="flex gap-3">
                                {selectedNotifications.length > 0 && (
                                    <>
                                        <button 
                                            onClick={archiveSelected}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        >
                                            <Archive size={16} />
                                            Archive ({selectedNotifications.length})
                                        </button>
                                        <button 
                                            onClick={() => setSelectedNotifications([])}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                        >
                                            <X size={16} />
                                            Clear Selection
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                >
                                    <Check size={16} />
                                    Mark All as Read
                                </button>
                            </div>
                        </div>

                        {/* Type Filters */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {["suspicious_activity", "auction_approval", "payment_issue", "new_user", "user_report", "system_alert", "performance", "maintenance"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                        filter === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {type.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-3 mb-16">
                        {filteredNotifications.length > 0 ? (
                            <>
                                {/* Select All Header */}
                                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                                        onChange={selectAll}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600">
                                        {selectedNotifications.length > 0 
                                            ? `${selectedNotifications.length} selected` 
                                            : "Select all notifications"
                                        }
                                    </span>
                                </div>

                                {/* Notifications */}
                                {filteredNotifications.map((notification) => (
                                    <div 
                                        key={notification.id}
                                        className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                                            notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                                        } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        <div className="p-4">
                                            <div className="flex gap-4">
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNotifications.includes(notification.id)}
                                                    onChange={() => toggleSelect(notification.id)}
                                                    className="mt-1 rounded border-gray-300"
                                                />
                                                
                                                {/* Icon */}
                                                <div className="flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className={`font-semibold ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                                                                {notification.title}
                                                            </h3>
                                                            {getSeverityBadge(notification.severity)}
                                                            {getCategoryBadge(notification.category)}
                                                            {!notification.read && (
                                                                <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500">
                                                                {formatTime(notification.timestamp)}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                {!notification.read && (
                                                                    <button 
                                                                        onClick={() => markAsRead(notification.id)}
                                                                        className="p-1 text-gray-400 hover:text-green-600"
                                                                        title="Mark as read"
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => deleteNotification(notification.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-600"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-gray-600 mb-3">{notification.message}</p>
                                                    
                                                    {notification.relatedItem && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                                            <Info size={14} />
                                                            <span>Related: {notification.relatedItem}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {getActionButton(notification)}
                                                        <button className="flex items-center gap-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                                            <Eye size={14} />
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <BellOff size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No notifications</h3>
                                <p className="text-gray-500 mb-6">
                                    {filter === "all" 
                                        ? "You're all caught up! No new notifications."
                                        : `No notifications match the "${filter.replace(/_/g, ' ')}" filter.`
                                    }
                                </p>
                                {filter !== "all" && (
                                    <button 
                                        onClick={() => setFilter("all")}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                    >
                                        Show All Notifications
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
}

export default Notifications;