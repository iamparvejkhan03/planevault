import { useState } from "react";
import { BidderContainer, BidderHeader, BidderSidebar, AuctionCard } from "../../components";
import { Search, Filter, SortAsc, Gavel, Award, Clock, DollarSign, TrendingUp, TrendingDown, Eye, MapPin, Star, Calendar, AlertCircle, CheckCircle, XCircle, Zap } from "lucide-react";
import { about } from "../../assets";

// Mock data for bidder's bidding activity
const myBidsData = [
    {
        id: "AV267400",
        auctionId: "AU267400",
        title: "Vintage Boeing 747 Control Panel",
        description: "Fully restored cockpit control panel from a 1978 Boeing 747-200",
        category: "Aviation Memorabilia",
        myBidAmount: 17500,
        currentBid: 18500,
        startingBid: 5000,
        status: "outbid", // outbid, winning, lost, won
        bidTime: "2023-12-10T14:30:00",
        endTime: "2023-12-19T15:30:00",
        bids: 24,
        watchers: 42,
        image: about,
        location: "Seattle, WA",
        sellerRating: 4.8,
        timeLeft: "3d 2h",
        bidIncrement: 500,
        nextMinBid: 19000
    },
    {
        id: "AV351289",
        auctionId: "AU351289",
        title: "Pratt & Whitney JT9D Engine",
        description: "Used Pratt & Whitney JT9D-7R4 turbofan engine, 50,000 hours total time",
        category: "Engines & Parts",
        myBidAmount: 42750,
        currentBid: 42750,
        startingBid: 25000,
        status: "winning",
        bidTime: "2023-12-15T13:55:00",
        endTime: "2023-12-20T14:00:00",
        bids: 12,
        watchers: 18,
        image: about,
        location: "Miami, FL",
        sellerRating: 4.5,
        timeLeft: "4d 6h",
        bidIncrement: 1000,
        nextMinBid: 43750
    },
    {
        id: "AV498712",
        auctionId: "AU498712",
        title: "Rare WWII P-51 Mustang Propeller",
        description: "Authentic Hamilton Standard propeller from a North American P-51 Mustang",
        category: "Aviation Memorabilia",
        myBidAmount: 22000,
        currentBid: 22500,
        startingBid: 8000,
        status: "outbid",
        bidTime: "2023-12-05T16:38:00",
        endTime: "2023-12-10T16:45:00",
        bids: 31,
        watchers: 56,
        image: about,
        location: "New York, NY",
        sellerRating: 4.9,
        timeLeft: "12h 45m",
        bidIncrement: 250,
        nextMinBid: 22750
    },
    {
        id: "AV672341",
        auctionId: "AU672341",
        title: "Vintage Pilot Uniform Collection",
        description: "Complete set of 1960s pilot uniform with hat, jacket, and accessories",
        category: "Aviation Memorabilia",
        myBidAmount: 3000,
        currentBid: 3200,
        startingBid: 1500,
        status: "outbid",
        bidTime: "2023-12-12T11:20:00",
        endTime: "2023-12-15T12:00:00",
        bids: 15,
        watchers: 23,
        image: about,
        location: "Los Angeles, CA",
        sellerRating: 4.7,
        timeLeft: "2d 4h",
        bidIncrement: 100,
        nextMinBid: 3300
    },
    {
        id: "AV783452",
        auctionId: "AU783452",
        title: "Aircraft Navigation System",
        description: "Vintage aircraft navigation system from 1970s commercial airliner",
        category: "Aircraft Parts",
        myBidAmount: 8500,
        currentBid: 8900,
        startingBid: 5000,
        status: "outbid",
        bidTime: "2023-12-14T15:45:00",
        endTime: "2023-12-17T20:45:00",
        bids: 8,
        watchers: 14,
        image: about,
        location: "Chicago, IL",
        sellerRating: 4.2,
        timeLeft: "5d 2h",
        bidIncrement: 200,
        nextMinBid: 9100
    },
    {
        id: "AV894563",
        auctionId: "AU894563",
        title: "Rare Aviation Books Collection",
        description: "Collection of 15 rare aviation books from 1940s-1960s, first editions",
        category: "Aviation Memorabilia",
        myBidAmount: 1800,
        currentBid: 1850,
        startingBid: 800,
        status: "outbid",
        bidTime: "2023-12-13T10:15:00",
        endTime: "2023-12-22T09:30:00",
        bids: 9,
        watchers: 32,
        image: about,
        location: "Dallas, TX",
        sellerRating: 4.6,
        timeLeft: "8d 3h",
        bidIncrement: 50,
        nextMinBid: 1900
    }
];

