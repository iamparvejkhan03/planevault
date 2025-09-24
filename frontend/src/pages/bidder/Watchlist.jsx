import { useState } from "react";
import { BidderContainer, BidderHeader, BidderSidebar } from "../../components";
import { Eye, Gavel, Clock, DollarSign, Trash2, Bell, BellOff, Search, Filter, SortAsc, Bookmark, MapPin, Award } from "lucide-react";
import { about } from "../../assets";

// Mock watchlist data
const watchlistData = [
    {
        id: "AV672341",
        title: "Vintage Pilot Uniform Collection",
        description: "Complete set of 1960s pilot uniform with hat, jacket, and accessories in excellent condition",
        category: "Aviation Memorabilia",
        currentBid: 3200,
        startingBid: 1500,
        bids: 12,
        watchers: 24,
        timeLeft: "3d 2h",
        endTime: "2023-12-20T14:30:00",
        image: about,
        auctionType: "Standard Auction",
        notifications: true,
        condition: "Excellent",
        location: "Seattle, WA",
        sellerRating: 4.8
    },
    {
        id: "AV783452",
        title: "Aircraft Navigation System",
        description: "Vintage aircraft navigation system from 1970s commercial airliner, fully functional",
        category: "Aircraft Parts",
        currentBid: 8900,
        startingBid: 5000,
        bids: 8,
        watchers: 18,
        timeLeft: "1d 8h",
        endTime: "2023-12-18T20:45:00",
        image: about,
        auctionType: "Reserve Auction",
        notifications: true,
        condition: "Good",
        location: "Miami, FL",
        sellerRating: 4.5
    },
    {
        id: "AV894563",
        title: "Rare Aviation Books Collection",
        description: "Collection of 15 rare aviation books from 1940s-1960s, including first editions",
        category: "Aviation Memorabilia",
        currentBid: 1850,
        startingBid: 800,
        bids: 15,
        watchers: 32,
        timeLeft: "12h 45m",
        endTime: "2023-12-17T12:45:00",
        image: about,
        auctionType: "Standard Auction",
        notifications: false,
        condition: "Very Good",
        location: "New York, NY",
        sellerRating: 4.9
    },
    {
        id: "AV905674",
        title: "Vintage Aircraft Radio Equipment",
        description: "Set of 1950s aircraft radio communication equipment, tested and working",
        category: "Aircraft Parts",
        currentBid: 4200,
        startingBid: 2500,
        bids: 6,
        watchers: 14,
        timeLeft: "5d 6h",
        endTime: "2023-12-22T10:15:00",
        image: about,
        auctionType: "Reserve Auction",
        notifications: true,
        condition: "Fair",
        location: "Los Angeles, CA",
        sellerRating: 4.2
    },
    {
        id: "AV016785",
        title: "WWII Pilot Flight Helmet",
        description: "Authentic WWII pilot flight helmet with oxygen mask, museum quality",
        category: "Aviation Memorabilia",
        currentBid: 5500,
        startingBid: 3000,
        bids: 21,
        watchers: 47,
        timeLeft: "2d 4h",
        endTime: "2023-12-19T16:20:00",
        image: about,
        auctionType: "Standard Auction",
        notifications: false,
        condition: "Good",
        location: "Chicago, IL",
        sellerRating: 4.7
    }
];

