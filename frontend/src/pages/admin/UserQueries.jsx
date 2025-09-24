import { useState } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import { Search, Filter, Mail, Phone, User, Clock, MessageSquare, Copy, CheckCircle, Trash2, Eye, MoreVertical, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

// Mock user queries data
const userQueriesData = [
    {
        id: "UQ267400",
        name: "Nathan Reynolds",
        email: "nathan.reynolds@example.com",
        phone: "+1 (917) 555-1234",
        userType: "bidder",
        message: "I'm having trouble placing bids on several auctions. The system keeps showing an error message when I try to submit my bid. Can you help me resolve this issue?",
        timestamp: "2023-12-05T14:30:00Z",
        status: "new",
        notes: "",
        category: "bidding"
    },
    {
        id: "UQ351289",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1 (212) 555-9876",
        userType: "seller",
        message: "I'm trying to list my vintage aircraft parts but the image upload feature isn't working properly. The files are under the size limit but keep failing to upload.",
        timestamp: "2023-12-04T09:15:00Z",
        status: "in-progress",
        notes: "Asked user to try different file formats. Following up tomorrow.",
        category: "listing"
    },
    {
        id: "UQ498712",
        name: "Michael Chen",
        email: "michael.chen@example.com",
        phone: "+1 (646) 555-4567",
        userType: "bidder",
        message: "I won an auction last week but haven't received any communication about shipping or payment instructions. The seller isn't responding to my messages.",
        timestamp: "2023-12-03T16:45:00Z",
        status: "resolved",
        notes: "Contacted seller directly. Issue resolved with expedited shipping.",
        category: "post-auction"
    },
    {
        id: "UQ672341",
        name: "Emma Rodriguez",
        email: "emma.rodriguez@example.com",
        phone: "+1 (718) 555-7890",
        userType: "seller",
        message: "Can you explain the fee structure for premium listings? I want to feature my items but need clarification on the costs involved.",
        timestamp: "2023-12-02T11:20:00Z",
        status: "closed",
        notes: "Sent detailed fee breakdown. User confirmed understanding.",
        category: "fees"
    },
    {
        id: "UQ783452",
        name: "David Thompson",
        email: "d.thompson@example.com",
        phone: "+1 (347) 555-2345",
        userType: "bidder",
        message: "The search function doesn't seem to be returning relevant results for 'vintage aviation'. I'm getting modern aircraft parts instead of historical items.",
        timestamp: "2023-12-01T13:10:00Z",
        status: "new",
        notes: "",
        category: "platform"
    },
    {
        id: "UQ894563",
        name: "Jessica Williams",
        email: "jessica.w@example.com",
        phone: "+1 (917) 555-6789",
        userType: "seller",
        message: "I need to update my bank account information for payout but the settings page keeps giving me an error when I try to save changes.",
        timestamp: "2023-11-30T10:05:00Z",
        status: "in-progress",
        notes: "Verified account details. Processing update manually.",
        category: "account"
    }
];

function UserQueries() {
    const [queries, setQueries] = useState(userQueriesData);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [userTypeFilter, setUserTypeFilter] = useState("all");
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    const filteredQueries = queries.filter(query => {
        const matchesSearch = searchTerm === "" || 
            query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            query.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || query.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || query.priority === priorityFilter;
        const matchesUserType = userTypeFilter === "all" || query.userType === userTypeFilter;
        
        return matchesSearch && matchesStatus && matchesPriority && matchesUserType;
    });

    const openQueryModal = (query) => {
        setSelectedQuery(query);
        setIsModalOpen(true);
    };

    const closeQueryModal = () => {
        setIsModalOpen(false);
        setSelectedQuery(null);
    };

    const updateQueryStatus = (queryId, newStatus) => {
        setQueries(queries.map(query => 
            query.id === queryId ? { ...query, status: newStatus } : query
        ));
    };

    const deleteQuery = (queryId) => {
        if (window.confirm("Are you sure you want to delete this query? This action cannot be undone.")) {
            setQueries(queries.filter(query => query.id !== queryId));
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

    const queryStats = {
        total: queries.length,
        new: queries.filter(q => q.status === 'new').length,
        inProgress: queries.filter(q => q.status === 'in-progress').length,
        resolved: queries.filter(q => q.status === 'resolved').length
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
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{queryStats.total}</div>
                            <div className="text-sm text-gray-500">Total Queries</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">{queryStats.new}</div>
                            <div className="text-sm text-gray-500">New</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-amber-600">{queryStats.inProgress}</div>
                            <div className="text-sm text-gray-500">In Progress</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">{queryStats.resolved}</div>
                            <div className="text-sm text-gray-500">Resolved</div>
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
                                        placeholder="Search queries by name, email, or message..."
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
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="new">New</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                
                                <select 
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={userTypeFilter}
                                    onChange={(e) => setUserTypeFilter(e.target.value)}
                                >
                                    <option value="all">All User Types</option>
                                    <option value="bidder">Bidder</option>
                                    <option value="seller">Seller</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Queries Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">User Queries</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Preview</th> */}
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Priority</th>
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
                                                        <div className="text-sm text-gray-500">{formatDate(query.timestamp)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* <td className="py-4 px-6">
                                                <div 
                                                    className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 line-clamp-2"
                                                    onClick={() => openQueryModal(query)}
                                                >
                                                    {query.message}
                                                </div>
                                            </td> */}
                                            <td className="py-4 px-6">
                                                {getUserTypeBadge(query.userType)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-2 flex items-center">
                                                    {getStatusBadge(query.status)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center md:flex-wrap gap-2">
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
                                        onClick={() => {
                                            setSearchTerm("");
                                            setStatusFilter("all");
                                            setPriorityFilter("all");
                                            setUserTypeFilter("all");
                                        }}
                                        className="text-blue-600 hover:text-blue-800 mt-2"
                                    >
                                        Clear filters
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
                                    <h3 className="text-lg font-semibold">Query Details</h3>
                                    <button 
                                        onClick={closeQueryModal}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        &times;
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
                                            <p className="text-gray-600">Submitted: {formatDate(selectedQuery.timestamp)}</p>
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
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="mb-6">
                                        <h5 className="font-semibold text-gray-900 mb-2">Message</h5>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700">{selectedQuery.message}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <a 
                                            href={`mailto:${selectedQuery.email}`}
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