import { useState } from "react";
import { SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import { Search, Filter, Calendar, Download, BarChart3, User, Gavel, Award, Clock, DollarSign, Plane, History, Package } from "lucide-react";

// Mock data for bid history
const bidHistoryData = [
    {
        id: "BH267400",
        auctionId: "AV267400",
        auctionTitle: "Vintage Boeing 747 Control Panel",
        category: "Aviation Memorabilia",
        auctionType: "Reserve Auction",
        startTime: "2023-11-15T10:00:00",
        endTime: "2023-11-28T15:30:00",
        startingBid: 5000,
        winningBid: 18500,
        status: "Completed",
        bids: [
            {
                id: "B001",
                bidder: {
                    id: 1,
                    name: "James Aerospace",
                    username: "james_aero",
                    email: "james@aerocollectors.com",
                    company: "Aero Collectors Inc."
                },
                amount: 18500,
                time: "2023-11-28T15:25:00",
                status: "Winner",
                ip: "49.36.178.105"
            },
            {
                id: "B002",
                bidder: {
                    id: 2,
                    name: "Sky Museum",
                    username: "sky_museum",
                    email: "contact@skymuseum.org",
                    company: "Sky Museum Foundation"
                },
                amount: 17500,
                time: "2023-11-28T15:28:00",
                status: "Outbid",
                ip: "76.89.123.45"
            },
            {
                id: "B003",
                bidder: {
                    id: 3,
                    name: "Aviation Heritage",
                    username: "av_heritage",
                    email: "info@aviationheritage.com",
                    company: "Aviation Heritage Ltd."
                },
                amount: 16200,
                time: "2023-11-27T12:30:00",
                status: "Outbid",
                ip: "112.203.78.91"
            },
            {
                id: "B004",
                bidder: {
                    id: 1,
                    name: "James Aerospace",
                    username: "james_aero",
                    email: "james@aerocollectors.com",
                    company: "Aero Collectors Inc."
                },
                amount: 12500,
                time: "2023-11-25T11:45:00",
                status: "Outbid",
                ip: "49.36.178.105"
            },
            {
                id: "B005",
                bidder: {
                    id: 2,
                    name: "Sky Museum",
                    username: "sky_museum",
                    email: "contact@skymuseum.org",
                    company: "Sky Museum Foundation"
                },
                amount: 12000,
                time: "2023-11-24T14:15:00",
                status: "Outbid",
                ip: "76.89.123.45"
            },
            {
                id: "B006",
                bidder: {
                    id: 1,
                    name: "James Aerospace",
                    username: "james_aero",
                    email: "james@aerocollectors.com",
                    company: "Aero Collectors Inc."
                },
                amount: 8000,
                time: "2023-11-20T14:22:00",
                status: "Outbid",
                ip: "49.36.178.105"
            }
        ]
    },
    {
        id: "BH351289",
        auctionId: "AV351289",
        auctionTitle: "Pratt & Whitney JT9D Engine",
        category: "Engines & Parts",
        auctionType: "Standard Auction",
        startTime: "2023-12-01T09:00:00",
        endTime: "2023-12-15T14:00:00",
        startingBid: 25000,
        winningBid: 42750,
        status: "Completed",
        bids: [
            {
                id: "B007",
                bidder: {
                    id: 4,
                    name: "Global Air Services",
                    username: "global_air",
                    email: "purchasing@globalairservices.com",
                    company: "Global Air Services LLC"
                },
                amount: 42750,
                time: "2023-12-15T13:55:00",
                status: "Winner",
                ip: "203.78.112.45"
            },
            {
                id: "B008",
                bidder: {
                    id: 5,
                    name: "AeroParts Direct",
                    username: "aero_parts",
                    email: "bids@aeropartsdirect.com",
                    company: "AeroParts Direct Inc."
                },
                amount: 41500,
                time: "2023-12-15T13:50:00",
                status: "Outbid",
                ip: "89.45.167.203"
            },
            {
                id: "B009",
                bidder: {
                    id: 6,
                    name: "Pacific Aviation",
                    username: "pacific_av",
                    email: "procurement@pacificav.com",
                    company: "Pacific Aviation Group"
                },
                amount: 39800,
                time: "2023-12-14T10:15:00",
                status: "Outbid",
                ip: "112.67.189.34"
            },
            {
                id: "B010",
                bidder: {
                    id: 4,
                    name: "Global Air Services",
                    username: "global_air",
                    email: "purchasing@globalairservices.com",
                    company: "Global Air Services LLC"
                },
                amount: 35500,
                time: "2023-12-10T11:22:00",
                status: "Outbid",
                ip: "203.78.112.45"
            },
            {
                id: "B011",
                bidder: {
                    id: 4,
                    name: "Global Air Services",
                    username: "global_air",
                    email: "purchasing@globalairservices.com",
                    company: "Global Air Services LLC"
                },
                amount: 30000,
                time: "2023-12-05T16:18:00",
                status: "Outbid",
                ip: "203.78.112.45"
            }
        ]
    },
    {
        id: "BH498712",
        auctionId: "AV498712",
        auctionTitle: "Rare WWII P-51 Mustang Propeller",
        category: "Aviation Memorabilia",
        auctionType: "Reserve Auction",
        startTime: "2023-11-20T11:00:00",
        endTime: "2023-12-05T16:45:00",
        startingBid: 8000,
        winningBid: 22500,
        status: "Completed",
        bids: [
            {
                id: "B012",
                bidder: {
                    id: 7,
                    name: "Warbird Restorations",
                    username: "warbird_restore",
                    email: "contact@warbirdrestorations.com",
                    company: "Warbird Restorations Ltd."
                },
                amount: 22500,
                time: "2023-12-05T16:40:00",
                status: "Winner",
                ip: "145.89.203.78"
            },
            {
                id: "B013",
                bidder: {
                    id: 8,
                    name: "Aviation History Museum",
                    username: "aviation_museum",
                    email: "acquisitions@aviationhistory.org",
                    company: "Aviation History Museum"
                },
                amount: 22000,
                time: "2023-12-05T16:38:00",
                status: "Outbid",
                ip: "167.89.145.23"
            },
            {
                id: "B014",
                bidder: {
                    id: 9,
                    name: "Private Collector",
                    username: "aviation_collector",
                    email: "collector@aviationantiques.com"
                },
                amount: 19500,
                time: "2023-12-03T14:20:00",
                status: "Outbid",
                ip: "201.78.156.89"
            },
            {
                id: "B015",
                bidder: {
                    id: 7,
                    name: "Warbird Restorations",
                    username: "warbird_restore",
                    email: "contact@warbirdrestorations.com",
                    company: "Warbird Restorations Ltd."
                },
                amount: 18000,
                time: "2023-12-01T10:45:00",
                status: "Outbid",
                ip: "145.89.203.78"
            },
            {
                id: "B016",
                bidder: {
                    id: 7,
                    name: "Warbird Restorations",
                    username: "warbird_restore",
                    email: "contact@warbirdrestorations.com",
                    company: "Warbird Restorations Ltd."
                },
                amount: 12000,
                time: "2023-11-25T15:30:00",
                status: "Outbid",
                ip: "145.89.203.78"
            }
        ]
    }
];

function BidHistory() {
    const [selectedAuction, setSelectedAuction] = useState(bidHistoryData[0]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

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
        switch(category) {
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
            Outbid: { class: "bg-gray-100 text-gray-800", text: "Outbid" },
            Retracted: { class: "bg-red-100 text-red-800", text: "Retracted" },
            Active: { class: "bg-blue-100 text-blue-800", text: "Active" }
        };
        
        const config = statusConfig[status] || statusConfig.Outbid;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>{config.text}</span>;
    };

    // Filter bids based on selected filters
    const filteredBids = selectedAuction.bids.filter(bid => {
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
    });

    const exportToCSV = () => {
        // In a real application, this would generate and download a CSV file
        toast.success("Bid history exported successfully");
    };

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
                            value={selectedAuction.id}
                            onChange={(e) => setSelectedAuction(bidHistoryData.find(a => a.id === e.target.value))}
                        >
                            {bidHistoryData.map(auction => (
                                <option key={auction.id} value={auction.id}>
                                    {auction.auctionTitle} - {formatCurrency(auction.winningBid)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Auction Summary Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {getCategoryIcon(selectedAuction.category)}
                                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                        {selectedAuction.category}
                                    </span>
                                    <span className={`text-sm font-medium px-2 py-1 rounded-md ${
                                        selectedAuction.auctionType === "Reserve Auction" 
                                            ? "bg-purple-100 text-purple-800" 
                                            : "bg-blue-100 text-blue-800"
                                    }`}>
                                        {selectedAuction.auctionType}
                                    </span>
                                    <span className={`text-sm font-medium px-2 py-1 rounded-md ${
                                        selectedAuction.status === "Completed" 
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
                                        <option value="Retracted">Retracted</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-500" />
                                    <input
                                        type="date"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                        placeholder="Start date"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="date"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                        placeholder="End date"
                                    />
                                </div>
                                
                                <button 
                                    onClick={exportToCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    <Download size={18} />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bids Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Bid History</h3>
                            <div className="text-sm text-gray-500">
                                Showing {filteredBids.length} of {selectedAuction.bids.length} bids
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Time</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBids.map((bid) => (
                                        <tr key={bid.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User size={18} className="text-gray-500" />
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
                                                    <div className="text-gray-500">{formatTime(bid.time)}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-900">{bid.ip}</td>
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