function Watchlist() {
    const [watchlist, setWatchlist] = useState(watchlistData);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("timeLeft");

    const removeFromWatchlist = (id) => {
        setWatchlist(watchlist.filter(item => item.id !== id));
        // toast.success("Removed from watchlist");
    };

    const toggleNotifications = (id) => {
        setWatchlist(watchlist.map(item => 
            item.id === id ? { ...item, notifications: !item.notifications } : item
        ));
        // toast.success("Notification settings updated");
    };

    const filteredWatchlist = watchlist
        .filter(item => {
            const matchesSearch = searchTerm === "" || 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch(sortBy) {
                case "timeLeft":
                    return new Date(a.endTime) - new Date(b.endTime);
                case "currentBid":
                    return b.currentBid - a.currentBid;
                case "bids":
                    return b.bids - a.bids;
                default:
                    return 0;
            }
        });

    const categories = ["all", ...new Set(watchlist.map(item => item.category))];

    const getTimeLeftColor = (timeLeft) => {
        if (timeLeft.includes('h') && !timeLeft.includes('d')) {
            return 'text-red-600';
        }
        if (timeLeft.includes('d') && parseInt(timeLeft) <= 1) {
            return 'text-amber-600';
        }
        return 'text-green-600';
    };

    return (
        <section className="flex min-h-screen">
            <BidderSidebar />
            
            <div className="w-full relative">
                <BidderHeader />
                
                <BidderContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">Your Watchlist</h2>
                                <p className="text-secondary">Track items you're interested in and get notified about bidding activity.</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {watchlist.length} items
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search watchlist items..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter size={18} className="text-gray-500" />
                                    <select 
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category === "all" ? "All Categories" : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <SortAsc size={18} className="text-gray-500" />
                                    <select 
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="timeLeft">Time Ending</option>
                                        <option value="currentBid">Highest Bid</option>
                                        <option value="bids">Most Bids</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Watchlist Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                            <div className="p-3 rounded-lg mr-4 bg-blue-100">
                                <Bookmark size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Items</p>
                                <p className="font-semibold text-lg">{watchlist.length}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                            <div className="p-3 rounded-lg mr-4 bg-green-100">
                                <Clock size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ending Today</p>
                                <p className="font-semibold text-lg">2 items</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                            <div className="p-3 rounded-lg mr-4 bg-amber-100">
                                <Bell size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Alerts</p>
                                <p className="font-semibold text-lg">{watchlist.filter(item => item.notifications).length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Watchlist Items */}
                    <div className="space-y-6">
                        {filteredWatchlist.length > 0 ? (
                            filteredWatchlist.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Item Image */}
                                        <div className="flex-shrink-0">
                                            <div className="relative">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.title} 
                                                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                                                />
                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                                    <Bookmark size={12} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Item Details */}
                                        <div className="flex-1">
                                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                            {item.category}
                                                        </span>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                                                            item.auctionType === "Reserve Auction" 
                                                                ? "bg-purple-100 text-purple-800" 
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}>
                                                            {item.auctionType}
                                                        </span>
                                                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-800">
                                                            {item.condition}
                                                        </span>
                                                    </div>
                                                    
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                                    <p className="text-gray-600 mb-4">{item.description}</p>
                                                    
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                            <MapPin size={14} className="mr-1" />
                                                            {item.location}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Award size={14} className="mr-1" />
                                                            Seller: {item.sellerRating}/5
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Eye size={14} className="mr-1" />
                                                            {item.watchers} watchers
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Gavel size={14} className="mr-1" />
                                                            {item.bids} bids
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Bid Information */}
                                                <div className="lg:text-right">
                                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                                        ${item.currentBid.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-3">
                                                        Starting: ${item.startingBid.toLocaleString()}
                                                    </div>
                                                    <div className={`flex items-center justify-center lg:justify-end text-sm font-medium ${getTimeLeftColor(item.timeLeft)}`}>
                                                        <Clock size={14} className="mr-1" />
                                                        {item.timeLeft} left
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                                                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                    <Gavel size={16} />
                                                    Place Bid
                                                </button>
                                                <button 
                                                    onClick={() => removeFromWatchlist(item.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                    Remove
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Eye size={16} />
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Bookmark size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-700 mb-2">Your watchlist is empty</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Start adding items to your watchlist to track their progress and get notified when auctions are ending.
                                </p>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                                    Browse Available Auctions
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredWatchlist.length > 0 && (
                        <div className="flex justify-between items-center mt-8 mb-16">
                            <div className="text-sm text-gray-500">
                                Showing {filteredWatchlist.length} of {watchlist.length} items
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-700">
                                    1
                                </button>
                                <button className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    2
                                </button>
                                <button className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default Watchlist;