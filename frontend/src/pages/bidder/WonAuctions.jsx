import { useState } from "react";
import { BidderContainer, BidderHeader, BidderSidebar } from "../../components";
import { Award, Trophy, Star, DollarSign, Calendar, MapPin, Truck, MessageCircle, Phone, Mail, Search, Filter, Download, Share2, Gift, Zap, Clock, Users, TrendingUp } from "lucide-react";

// Mock data for won auctions
const wonAuctionsData = [
    {
        id: "AV267400",
        auctionId: "AU267400",
        title: "Vintage Boeing 747 Control Panel",
        description: "Fully restored cockpit control panel from a 1978 Boeing 747-200. Includes all original components and documentation.",
        category: "Aviation Memorabilia",
        finalBid: 18500,
        startingBid: 5000,
        yourMaxBid: 17500,
        winningBid: 18500,
        bids: 24,
        watchers: 42,
        endTime: "2023-12-19T15:30:00",
        winTime: "2023-12-19T15:28:00",
        image: "/api/placeholder/400/300",
        location: "Seattle, WA",
        seller: {
            name: "AeroCollectors Inc.",
            rating: 4.8,
            reviews: 127,
            memberSince: "2018"
        },
        condition: "Excellent",
        shipping: {
            cost: 250,
            estimatedDelivery: "5-7 business days",
            insurance: true
        },
        status: "payment_pending", // payment_pending, paid, shipped, delivered
        congratulatoryMessage: "Congratulations! You won this rare piece of aviation history!"
    },
    {
        id: "AV351289",
        auctionId: "AU351289",
        title: "Pratt & Whitney JT9D Engine",
        description: "Used Pratt & Whitney JT9D-7R4 turbofan engine with 50,000 hours total time. Complete with maintenance records.",
        category: "Engines & Parts",
        finalBid: 42750,
        startingBid: 25000,
        yourMaxBid: 42750,
        winningBid: 42750,
        bids: 12,
        watchers: 18,
        endTime: "2023-12-20T14:00:00",
        winTime: "2023-12-20T13:55:00",
        image: "/api/placeholder/400/300",
        location: "Miami, FL",
        seller: {
            name: "Global Air Services",
            rating: 4.5,
            reviews: 89,
            memberSince: "2019"
        },
        condition: "Good",
        shipping: {
            cost: 1200,
            estimatedDelivery: "10-14 business days",
            insurance: true
        },
        status: "paid",
        congratulatoryMessage: "Outstanding win! This engine is a fantastic addition to any collection."
    },
    {
        id: "AV498712",
        auctionId: "AU498712",
        title: "Rare WWII P-51 Mustang Propeller",
        description: "Authentic Hamilton Standard propeller from a North American P-51 Mustang. Museum quality preservation.",
        category: "Aviation Memorabilia",
        finalBid: 22500,
        startingBid: 8000,
        yourMaxBid: 22000,
        winningBid: 22500,
        bids: 31,
        watchers: 56,
        endTime: "2023-12-10T16:45:00",
        winTime: "2023-12-10T16:40:00",
        image: "/api/placeholder/400/300",
        location: "New York, NY",
        seller: {
            name: "Warbird Restorations",
            rating: 4.9,
            reviews: 203,
            memberSince: "2015"
        },
        condition: "Very Good",
        shipping: {
            cost: 350,
            estimatedDelivery: "3-5 business days",
            insurance: true
        },
        status: "shipped",
        trackingNumber: "1Z987XYZ654321",
        congratulatoryMessage: "Historic win! This propeller is a true piece of aviation heritage."
    },
    {
        id: "AV672341",
        auctionId: "AU672341",
        title: "Vintage Pilot Uniform Collection",
        description: "Complete set of 1960s pilot uniform with hat, jacket, and accessories. Perfect condition.",
        category: "Aviation Memorabilia",
        finalBid: 3200,
        startingBid: 1500,
        yourMaxBid: 3000,
        winningBid: 3200,
        bids: 15,
        watchers: 23,
        endTime: "2023-12-15T12:00:00",
        winTime: "2023-12-15T11:58:00",
        image: "/api/placeholder/400/300",
        location: "Los Angeles, CA",
        seller: {
            name: "Vintage Aviation Co.",
            rating: 4.7,
            reviews: 156,
            memberSince: "2017"
        },
        condition: "Excellent",
        shipping: {
            cost: 45,
            estimatedDelivery: "2-3 business days",
            insurance: false
        },
        status: "delivered",
        deliveredDate: "2023-12-18T14:30:00",
        congratulatoryMessage: "Fantastic win! This uniform collection is in impeccable condition."
    }
];

