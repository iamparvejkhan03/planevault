// components/BidHistory.jsx
import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Calendar, Download, BarChart3, User, Gavel, Award, Clock, DollarSign, Users, TrendingUp, Package } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import { toast } from "react-hot-toast";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components/index.js";

function BidHistory() {
    const [allAuctions, setAllAuctions] = useState([]); // Store all auctions from initial fetch
    const [filteredAuctions, setFilteredAuctions] = useState([]); // Store filtered auctions
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [filterOptions, setFilterOptions] = useState({});

    // Filters - all handled on frontend now
    const [filters, setFilters] = useState({
        status: "all",
        category: "all",
        seller: "all",
        search: "",
        sortBy: "recent"
    });

    // Fetch all data once on component mount
    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [historyResponse, statsResponse] = await Promise.all([
                axiosInstance.get(`/api/v1/bids/admin/history`), // No filters initially
                axiosInstance.get('/api/v1/bids/admin/stats')
            ]);

            if (historyResponse.data.success) {
                setAllAuctions(historyResponse.data.data.auctions);
                setFilteredAuctions(historyResponse.data.data.auctions); // Initially show all
                setFilterOptions(historyResponse.data.data.filterOptions);
                if (historyResponse.data.data.auctions.length > 0) {
                    setSelectedAuction(historyResponse.data.data.auctions[0]);
                }
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

        } catch (error) {
            console.error('Fetch admin bid history error:', error);
            toast.error('Failed to load bid history');
        } finally {
            setLoading(false);
        }
    };

    // Apply filters locally
    const applyFilters = useMemo(() => {
        return () => {
            let filtered = [...allAuctions];

            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(auction => 
                    auction.title?.toLowerCase().includes(searchTerm) ||
                    auction.description?.toLowerCase().includes(searchTerm) ||
                    auction.seller?.name?.toLowerCase().includes(searchTerm) ||
                    auction.seller?.username?.toLowerCase().includes(searchTerm) ||
                    auction.bids.some(bid => 
                        bid.bidder.name?.toLowerCase().includes(searchTerm) ||
                        bid.bidder.username?.toLowerCase().includes(searchTerm) ||
                        bid.bidder.email?.toLowerCase().includes(searchTerm)
                    )
                );
            }

            // Status filter
            if (filters.status !== "all") {
                filtered = filtered.filter(auction => auction.status === filters.status);
            }

            // Category filter
            if (filters.category !== "all") {
                filtered = filtered.filter(auction => auction.category === filters.category);
            }

            // Seller filter
            if (filters.seller !== "all") {
                filtered = filtered.filter(auction => auction.seller.id === filters.seller);
            }

            // Apply sorting
            filtered.sort((a, b) => {
                switch(filters.sortBy) {
                    case "recent":
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case "ending_soon":
                        return new Date(a.endTime) - new Date(b.endTime);
                    case "most_bids":
                        return b.totalBids - a.totalBids;
                    case "highest_bid":
                        return b.winningBid - a.winningBid;
                    case "seller_name":
                        return a.seller.name.localeCompare(b.seller.name);
                    default:
                        return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });

            return filtered;
        };
    }, [allAuctions, filters]);

    // Update filtered auctions when filters change
    useEffect(() => {
        if (allAuctions.length > 0) {
            const filtered = applyFilters();
            setFilteredAuctions(filtered);
            
            // Update selected auction if it's no longer in filtered list
            if (selectedAuction && !filtered.find(a => a.id === selectedAuction.id)) {
                setSelectedAuction(filtered.length > 0 ? filtered[0] : null);
            }
        }
    }, [applyFilters, allAuctions.length, selectedAuction]);

    // Initial fetch
    useEffect(() => {
        fetchAllData();
    }, []);

    // Handle filter changes - no API calls
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "all",
            category: "all",
            seller: "all",
            search: "",
            sortBy: "recent"
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // No API call needed - filters are applied automatically
        }
    };

    // Helper functions remain the same
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Winner: { class: "bg-green-100 text-green-800", text: "Winner" },
            Winning: { class: "bg-blue-100 text-blue-800", text: "Winning" },
            Outbid: { class: "bg-gray-100 text-gray-800", text: "Outbid" },
            'Reserve Not Met': { class: "bg-orange-100 text-orange-800", text: "Reserve Not Met" },
            Active: { class: "bg-green-100 text-green-800", text: "Active" },
            Sold: { class: "bg-purple-100 text-purple-800", text: "Sold" },
            Ended: { class: "bg-gray-100 text-gray-800", text: "Ended" },
            Cancelled: { class: "bg-red-100 text-red-800", text: "Cancelled" }
        };

        const config = statusConfig[status] || statusConfig.Outbid;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>{config.text}</span>;
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Aircraft":
                return <Package size={18} className="text-blue-600" />;
            case "Engines & Parts":
                return <Package size={18} className="text-green-600" />;
            case "Memorabilia":
                return <Award size={18} className="text-amber-600" />;
            default:
                return <Package size={18} className="text-gray-600" />;
        }
    };

    // Stats cards configuration
    const statCards = [
        {
            title: "Total Bids",
            value: stats.totalBids?.toString() || "0",
            change: "All Time",
            icon: <Gavel size={24} />,
            color: "blue"
        },
        {
            title: "Recent Bids",
            value: stats.recentBids?.toString() || "0",
            change: "Last 7 Days",
            icon: <TrendingUp size={24} />,
            color: "green"
        },
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue || 0),
            change: "From Commissions",
            icon: <DollarSign size={24} />,
            color: "purple"
        },
        {
            title: "Active Bidders",
            value: stats.activeBidders?.toString() || "0",
            change: "Last 30 Days",
            icon: <Users size={24} />,
            color: "orange"
        }
    ];

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Bid History</h2>
                        <p className="text-gray-600">Track all bidding activity on your auctions.</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search auctions, bidders..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    {filterOptions.statuses?.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {filterOptions.categories?.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="ending_soon">Ending Soon</option>
                                    <option value="most_bids">Most Bids</option>
                                    <option value="highest_bid">Highest Bid</option>
                                    <option value="seller_name">Seller Name</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredAuctions.length} of {allAuctions.length} auctions
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>

                    {/* Auctions List */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Auctions Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Auctions with Bids ({filteredAuctions.length})</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {filteredAuctions.map(auction => (
                                        <div
                                            key={auction.id}
                                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedAuction?.id === auction.id ? 'bg-blue-50 border-blue-200' : ''
                                                }`}
                                            onClick={() => setSelectedAuction(auction)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                                        {auction.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {getCategoryIcon(auction.category)}
                                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                            {auction.category}
                                                        </span>
                                                        {getStatusBadge(auction.status)}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {formatCurrency(auction.winningBid)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {auction.totalBids} bids
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Selected Auction Details */}
                        <div className="lg:col-span-2">
                            {selectedAuction ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    {/* Auction Header */}
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            {getCategoryIcon(selectedAuction.category)}
                                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {selectedAuction.category}
                                            </span>
                                            <span className={`text-sm font-medium px-2 py-1 rounded ${selectedAuction.auctionType === "Reserve Auction"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-blue-100 text-blue-800"
                                                }`}>
                                                {selectedAuction.auctionType}
                                            </span>
                                            {getStatusBadge(selectedAuction.status)}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedAuction.title}</h2>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Starting Bid</div>
                                                <div className="font-medium">{formatCurrency(selectedAuction.startingBid)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Winning Bid</div>
                                                <div className="font-medium text-green-600">{formatCurrency(selectedAuction.winningBid)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Total Bids</div>
                                                <div className="font-medium">{selectedAuction.totalBids}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Unique Bidders</div>
                                                <div className="font-medium">{selectedAuction.uniqueBidders}</div>
                                            </div>
                                        </div>

                                        {/* Seller Info */}
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">Seller</div>
                                            <div className="font-medium">{selectedAuction.seller.name}</div>
                                            <div className="text-sm text-gray-500">@{selectedAuction.seller.username} • {selectedAuction.seller.email}</div>
                                        </div>
                                    </div>

                                    {/* Bids Table */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Bid History ({selectedAuction.bids.length})</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Bidder</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedAuction.bids.map((bid) => (
                                                        <tr key={bid.id} className="hover:bg-gray-50">
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                                        <User size={14} className="text-gray-500" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-sm text-gray-900">{bid.bidder.name}</div>
                                                                        <div className="text-xs text-gray-500">@{bid.bidder.username}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className={`font-medium text-sm ${bid.isHighest ? 'text-green-600' : 'text-gray-900'
                                                                    }`}>
                                                                    {formatCurrency(bid.amount)}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                                {formatDate(bid.time)}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                                {formatTime(bid.time)}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {getStatusBadge(bid.status)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Auction Selected</h3>
                                    <p className="text-gray-500">Select an auction from the list to view its bid history</p>
                                </div>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
}

export default BidHistory;