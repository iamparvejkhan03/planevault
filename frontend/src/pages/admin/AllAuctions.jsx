import { useEffect, useState } from "react";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import { Search, Filter, Gavel, DollarSign, Clock, Eye, Edit, Shield, TrendingUp, User, Award, MoreVertical, Trash2, AlertTriangle, CheckCircle, Star, Crown } from "lucide-react";
import { about } from "../../assets";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

function AllAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        featured: 0,
        sold: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalAuctions: 0,
        hasNext: false,
        hasPrev: false
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest('.relative')) {
                setActiveDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchAuctions = async (page = 1, search = searchTerm, auctionFilter = filter) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/v1/admin/auctions`, {
                params: {
                    page,
                    limit: 10,
                    search,
                    filter: auctionFilter !== 'all' ? auctionFilter : undefined
                }
            });

            if (data.success) {
                setAuctions(data.data.auctions);
                setStats(data.data.stats);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Fetch auctions error:', err);
            toast.error("Failed to load auctions");
        } finally {
            setLoading(false);
        }
    };

    const fetchAuctionDetails = async (auctionId) => {
        try {
            const { data } = await axiosInstance.get(`/api/v1/admin/auctions/${auctionId}`);
            if (data.success) {
                setSelectedAuction(data.data.auction);
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error('Fetch auction details error:', err);
            toast.error("Failed to load auction details");
        }
    };

    const approveAuction = async (auctionId) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/auctions/${auctionId}/approve`);
            if (data.success) {
                toast.success(data.message);
                fetchAuctions(); // Refresh the list
            }
        } catch (err) {
            console.error('Approve auction error:', err);
            toast.error(err.response?.data?.message || "Failed to approve auction");
        }
    };

    const suspendAuction = async (auctionId) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/auctions/${auctionId}/status`, {
                status: 'cancelled'
            });
            if (data.success) {
                toast.success(data.message);
                fetchAuctions(); // Refresh the list
            }
        } catch (err) {
            console.error('Cancel auction error:', err);
            toast.error(err.response?.data?.message || "Failed to cancel auction");
        }
    };

    const activateAuction = async (auctionId) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/auctions/${auctionId}/status`, {
                status: 'active'
            });
            if (data.success) {
                toast.success(data.message);
                fetchAuctions(); // Refresh the list
            }
        } catch (err) {
            console.error('Activate auction error:', err);
            toast.error(err.response?.data?.message || "Failed to activate auction");
        }
    };

    const toggleFeatured = async (auctionId, currentlyFeatured) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/auctions/${auctionId}/status`, {
                featured: !currentlyFeatured
            });
            if (data.success) {
                toast.success(data.message);
                fetchAuctions(); // Refresh the list
            }
        } catch (err) {
            console.error('Toggle featured error:', err);
            toast.error(err.response?.data?.message || "Failed to update featured status");
        }
    };

    const endAuction = async (auctionId) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/auctions/${auctionId}/end`);
            if (data.success) {
                toast.success(data.message);
                fetchAuctions(); // Refresh the list
            }
        } catch (err) {
            console.error('End auction error:', err);
            toast.error(err.response?.data?.message || "Failed to end auction");
        }
    };

    const deleteAuction = async (auctionId, auctionTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${auctionTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/admin/auctions/${auctionId}`);
            if (data.success) {
                toast.success(data.message);
                fetchAuctions(); // Refresh the list
            }
        } catch (err) {
            console.error('Delete auction error:', err);
            toast.error(err.response?.data?.message || "Failed to delete auction");
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchAuctions(1, searchTerm, filter);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filter]);

    const openAuctionModal = (auction) => {
        fetchAuctionDetails(auction._id);
    };

    const closeAuctionModal = () => {
        setIsModalOpen(false);
        setSelectedAuction(null);
    };

    const handleEditAuction = (auction) => {
        if(auction.status === 'sold'){
            return toast.error(`Sold auction can't be edited`)
        }
        navigate(`/admin/auctions/edit/${auction._id}`);
    };

    const getStatusBadge = (status, endDate) => {
        const config = {
            active: {
                color: "bg-green-100 text-green-800",
                text: new Date(endDate) > new Date() ? "Active" : "Ending Soon"
            },
            draft: { color: "bg-amber-100 text-amber-800", text: "Pending" },
            approved: { color: "bg-green-100 text-green-800", text: "Approved" },
            ended: { color: "bg-gray-100 text-gray-800", text: "Ended" },
            sold: { color: "bg-blue-100 text-blue-800", text: "Sold" },
            cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
            reserve_not_met: { color: "bg-orange-100 text-orange-800", text: "Reserve Not Met" },
            cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" }
        };
        const { color, text } = config[status] || { color: "bg-gray-100 text-gray-800", text: status };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
    };

    const getAuctionTypeBadge = (auctionType) => {
        return auctionType === 'reserve' ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Reserve
            </span>
        ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Standard
            </span>
        );
    };

    const formatCurrency = (amount) => {
        if (!amount) return '$0';
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
            year: 'numeric'
        });
    };

    const formatTimeRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffMs = end - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
        if (diffHours > 0) return `${diffHours}h`;
        return 'Ending soon';
    };

    const getConditionBadge = (specifications) => {
        const condition = specifications.condition || 'Unknown';
        const config = {
            'Excellent': 'bg-green-100 text-green-800',
            'Very Good': 'bg-blue-100 text-blue-800',
            'Good': 'bg-amber-100 text-amber-800',
            'Fair': 'bg-orange-100 text-orange-800',
            'Poor': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[condition] || 'bg-gray-100 text-gray-800'}`}>
                {condition}
            </span>
        );
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
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">Auction Management</h2>
                                <p className="text-gray-600">Manage and monitor all platform auctions</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination.totalAuctions} auctions found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-500">Total Auctions</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                            <div className="text-sm text-gray-500">Active</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                            <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        {/* <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-purple-600">{stats.featured}</div>
                            <div className="text-sm text-gray-500">Featured</div>
                        </div> */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
                            <div className="text-sm text-gray-500">Sold</div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search auctions by title, seller, or category..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter size={18} className="text-gray-500" />
                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    >
                                        <option value="all">All Auctions</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="ended">Ended</option>
                                        <option value="sold">Sold</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auctions Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">All Auctions</h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Bid</th>
                                            {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids/Watchers</th> */}
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {auctions.map((auction) => (
                                            <tr key={auction._id} className="hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={auction.photos?.[0]?.url || about}
                                                            alt={auction.title}
                                                            className="w-12 h-12 rounded-lg object-cover mr-3 border border-gray-200"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div
                                                                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                                                                onClick={() => openAuctionModal(auction)}
                                                                title={auction.title}
                                                            >
                                                                {auction.title}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                    {auction.category}
                                                                </span>
                                                                {getAuctionTypeBadge(auction.auctionType)}
                                                                {auction.featured && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full">
                                                                        <Star size={10} />
                                                                        Featured
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} className="text-gray-400" />
                                                        <div>
                                                            <div className="text-sm text-gray-900">
                                                                {auction.seller?.username || 'Unknown'}
                                                            </div>
                                                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                                                {auction.seller?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-lg font-bold text-green-600">
                                                        {formatCurrency(auction.currentPrice)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Start: {formatCurrency(auction.startPrice)}
                                                        {auction.reservePrice && (
                                                            <div>Reserve: {formatCurrency(auction.reservePrice)}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Gavel size={14} className="text-gray-400" />
                                                            <span>{auction.bidCount} bids</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Eye size={14} className="text-gray-400" />
                                                            <span>{auction.watchlistCount} watchers</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <TrendingUp size={14} className="text-gray-400" />
                                                            <span>{auction.views} views</span>
                                                        </div>
                                                    </div>
                                                </td> */}
                                                <td className="py-4 px-6">
                                                    <div className="space-y-2">
                                                        {getStatusBadge(auction.status, auction.endDate)}
                                                        {/* {getConditionBadge(auction.specifications)} */}
                                                        {auction.status === 'active' && (
                                                            <div className="text-xs text-gray-500">
                                                                Ends: {formatTimeRemaining(auction.endDate)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => openAuctionModal(auction)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        {/* Edit Button - Always visible */}
                                                        <button
                                                            onClick={() => handleEditAuction(auction)}
                                                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                                            title="Edit Auction"
                                                        >
                                                            <Edit size={16} />
                                                        </button>

                                                        {/* More Actions Dropdown */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveDropdown(activeDropdown === auction._id ? null : auction._id);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                                title="More Actions"
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>

                                                            {activeDropdown === auction._id && (
                                                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                                                                    {/* Status Management */}

                                                                    {auction.status === "draft" && (
                                                                        <button
                                                                            onClick={() => {
                                                                                approveAuction(auction._id);
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                            <span>Approve Auction</span>
                                                                        </button>
                                                                    )}

                                                                    {auction.status === "active" && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    suspendAuction(auction._id);
                                                                                    setActiveDropdown(null);
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                                                                            >
                                                                                <AlertTriangle size={16} />
                                                                                <span>Cancel Auction</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    endAuction(auction._id);
                                                                                    setActiveDropdown(null);
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                            >
                                                                                <Clock size={16} />
                                                                                <span>End Auction Now</span>
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {auction.status === "cancelled" && (
                                                                        <button
                                                                            onClick={() => {
                                                                                activateAuction(auction._id);
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                            <span>Activate Auction</span>
                                                                        </button>
                                                                    )}

                                                                    {/* Featured Toggle */}
                                                                    {/* <div className="border-t border-gray-100 my-1"></div>
                                                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                                                                        Featured Status
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            toggleFeatured(auction._id, auction.featured);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                                                                    >
                                                                        <Star size={16} fill={auction.featured ? "currentColor" : "none"} />
                                                                        <span>{auction.featured ? "Remove Featured" : "Make Featured"}</span>
                                                                    </button> */}

                                                                    {/* Delete Action */}
                                                                    <div className="border-t border-gray-100 my-1"></div>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm(`Are you sure you want to delete "${auction.title}"? This action cannot be undone.`)) {
                                                                                deleteAuction(auction._id, auction.title);
                                                                                setActiveDropdown(null);
                                                                            }
                                                                        }}
                                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        <span>Delete Auction</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {auctions.length === 0 && (
                                    <div className="text-center py-12">
                                        <Gavel size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No auctions found matching your criteria</p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setFilter("all");
                                            }}
                                            className="text-blue-600 hover:text-blue-800 mt-2"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            Showing page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchAuctions(pagination.currentPage - 1)}
                                                disabled={!pagination.hasPrev}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => fetchAuctions(pagination.currentPage + 1)}
                                                disabled={!pagination.hasNext}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Auction Detail Modal */}
                    {isModalOpen && selectedAuction && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Auction Details</h3>
                                    <button
                                        onClick={closeAuctionModal}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Header Section */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <img
                                            src={selectedAuction.photos?.[0]?.url || about}
                                            alt={selectedAuction.title}
                                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">{selectedAuction.title}</h4>
                                                {/* {selectedAuction.featured && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full">
                                                        <Star size={12} />
                                                        Featured
                                                    </span>
                                                )} */}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {getStatusBadge(selectedAuction.status, selectedAuction.endDate)}
                                                {getAuctionTypeBadge(selectedAuction.auctionType)}
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {selectedAuction.category}
                                                </span>
                                                {/* {getConditionBadge(selectedAuction.specifications)} */}
                                            </div>
                                            <div className="text-gray-600 prose">
                                                <div dangerouslySetInnerHTML={{ __html: selectedAuction.description }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auction Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Auction Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Current Bid</span>
                                                    <span className="font-bold text-green-600">{formatCurrency(selectedAuction.currentPrice)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Starting Bid</span>
                                                    <span className="font-medium">{formatCurrency(selectedAuction.startPrice)}</span>
                                                </div>
                                                {selectedAuction.reservePrice && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Reserve Price</span>
                                                        <span className="font-medium">{formatCurrency(selectedAuction.reservePrice)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Bid Increment</span>
                                                    <span className="font-medium">{formatCurrency(selectedAuction.bidIncrement)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Total Bids</span>
                                                    <span className="font-medium">{selectedAuction.bidCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Watchers</span>
                                                    <span className="font-medium">{selectedAuction.watchlistCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Views</span>
                                                    <span className="font-medium">{selectedAuction.views}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Location</span>
                                                    <span className="font-medium">{selectedAuction.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Timeline & Seller</h5>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Start Date</span>
                                                    <span className="font-medium">{formatDate(selectedAuction.startDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">End Date</span>
                                                    <span className="font-medium">{formatDate(selectedAuction.endDate)}</span>
                                                </div>
                                                {selectedAuction.status === 'active' && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Time Remaining</span>
                                                        <span className="font-medium text-amber-600">{formatTimeRemaining(selectedAuction.endDate)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Seller</span>
                                                    <span className="font-medium">{selectedAuction.seller?.username}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Seller Email</span>
                                                    <span className="font-medium text-blue-600">{selectedAuction.seller?.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Seller Phone</span>
                                                    <span className="font-medium text-blue-600">{selectedAuction.seller?.phone}</span>
                                                </div>
                                                {selectedAuction.winner && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Winner</span>
                                                        <span className="font-medium text-green-600">{selectedAuction.winner?.username}</span>
                                                    </div>
                                                )}
                                                {selectedAuction.finalPrice && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Final Price</span>
                                                        <span className="font-bold text-green-600">{formatCurrency(selectedAuction.finalPrice)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specifications */}
                                    {selectedAuction.specifications && Object.keys(selectedAuction.specifications).length > 0 && (
                                        <div className="mb-6">
                                            <h5 className="font-semibold text-gray-900 mb-3">Specifications</h5>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {Object.entries(selectedAuction.specifications).map(([key, value]) => (
                                                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-sm font-medium text-gray-500 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </div>
                                                        <div className="text-sm text-gray-900">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => handleEditAuction(selectedAuction)}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit size={18} />
                                            Edit Auction
                                        </button>
                                        <Link
                                            to={`/auction/${selectedAuction._id}`}
                                            target="_blank"
                                            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                        >
                                            View Auction Page
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default AllAuctions;