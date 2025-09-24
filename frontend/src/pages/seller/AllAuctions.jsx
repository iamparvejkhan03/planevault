import { useEffect, useState } from "react";
import { LoadingSpinner, SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import toast from "react-hot-toast";
import axios from "axios";
import { Clock, Gavel, TrendingUp, Users, DollarSign, Eye, Award, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const auctionStats = [
    {
        title: "Active Auctions",
        value: "12",
        change: "+3",
        icon: <Gavel size={24} />,
        trend: "up"
    },
    {
        title: "Total Bids",
        value: "1,452",
        change: "+210",
        icon: <TrendingUp size={24} />,
        trend: "up"
    },
    {
        title: "Highest Bid",
        value: "2,850",
        change: "+320",
        icon: <DollarSign size={24} />,
        trend: "up",
        currency: "$"
    },
    {
        title: "Items Ending Soon",
        value: "7",
        change: "-2",
        icon: <Clock size={24} />,
        trend: "down"
    }
];

const auctionData = [
    {
        id: "KP267400",
        title: "Cherry Delight",
        initialPrice: 90.50,
        currentBid: 125.75,
        bids: 24,
        watchers: 42,
        startTime: "2023-12-05T00:00:00",
        endTime: "2023-12-19T00:00:00",
        status: "active",
        category: "Dessert"
    },
    {
        id: "T1651535",
        title: "Vintage Leather Jacket",
        initialPrice: 120.00,
        currentBid: 156.00,
        bids: 12,
        watchers: 18,
        startTime: "2023-12-02T00:00:00",
        endTime: "2023-12-20T00:00:00",
        status: "active",
        category: "Fashion"
    },
    {
        id: "GB651535",
        title: "Mango Magic Collection",
        initialPrice: 100.50,
        currentBid: 100.50,
        bids: 0,
        watchers: 7,
        startTime: "2023-12-01T00:00:00",
        endTime: "2023-12-22T00:00:00",
        status: "upcoming",
        category: "Food"
    },
    {
        id: "ER651535",
        title: "Joy Care Package",
        initialPrice: 59.99,
        currentBid: 89.50,
        bids: 15,
        watchers: 23,
        startTime: "2023-11-28T00:00:00",
        endTime: "2023-12-15T00:00:00",
        status: "ending_soon",
        category: "Care"
    },
    {
        id: "SD487441",
        title: "Blueberry Bliss Basket",
        initialPrice: 150.90,
        currentBid: 210.25,
        bids: 31,
        watchers: 56,
        startTime: "2023-11-25T00:00:00",
        endTime: "2023-12-10T00:00:00",
        status: "active",
        category: "Dessert"
    },
    {
        id: "TL449003",
        title: "Artisanal Olive Oil",
        initialPrice: 35.50,
        currentBid: 52.75,
        bids: 9,
        watchers: 14,
        startTime: "2023-12-03T00:00:00",
        endTime: "2023-12-17T00:00:00",
        status: "active",
        category: "Food"
    }
];

function AllAuctions() {
    const [auctions, setAuctions] = useState(auctionData);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");

    // In a real app, this would fetch from your API
    useEffect(() => {
        const fetchAuctions = async () => {
            setLoading(true);
            try {
                // Simulate API call
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            } catch (error) {
                toast.error("Failed to load auctions");
                setLoading(false);
            }
        };
        
        fetchAuctions();
    }, []);

    const filteredAuctions = filter === "all" 
        ? auctions 
        : auctions.filter(auction => auction.status === filter);

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { class: "bg-green-100 text-green-800", text: "Active" },
            upcoming: { class: "bg-blue-100 text-blue-800", text: "Upcoming" },
            ending_soon: { class: "bg-amber-100 text-amber-800", text: "Ending Soon" },
            completed: { class: "bg-gray-100 text-gray-800", text: "Completed" }
        };
        
        const config = statusConfig[status] || statusConfig.active;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>{config.text}</span>;
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
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
        if (diffHours > 0) return `${diffHours}h left`;
        return "Ending soon";
    };

    return (
        <section className="flex min-h-[70vh]">
            <SellerSidebar />
            
            <div className="w-full relative">
                <SellerHeader />
                
                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Live Auctions</h2>
                        <p className="text-secondary">Monitor and manage your active auctions in real-time.</p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                            {stat.change} from yesterday
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button 
                            onClick={() => setFilter("all")} 
                            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"}`}
                        >
                            All Auctions
                        </button>
                        <button 
                            onClick={() => setFilter("active")} 
                            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => setFilter("upcoming")} 
                            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "upcoming" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
                        >
                            Upcoming
                        </button>
                        <button 
                            onClick={() => setFilter("ending_soon")} 
                            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === "ending_soon" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"}`}
                        >
                            Ending Soon
                        </button>
                    </div>

                    {/* Auctions Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Price</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Bid</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watchers</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ends In</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredAuctions.map((auction) => (
                                            <tr key={auction.id} className="hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <Award size={18} className="text-gray-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-gray-900">{auction.title}</div>
                                                            <div className="text-sm text-gray-500">#{auction.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-900">${auction.initialPrice.toFixed(2)}</td>
                                                <td className="py-4 px-6 text-sm font-medium text-green-600">${auction.currentBid.toFixed(2)}</td>
                                                <td className="py-4 px-6 text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <Gavel size={14} className="mr-1 text-gray-500" />
                                                        {auction.bids}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <Eye size={14} className="mr-1 text-gray-500" />
                                                        {auction.watchers}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-900">{formatTimeLeft(auction.endTime)}</td>
                                                <td className="py-4 px-6 text-sm">
                                                    {getStatusBadge(auction.status)}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-primary hover:text-primary-dark">
                                                            View
                                                        </button>
                                                        <button className="text-blue-600 hover:text-blue-800">
                                                            Edit
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-800">
                                                            End
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {filteredAuctions.length === 0 && (
                                    <div className="text-center py-12">
                                        <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No auctions found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 mb-16">
                        <div className="text-sm text-gray-500">
                            Showing {filteredAuctions.length} of {auctions.length} auctions
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="px-3 py-1 rounded-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-700">
                                1
                            </button>
                            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                2
                            </button>
                            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                3
                            </button>
                            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                    </div>
                </SellerContainer>
            </div>
        </section>
    );
}

export default AllAuctions;