import { useEffect, useState } from "react";
import { LoadingSpinner, BidderContainer, BidderHeader, BidderSidebar, AuctionCard } from "../../components";
import toast from "react-hot-toast";
import axios from "axios";
import { Clock, Gavel, TrendingUp, DollarSign, Eye, Award, BarChart3, Search, Filter, SortAsc, MapPin, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { about } from "../../assets";

const auctionStats = [
    {
        title: "Active Auctions",
        value: "48",
        change: "+12",
        icon: <Gavel size={24} />,
        trend: "up"
    },
    {
        title: "New Today",
        value: "7",
        change: "+2",
        icon: <Award size={24} />,
        trend: "up"
    },
    {
        title: "Ending Soon",
        value: "15",
        change: "-3",
        icon: <Clock size={24} />,
        trend: "down",
        highlight: true
    },
    {
        title: "Total Bidders",
        value: "1,248",
        change: "+156",
        icon: <Users size={24} />,
        trend: "up"
    }
];

const auctionData = [
    {
        id: "AV267400",
        title: "Vintage Boeing 747 Control Panel",
        description: "Fully restored cockpit control panel from a 1978 Boeing 747-200",
        bids: 24,
        currentBid: 18500,
        endDate: "2025-12-19T15:30:00",
        category: "Aviation Memorabilia",
        image: about,
        location: "Seattle, WA",
        sellerRating: 4.8,
        condition: "Excellent",
        watchers: 42,
        startingBid: 5000
    },
    {
        id: "AV351289",
        title: "Pratt & Whitney JT9D Engine",
        description: "Used Pratt & Whitney JT9D-7R4 turbofan engine, 50,000 hours total time",
        bids: 12,
        currentBid: 42750,
        endDate: "2025-12-20T14:00:00",
        category: "Engines & Parts",
        image: about,
        location: "Miami, FL",
        sellerRating: 4.5,
        condition: "Good",
        watchers: 18,
        startingBid: 25000
    },
    {
        id: "AV498712",
        title: "Rare WWII P-51 Mustang Propeller",
        description: "Authentic Hamilton Standard propeller from a North American P-51 Mustang",
        bids: 31,
        currentBid: 22500,
        endDate: "2025-12-10T16:45:00",
        category: "Aviation Memorabilia",
        image: about,
        location: "New York, NY",
        sellerRating: 4.9,
        condition: "Very Good",
        watchers: 56,
        startingBid: 8000
    },
    {
        id: "AV672341",
        title: "Vintage Pilot Uniform Collection",
        description: "Complete set of 1960s pilot uniform with hat, jacket, and accessories",
        bids: 15,
        currentBid: 3200,
        endDate: "2025-12-15T12:00:00",
        category: "Aviation Memorabilia",
        image: about,
        location: "Los Angeles, CA",
        sellerRating: 4.7,
        condition: "Excellent",
        watchers: 23,
        startingBid: 1500
    },
    {
        id: "AV783452",
        title: "Aircraft Navigation System",
        description: "Vintage aircraft navigation system from 1970s commercial airliner",
        bids: 8,
        currentBid: 8900,
        endDate: "2025-12-17T20:45:00",
        category: "Aircraft Parts",
        image: about,
        location: "Chicago, IL",
        sellerRating: 4.2,
        condition: "Good",
        watchers: 14,
        startingBid: 5000
    },
    {
        id: "AV894563",
        title: "Rare Aviation Books Collection",
        description: "Collection of 15 rare aviation books from 1940s-1960s, first editions",
        bids: 9,
        currentBid: 1850,
        endDate: "2025-12-22T09:30:00",
        category: "Aviation Memorabilia",
        image: about,
        location: "Dallas, TX",
        sellerRating: 4.6,
        condition: "Very Good",
        watchers: 32,
        startingBid: 800
    },
    {
        id: "AV905674",
        title: "Vintage Aircraft Radio Equipment",
        description: "Set of 1950s aircraft radio communication equipment",
        bids: 6,
        currentBid: 4200,
        endDate: "2025-12-22T10:15:00",
        category: "Aircraft Parts",
        image: about,
        location: "San Francisco, CA",
        sellerRating: 4.3,
        condition: "Fair",
        watchers: 11,
        startingBid: 2500
    },
    {
        id: "AV016785",
        title: "WWII Pilot Flight Helmet",
        description: "Authentic WWII pilot flight helmet with oxygen mask",
        bids: 21,
        currentBid: 5500,
        endDate: "2025-12-19T16:20:00",
        category: "Aviation Memorabilia",
        image: about,
        location: "Boston, MA",
        sellerRating: 4.7,
        condition: "Good",
        watchers: 47,
        startingBid: 3000
    }
];

function ActiveAuctions() {
    const [auctions, setAuctions] = useState(auctionData);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("ending_soon");
    const [viewMode, setViewMode] = useState("grid");

    useEffect(() => {
        const fetchAuctions = async () => {
            setLoading(true);
            try {
                // Simulate API call
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            } catch (error) {
                toast.error("Failed to load auctions");
                setLoading(false);
            }
        };
        
        fetchAuctions();
    }, []);

    const categories = ["all", ...new Set(auctions.map(auction => auction.category))];

    const filteredAuctions = auctions
        .filter(auction => {
            const matchesSearch = searchTerm === "" || 
                auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                auction.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || auction.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch(sortBy) {
                case "ending_soon":
                    return new Date(a.endDate) - new Date(b.endDate);
                case "most_bids":
                    return b.bids - a.bids;
                case "highest_bid":
                    return b.currentBid - a.currentBid;
                case "newest":
                    return new Date(b.endDate) - new Date(a.endDate); // Assuming endDate is close to start
                case "lowest_bid":
                    return a.currentBid - b.currentBid;
                default:
                    return 0;
            }
        })
        .filter(auction => {
            // Filter by status based on time remaining
            const now = new Date();
            const end = new Date(auction.endDate);
            const diffHours = (end - now) / (1000 * 60 * 60);
            
            switch(filter) {
                case "ending_soon":
                    return diffHours < 24;
                case "active":
                    return diffHours > 24 && diffHours < 168; // Within 7 days
                case "upcoming":
                    return diffHours > 168; // More than 7 days
                default:
                    return true;
            }
        });

    const getTimeLeftColor = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffHours = (end - now) / (1000 * 60 * 60);
        
        if (diffHours < 24) return 'text-red-600 bg-red-50 border-red-200';
        if (diffHours < 48) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-green-600 bg-green-50 border-green-200';
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
                                <h2 className="text-3xl md:text-4xl font-bold my-5">Active Auctions</h2>
                                <p className="text-secondary">Discover and bid on exclusive aviation items and memorabilia.</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {filteredAuctions.length} items found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {auctionStats.map(stat => (
                            <div key={stat.title} className={`bg-white rounded-xl p-5 shadow-sm border ${stat.highlight ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.title}</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {stat.value}
                                        </h3>
                                        <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change} from yesterday
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.highlight ? 'bg-amber-100 text-amber-600' : stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search aviation auctions by title or description..."
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
                                        <option value="ending_soon">Ending Soon</option>
                                        <option value="most_bids">Most Bids</option>
                                        <option value="highest_bid">Highest Bid</option>
                                        <option value="lowest_bid">Lowest Bid</option>
                                        <option value="newest">Newest</option>
                                    </select>
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                                    >
                                        Grid
                                    </button>
                                    <button 
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                                    >
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Filters with Status */}
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => setFilter("all")} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                All Auctions
                            </button>
                            <button 
                                onClick={() => setFilter("ending_soon")} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "ending_soon" ? "bg-red-100 text-red-800 border border-red-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Ending Soon
                            </button>
                            <button 
                                onClick={() => setFilter("active")} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "active" ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Active
                            </button>
                            <button 
                                onClick={() => setFilter("upcoming")} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "upcoming" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Upcoming
                            </button>
                        </div>
                    </div>

                    {/* Auction Cards Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAuctions.length > 0 ? (
                        <div className={`gap-x-5 gap-y-8 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch" : "space-y-6"}`}>
                            {filteredAuctions.map((auction) => (
                                <div key={auction.id} className={viewMode === "list" ? "flex" : ""}>
                                    <AuctionCard 
                                        id={auction.id}
                                        title={auction.title}
                                        bids={auction.bids}
                                        currentBid={auction.currentBid}
                                        endDate={auction.endDate}
                                    />
                                    {/* Additional info for list view */}
                                    {viewMode === "list" && (
                                        <div className="ml-6 flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                    {auction.category}
                                                </span>
                                                <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-800">
                                                    {auction.condition}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-4">{auction.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {auction.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Star size={14} className="text-amber-500" fill="currentColor" />
                                                    Seller: {auction.sellerRating}/5
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye size={14} />
                                                    {auction.watchers} watchers
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <BarChart3 size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No auctions found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
                            <button 
                                onClick={() => {
                                    setFilter("all");
                                    setSearchTerm("");
                                    setCategoryFilter("all");
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredAuctions.length > 0 && (
                        <div className="flex justify-between items-center flex-wrap mt-8 mb-16">
                            <div className="text-sm text-gray-500">
                                Showing {filteredAuctions.length} of {auctions.length} auctions
                            </div>
                            <div className="flex flex-wrap gap-2">
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
                                    3
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

export default ActiveAuctions;