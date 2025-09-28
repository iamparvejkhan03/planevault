import { useEffect, useState } from "react";
import { LoadingSpinner, BidderContainer, BidderHeader, BidderSidebar, AuctionCard } from "../../components";
import toast from "react-hot-toast";
import axios from "axios";
import { Clock, Gavel, TrendingUp, DollarSign, Eye, Award, BarChart3, Search, Filter, SortAsc, MapPin, Users, Star, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuctions } from "../../hooks/useAuctions";
import { useStats } from "../../hooks/useStats";

function ActiveAuctions() {
    const {
        auctions,
        loading,
        loadingMore,
        pagination,
        loadMoreAuctions,
    } = useAuctions();
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("ending_soon");
    const [viewMode, setViewMode] = useState("grid");
    const { stats } = useStats();

    const handleLoadMore = () => {
        loadMoreAuctions();
    };

    const auctionStats = [
        {
            title: "Active Auctions",
            value: stats.activeAuctions.toString(),
            change: "All Time",
            icon: <Gavel size={24} />,
            trend: "up"
        },
        {
            title: "New Today",
            value: stats.newToday.toString(),
            change: "In Last 24 Hours",
            icon: <Award size={24} />,
            trend: "up"
        },
        {
            title: "Ending Soon",
            value: stats.endingSoon.toString(),
            change: "In Next 24 Hours",
            icon: <Clock size={24} />,
            trend: "down",
            highlight: true
        },
        {
            title: "Total Bidders",
            value: stats.totalBidders.toString(),
            change: "All Time",
            icon: <Users size={24} />,
            trend: "up"
        }
    ];

    const categories = ["all", ...new Set(auctions.map(auction => auction.category))];

    const filteredAuctions = auctions
        .filter(auction => {
            const matchesSearch = searchTerm === "" ||
                auction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                auction.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || auction.category === categoryFilter;
            return matchesSearch && matchesCategory;
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
                    return 0;
            }
        })
        .filter(auction => {
            // Filter by status based on time remaining
            const now = new Date();
            const end = new Date(auction.endDate);
            const diffHours = (end - now) / (1000 * 60 * 60);

            switch (filter) {
                case "ending_soon":
                    return diffHours < 24;
                case "active":
                    return diffHours > 0 && diffHours < 168; // Within 7 days and not ended
                case "upcoming":
                    return diffHours > 168; // More than 7 days
                default:
                    return diffHours > 0; // All active (not ended)
            }
        });

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
                                            {stat.change}
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
                            </div>
                        </div>

                        {/* Quick Filters with Status */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                All Active
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
                        </div>
                    </div>

                    {/* Auction Cards Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, index) => (
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
                                <div key={auction._id} className={viewMode === "list" ? "flex" : ""}>
                                    <AuctionCard
                                        auction={auction}
                                    />
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

                    {/* Load More Button */}
                    {pagination?.currentPage < pagination?.totalPages && (
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
                                            {pagination.totalAuctions - auctions.length} more
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default ActiveAuctions;