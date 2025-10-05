import { useState, useEffect, useMemo } from "react";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import { Search, Filter, Mail, Phone, User, Clock, MessageSquare, Copy, CheckCircle, Trash2, Eye, AlertCircle, CheckCircle2, XCircle, X } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

function UserQueries() {
    const [allQueries, setAllQueries] = useState([]);
    const [filteredQueries, setFilteredQueries] = useState([]);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [filterOptions, setFilterOptions] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        status: "all",
        userType: "all",
        category: "all",
        priority: "all",
        dateRange: "all",
        search: "",
        sortBy: "recent"
    });

    // Fetch all data
    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [queriesResponse, statsResponse] = await Promise.all([
                axiosInstance.get(`/api/v1/contact/admin/queries`),
                axiosInstance.get('/api/v1/contact/admin/queries/stats')
            ]);

            if (queriesResponse.data.success) {
                setAllQueries(queriesResponse.data.data.queries);
                setFilteredQueries(queriesResponse.data.data.queries);
                setFilterOptions(queriesResponse.data.data.filterOptions);
                if (queriesResponse.data.data.queries.length > 0) {
                    setSelectedQuery(queriesResponse.data.data.queries[0]);
                }
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

        } catch (error) {
            console.error('Fetch user queries error:', error);
            toast.error('Failed to load user queries');
        } finally {
            setLoading(false);
        }
    };

    // Apply filters locally
    const applyFilters = useMemo(() => {
        return () => {
            let filtered = [...allQueries];

            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(query =>
                    query.name.toLowerCase().includes(searchTerm) ||
                    query.email.toLowerCase().includes(searchTerm) ||
                    query.queryId.toLowerCase().includes(searchTerm) ||
                    query.message.toLowerCase().includes(searchTerm)
                );
            }

            // Status filter
            if (filters.status !== "all") {
                filtered = filtered.filter(query => query.status === filters.status);
            }

            // User type filter
            if (filters.userType !== "all") {
                filtered = filtered.filter(query => query.userType === filters.userType);
            }

            // Category filter
            if (filters.category !== "all") {
                filtered = filtered.filter(query => query.category === filters.category);
            }

            // Priority filter
            if (filters.priority !== "all") {
                filtered = filtered.filter(query => query.priority === filters.priority);
            }

            // Date range filter
            if (filters.dateRange !== "all") {
                const now = new Date();
                let startDate;

                switch (filters.dateRange) {
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
                    filtered = filtered.filter(query =>
                        new Date(query.createdAt) >= startDate
                    );
                }
            }

            // Apply sorting
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case "recent":
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case "oldest":
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    case "priority":
                        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    case "name":
                        return a.name.localeCompare(b.name);
                    default:
                        return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });

            return filtered;
        };
    }, [allQueries, filters]);

    // Update filtered queries when filters change
    useEffect(() => {
        if (allQueries.length > 0) {
            const filtered = applyFilters();
            setFilteredQueries(filtered);

            if (selectedQuery && !filtered.find(q => q.id === selectedQuery.id)) {
                setSelectedQuery(filtered.length > 0 ? filtered[0] : null);
            }
        }
    }, [applyFilters, allQueries.length, selectedQuery]);

    // Initial fetch
    useEffect(() => {
        fetchAllData();
    }, []);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "all",
            userType: "all",
            category: "all",
            priority: "all",
            dateRange: "all",
            search: "",
            sortBy: "recent"
        });
    };

    const openQueryModal = (query) => {
        setSelectedQuery(query);
        setIsModalOpen(true);
    };

    const closeQueryModal = () => {
        setIsModalOpen(false);
        setSelectedQuery(null);
    };

    // Update query status
    const updateQueryStatus = async (queryId, newStatus) => {
        try {
            const { data } = await axiosInstance.put(`/api/v1/contact/admin/queries/${queryId}`, {
                status: newStatus
            });

            if (data.success) {
                // Update local state
                setAllQueries(prev => prev.map(query =>
                    query.id === queryId ? { ...query, status: newStatus } : query
                ));

                if (selectedQuery && selectedQuery.id === queryId) {
                    setSelectedQuery(prev => ({ ...prev, status: newStatus }));
                }

                toast.success('Query status updated successfully');
            }
        } catch (error) {
            console.error('Update query status error:', error);
            toast.error('Failed to update query status');
        }
    };

    // Delete query
    const deleteQuery = async (queryId) => {
        if (!window.confirm("Are you sure you want to delete this query? This action cannot be undone.")) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/contact/admin/queries/${queryId}`);

            if (data.success) {
                setAllQueries(prev => prev.filter(query => query.id !== queryId));

                if (selectedQuery && selectedQuery.id === queryId) {
                    setSelectedQuery(null);
                }

                toast.success('Query deleted successfully');
            }
        } catch (error) {
            console.error('Delete query error:', error);
            toast.error('Failed to delete query');
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getStatusBadge = (status) => {
        const config = {
            new: { color: "bg-blue-100 text-blue-800", icon: Clock, text: "New" },
            "in-progress": { color: "bg-amber-100 text-amber-800", icon: AlertCircle, text: "In Progress" },
            resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle2, text: "Resolved" },
            closed: { color: "bg-gray-100 text-gray-800", icon: XCircle, text: "Closed" }
        };
        const { color, icon: Icon, text } = config[status];
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color}`}>
                <Icon size={12} />
                {text}
            </span>
        );
    };

    const getUserTypeBadge = (userType) => {
        const config = {
            bidder: { color: "bg-purple-100 text-purple-800", text: "Bidder" },
            seller: { color: "bg-indigo-100 text-indigo-800", text: "Seller" }
        };
        const { color, text } = config[userType];
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate stats from filtered queries
    const queryStats = {
        total: filteredQueries.length,
        new: filteredQueries.filter(q => q.status === 'new').length,
        inProgress: filteredQueries.filter(q => q.status === 'in-progress').length,
        resolved: filteredQueries.filter(q => q.status === 'resolved').length
    };

    // Stats cards configuration
    const statCards = [
        {
            title: "Total Queries",
            value: queryStats.total.toString(),
            change: "Showing",
            icon: MessageSquare,
            color: "blue"
        },
        {
            title: "New Queries",
            value: queryStats.new.toString(),
            change: "Require Attention",
            icon: AlertCircle,
            color: "orange"
        },
        {
            title: "In Progress",
            value: queryStats.inProgress.toString(),
            change: "Being Handled",
            icon: Clock,
            color: "amber"
        },
        {
            title: "Resolved",
            value: queryStats.resolved.toString(),
            change: "Completed",
            icon: CheckCircle2,
            color: "green"
        }
    ];

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="max-w-full pt-16 pb-7 md:pt-0">
                            <h2 className="text-3xl md:text-4xl font-bold my-5">User Queries</h2>
                            <p className="text-gray-600">Loading user queries...</p>
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
                    {/* Header Section */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">User Queries</h2>
                                <p className="text-gray-600">Manage and respond to user inquiries and support requests</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {filteredQueries.length} queries found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {statCards.map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`text-2xl font-bold text-${stat.color}-600`}>
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-500">{stat.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search queries by name, email, or message..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
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

                            {/* User Type Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.userType}
                                    onChange={(e) => handleFilterChange('userType', e.target.value)}
                                >
                                    {/* <option value="all">All User Types</option> */}
                                    {filterOptions.userTypes?.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
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
                                    {/* <option value="priority">Priority</option> */}
                                    <option value="name">Name</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredQueries.length} of {allQueries.length} queries
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>

                    {/* Queries Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">User Queries ({filteredQueries.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredQueries.map((query) => (
                                        <tr key={query.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                        <User size={18} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{query.name}</div>
                                                        <div className="text-sm text-gray-500">{query.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getUserTypeBadge(query.userType)}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(query.status)}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {formatDate(query.createdAt)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openQueryModal(query)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <a
                                                        href={`mailto:${query.email}`}
                                                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                                                        title="Send Email"
                                                    >
                                                        <Mail size={16} />
                                                    </a>

                                                    {query.phone && (
                                                        <a
                                                            href={`tel:${query.phone.replace(/\D/g, '')}`}
                                                            className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                                                            title="Call User"
                                                        >
                                                            <Phone size={16} />
                                                        </a>
                                                    )}

                                                    <button
                                                        onClick={() => deleteQuery(query.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                        title="Delete Query"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredQueries.length === 0 && (
                                <div className="text-center py-12">
                                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No queries found matching your criteria</p>
                                    <button
                                        onClick={clearFilters}
                                        className="text-blue-600 hover:text-blue-800 mt-2"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Query Detail Modal */}
                    {isModalOpen && selectedQuery && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Query Details - {selectedQuery.queryId}</h3>
                                    <button
                                        onClick={closeQueryModal}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        {/* &times; */}
                                        <X />
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Header Section */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User size={24} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">{selectedQuery.name}</h4>
                                                {getUserTypeBadge(selectedQuery.userType)}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {getStatusBadge(selectedQuery.status)}
                                            </div>
                                            <p className="text-gray-600">Submitted: {formatDate(selectedQuery.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Contact Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Email</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{selectedQuery.email}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(selectedQuery.email, 'modal-email')}
                                                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                        >
                                                            {copiedField === 'modal-email' ? (
                                                                <CheckCircle size={14} className="text-green-500" />
                                                            ) : (
                                                                <Copy size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                {selectedQuery.phone && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-500">Phone</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{selectedQuery.phone}</span>
                                                            <button
                                                                onClick={() => copyToClipboard(selectedQuery.phone, 'modal-phone')}
                                                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                            >
                                                                {copiedField === 'modal-phone' ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <Copy size={14} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Query Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">User Type</span>
                                                    <span className="font-medium capitalize">{selectedQuery.userType}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Category</span>
                                                    <span className="font-medium capitalize">{selectedQuery.category}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Priority</span>
                                                    <span className="font-medium capitalize">{selectedQuery.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="mb-6">
                                        <h5 className="font-semibold text-gray-900 mb-2">Message</h5>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700 whitespace-pre-wrap">{selectedQuery.message}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <a
                                            href={`mailto:${selectedQuery.email}?subject=Re: Your Query (${selectedQuery.queryId})&body=Dear ${selectedQuery.name},%0D%0A%0D%0AThank you for contacting us regarding: "%0D%0A%0D%0A${selectedQuery.message}%0D%0A%0D%0A`}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                        >
                                            Send Email
                                        </a>
                                        {selectedQuery.phone && (
                                            <a
                                                href={`tel:${selectedQuery.phone.replace(/\D/g, '')}`}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                                            >
                                                Call User
                                            </a>
                                        )}
                                    </div>

                                    {/* Status Actions */}
                                    <div className="flex gap-2 mt-4">
                                        {selectedQuery.status === "new" && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        updateQueryStatus(selectedQuery.id, "in-progress");
                                                        closeQueryModal();
                                                    }}
                                                    className="flex-1 bg-amber-100 text-amber-800 py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors"
                                                >
                                                    Mark as In Progress
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        updateQueryStatus(selectedQuery.id, "resolved");
                                                        closeQueryModal();
                                                    }}
                                                    className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            </>
                                        )}
                                        {selectedQuery.status === "in-progress" && (
                                            <button
                                                onClick={() => {
                                                    updateQueryStatus(selectedQuery.id, "resolved");
                                                    closeQueryModal();
                                                }}
                                                className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                Mark as Resolved
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                updateQueryStatus(selectedQuery.id, "closed");
                                                closeQueryModal();
                                            }}
                                            className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Close Query
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

export default UserQueries;