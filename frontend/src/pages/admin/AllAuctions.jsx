import { useState } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import { Search, Filter, Gavel, DollarSign, Clock, Eye, Edit, Shield, TrendingUp, User, Award, MoreVertical, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { about } from "../../assets";

// Mock auctions data
const auctionsData = [
    {
        id: "AV267400",
        title: "Vintage Boeing 747 Control Panel",
        seller: "AeroVendors Inc.",
        category: "Aviation Memorabilia",
        currentBid: 18500,
        startingBid: 5000,
        bids: 24,
        watchers: 42,
        startDate: "2023-12-05",
        endDate: "2023-12-19",
        status: "active", // active, pending, ended, suspended
        condition: "Excellent",
        featured: true,
        approved: true,
        image: about
    },
    {
        id: "AV351289",
        title: "Pratt & Whitney JT9D Engine",
        seller: "Global Air Services",
        category: "Engines & Parts",
        currentBid: 42750,
        startingBid: 25000,
        bids: 12,
        watchers: 18,
        startDate: "2023-12-02",
        endDate: "2023-12-20",
        status: "active",
        condition: "Good",
        featured: false,
        approved: true,
        image: about
    },
    {
        id: "AV498712",
        title: "Rare WWII P-51 Mustang Propeller",
        seller: "Warbird Restorations",
        category: "Aviation Memorabilia",
        currentBid: 22500,
        startingBid: 8000,
        bids: 31,
        watchers: 56,
        startDate: "2023-11-25",
        endDate: "2023-12-10",
        status: "ended",
        condition: "Very Good",
        featured: true,
        approved: true,
        image: about
    },
    {
        id: "AV672341",
        title: "Vintage Pilot Uniform Collection",
        seller: "Vintage Aviation Co.",
        category: "Aviation Memorabilia",
        currentBid: 3200,
        startingBid: 1500,
        bids: 15,
        watchers: 23,
        startDate: "2023-12-15",
        endDate: "2023-12-25",
        status: "pending",
        condition: "Excellent",
        featured: false,
        approved: false,
        image: about
    },
    {
        id: "AV783452",
        title: "Aircraft Navigation System",
        seller: "TechRestorations Ltd.",
        category: "Aircraft Parts",
        currentBid: 8900,
        startingBid: 5000,
        bids: 8,
        watchers: 14,
        startDate: "2023-12-03",
        endDate: "2023-12-17",
        status: "suspended",
        condition: "Good",
        featured: false,
        approved: true,
        image: about
    },
    {
        id: "AV894563",
        title: "Rare Aviation Books Collection",
        seller: "Aviation Heritage",
        category: "Aviation Memorabilia",
        currentBid: 1850,
        startingBid: 800,
        bids: 9,
        watchers: 32,
        startDate: "2023-12-01",
        endDate: "2023-12-22",
        status: "active",
        condition: "Very Good",
        featured: false,
        approved: true,
        image: about
    }
];

function AllAuctions() {
    const [auctions, setAuctions] = useState(auctionsData);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredAuctions = auctions.filter(auction => {
        const matchesSearch = searchTerm === "" || 
            auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            auction.seller.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || auction.status === filter;
        return matchesSearch && matchesFilter;
    });

    const openAuctionModal = (auction) => {
        setSelectedAuction(auction);
        setIsModalOpen(true);
    };

    const closeAuctionModal = () => {
        setIsModalOpen(false);
        setSelectedAuction(null);
    };

    const approveAuction = (auctionId) => {
        setAuctions(auctions.map(auction => 
            auction.id === auctionId ? { ...auction, approved: true, status: "active" } : auction
        ));
    };

    const suspendAuction = (auctionId) => {
        setAuctions(auctions.map(auction => 
            auction.id === auctionId ? { ...auction, status: "suspended" } : auction
        ));
    };

    const deleteAuction = (auctionId) => {
        if (window.confirm("Are you sure you want to delete this auction? This action cannot be undone.")) {
            setAuctions(auctions.filter(auction => auction.id !== auctionId));
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { color: "bg-green-100 text-green-800", text: "Active" },
            pending: { color: "bg-amber-100 text-amber-800", text: "Pending" },
            ended: { color: "bg-gray-100 text-gray-800", text: "Ended" },
            suspended: { color: "bg-red-100 text-red-800", text: "Suspended" }
        };
        const { color, text } = config[status];
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
    };

    const getApprovalBadge = (approved) => {
        return approved ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Approved
            </span>
        ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Awaiting Approval
            </span>
        );
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
            day: 'numeric'
        });
    };

    const auctionStats = {
        total: auctions.length,
        active: auctions.filter(a => a.status === 'active').length,
        pending: auctions.filter(a => a.status === 'pending').length,
        featured: auctions.filter(a => a.featured).length
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
                                    {filteredAuctions.length} auctions found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{auctionStats.total}</div>
                            <div className="text-sm text-gray-500">Total Auctions</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">{auctionStats.active}</div>
                            <div className="text-sm text-gray-500">Active</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-amber-600">{auctionStats.pending}</div>
                            <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-purple-600">{auctionStats.featured}</div>
                            <div className="text-sm text-gray-500">Featured</div>
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
                                        placeholder="Search auctions by title or seller..."
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
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auctions Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">All Auctions</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Bid</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids/Watchers</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAuctions.map((auction) => (
                                        <tr key={auction.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <img 
                                                        src={auction.image} 
                                                        alt={auction.title} 
                                                        className="w-10 h-10 rounded-lg object-cover mr-3"
                                                    />
                                                    <div>
                                                        <div 
                                                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                                            onClick={() => openAuctionModal(auction)}
                                                        >
                                                            {auction.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{auction.category}</div>
                                                        {auction.featured && (
                                                            <span className="inline-block mt-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-900">{auction.seller}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-lg font-bold text-green-600">
                                                    {formatCurrency(auction.currentBid)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Start: {formatCurrency(auction.startingBid)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Gavel size={14} className="text-gray-400" />
                                                        <span>{auction.bids}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Eye size={14} className="text-gray-400" />
                                                        <span>{auction.watchers}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    {getStatusBadge(auction.status)}
                                                    {getApprovalBadge(auction.approved)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => openAuctionModal(auction)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    
                                                    {auction.status === "pending" && (
                                                        <button 
                                                            onClick={() => approveAuction(auction.id)}
                                                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                                                            title="Approve Auction"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    
                                                    {auction.status === "active" && (
                                                        <button 
                                                            onClick={() => suspendAuction(auction.id)}
                                                            className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                                                            title="Suspend Auction"
                                                        >
                                                            <AlertTriangle size={16} />
                                                        </button>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => deleteAuction(auction.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                        title="Delete Auction"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {filteredAuctions.length === 0 && (
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
                        </div>
                    </div>

                    {/* Auction Detail Modal */}
                    {isModalOpen && selectedAuction && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                                            src={selectedAuction.image} 
                                            alt={selectedAuction.title} 
                                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">{selectedAuction.title}</h4>
                                                {selectedAuction.featured && (
                                                    <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {getStatusBadge(selectedAuction.status)}
                                                {getApprovalBadge(selectedAuction.approved)}
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {selectedAuction.category}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">Condition: {selectedAuction.condition}</p>
                                        </div>
                                    </div>

                                    {/* Auction Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Auction Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Current Bid</span>
                                                    <span className="font-bold text-green-600">{formatCurrency(selectedAuction.currentBid)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Starting Bid</span>
                                                    <span className="font-medium">{formatCurrency(selectedAuction.startingBid)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Total Bids</span>
                                                    <span className="font-medium">{selectedAuction.bids}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Watchers</span>
                                                    <span className="font-medium">{selectedAuction.watchers}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Timeline</h5>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Start Date</span>
                                                    <span className="font-medium">{formatDate(selectedAuction.startDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">End Date</span>
                                                    <span className="font-medium">{formatDate(selectedAuction.endDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Seller</span>
                                                    <span className="font-medium">{selectedAuction.seller}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                            View Full Auction
                                        </button>
                                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                            Contact Seller
                                        </button>
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