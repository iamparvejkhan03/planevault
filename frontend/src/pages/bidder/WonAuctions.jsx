import { useState, useEffect } from "react";
import { BidderContainer, BidderHeader, BidderSidebar, LoadingSpinner } from "../../components";
import {
    Award,
    Trophy,
    Star,
    DollarSign,
    MessageCircle,
    Phone,
    Mail,
    Search,
    Zap,
    TrendingUp,
    SortAsc,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

function WonAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [allAuctions, setAllAuctions] = useState([]); // Store all auctions
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [statistics, setStatistics] = useState({
        totalWon: 0,
        totalSpent: 0,
        averageSavings: 0,
        recentWins: 0,
    });

    useEffect(() => {
        fetchWonAuctions();
    }, []);

    const fetchWonAuctions = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axiosInstance.get("/api/v1/auctions/won-auctions");

            if (data.success) {
                setAllAuctions(data.data.auctions);
                setAuctions(data.data.auctions);
                setStatistics(data.data.statistics);
            } else {
                setError("Failed to fetch won auctions");
            }
        } catch (err) {
            setError("Error loading won auctions");
            console.error("Fetch won auctions error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (allAuctions.length === 0) return;

        let filtered = [...allAuctions];

        if (filter !== "all") {
            filtered = filtered.filter(auction => auction.status === filter);
        }

        if (searchTerm) {
            filtered = filtered.filter(auction =>
                auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                auction.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.endDate) - new Date(a.endDate); // Use endDate as win time
                case "oldest":
                    return new Date(a.endDate) - new Date(b.endDate); // Use endDate as win time
                case "highest_bid":
                    return (b.finalBid || b.currentPrice || 0) - (a.finalBid || a.currentPrice || 0);
                case "lowest_bid":
                    return (a.finalBid || a.currentPrice || 0) - (b.finalBid || b.currentPrice || 0);
                default:
                    return new Date(b.endDate) - new Date(a.endDate); // Default to newest
            }
        });

        setAuctions(filtered);
    }, [filter, searchTerm, allAuctions, sortBy]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const openContactModal = (auction) => {
        setSelectedAuction(auction);
        setShowContactModal(true);
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
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
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchWonAuctions}
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
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <BidderSidebar />

            <div className="w-full relative">
                <BidderHeader />

                <BidderContainer>
                    {/* Celebratory Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy className="text-amber-500" size={32} />
                                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        Your Won Auctions
                                    </h2>
                                </div>
                                <p className="text-secondary text-lg">
                                    Celebrate your winning bids and manage your acquisitions
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                    {statistics.totalWon} Triumphant Wins!
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Gradient Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm">Total Wins</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {statistics.totalWon}
                                    </p>
                                    <p className="text-amber-200 text-xs mt-1">Auctions Won</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Trophy size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Total Investment</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {formatCurrency(statistics.totalSpent)}
                                    </p>
                                    <p className="text-green-200 text-xs mt-1">In Winning Bids</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <DollarSign size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Recent Success</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {statistics.recentWins}
                                    </p>
                                    <p className="text-blue-200 text-xs mt-1">Wins This Week</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Zap size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Avg. Value Gain</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {((1 - statistics.averageSavings) * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-purple-200 text-xs mt-1">
                                        Over Starting Bid
                                    </p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search your won auctions..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <SortAsc size={18} className="text-gray-500" />
                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    {/* <option value="newest">Newest First</option> */}
                                    {/* <option value="oldest">Oldest First</option> */}
                                    <option value="highest_bid">Highest Bid</option>
                                    <option value="lowest_bid">Lowest Bid</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Won Auctions Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
                        {auctions.map((auction) => (
                            <div
                                key={auction._id}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-all duration-300"
                            >

                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                    {auction.category}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {auction.title}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(auction.finalBid)}
                                            </div>
                                            <div className="text-sm text-gray-500">Winning Bid</div>
                                        </div>
                                    </div>

                                    {/* Congratulations Message */}
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Star
                                                className="text-amber-500"
                                                size={20}
                                                fill="currentColor"
                                            />
                                            <p className="text-amber-800 font-medium">
                                                {auction.congratulatoryMessage}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Auction Details */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Won On</p>
                                            <p className="font-semibold">
                                                {formatDate(auction.winTime)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Starting Bid</p>
                                            <p className="font-semibold text-blue-600">
                                                {formatCurrency(auction.startingBid)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Your Max Bid</p>
                                            <p className="font-semibold">
                                                {formatCurrency(auction.yourMaxBid)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Bids</p>
                                            <p className="font-semibold">{auction.bids} bids</p>
                                        </div>
                                    </div>

                                    {/* Seller Info */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {auction.seller.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{auction.seller.name}</p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        Member Since: {new Date(auction.seller.memberSince).getFullYear()}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openContactModal(auction)}
                                                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                            >
                                                <MessageCircle size={14} />
                                                Contact
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Link
                                            to={`/auction/${auction._id}`}
                                            target="_blank"
                                            className="flex-1 text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                                        >
                                            View Auction
                                        </Link>

                                        {/* <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                            <Share2 size={18} />
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {auctions.length === 0 && !loading && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Award size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                                {searchTerm || filter !== "all"
                                    ? "No matching auctions found"
                                    : "No won auctions yet"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || filter !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Start bidding on aviation auctions to see your wins here!"}
                            </p>
                            <Link to={`/auctions`} target="_blank" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                                Browse Active Auctions
                            </Link>
                        </div>
                    )}

                    {/* Contact Seller Modal */}
                    {showContactModal && selectedAuction && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Contact Seller</h3>
                                    <p className="text-gray-600 text-sm">
                                        Reach out to {selectedAuction.seller.name}
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <Link to={`mailto:${selectedAuction.seller.email}`} className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Mail size={20} className="text-blue-600" />
                                        <span>Send Email ({selectedAuction.seller.email})</span>
                                    </Link>
                                    <Link to={`tel:${selectedAuction.seller.phone}`} className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Phone size={20} className="text-purple-600" />
                                        <span>Call ({selectedAuction.seller.phone})</span>
                                    </Link>
                                </div>
                                <div className="p-4 border-t border-gray-200 flex gap-3">
                                    <button
                                        onClick={() => setShowContactModal(false)}
                                        className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default WonAuctions;
