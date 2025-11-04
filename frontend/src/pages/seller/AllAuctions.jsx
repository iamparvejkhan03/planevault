import { useEffect, useState } from "react";
import { LoadingSpinner, LowerReserveModal, SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import { Gavel, Eye, Award, BarChart3, TrendingUp, DollarSign, Clock, Search, Filter, SortAsc, Users, MoreVertical, Loader } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import { useRef } from "react";

function AllAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalAuctions: 0
    });

    // Filter states
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const [isLowerReserveModalOpen, setIsLowerReserveModalOpen] = useState(false);
    const [lowerReserveCurrentAuction, setLowerReserveCurrentAuction] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleReserveLowered = (updatedAuction) => {
        // Update your local state with the new auction data
        return;
    };

    const dropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleShowReserveModal = (auction) => {
        setLowerReserveCurrentAuction(auction);
        setIsLowerReserveModalOpen(true);
    }

    // Fetch user stats (keep as is since it's working)
    // const fetchUserStats = async () => {
    //     try {
    //         const { data } = await axiosInstance.get('/api/v1/users/stats');
    //         if (data.success) {
    //             setStats(data.data.statistics);
    //         }
    //     } catch (err) {
    //         console.error('Fetch stats error:', err);
    //     }
    // };

    // Fetch auctions
    const fetchAuctions = async (page = 1, loadMore = false) => {
        try {
            if (loadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                status: ''
            });

            const { data } = await axiosInstance.get(`/api/v1/auctions/user/my-auctions?${params}`);

            if (data.success) {
                if (loadMore) {
                    setAuctions(prev => [...prev, ...data.data.auctions]);
                } else {
                    setAuctions(data.data.auctions);
                }
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Fetch auctions error:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreAuctions = () => {
        if (pagination.currentPage < pagination.totalPages && !loadingMore) {
            fetchAuctions(pagination.currentPage + 1, true);
        }
    };

    useEffect(() => {
        // fetchUserStats();
        fetchAuctions();
    }, []);


    // Get unique categories from auctions
    const categories = ["all", ...new Set(auctions.map(auction => auction.category))];

    // Filter and sort auctions
    const filteredAuctions = auctions
        .filter(auction => {
            // Search filter
            const matchesSearch = searchTerm === "" ||
                auction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                auction.description?.toLowerCase().includes(searchTerm.toLowerCase());

            // Category filter
            const matchesCategory = categoryFilter === "all" || auction.category === categoryFilter;

            // Status filter - FIXED VERSION
            const now = new Date();
            const end = new Date(auction.endDate);
            const start = new Date(auction.startDate);
            const diffHours = (end - now) / (1000 * 60 * 60);
            const hasStarted = now >= start;

            let matchesStatus = true;
            switch (filter) {
                case "ending_soon":
                    matchesStatus = diffHours < 24 && diffHours > 0 && hasStarted;
                    break;
                case "active":
                    matchesStatus = hasStarted && diffHours > 0; // Auction has started and not ended
                    break;
                case "upcoming":
                    matchesStatus = !hasStarted; // Auction hasn't started yet
                    break;
                case "pending":
                    matchesStatus = auction.status === 'draft' || auction.status === 'pending';
                    break;
                default: // "all"
                    matchesStatus = true; // Show all auctions
            }

            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "ending_soon":
                    return new Date(a.endDate) - new Date(b.endDate);
                case "most_bids":
                    return (b.bidCount || 0) - (a.bidCount || 0);
                case "highest_bid":
                    return (b.currentPrice || 0) - (a.currentPrice || 0);
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "lowest_bid":
                    return (a.currentPrice || 0) - (b.currentPrice || 0);
                default:
                    return new Date(a.endDate) - new Date(b.endDate);
            }
        });

    // Helper functions
    const getStatusBadge = (auction) => {
        const now = new Date();
        const end = new Date(auction.endDate);
        const diffHours = (end - now) / (1000 * 60 * 60);

        if (diffHours < 24 && diffHours > 0) {
            return { class: "bg-amber-100 text-amber-800", text: "Ending Soon" };
        } else if (diffHours <= 0) {
            return { class: "bg-gray-100 text-gray-800", text: "Ended" };
        } else if (auction.status === 'draft') {
            return { class: "bg-blue-100 text-blue-800", text: "Upcoming" };
        } else {
            return { class: "bg-green-100 text-green-800", text: "Active" };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTimeLeft = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diffMs = end - now;

        if (diffMs <= 0) return "Auction ended";

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
        if (diffHours > 0) return `${diffHours}h left`;
        return "Less than 1h left";
    };

    return (
        <section className="flex min-h-[70vh]">
            <SellerSidebar />

            {/* Modal */}
            {
                isLowerReserveModalOpen &&
                <LowerReserveModal
                    isOpen={isLowerReserveModalOpen}
                    onClose={() => setIsLowerReserveModalOpen(false)}
                    auction={lowerReserveCurrentAuction}
                    onReserveLowered={handleReserveLowered}
                />
            }

            <div className="w-full relative">
                <SellerHeader />
                <LowerReserveModal />

                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">All Auctions</h2>
                        <p className="text-secondary">Monitor and manage your active auctions in real-time.</p>
                    </div>

                    {/* Stats Overview */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {auctionStats.map(stat => (
                            <div key={stat.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.title}</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {stat.currency && <span>{stat.currency}</span>}
                                            {stat.value}
                                            {stat.suffix && <span>{stat.suffix}</span>}
                                        </h3>
                                        <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> */}

                    {/* Enhanced Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search your auctions by title or description..."
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
                                        <option value="ending_soon">End Time</option>
                                        <option value="most_bids">Most Bids</option>
                                        <option value="highest_bid">Highest Bid</option>
                                        <option value="lowest_bid">Lowest Bid</option>
                                        <option value="newest">Newest</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quick Filters with Status */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                All
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
                                Active This Week
                            </button>
                            <button
                                onClick={() => setFilter("upcoming")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "upcoming" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setFilter("pending")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "pending" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Pending
                            </button>
                        </div>
                    </div>

                    {/* Auctions Table */}
                    <div ref={dropdownRef} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-16 min-h-[300px]">
                        {loading ? (
                            <div className="flex justify-center items-center py-12 min-h-[300px]">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto min-h-[300px]">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Price</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Bid</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watchers</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ends In</th>
                                            {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredAuctions.map((auction) => {
                                            const statusConfig = getStatusBadge(auction);
                                            return (
                                                <tr key={auction._id} className="hover:bg-gray-50">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                {auction.photos && auction.photos.length > 0 ? (
                                                                    <img
                                                                        src={auction.photos[0].url}
                                                                        alt={auction.title}
                                                                        className="h-10 w-10 object-cover rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <Award size={18} className="text-gray-500" />
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <Link to={`/auction/${auction._id}`} target="_blank" className="font-medium text-gray-900">{auction.title}</Link>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">${auction.startPrice?.toLocaleString()}</td>
                                                    <td className="py-4 px-6 text-sm font-medium text-green-600">
                                                        ${auction.currentPrice?.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">
                                                        <div className="flex items-center">
                                                            <Gavel size={14} className="mr-1 text-gray-500" />
                                                            {auction.bidCount || 0}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">
                                                        <div className="flex items-center">
                                                            <Eye size={14} className="mr-1 text-gray-500" />
                                                            {auction.watchlistCount || 0}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">
                                                        {formatTimeLeft(auction.endDate)}
                                                    </td>
                                                    {/* <td className="py-4 px-6 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
                                                            {statusConfig.text}
                                                        </span>
                                                    </td> */}
                                                    <td className="py-4 px-6 text-sm font-medium text-center">
                                                        <div className="relative inline-block">
                                                            <MoreVertical
                                                                className="cursor-pointer mx-auto"
                                                                onClick={() => setActiveDropdown(activeDropdown === auction._id ? null : auction._id)}
                                                            />
                                                            {activeDropdown === auction._id && (
                                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg py-2 z-50 rounded-md min-w-[180px]">
                                                                    <div className="flex flex-col">
                                                                        <Link
                                                                            to={`/auction/${auction._id}`}
                                                                            target="_blank"
                                                                            className="px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                                                            onClick={() => setActiveDropdown(null)}
                                                                        >
                                                                            View
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => {
                                                                                handleShowReserveModal(auction);
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="px-4 py-2 text-orange-600 hover:bg-orange-50 transition-colors text-left"
                                                                        >
                                                                            Lower Reserve Price
                                                                        </button>
                                                                        <Link
                                                                            to={`/seller/auctions/edit/${auction._id}`}
                                                                            className="px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                                                            onClick={() => setActiveDropdown(null)}
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                        <button
                                                                            className="px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                                                                            onClick={() => setActiveDropdown(null)}
                                                                        >
                                                                            End
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {filteredAuctions.length === 0 && !loading && (
                                    <div className="text-center py-12 min-h-[200px]">
                                        <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">
                                            {auctions.length === 0 ? "No auctions found" : "No auctions match your filters"}
                                        </p>
                                        {auctions.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                    setCategoryFilter("all");
                                                    setFilter("all");
                                                }}
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Load More and Pagination */}
                    {/* {pagination.totalPages > 1 && filteredAuctions.length > 0 && (
                        <div className="flex justify-center mt-6 mb-16">
                            {pagination.currentPage < pagination.totalPages ? (
                                <button
                                    onClick={loadMoreAuctions}
                                    disabled={loadingMore}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? <Loader size={20} className="animate-spin-slow" /> : 'Load More'}
                                </button>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    Showing all {filteredAuctions.length} auctions
                                </p>
                            )}
                        </div>
                    )} */}
                </SellerContainer>
            </div>
        </section>
    );
}

export default AllAuctions;