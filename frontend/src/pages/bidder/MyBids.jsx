import { useState, useEffect } from "react";
import { BidderContainer, BidderHeader, BidderSidebar, LoadingSpinner } from "../../components";
import {
    Search,
    Filter,
    Gavel,
    Award,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Eye,
    Calendar,
    CheckCircle,
    XCircle,
    Zap
} from "lucide-react";
import { about } from "../../assets";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce"; // Create this hook as shown earlier

function MyBids() {
    const [bids, setBids] = useState([]);
    const [allBids, setAllBids] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sortBy, setSortBy] = useState("recent");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState({
        totalBids: 0,
        totalActiveBids: 0,
        totalWinning: 0,
        totalWonAmount: 0,
        successRate: 0,
        avgBidAmount: 0
    });

    // Fetch all bids on component mount
    useEffect(() => {
        fetchMyBids();
    }, []);

    // Apply client-side filtering when filters change
    useEffect(() => {
        if (allBids.length === 0) return;

        let filtered = [...allBids];

        // Apply status filter
        if (filter !== "all") {
            filtered = filtered.filter(bid => bid.status === filter);
        }

        // Apply search filter
        if (debouncedSearchTerm) {
            filtered = filtered.filter(bid =>
                bid.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                bid.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
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

        setBids(filtered);
    }, [filter, debouncedSearchTerm, sortBy, allBids]);

    const fetchMyBids = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axiosInstance.get("/api/v1/bids/my-bids");

            if (data.success) {
                setAllBids(data.data.bids);
                setBids(data.data.bids);
                setStatistics(data.data.statistics);
            } else {
                setError("Failed to fetch your bids");
            }
        } catch (err) {
            setError("Error loading your bids");
            console.error("Fetch my bids error:", err);
        } finally {
            setLoading(false);
        }
    };

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
        if (timeLeft === 'Ended') return 'text-gray-600 bg-gray-50 border-gray-200';
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

    if (loading) {
        return (
            <section className="flex min-h-screen">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <div className="flex justify-center items-center min-h-96">
                            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> */}
                            <LoadingSpinner />
                        </div>
                    </BidderContainer>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchMyBids}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </BidderContainer>
                </div>
            </section>
        );
    }

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
                                    {bids.length} participated auctions
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview - Add Won Auctions card */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Active Bids</p>
                                    <p className="text-2xl font-bold mt-1">{statistics.totalActiveBids}</p>
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
                                    <p className="text-2xl font-bold mt-1">{statistics.totalWinning}</p>
                                    <p className="text-green-200 text-xs mt-1">Currently leading</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <Award size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm">Won Auctions</p>
                                    <p className="text-2xl font-bold mt-1">{statistics.totalWon}</p>
                                    <p className="text-amber-200 text-xs mt-1">Successful bids</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Total Bid Amount</p>
                                    <p className="text-2xl font-bold mt-1">{formatCurrency(statistics.totalWonAmount)}</p>
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
                            </div>
                        </div>

                        {/* Status Filters - Add Won filter */}
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
                                Winning ({statistics.totalWinning})
                            </button>
                            <button
                                onClick={() => setFilter("outbid")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "outbid" ? "bg-red-100 text-red-800 border border-red-200 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                <TrendingDown size={14} className="inline mr-1" />
                                Outbid
                            </button>
                            <button
                                onClick={() => setFilter("won")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "won" ? "bg-blue-100 text-blue-800 border border-blue-200 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                <CheckCircle size={14} className="inline mr-1" />
                                Won ({statistics.totalWon})
                            </button>
                        </div>
                    </div>

                    {/* Bids List */}
                    <div className="space-y-6">
                        {bids.length > 0 ? (
                            bids.map((bid) => (
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
                                                        {/* <p className="text-gray-600 text-sm mb-4">{bid.description}</p> */}

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
                                                                <p className="text-gray-500">
                                                                    {bid.status === 'won' ? 'Winning Bid' : bid.auctionStatus === 'active' ? 'Next Min. Bid' : 'Final Bid'}
                                                                </p>
                                                                <p className="font-semibold text-lg text-green-600">
                                                                    {bid.status === 'won' ? formatCurrency(bid.currentBid) : formatCurrency(bid.nextMinBid)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Bid Placed</p>
                                                                <p className="font-semibold">{formatDate(bid.bidTime)}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-3">
                                                        {bid.status === "outbid" && bid.auctionStatus === "active" && (
                                                            <Link
                                                                to={`/auction/${bid.id}`}
                                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
                                                            >
                                                                <Zap size={16} />
                                                                Re-bid Now
                                                            </Link>
                                                        )}
                                                        {bid.status === "winning" && (
                                                            <Link
                                                                to={`/auction/${bid.id}`}
                                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                                                            >
                                                                <Award size={16} />
                                                                Increase Bid
                                                            </Link>
                                                        )}
                                                        <Link
                                                            to={`/auction/${bid.id}`}
                                                            target="_blank"
                                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                                        >
                                                            <Eye size={16} />
                                                            View Auction
                                                        </Link>
                                                        {bid.status === "won" && (
                                                            <Link
                                                                to="/bidder/auctions/won"
                                                                target="_blank"
                                                                className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-center"
                                                            >
                                                                <CheckCircle size={16} />
                                                                View Win
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar for Winning/Outbid Status */}
                                    <div className={`h-1 ${bid.status === "winning" ? "bg-green-500" : bid.status === "outbid" ? "bg-red-500" : "bg-gray-300"} w-full`}></div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Gavel size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No bids found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || filter !== "all"
                                        ? "No bids match your current filters. Try adjusting your search criteria."
                                        : "You haven't placed any bids yet. Start bidding on auctions to see them here!"}
                                </p>
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
                                    <Link
                                        to="/auctions"
                                        target="_blank"
                                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Browse Auctions
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Footer */}
                    {bids.length > 0 && (
                        <div className="mt-8 mb-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total Bids Placed</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.totalBids}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Participation</p>
                                    <p className="text-2xl font-bold text-green-600">{statistics.totalActiveBids}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {statistics.successRate}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Avg. Bid Amount</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(statistics.avgBidAmount)}
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