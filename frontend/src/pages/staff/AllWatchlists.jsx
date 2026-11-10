import { useEffect, useState } from "react";
import {
    StaffContainer, StaffHeader, StaffSidebar, LoadingSpinner,
} from "../../components";
import {
    Search, Filter, Bookmark, Users, Mail, Phone, Calendar,
    X, Eye, MapPin,
    Copy,
    Check,
} from "lucide-react";
import { about } from "../../assets";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

function AllWatchlists() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("most_watched");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalAuctions: 0,
        hasNext: false,
        hasPrev: false,
    });

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [watchlistUsers, setWatchlistUsers] = useState([]);
    const [copiedKey, setCopiedKey] = useState(null);


    const fetchWatchlist = async (page = 1, search = searchTerm, sort = sortBy) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/api/v1/admin/watchlists", {
                params: { page, limit: 10, search, sortBy: sort },
            });
            if (data.success) {
                setAuctions(data.data.auctions);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error("Fetch watchlist error:", err);
            toast.error("Failed to load watchlist data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced search / sort
    useEffect(() => {
        const t = setTimeout(() => {
            fetchWatchlist(1, searchTerm, sortBy);
        }, 500);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, sortBy]);

    const openWatchlistModal = async (auctionId) => {
        setIsModalOpen(true);
        setModalLoading(true);
        setSelectedAuction(null);
        setWatchlistUsers([]);

        try {
            const { data } = await axiosInstance.get(
                `/api/v1/admin/watchlists/${auctionId}`
            );
            if (data.success) {
                setSelectedAuction(data.data.auction);
                setWatchlistUsers(data.data.watchlistUsers);
            }
        } catch (err) {
            console.error("Fetch watchlist details error:", err);
            toast.error("Failed to load watchlist details");
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAuction(null);
        setWatchlistUsers([]);
    };

    const copyToClipboard = async (text, key) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopiedKey(null), 1500);
        } catch (err) {
            console.error("Copy failed:", err);
            toast.error("Failed to copy");
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "$0";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (d) => {
        if (!d) return "N/A";
        return new Date(d).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    const formatDateTime = (d) => {
        if (!d) return "N/A";
        return new Date(d).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { color: "bg-green-100 text-green-800", text: "Active" },
            draft: { color: "bg-amber-100 text-amber-800", text: "Pending" },
            approved: { color: "bg-green-100 text-green-800", text: "Approved" },
            ended: { color: "bg-gray-100 text-gray-800", text: "Ended" },
            sold: { color: "bg-blue-100 text-blue-800", text: "Sold" },
            cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
            reserve_not_met: { color: "bg-orange-100 text-orange-800", text: "Reserve Not Met" },
        };
        const { color, text } = config[status] || {
            color: "bg-gray-100 text-gray-800", text: status,
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {text}
            </span>
        );
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <StaffSidebar />

            <div className="w-full relative">
                <StaffHeader />

                <StaffContainer>
                    {/* Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">
                                    Watchlist Overview
                                </h2>
                                <p className="text-gray-600">
                                    Auctions that have been watchlisted by users at least once
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination.totalAuctions} watchlisted auctions
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search auctions by title, category, or seller..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <Bookmark size={18} className="text-red-500" />
                            <h3 className="text-lg font-semibold">Watchlisted Auctions</h3>
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
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watchers</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {auctions.map((auction) => (
                                            <tr key={auction.auctionId} className="hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={auction.photos?.[0]?.url || about}
                                                            alt={auction.title}
                                                            className="w-12 h-12 rounded-lg object-cover mr-3 border border-gray-200"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div
                                                                className="font-medium text-gray-900 truncate w-48"
                                                                title={auction.title}
                                                            >
                                                                {auction.title}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                    {auction.category}
                                                                </span>
                                                                {auction.auctionType === "reserve" && (
                                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                        Reserve
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-gray-400" />
                                                        <div>
                                                            <div className="text-sm text-gray-900">
                                                                {auction.seller?.username || "Unknown"}
                                                            </div>
                                                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                                                {auction.seller?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full">
                                                        <Bookmark size={14} />
                                                        <span className="font-semibold">
                                                            {auction.watchersCount}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {getStatusBadge(auction.status)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button
                                                        onClick={() => openWatchlistModal(auction.auctionId)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                    >
                                                        <Users size={16} />
                                                        View Watchers
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {auctions.length === 0 && (
                                    <div className="text-center py-12">
                                        <Bookmark size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">
                                            No watchlisted auctions found
                                        </p>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm("")}
                                                className="text-blue-600 hover:text-blue-800 mt-2"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                )}

                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            Showing page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchWatchlist(pagination.currentPage - 1)}
                                                disabled={!pagination.hasPrev}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => fetchWatchlist(pagination.currentPage + 1)}
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

                    {/* Watchers Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                    <h3 className="text-lg font-semibold">
                                        Users Who Watchlisted This Auction
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {modalLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <LoadingSpinner />
                                    </div>
                                ) : selectedAuction ? (
                                    <div className="p-6">
                                        {/* Auction Summary */}
                                        <div className="flex flex-col md:flex-row items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                                            <img
                                                src={selectedAuction.photos?.[0]?.url || about}
                                                alt={selectedAuction.title}
                                                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                            />
                                            <div className="flex-1">
                                                <h4 className="text-xl font-bold text-gray-900 mb-1">
                                                    {selectedAuction.title}
                                                </h4>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {getStatusBadge(selectedAuction.status)}
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {selectedAuction.category}
                                                    </span>
                                                    {selectedAuction.location && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-600">
                                                            <MapPin size={12} />
                                                            {selectedAuction.location}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Current Bid:{" "}
                                                    <span className="font-bold text-green-600">
                                                        {formatCurrency(selectedAuction.currentPrice)}
                                                    </span>{" "}
                                                    • Seller:{" "}
                                                    <span className="font-medium">
                                                        {selectedAuction.seller?.username}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-right">
                                                <div className="text-3xl font-bold text-red-600">
                                                    {watchlistUsers.length}
                                                </div>
                                                <div className="text-xs text-gray-500">Watchers</div>
                                            </div>
                                        </div>

                                        {/* Users list */}
                                        {watchlistUsers.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watchlisted On</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {watchlistUsers.map((entry) => (
                                                            <tr key={entry._id} className="hover:bg-gray-50">
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-3">
                                                                        {entry.user?.image ? (
                                                                            <img
                                                                                src={entry.user.image}
                                                                                alt=""
                                                                                className="w-9 h-9 rounded-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                                                                                {(entry.user?.firstName?.[0] || "U").toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <div className="font-medium text-sm text-gray-900">
                                                                                {entry.user?.firstName} {entry.user?.lastName}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                @{entry.user?.username}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-1 text-sm text-gray-700">
                                                                        <Mail size={12} className="text-gray-400" />
                                                                        <span>{entry.user?.email || "N/A"}</span>
                                                                        {entry.user?.email && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    copyToClipboard(entry.user.email, `email-${entry._id}`)
                                                                                }
                                                                                className="ml-1 p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                                                                title="Copy email"
                                                                            >
                                                                                {copiedKey === `email-${entry._id}` ? (
                                                                                    <Check size={12} className="text-green-600" />
                                                                                ) : (
                                                                                    <Copy size={12} />
                                                                                )}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-1 text-sm text-gray-700">
                                                                        <Phone size={12} className="text-gray-400" />
                                                                        <span>
                                                                            {entry.user?.phone
                                                                                ? `${entry.user.countryCode || ""} ${entry.user.phone}`.trim()
                                                                                : "N/A"}
                                                                        </span>
                                                                        {entry.user?.phone && (
                                                                            <button
                                                                                onClick={() => copyToClipboard(entry.user.phone, `phone-${entry._id}`)}
                                                                                className="ml-1 p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                                                                title="Copy phone"
                                                                            >
                                                                                {copiedKey === `phone-${entry._id}` ? (
                                                                                    <Check size={12} className="text-green-600" />
                                                                                ) : (
                                                                                    <Copy size={12} />
                                                                                )}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                                        {entry.user?.userType || "user"}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-1 text-sm text-gray-700">
                                                                        <Bookmark size={12} className="text-red-400" />
                                                                        {formatDateTime(entry.addedAt)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No users currently watching this auction
                                            </div>
                                        )}

                                        {/* Footer actions */}
                                        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                                            <Link
                                                to={`/auction/${selectedAuction._id}`}
                                                target="_blank"
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye size={16} />
                                                View Public Auction Page
                                            </Link>
                                            <button
                                                onClick={closeModal}
                                                className="ml-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}
                </StaffContainer>
            </div>
        </section>
    );
}

export default AllWatchlists;