function WonAuctions() {
    const [auctions, setAuctions] = useState(wonAuctionsData);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);

    const filteredAuctions = auctions
        .filter(auction => {
            const matchesStatus = filter === "all" || auction.status === filter;
            const matchesSearch = searchTerm === "" || 
                auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                auction.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => new Date(b.winTime) - new Date(a.winTime));

    const getStatusConfig = (status) => {
        const config = {
            payment_pending: { 
                icon: <Clock className="text-amber-600" size={16} />, 
                text: "Payment Pending", 
                bgColor: "bg-amber-50", 
                textColor: "text-amber-700",
                badgeColor: "bg-amber-500"
            },
            paid: { 
                icon: <DollarSign className="text-blue-600" size={16} />, 
                text: "Payment Received", 
                bgColor: "bg-blue-50", 
                textColor: "text-blue-700",
                badgeColor: "bg-blue-500"
            },
            shipped: { 
                icon: <Truck className="text-purple-600" size={16} />, 
                text: "Shipped", 
                bgColor: "bg-purple-50", 
                textColor: "text-purple-700",
                badgeColor: "bg-purple-500"
            },
            delivered: { 
                icon: <Award className="text-green-600" size={16} />, 
                text: "Delivered", 
                bgColor: "bg-green-50", 
                textColor: "text-green-700",
                badgeColor: "bg-green-500"
            }
        };
        return config[status] || config.payment_pending;
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
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Statistics
    const totalWon = auctions.length;
    const totalSpent = auctions.reduce((sum, auction) => sum + auction.finalBid, 0);
    const averageSavings = auctions.reduce((sum, auction) => sum + (auction.startingBid / auction.finalBid), 0) / auctions.length;
    const recentWins = auctions.filter(auction => {
        const winDate = new Date(auction.winTime);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return winDate > weekAgo;
    }).length;

    const openContactModal = (auction) => {
        setSelectedAuction(auction);
        setShowContactModal(true);
    };

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
                                <p className="text-secondary text-lg">Celebrate your winning bids and manage your acquisitions</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                    {totalWon} Triumphant Wins!
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
                                    <p className="text-3xl font-bold mt-1">{totalWon}</p>
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
                                    <p className="text-3xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
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
                                    <p className="text-3xl font-bold mt-1">{recentWins}</p>
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
                                    <p className="text-3xl font-bold mt-1">{((1 - averageSavings) * 100).toFixed(1)}%</p>
                                    <p className="text-purple-200 text-xs mt-1">Over Starting Bid</p>
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
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search your won auctions..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => setFilter("all")} 
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === "all" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    All Wins
                                </button>
                                <button 
                                    onClick={() => setFilter("payment_pending")} 
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === "payment_pending" ? "bg-amber-100 text-amber-800 border border-amber-200 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    Payment Due
                                </button>
                                <button 
                                    onClick={() => setFilter("shipped")} 
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === "shipped" ? "bg-purple-100 text-purple-800 border border-purple-200 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    In Transit
                                </button>
                                <button 
                                    onClick={() => setFilter("delivered")} 
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === "delivered" ? "bg-green-100 text-green-800 border border-green-200 shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    Delivered
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Won Auctions Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
                        {filteredAuctions.map((auction) => (
                            <div key={auction.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-all duration-300">
                                {/* Status Ribbon */}
                                <div className={`h-2 ${getStatusConfig(auction.status).badgeColor}`}></div>
                                
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                    {auction.category}
                                                </span>
                                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(auction.status).bgColor} ${getStatusConfig(auction.status).textColor}`}>
                                                    {getStatusConfig(auction.status).icon}
                                                    {getStatusConfig(auction.status).text}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{auction.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">{formatCurrency(auction.finalBid)}</div>
                                            <div className="text-sm text-gray-500">Winning Bid</div>
                                        </div>
                                    </div>

                                    {/* Congratulations Message */}
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Star className="text-amber-500" size={20} fill="currentColor" />
                                            <p className="text-amber-800 font-medium">{auction.congratulatoryMessage}</p>
                                        </div>
                                    </div>

                                    {/* Auction Details */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Won On</p>
                                            <p className="font-semibold">{formatDate(auction.winTime)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Starting Bid</p>
                                            <p className="font-semibold text-blue-600">{formatCurrency(auction.startingBid)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Your Max Bid</p>
                                            <p className="font-semibold">{formatCurrency(auction.yourMaxBid)}</p>
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
                                                        <Star size={12} className="text-amber-500" fill="currentColor" />
                                                        {auction.seller.rating} ({auction.seller.reviews} reviews)
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
                                        {auction.status === "payment_pending" && (
                                            <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all">
                                                Pay Now
                                            </button>
                                        )}
                                        {auction.status === "shipped" && (
                                            <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all">
                                                Track Package
                                            </button>
                                        )}
                                        {auction.status === "delivered" && (
                                            <button className="flex-1 bg-gradient-to-r from-gray-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-blue-700 transition-all">
                                                Leave Review
                                            </button>
                                        )}
                                        <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredAuctions.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Award size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No won auctions yet</h3>
                            <p className="text-gray-500 mb-6">Start bidding on aviation auctions to see your wins here!</p>
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                                Browse Active Auctions
                            </button>
                        </div>
                    )}

                    {/* Contact Seller Modal */}
                    {showContactModal && selectedAuction && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Contact Seller</h3>
                                    <p className="text-gray-600 text-sm">Reach out to {selectedAuction.seller.name}</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <button className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Mail size={20} className="text-blue-600" />
                                        <span>Send Email</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <MessageCircle size={20} className="text-green-600" />
                                        <span>Send Message</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Phone size={20} className="text-purple-600" />
                                        <span>Request Callback</span>
                                    </button>
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