function MyBids() {
    const [bids, setBids] = useState(myBidsData);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [viewMode, setViewMode] = useState("detailed"); // detailed or compact

    const filteredBids = bids
        .filter(bid => {
            const matchesStatus = filter === "all" || bid.status === filter;
            const matchesSearch = searchTerm === "" || 
                bid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bid.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            switch(sortBy) {
                case "recent":
                    return new Date(b.bidTime) - new Date(a.bidTime);
                case "ending_soon":
                    return new Date(a.endTime) - new Date(b.endTime);
                case "bid_amount":
                    return b.myBidAmount - a.myBidAmount;
                case "auction_value":
                    return b.currentBid - a.currentBid;
                default:
                    return 0;
            }
        });

    const getStatusConfig = (status) => {
        const config = {
            winning: { 
                icon: <Award className="text-green-600" size={16} />, 
                text: "Winning Bid", 
                bgColor: "bg-green-50", 
                textColor: "text-green-700",
                borderColor: "border-green-200"
            },
            outbid: { 
                icon: <TrendingDown className="text-red-600" size={16} />, 
                text: "Outbid", 
                bgColor: "bg-red-50", 
                textColor: "text-red-700",
                borderColor: "border-red-200"
            },
            won: { 
                icon: <CheckCircle className="text-blue-600" size={16} />, 
                text: "Auction Won", 
                bgColor: "bg-blue-50", 
                textColor: "text-blue-700",
                borderColor: "border-blue-200"
            },
            lost: { 
                icon: <XCircle className="text-gray-600" size={16} />, 
                text: "Auction Lost", 
                bgColor: "bg-gray-50", 
                textColor: "text-gray-700",
                borderColor: "border-gray-200"
            }
        };
        return config[status] || config.outbid;
    };

    const getUrgencyColor = (timeLeft) => {
        if (timeLeft.includes('h') && !timeLeft.includes('d')) return 'text-red-600 bg-red-50 border-red-200';
        if (timeLeft.includes('d') && parseInt(timeLeft) <= 1) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalActiveBids = bids.filter(bid => bid.status === 'winning' || bid.status === 'outbid').length;
    const totalWinning = bids.filter(bid => bid.status === 'winning').length;
    const totalAmountBid = bids.reduce((sum, bid) => sum + bid.myBidAmount, 0);

    return (
        <section className="flex min-h-screen">
            <BidderSidebar />
            
            <div className="w-full relative">
                <BidderHeader />
                
                <BidderContainer>
                    {/* Header Section */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">My Bids</h2>
                                <p className="text-secondary">Track your bidding activity and manage your auction participation.</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {filteredBids.length} bids found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Active Bids</p>
                                    <p className="text-2xl font-bold mt-1">{totalActiveBids}</p>
                                    <p className="text-blue-200 text-xs mt-1">Currently participating</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <Gavel size={24} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Winning Bids</p>
                                    <p className="text-2xl font-bold mt-1">{totalWinning}</p>
                                    <p className="text-green-200 text-xs mt-1">Currently leading</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <Award size={24} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Total Bid Amount</p>
                                    <p className="text-2xl font-bold mt-1">{formatCurrency(totalAmountBid)}</p>
                                    <p className="text-purple-200 text-xs mt-1">Across all auctions</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <DollarSign size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search your bids..."
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
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="ending_soon">Ending Soon</option>
                                        <option value="bid_amount">Bid Amount</option>
                                        <option value="auction_value">Auction Value</option>
                                    </select>
                                </div>

                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={() => setViewMode("detailed")}
                                        className={`p-2 ${viewMode === "detailed" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                                    >
                                        Detailed
                                    </button>
                                    <button 
                                        onClick={() => setViewMode("compact")}
                                        className={`p-2 ${viewMode === "compact" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                                    >
                                        Compact
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => setFilter("all")} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                All Bids
                            </button>
                            <button 
                                onClick={() => setFilter("winning")} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "winning" ? "bg-green-100 text-green-800 border border-green-200 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                <Award size={14} className="inline mr-1" />
                                Winning ({totalWinning})
                            </button>
                            <button 
                                onClick={() => setFilter("outbid")} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "outbid" ? "bg-red-100 text-red-800 border border-red-200 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                <TrendingDown size={14} className="inline mr-1" />
                                Outbid
                            </button>
                        </div>
                    </div>

                    {/* Bids List */}
                    <div className="space-y-6">
                        {filteredBids.length > 0 ? (
                            filteredBids.map((bid) => (
                                <div key={bid.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg ${getStatusConfig(bid.status).borderColor}`}>
                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                            {/* Auction Image and Basic Info */}
                                            <div className="flex-shrink-0">
                                                <div className="relative">
                                                    <img 
                                                        src={bid.image} 
                                                        alt={bid.title} 
                                                        className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(bid.timeLeft)}`}>
                                                        <Clock size={10} className="inline mr-1" />
                                                        {bid.timeLeft}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Bid Details */}
                                            <div className="flex-1">
                                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                                {bid.category}
                                                            </span>
                                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(bid.status).bgColor} ${getStatusConfig(bid.status).textColor}`}>
                                                                {getStatusConfig(bid.status).icon}
                                                                {getStatusConfig(bid.status).text}
                                                            </div>
                                                        </div>
                                                        
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{bid.title}</h3>
                                                        <p className="text-gray-600 text-sm mb-4">{bid.description}</p>
                                                        
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Your Bid</p>
                                                                <p className="font-semibold text-lg text-blue-600">{formatCurrency(bid.myBidAmount)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Current Bid</p>
                                                                <p className="font-semibold text-lg">{formatCurrency(bid.currentBid)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Next Min. Bid</p>
                                                                <p className="font-semibold text-lg text-green-600">{formatCurrency(bid.nextMinBid)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Bid Placed</p>
                                                                <p className="font-semibold">{formatDate(bid.bidTime)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-3">
                                                        {bid.status === "outbid" && (
                                                            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                                                <Zap size={16} />
                                                                Re-bid Now
                                                            </button>
                                                        )}
                                                        {bid.status === "winning" && (
                                                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                                <Award size={16} />
                                                                Increase Bid
                                                            </button>
                                                        )}
                                                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                            <Eye size={16} />
                                                            View Auction
                                                        </button>
                                                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                            <Calendar size={16} />
                                                            Add Reminder
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar for Winning/Outbid Status */}
                                    <div className={`h-1 ${bid.status === "winning" ? "bg-green-500" : "bg-red-500"} w-full`}></div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Gavel size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No bids found</h3>
                                <p className="text-gray-500 mb-6">You haven't placed any bids yet or no bids match your current filters.</p>
                                <div className="flex gap-4 justify-center">
                                    <button 
                                        onClick={() => {
                                            setFilter("all");
                                            setSearchTerm("");
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        Browse Auctions
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Footer */}
                    {filteredBids.length > 0 && (
                        <div className="mt-8 mb-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total Bids Placed</p>
                                    <p className="text-2xl font-bold text-gray-900">{bids.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Participation</p>
                                    <p className="text-2xl font-bold text-green-600">{totalActiveBids}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {Math.round((totalWinning / bids.length) * 100)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Avg. Bid Amount</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(totalAmountBid / bids.length)}
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

export default MyBids;