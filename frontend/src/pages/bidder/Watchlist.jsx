import { useState, useEffect } from "react";
import { BidderContainer, BidderHeader, BidderSidebar, LoadingSpinner } from "../../components";
import { Eye, Gavel, Clock, DollarSign, Trash2, Bell, BellOff, Search, Filter, SortAsc, Bookmark, MapPin, Award, Loader } from "lucide-react";
import { about } from "../../assets";
import axiosInstance from "../../utils/axiosInstance";
import { useWatchlist } from "../../hooks/useWatchlist";
import { Link } from "react-router-dom";

function Watchlist() {
    const [watchlist, setWatchlist] = useState([]);
    const [pagination, setPagination] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("timeLeft");
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch watchlist from API
    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/v1/watchlist/my-watchlist');
            if (data.success) {
                setWatchlist(data.data.watchlist || []);
                setPagination(data.data.pagination || []);
            } else {
                setError('Failed to fetch watchlist');
            }
        } catch (err) {
            setError('Error loading watchlist');
            console.error('Fetch watchlist error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const handleLoadMore = async () => {
        if (!pagination || pagination.currentPage >= pagination.totalPages) return;

        try {
            setLoadingMore(true);
            const nextPage = pagination.currentPage + 1;
            const { data } = await axiosInstance.get(`/api/v1/watchlist/my-watchlist?page=${nextPage}`);

            if (data.success) {
                setWatchlist(prev => [...prev, ...(data.data.watchlist || [])]);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Load more error:', err);
            // toast.error('Failed to load more items');
        } finally {
            setLoadingMore(false);
        }
    };

    const removeFromWatchlist = async (auctionId) => {
        try {
            const { data } = await axiosInstance.delete(`/api/v1/watchlist/remove/${auctionId}`);
            if (data.success) {
                setWatchlist(watchlist.filter(item => item.auction._id !== auctionId));
                // toast.success("Removed from watchlist");
            } else {
                // toast.error("Failed to remove from watchlist");
            }
        } catch (err) {
            console.error('Remove from watchlist error:', err);
            // toast.error("Error removing from watchlist");
        }
    };

    // Transform API data to match frontend structure
    const transformWatchlistData = (watchlistItems) => {
        return watchlistItems.map(item => {
            const auction = item.auction;
            return {
                id: auction._id,
                title: auction.title,
                description: auction.description,
                category: auction.category,
                currentBid: auction.currentPrice || auction.startingPrice,
                startingBid: auction.startPrice,
                bids: auction.bidCount || 0,
                watchers: auction.watchlistCount || 0,
                timeLeft: calculateTimeLeft(auction.endDate),
                endTime: auction.endDate,
                image: auction.photos?.[0] || about,
                auctionType: auction.reservePrice ? "Reserve Auction" : "Standard Auction",
                notifications: true, // You can add this field to your model if needed
                condition: auction.condition || "Good",
                location: auction.location || "Unknown",
                sellerRating: auction.seller?.rating || 4.5,
                originalData: item
            };
        });
    };

    const calculateTimeLeft = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end - now;

        if (diff <= 0) return "Ended";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days}d ${hours}h`;
        } else {
            return `${hours}h`;
        }
    };

    const filteredWatchlist = transformWatchlistData(watchlist)
        .filter(item => {
            const matchesSearch = searchTerm === "" ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
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

    const categories = ["all", ...new Set(watchlist.map(item => item.auction.category))];

    const getTimeLeftColor = (timeLeft) => {
        if (timeLeft.includes('h') && !timeLeft.includes('d')) {
            return 'text-red-600';
        }
        if (timeLeft.includes('d') && parseInt(timeLeft) <= 1) {
            return 'text-amber-600';
        }
        return 'text-green-600';
    };

    if (loading) {
        return (
            <section className="flex min-h-screen">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <div className="text-center">
                                {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div> */}
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-600">Loading your watchlist...</p>
                            </div>
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
                        <div className="flex justify-center items-center min-h-96">
                            <div className="text-center">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchWatchlist}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
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
                                <p className="font-semibold text-lg">
                                    {filteredWatchlist.filter(item =>
                                        item.timeLeft.includes('h') && !item.timeLeft.includes('d')
                                    ).length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                            <div className="p-3 rounded-lg mr-4 bg-amber-100">
                                <Bell size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Alerts</p>
                                <p className="font-semibold text-lg">
                                    {filteredWatchlist.filter(item => item.notifications).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Watchlist Items */}
                    <div className="space-y-6">
                        {filteredWatchlist.length > 0 ? (
                            filteredWatchlist.map(item => (
                                <WatchlistItem
                                    key={item.id}
                                    item={item}
                                    onRemove={removeFromWatchlist}
                                />
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Bookmark size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-700 mb-2">Your watchlist is empty</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Start adding items to your watchlist to track their progress and get notified when auctions are ending.
                                </p>
                                <Link to={'/bidder/auctions/active'} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                                    Browse Available Auctions
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Load More Button */}
                    {/* {pagination?.currentPage < pagination?.totalPages && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Load More Auctions
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                            {pagination.totalItems - watchlist.length} more
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    )} */}
                </BidderContainer>
            </div>
        </section>
    );
}

// Separate component for individual watchlist items to use the useWatchlist hook
function WatchlistItem({ item, onRemove }) {
    const { isWatchlisted, toggleWatchlist, loading } = useWatchlist(item.id);

    const handleRemove = () => {
        onRemove(item.id);
    };

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Item Image */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <img
                            src={item?.image?.url}
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
                                <span className={`text-xs font-medium px-2 py-1 rounded-md ${item.auctionType === "Reserve Auction"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                    }`}>
                                    {item.auctionType}
                                </span>
                                {/* <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-800">
                                    {item.condition}
                                </span> */}
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                            {/* <p className="text-gray-600 mb-4">{item.description}</p> */}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <MapPin size={14} className="mr-1" />
                                    {item.location}
                                </span>
                                {/* <span className="flex items-center">
                                    <Award size={14} className="mr-1" />
                                    Seller: {item.sellerRating}/5
                                </span> */}
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
                        <Link to={`/auction/${item.originalData.auction._id}`} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Gavel size={16} />
                            Place Bid
                        </Link>
                        <button
                            onClick={handleRemove}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {loading ? 'Removing...' : 'Remove'}
                        </button>
                        <Link to={`/auction/${item.originalData.auction._id}`} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <Eye size={16} />
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Watchlist;