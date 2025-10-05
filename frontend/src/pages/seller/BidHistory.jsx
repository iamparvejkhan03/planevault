import { useState, useEffect } from "react";
import { LoadingSpinner, SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import { Search, Filter, Calendar, Download, BarChart3, User, Gavel, Award, Clock, DollarSign, Plane, History, Package } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

function BidHistory() {
    const [auctions, setAuctions] = useState([]);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch seller's auctions with bid history
    useEffect(() => {
        fetchSellerAuctions();
    }, []);

    const fetchSellerAuctions = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axiosInstance.get(`/api/v1/auctions/user/my-auctions`);

            if (data.success) {
                // Filter auctions that have bids and transform the data
                const auctionsWithBids = data.data.auctions.filter(auction => {
                    return auction.bids && auction.bids.length > 0;
                });

                const transformedAuctions = transformAuctionData(auctionsWithBids);
                setAuctions(transformedAuctions);
                if (transformedAuctions.length > 0) {
                    setSelectedAuction(transformedAuctions[0]);
                }
            } else {
                setError("Failed to fetch auction data");
            }
        } catch (err) {
            console.error("Fetch seller auctions error:", err);
            setError("Error loading bid history");
            toast.error("Failed to load bid history");
        } finally {
            setLoading(false);
        }
    };

    const transformAuctionData = (backendAuctions) => {

        return backendAuctions.map(auction => {
            const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
            const bids = sortedBids.map((bid, index) => {
                let status = "Outbid";

                if (auction.status === 'active') {
                    if (index === 0) { // Highest bid
                        status = "Winning";
                    }
                }
                // For sold/completed auctions: winner is "Winner", others are "Outbid"
                else if (auction.status === 'sold' || auction.status === 'completed') {
                    if (auction.winner?._id?.toString() === bid.bidder?._id?.toString() && index === 0) {
                        status = "Winner";
                    }
                }

                return {
                    id: bid._id || `bid-${index}`,
                    bidder: {
                        id: bid.bidder?._id || bid.bidder,
                        name: bid.bidder?.firstName && bid.bidder?.lastName
                            ? `${bid.bidder.firstName} ${bid.bidder.lastName}`
                            : bid.bidder?.username || 'Unknown Bidder',
                        username: bid.bidder?.username || 'unknown',
                        email: bid.bidder?.email || '',
                        company: bid.bidder?.company || ''
                    },
                    amount: bid.amount,
                    time: bid.timestamp,
                    status: status,
                    ip: "Not Available"
                };
            });

            return {
                id: auction._id,
                auctionId: `AU${auction._id.toString().slice(-6).toUpperCase()}`,
                auctionTitle: auction.title,
                category: auction.category,
                auctionType: auction.auctionType === 'reserve' ? 'Reserve Auction' : 'Standard Auction',
                startTime: auction.startDate,
                endTime: auction.endDate,
                startingBid: auction.startPrice,
                winningBid: sortedBids[0]?.amount || auction.currentPrice,
                status: auction.status === 'active' ? 'Active' :
                    auction.status === 'sold' ? 'Completed' :
                        auction.status.charAt(0).toUpperCase() + auction.status.slice(1),
                bids: bids
            };
        });
    };

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

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Aircraft":
                return <Plane size={18} className="text-blue-600" />;
            case "Aviation Memorabilia":
                return <History size={18} className="text-amber-600" />;
            case "Engines & Parts":
                return <Package size={18} className="text-gray-600" />;
            default:
                return <Award size={18} className="text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Winner: { class: "bg-green-100 text-green-800", text: "Winner" },
            Winning: { class: "bg-green-100 text-green-800", text: "Winning" },
            Outbid: { class: "bg-gray-100 text-gray-800", text: "Outbid" },
            Retracted: { class: "bg-red-100 text-red-800", text: "Retracted" },
            Active: { class: "bg-blue-100 text-blue-800", text: "Active" }
        };

        const config = statusConfig[status] || statusConfig.Outbid;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>{config.text}</span>;
    };

    // Filter bids based on selected filters
    const filteredBids = selectedAuction ? selectedAuction.bids.filter(bid => {
        const matchesStatus = filterStatus === "all" || bid.status === filterStatus;
        const matchesSearch = searchTerm === "" ||
            bid.bidder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bid.bidder.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bid.bidder.email.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateRange.start && dateRange.end) {
            const bidDate = new Date(bid.time).toISOString().split('T')[0];
            matchesDate = bidDate >= dateRange.start && bidDate <= dateRange.end;
        }

        return matchesStatus && matchesSearch && matchesDate;
    }) : [];

    // Loading state
    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <SellerSidebar />
                <div className="w-full relative">
                    <SellerHeader />
                    <SellerContainer>
                        <div className="flex justify-center items-center h-64">
                            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> */}
                            <LoadingSpinner />
                        </div>
                    </SellerContainer>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <SellerSidebar />
                <div className="w-full relative">
                    <SellerHeader />
                    <SellerContainer>
                        <div className="text-center py-12">
                            <BarChart3 size={48} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchSellerAuctions}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </SellerContainer>
                </div>
            </section>
        );
    }

    // No auctions state
    if (auctions.length === 0) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <SellerSidebar />
                <div className="w-full relative">
                    <SellerHeader />
                    <SellerContainer>
                        <div className="max-w-full pt-16 pb-7 md:pt-0">
                            <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Bid History</h2>
                            <p className="text-gray-600">Track all bidding activity on your auctions.</p>
                        </div>
                        <div className="text-center py-12">
                            <Gavel size={48} className="mx-auto text-gray-400 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Auctions Found</h3>
                            <p className="text-gray-500">You don't have any completed auctions with bids yet.</p>
                        </div>
                    </SellerContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <SellerSidebar />

            <div className="w-full relative">
                <SellerHeader />

                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Bid History</h2>
                        <p className="text-gray-600">Track all bidding activity on your auctions.</p>
                    </div>

                    {/* Auction Selection */}
                    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Auction</label>
                        <select
                            className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            value={selectedAuction?.id || ""}
                            onChange={(e) => setSelectedAuction(auctions.find(a => a.id === e.target.value))}
                        >
                            {auctions.map(auction => (
                                <option key={auction.id} value={auction.id}>
                                    {auction.auctionTitle} - {formatCurrency(auction.winningBid)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Auction Summary Card */}
                    {selectedAuction && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getCategoryIcon(selectedAuction.category)}
                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                            {selectedAuction.category}
                                        </span>
                                        <span className={`text-sm font-medium px-2 py-1 rounded-md ${selectedAuction.auctionType === "Reserve Auction"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {selectedAuction.auctionType}
                                        </span>
                                        <span className={`text-sm font-medium px-2 py-1 rounded-md ${selectedAuction.status === "Completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-amber-100 text-amber-800"
                                            }`}>
                                            {selectedAuction.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedAuction.auctionTitle}</h3>

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
                                            <div className="font-medium">{selectedAuction.bids.length}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Unique Bidders</div>
                                            <div className="font-medium">
                                                {new Set(selectedAuction.bids.map(bid => bid.bidder.id)).size}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-5 py-4 rounded-xl">
                                    <div className="text-sm font-medium">Auction Period</div>
                                    <div className="text-sm">{formatDate(selectedAuction.startTime)} - {formatDate(selectedAuction.endTime)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search bidders..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Winner">Winner</option>
                                        <option value="Outbid">Outbid</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-500" />
                                    <input
                                        type="date"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        placeholder="Start date"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="date"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        placeholder="End date"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bids Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Bid History</h3>
                            <div className="text-sm text-gray-500">
                                Showing {filteredBids.length} of {selectedAuction?.bids?.length || 0} bids
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Date</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Time</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBids.map((bid) => (
                                        <tr key={bid.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center overflow-hidden justify-center">
                                                        {
                                                            bid.bidder.image
                                                                ?
                                                                <img src={bid.bidder.image} alt="bidder image" />
                                                                :
                                                                <User size={18} className="text-gray-500" />
                                                        }
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{bid.bidder.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {bid.bidder.company ? `${bid.bidder.company} • ` : ''}@{bid.bidder.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{formatCurrency(bid.amount)}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-900">
                                                    <div>{formatDate(bid.time)}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-900">{formatTime(bid.time)}</td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(bid.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredBids.length === 0 && (
                                <div className="text-center py-12">
                                    <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No bids match your filters</p>
                                    <button
                                        onClick={() => {
                                            setFilterStatus("all");
                                            setSearchTerm("");
                                            setDateRange({ start: "", end: "" });
                                        }}
                                        className="text-blue-600 hover:text-blue-800 mt-2"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </SellerContainer>
            </div>
        </section>
    );
}

export default BidHistory;