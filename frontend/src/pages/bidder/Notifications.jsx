import { useState } from "react";
import { BidderContainer, BidderHeader, BidderSidebar } from "../../components";
import { Bell, BellOff, Settings, Filter, Check, X, Archive, Trash2, Eye, Gavel, Award, Clock, DollarSign, TrendingUp, TrendingDown, Star, MessageCircle, Zap, AlertTriangle, Info } from "lucide-react";

// Mock notifications data
const notificationsData = [
    {
        id: "N001",
        type: "outbid", // outbid, winning, auction_ending, auction_won, new_auction, price_drop, system
        title: "You've been outbid!",
        message: "Someone placed a higher bid on 'Vintage Boeing 747 Control Panel'. Current bid is now $19,000.",
        auctionId: "AV267400",
        auctionTitle: "Vintage Boeing 747 Control Panel",
        currentBid: 19000,
        yourBid: 18500,
        timestamp: "2023-12-19T15:32:00",
        read: false,
        priority: "high",
        actionRequired: true,
        category: "Aviation Memorabilia"
    },
    {
        id: "N002",
        type: "winning",
        title: "You're currently winning!",
        message: "Your bid of $42,750 is the highest on 'Pratt & Whitney JT9D Engine'. Auction ends in 2 days.",
        auctionId: "AV351289",
        auctionTitle: "Pratt & Whitney JT9D Engine",
        currentBid: 42750,
        yourBid: 42750,
        timestamp: "2023-12-19T14:15:00",
        read: true,
        priority: "medium",
        actionRequired: false,
        category: "Engines & Parts"
    },
    {
        id: "N003",
        type: "auction_ending",
        title: "Auction ending soon!",
        message: "'Rare WWII P-51 Mustang Propeller' ends in 2 hours. You're currently not the highest bidder.",
        auctionId: "AV498712",
        auctionTitle: "Rare WWII P-51 Mustang Propeller",
        currentBid: 22500,
        yourBid: 22000,
        timestamp: "2023-12-19T13:45:00",
        read: false,
        priority: "high",
        actionRequired: true,
        category: "Aviation Memorabilia"
    },
    {
        id: "N004",
        type: "auction_won",
        title: "Congratulations! Auction Won",
        message: "You've successfully won 'Vintage Pilot Uniform Collection' for $3,200. Next steps: complete payment.",
        auctionId: "AV672341",
        auctionTitle: "Vintage Pilot Uniform Collection",
        winningBid: 3200,
        timestamp: "2023-12-19T12:00:00",
        read: true,
        priority: "high",
        actionRequired: true,
        category: "Aviation Memorabilia"
    },
    {
        id: "N005",
        type: "price_drop",
        title: "Price drop alert!",
        message: "Starting bid reduced on 'Aircraft Navigation System'. New starting bid: $4,500.",
        auctionId: "AV783452",
        auctionTitle: "Aircraft Navigation System",
        oldPrice: 5000,
        newPrice: 4500,
        timestamp: "2023-12-19T10:30:00",
        read: true,
        priority: "medium",
        actionRequired: false,
        category: "Aircraft Parts"
    },
    {
        id: "N006",
        type: "new_auction",
        title: "New auction matching your interests",
        message: "New listing: 'Vintage Aircraft Radio Equipment' in Aviation Memorabilia category.",
        auctionId: "AV905674",
        auctionTitle: "Vintage Aircraft Radio Equipment",
        startingBid: 2500,
        timestamp: "2023-12-19T09:15:00",
        read: false,
        priority: "low",
        actionRequired: false,
        category: "Aviation Memorabilia"
    },
    {
        id: "N007",
        type: "system",
        title: "Weekly bidding summary",
        message: "You placed 12 bids this week with a 42% success rate. Total active bids: 8.",
        timestamp: "2023-12-19T08:00:00",
        read: true,
        priority: "low",
        actionRequired: false
    },
    {
        id: "N008",
        type: "outbid",
        title: "You've been outbid!",
        message: "Someone placed a higher bid on 'Rare Aviation Books Collection'. Current bid is now $1,900.",
        auctionId: "AV894563",
        auctionTitle: "Rare Aviation Books Collection",
        currentBid: 1900,
        yourBid: 1850,
        timestamp: "2023-12-18T16:20:00",
        read: true,
        priority: "high",
        actionRequired: true,
        category: "Aviation Memorabilia"
    }
];

