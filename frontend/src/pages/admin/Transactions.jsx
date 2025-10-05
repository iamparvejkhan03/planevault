import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Calendar, Download, BarChart3, User, DollarSign, TrendingUp, CreditCard, Shield, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import { toast } from "react-hot-toast";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components/index.js";

function Transactions() {
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [filterOptions, setFilterOptions] = useState({});

    // Filters
    const [filters, setFilters] = useState({
        status: "all",
        type: "all",
        dateRange: "all",
        search: "",
        sortBy: "recent"
    });

    // Fetch all data once on component mount
    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [transactionsResponse, statsResponse] = await Promise.all([
                axiosInstance.get(`/api/v1/admin/transactions`),
                axiosInstance.get('/api/v1/admin/transactions/stats')
            ]);

            if (transactionsResponse.data.success) {
                setAllTransactions(transactionsResponse.data.data.transactions);
                setFilteredTransactions(transactionsResponse.data.data.transactions);
                setFilterOptions(transactionsResponse.data.data.filterOptions);
                if (transactionsResponse.data.data.transactions.length > 0) {
                    setSelectedTransaction(transactionsResponse.data.data.transactions[0]);
                }
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

        } catch (error) {
            console.error('Fetch transactions error:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    // Apply filters locally
    const applyFilters = useMemo(() => {
        return () => {
            let filtered = [...allTransactions];

            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(transaction => 
                    transaction.transactionId.toLowerCase().includes(searchTerm) ||
                    transaction.paymentIntentId.toLowerCase().includes(searchTerm) ||
                    transaction.auction.title.toLowerCase().includes(searchTerm) ||
                    transaction.bidder.name.toLowerCase().includes(searchTerm) ||
                    transaction.bidder.username.toLowerCase().includes(searchTerm) ||
                    transaction.bidder.email.toLowerCase().includes(searchTerm)
                );
            }

            // Status filter
            if (filters.status !== "all") {
                filtered = filtered.filter(transaction => transaction.status === filters.status);
            }

            // Type filter
            if (filters.type !== "all") {
                filtered = filtered.filter(transaction => transaction.type === filters.type);
            }

            // Date range filter
            if (filters.dateRange !== "all") {
                const now = new Date();
                let startDate;
                
                switch(filters.dateRange) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0));
                        break;
                    case 'week':
                        startDate = new Date(now.setDate(now.getDate() - 7));
                        break;
                    case 'month':
                        startDate = new Date(now.setMonth(now.getMonth() - 1));
                        break;
                    case 'year':
                        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                        break;
                }
                
                if (startDate) {
                    filtered = filtered.filter(transaction => 
                        new Date(transaction.createdAt) >= startDate
                    );
                }
            }

            // Apply sorting
            filtered.sort((a, b) => {
                switch(filters.sortBy) {
                    case "recent":
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case "oldest":
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    case "amount_high":
                        return b.amount - a.amount;
                    case "amount_low":
                        return a.amount - b.amount;
                    case "bidder_name":
                        return a.bidder.name.localeCompare(b.bidder.name);
                    default:
                        return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });

            return filtered;
        };
    }, [allTransactions, filters]);

    // Update filtered transactions when filters change
    useEffect(() => {
        if (allTransactions.length > 0) {
            const filtered = applyFilters();
            setFilteredTransactions(filtered);
            
            // Update selected transaction if it's no longer in filtered list
            if (selectedTransaction && !filtered.find(t => t.id === selectedTransaction.id)) {
                setSelectedTransaction(filtered.length > 0 ? filtered[0] : null);
            }
        }
    }, [applyFilters, allTransactions.length, selectedTransaction]);

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
            type: "all",
            dateRange: "all",
            search: "",
            sortBy: "recent"
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // No API call needed - filters are applied automatically
        }
    };

    // Helper functions
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

    const getStatusIcon = (status) => {
        switch(status) {
            case 'succeeded':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'created':
                return <Clock size={16} className="text-blue-600" />;
            case 'requires_capture':
                return <Shield size={16} className="text-yellow-600" />;
            case 'canceled':
                return <XCircle size={16} className="text-red-600" />;
            case 'processing_failed':
                return <AlertCircle size={16} className="text-red-600" />;
            default:
                return <Clock size={16} className="text-gray-600" />;
        }
    };

    const getStatusBadge = (transaction) => {
        const statusConfig = {
            succeeded: { class: "bg-green-100 text-green-800", text: "Completed" },
            created: { class: "bg-blue-100 text-blue-800", text: "Pending" },
            requires_capture: { class: "bg-yellow-100 text-yellow-800", text: "Awaiting Capture" },
            canceled: { class: "bg-red-100 text-red-800", text: "Canceled" },
            processing_failed: { class: "bg-red-100 text-red-800", text: "Failed" }
        };

        const config = statusConfig[transaction.status] || statusConfig.created;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class} flex items-center gap-1`}>
                {getStatusIcon(transaction.status)}
                {config.text}
            </span>
        );
    };

    // Stats cards configuration
    const statCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(stats.overall?.totalRevenue || 0),
            change: "All Time",
            icon: <DollarSign size={24} />,
            color: "green"
        },
        {
            title: "Total Transactions",
            value: stats.overall?.totalTransactions?.toString() || "0",
            change: "Completed Payments",
            icon: <CreditCard size={24} />,
            color: "blue"
        },
        {
            title: "Average Transaction",
            value: formatCurrency(stats.overall?.averageTransaction || 0),
            change: "Per Payment",
            icon: <TrendingUp size={24} />,
            color: "purple"
        },
        // {
        //     title: "Recent Transactions",
        //     value: stats?.recentActivity[0]?.transactionCount || "0",
        //     change: "Last 24 Hours",
        //     icon: <BarChart3 size={24} />,
        //     color: "orange"
        // }
    ];

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="max-w-full pt-16 pb-7 md:pt-0">
                            <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Transactions</h2>
                            <p className="text-gray-600">Loading transaction data...</p>
                        </div>
                        <div className="flex justify-center items-center h-64">
                            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> */}
                            <LoadingSpinner />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Transactions</h2>
                        <p className="text-gray-600">Monitor all payment transactions and revenue.</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search transactions, users, auctions..."
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
                                    {/* <option value="all">All Status</option> */}
                                    {filterOptions.statuses?.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.dateRange}
                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                >
                                    {/* <option value="all">All Time</option> */}
                                    {filterOptions.dateRanges?.map(range => (
                                        <option key={range.value} value={range.value}>
                                            {range.label}
                                        </option>
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
                                    <option value="oldest">Oldest First</option>
                                    <option value="amount_high">Amount (High to Low)</option>
                                    <option value="amount_low">Amount (Low to High)</option>
                                    <option value="bidder_name">Bidder Name</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredTransactions.length} of {allTransactions.length} transactions
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Transactions Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Transactions ({filteredTransactions.length})</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {filteredTransactions.map(transaction => (
                                        <div
                                            key={transaction.id}
                                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                                selectedTransaction?.id === transaction.id ? 'bg-blue-50 border-blue-200' : ''
                                            }`}
                                            onClick={() => setSelectedTransaction(transaction)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium text-gray-900 text-sm">
                                                            {transaction.transactionId}
                                                        </h4>
                                                        <span className="text-sm font-semibold text-green-600">
                                                            {formatCurrency(transaction.amount)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                                        {transaction.auction.title}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            {transaction.bidder.name}
                                                        </span>
                                                        {getStatusBadge(transaction)}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Selected Transaction Details */}
                        <div className="lg:col-span-2">
                            {selectedTransaction ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    {/* Transaction Header */}
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">{selectedTransaction.transactionId}</h2>
                                                <p className="text-sm text-gray-600">Payment Intent: {selectedTransaction.paymentIntentId}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {formatCurrency(selectedTransaction.amount)}
                                                </div>
                                                {getStatusBadge(selectedTransaction)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Bidder Information */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-900 mb-3">Bidder Information</h3>
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Name</div>
                                                        <div className="font-medium">{selectedTransaction.bidder.name}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Username</div>
                                                        <div className="font-medium">@{selectedTransaction.bidder.username}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Email</div>
                                                        <div className="font-medium">{selectedTransaction.bidder.email}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Company</div>
                                                        <div className="font-medium">{selectedTransaction.bidder.company}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Auction Information */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-900 mb-3">Auction Information</h3>
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Auction Title</div>
                                                        <div className="font-medium line-clamp-2">{selectedTransaction.auction.title}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Category</div>
                                                        <div className="font-medium">{selectedTransaction.auction.category}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Status</div>
                                                        <div className="font-medium capitalize">{selectedTransaction.auction.status}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Bid Amount</div>
                                                        <div className="font-medium">{formatCurrency(selectedTransaction.bidAmount)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <div className="text-sm text-gray-600">Commission</div>
                                                    <div className="font-medium">{formatCurrency(selectedTransaction.commissionAmount)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Total Amount</div>
                                                    <div className="font-medium text-green-600">{formatCurrency(selectedTransaction.amount)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Created</div>
                                                    <div className="font-medium">{formatDate(selectedTransaction.createdAt)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Last Updated</div>
                                                    <div className="font-medium">{formatDate(selectedTransaction.updatedAt)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Timeline */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Transaction Timeline</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle size={16} className="text-green-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">Payment Created</div>
                                                    <div className="text-sm text-gray-500">{formatDate(selectedTransaction.createdAt)} at {formatTime(selectedTransaction.createdAt)}</div>
                                                </div>
                                            </div>
                                            {selectedTransaction.chargeAttempted && (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <CreditCard size={16} className="text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">Charge Attempted</div>
                                                        <div className="text-sm text-gray-500">
                                                            {selectedTransaction.chargeSucceeded ? 'Successfully charged' : 'Charge failed'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedTransaction.status === 'succeeded' && (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">Payment Completed</div>
                                                        <div className="text-sm text-gray-500">Transaction successfully processed</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Transaction Selected</h3>
                                    <p className="text-gray-500">Select a transaction from the list to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
}

export default Transactions;