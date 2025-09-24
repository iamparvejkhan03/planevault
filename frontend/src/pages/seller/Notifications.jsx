import { useState } from "react";
import { SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import { Bell, BellOff, Settings, Filter, Check, X, Archive, Trash2, Eye, Gavel, Award, Clock, DollarSign, TrendingUp, Users, MessageCircle, Zap, AlertTriangle, Info, Package, Truck, Star, CreditCard, UserCheck } from "lucide-react";

// Mock notifications data for sellers
const notificationsData = [
    {
        id: "N001",
        type: "new_bid", // new_bid, reserve_met, auction_ending, auction_ended, buyer_inquiry, payment_received, item_shipped, review_received, system
        title: "New Bid Received!",
        message: "Alex Aviation placed a bid of $19,000 on your 'Vintage Boeing 747 Control Panel' auction.",
        auctionId: "AV267400",
        auctionTitle: "Vintage Boeing 747 Control Panel",
        bidAmount: 19000,
        bidder: "Alex Aviation",
        timestamp: "2023-12-19T15:32:00",
        read: false,
        priority: "high",
        actionRequired: false,
        category: "Aviation Memorabilia"
    },
    {
        id: "N002",
        type: "reserve_met",
        title: "Reserve Price Met!",
        message: "Your reserve price of $15,000 has been met for 'Pratt & Whitney JT9D Engine'. Current bid: $42,750.",
        auctionId: "AV351289",
        auctionTitle: "Pratt & Whitney JT9D Engine",
        reservePrice: 15000,
        currentBid: 42750,
        timestamp: "2023-12-19T14:15:00",
        read: true,
        priority: "high",
        actionRequired: false,
        category: "Engines & Parts"
    },
    {
        id: "N003",
        type: "auction_ending",
        title: "Your auction ends soon!",
        message: "'Rare WWII P-51 Mustang Propeller' ends in 2 hours. Current bid: $22,500 with 31 bids.",
        auctionId: "AV498712",
        auctionTitle: "Rare WWII P-51 Mustang Propeller",
        currentBid: 22500,
        bids: 31,
        watchers: 56,
        timestamp: "2023-12-19T13:45:00",
        read: false,
        priority: "high",
        actionRequired: false,
        category: "Aviation Memorabilia"
    },
    {
        id: "N004",
        type: "auction_ended",
        title: "Auction Completed Successfully!",
        message: "'Vintage Pilot Uniform Collection' sold for $3,200 to Sarah Johnson. Please arrange shipment.",
        auctionId: "AV672341",
        auctionTitle: "Vintage Pilot Uniform Collection",
        winningBid: 3200,
        winner: "Sarah Johnson",
        timestamp: "2023-12-19T12:00:00",
        read: true,
        priority: "high",
        actionRequired: true,
        category: "Aviation Memorabilia"
    },
    {
        id: "N005",
        type: "buyer_inquiry",
        title: "New Buyer Question",
        message: "Michael Chen asked: 'What is the exact dimensions of the aircraft navigation system?'",
        auctionId: "AV783452",
        auctionTitle: "Aircraft Navigation System",
        buyer: "Michael Chen",
        timestamp: "2023-12-19T10:30:00",
        read: false,
        priority: "medium",
        actionRequired: true,
        category: "Aircraft Parts"
    },
    {
        id: "N006",
        type: "payment_received",
        title: "Payment Received!",
        message: "Payment of $3,200 received from Sarah Johnson for 'Vintage Pilot Uniform Collection'.",
        auctionId: "AV672341",
        auctionTitle: "Vintage Pilot Uniform Collection",
        amount: 3200,
        buyer: "Sarah Johnson",
        timestamp: "2023-12-19T09:15:00",
        read: true,
        priority: "medium",
        actionRequired: true,
        category: "Aviation Memorabilia"
    },
    {
        id: "N007",
        type: "item_shipped",
        title: "Ready for Shipping",
        message: "Buyer has completed payment for 'Rare Aviation Books Collection'. Ready to ship.",
        auctionId: "AV894563",
        auctionTitle: "Rare Aviation Books Collection",
        buyer: "David Wilson",
        timestamp: "2023-12-19T08:00:00",
        read: true,
        priority: "medium",
        actionRequired: true,
        category: "Aviation Memorabilia"
    },
    {
        id: "N008",
        type: "review_received",
        title: "New Review Received",
        message: "Robert Kim left a 5-star review: 'Excellent seller! Fast shipping and item as described.'",
        rating: 5,
        reviewer: "Robert Kim",
        timestamp: "2023-12-18T16:20:00",
        read: true,
        priority: "low",
        actionRequired: false
    },
    {
        id: "N009",
        type: "system",
        title: "Weekly Sales Report",
        message: "Last week: 3 auctions completed, $18,450 total sales, 4.8★ average rating.",
        timestamp: "2023-12-18T14:00:00",
        read: true,
        priority: "low",
        actionRequired: false
    },
    {
        id: "N010",
        type: "new_bid",
        title: "Bidding War Heating Up!",
        message: "2 new bids received on 'Vintage Aircraft Radio Equipment' in the last hour.",
        auctionId: "AV905674",
        auctionTitle: "Vintage Aircraft Radio Equipment",
        newBids: 2,
        currentBid: 4200,
        timestamp: "2023-12-18T12:30:00",
        read: true,
        priority: "medium",
        actionRequired: false,
        category: "Aircraft Parts"
    }
];

function Notifications() {
    const [notifications, setNotifications] = useState(notificationsData);
    const [filter, setFilter] = useState("all");
    const [showSettings, setShowSettings] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;
    const financialCount = notifications.filter(n => (n.type === 'payment_received' || n.type === 'auction_ended') && !n.read).length;

    const filteredNotifications = notifications.filter(notification => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        if (filter === "action_required") return notification.actionRequired;
        if (filter === "financial") return notification.type === 'payment_received' || notification.type === 'auction_ended';
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
            new_bid: <Gavel className="text-green-500" size={20} />,
            reserve_met: <Award className="text-amber-500" size={20} />,
            auction_ending: <Clock className="text-red-500" size={20} />,
            auction_ended: <DollarSign className="text-blue-500" size={20} />,
            buyer_inquiry: <MessageCircle className="text-purple-500" size={20} />,
            payment_received: <CreditCard className="text-emerald-500" size={20} />,
            item_shipped: <Truck className="text-orange-500" size={20} />,
            review_received: <Star className="text-yellow-500" size={20} />,
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
            case "auction_ended":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        <Package size={14} />
                        Arrange Shipment
                    </button>
                );
            case "buyer_inquiry":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                        <MessageCircle size={14} />
                        Reply to Buyer
                    </button>
                );
            case "payment_received":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        <Truck size={14} />
                        Prepare Shipment
                    </button>
                );
            case "item_shipped":
                return (
                    <button className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                        <Truck size={14} />
                        Add Tracking
                    </button>
                );
            default:
                return null;
        }
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
            <SellerSidebar />
            
            <div className="w-full relative">
                <SellerHeader />
                
                <SellerContainer>
                    {/* Header Section */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Bell className="text-blue-600" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold my-5">Seller Notifications</h2>
                                    <p className="text-gray-600">Manage your auction activity and buyer communications</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4 md:mt-0">
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {unreadCount} unread
                                    </span>
                                )}
                                {actionRequiredCount > 0 && (
                                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {actionRequiredCount} actions needed
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
                            <h3 className="text-lg font-semibold mb-4">Seller Notification Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">New Bid Alerts</p>
                                            <p className="text-sm text-gray-500">Get notified for new bids</p>
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
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Buyer Questions</p>
                                            <p className="text-sm text-gray-500">New inquiry alerts</p>
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
                                            <p className="font-medium">Payment Notifications</p>
                                            <p className="text-sm text-gray-500">Payment received alerts</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Review Alerts</p>
                                            <p className="text-sm text-gray-500">New review notifications</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">Sales Reports</p>
                                            <p className="text-sm text-gray-500">Weekly performance updates</p>
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
                                    onClick={() => setFilter("action_required")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === "action_required" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Action Required ({actionRequiredCount})
                                </button>
                                <button 
                                    onClick={() => setFilter("financial")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === "financial" ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Financial ({financialCount})
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
                            {["new_bid", "reserve_met", "auction_ending", "auction_ended", "buyer_inquiry", "payment_received", "item_shipped", "review_received", "system"].map(type => (
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
                                                            {notification.actionRequired && (
                                                                <span className="px-2 py-1 bg-amber-500 text-white rounded-full text-xs">
                                                                    Action Required
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
                                                    
                                                    {/* Additional Info */}
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                                        {notification.auctionTitle && (
                                                            <span className="flex items-center gap-1">
                                                                <Gavel size={14} />
                                                                {notification.auctionTitle}
                                                            </span>
                                                        )}
                                                        {notification.bidAmount && (
                                                            <span className="flex items-center gap-1">
                                                                <DollarSign size={14} />
                                                                {formatCurrency(notification.bidAmount)}
                                                            </span>
                                                        )}
                                                        {notification.bidder && (
                                                            <span className="flex items-center gap-1">
                                                                <UserCheck size={14} />
                                                                {notification.bidder}
                                                            </span>
                                                        )}
                                                        {notification.category && (
                                                            <span className="px-2 py-1 bg-gray-100 rounded-md">
                                                                {notification.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {getActionButton(notification)}
                                                        <button className="flex items-center gap-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                                            <Eye size={14} />
                                                            View Details
                                                        </button>
                                                        {notification.type === 'buyer_inquiry' && (
                                                            <button className="flex items-center gap-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                                                                <MessageCircle size={14} />
                                                                Contact Buyer
                                                            </button>
                                                        )}
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
                                        ? "You're all caught up! No new seller notifications."
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

                    {/* Seller Quick Stats */}
                    {filteredNotifications.length > 0 && (
                        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                            <h4 className="font-semibold text-gray-900 mb-4">Seller Activity Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-600">Active Auctions</p>
                                    <p className="text-2xl font-bold text-gray-900">12</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pending Actions</p>
                                    <p className="text-2xl font-bold text-amber-600">{actionRequiredCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Recent Sales</p>
                                    <p className="text-2xl font-bold text-green-600">3</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Avg. Response Time</p>
                                    <p className="text-2xl font-bold text-blue-600">2.3h</p>
                                </div>
                            </div>
                        </div>
                    )}
                </SellerContainer>
            </div>
        </section>
    );
}

export default Notifications;