function Notifications() {
    const [notifications, setNotifications] = useState(notificationsData);
    const [filter, setFilter] = useState("all");
    const [showSettings, setShowSettings] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => n.priority === "high" && !n.read).length;

    const filteredNotifications = notifications.filter(notification => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        if (filter === "high_priority") return notification.priority === "high";
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
            outbid: <TrendingDown className="text-red-500" size={20} />,
            winning: <Award className="text-green-500" size={20} />,
            auction_ending: <Clock className="text-amber-500" size={20} />,
            auction_won: <Star className="text-blue-500" size={20} />,
            new_auction: <Zap className="text-purple-500" size={20} />,
            price_drop: <TrendingUp className="text-emerald-500" size={20} />,
            system: <Info className="text-gray-500" size={20} />
        };
        return icons[type] || <Bell className="text-gray-500" size={20} />;
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            high: "bg-red-100 text-red-800 border-red-200",
            medium: "bg-amber-100 text-amber-800 border-amber-200",
            low: "bg-gray-100 text-gray-800 border-gray-200"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
                {priority} priority
            </span>
        );
    };

    const getActionButton = (notification) => {
        if (!notification.actionRequired) return null;

        switch (notification.type) {
            case "outbid":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        <Gavel size={14} />
                        Re-bid Now
                    </button>
                );
            case "auction_ending":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">
                        <Clock size={14} />
                        Place Bid
                    </button>
                );
            case "auction_won":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        <DollarSign size={14} />
                        Complete Payment
                    </button>
                );
            default:
                return null;
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

    return (
        <section className="flex min-h-screen bg-gray-50">
            <BidderSidebar />
            
            <div className="w-full relative">
                <BidderHeader />
                
                <BidderContainer>
                    {/* Header Section */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Bell className="text-blue-600" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold my-5">Notifications</h2>
                                    <p className="text-gray-600">Stay updated with your bidding activity and auction alerts</p>
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

                    {/* Notification Settings Panel */}
                    {showSettings && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Bid Alerts</p>
                                            <p className="text-sm text-gray-500">Get notified when you're outbid</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Auction Updates</p>
                                            <p className="text-sm text-gray-500">Ending soon notifications</p>
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
                                            <p className="font-medium">Price Drops</p>
                                            <p className="text-sm text-gray-500">Alerts for watched items</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">New Listings</p>
                                            <p className="text-sm text-gray-500">Matching your interests</p>
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
                                    onClick={() => setFilter("high_priority")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === "high_priority" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    High Priority ({highPriorityCount})
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
                            {["outbid", "winning", "auction_ending", "auction_won", "new_auction", "price_drop", "system"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                        filter === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-3">
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
                                                            {getPriorityBadge(notification.priority)}
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
                                                    
                                                    {notification.auctionTitle && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                                            <Gavel size={14} />
                                                            <span>Auction: {notification.auctionTitle}</span>
                                                            {notification.category && (
                                                                <span className="px-2 py-1 bg-gray-100 rounded-md">
                                                                    {notification.category}
                                                                </span>
                                                            )}
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
                                        : `No notifications match the "${filter}" filter.`
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

                    {/* Quick Stats */}
                    {filteredNotifications.length > 0 && (
                        <div className="mt-8 mb-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total Notifications</p>
                                    <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Unread</p>
                                    <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">High Priority</p>
                                    <p className="text-2xl font-bold text-amber-600">{highPriorityCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Action Required</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {notifications.filter(n => n.actionRequired && !n.read).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default Notifications;