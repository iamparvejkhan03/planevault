import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Flag, Info, MessageCircle, MessageCircleMore, MoreVertical, Trash, TriangleAlert, Undo, UserCheck, UserRoundMinus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from '../../components';

const Comments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');
    // Add these state variables at the top of your component
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCommentDetails, setSelectedCommentDetails] = useState(null);
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    const [filters, setFilters] = useState({
        status: 'all',
        sortBy: 'recent'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
        commentsPerPage: 10
    });

    // Fetch flagged comments
    const fetchFlaggedComments = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                limit: pagination.commentsPerPage,
                ...filters
            });

            const { data } = await axiosInstance.get(`/api/v1/comments/flagged?${params}`);

            if (data.success) {
                setComments(data.data.comments);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Fetch flagged comments error:', err);
            toast.error(err.response?.data?.message || "Failed to fetch comments");
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/comments/stats');
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    };

    useEffect(() => {
        fetchFlaggedComments();
        fetchStats();
    }, [filters]);

    // Handle comment deletion
    const handleDeleteComment = async () => {
        if (!selectedComment) return;

        try {
            const { data } = await axiosInstance.delete(
                `/api/v1/comments/${selectedComment._id}`,
                { data: { deleteReason } }
            );

            if (data.success) {
                toast.success(`Comment by ${data.data.userName} deleted successfully`);
                setShowDeleteModal(false);
                setSelectedComment(null);
                setDeleteReason('');

                // Update the comment locally
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment._id === selectedComment._id
                            ? { ...comment, status: 'deleted' }
                            : comment
                    )
                );

                fetchStats();
            }
        } catch (err) {
            console.error('Delete comment error:', err);
            toast.error(err.response?.data?.message || "Failed to delete comment");
        }
    };

    // Handle clear flags
    const handleClearFlags = async (commentId) => {
        try {
            const { data } = await axiosInstance.patch(
                `/api/v1/comments/${commentId}/clear-flags`
            );

            if (data.success) {
                toast.success('Flags cleared successfully');

                // Update the comment locally instead of refetching
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment._id === commentId
                            ? {
                                ...comment,
                                flags: [],
                                status: 'active',
                                flagsCount: 0
                            }
                            : comment
                    )
                );

                // Also update stats
                fetchStats();
            }
        } catch (err) {
            console.error('Clear flags error:', err);
            toast.error(err.response?.data?.message || "Failed to clear flags");
        }
    };

    // Handle restore comment
    const handleRestoreComment = async (commentId) => {
        try {
            const { data } = await axiosInstance.patch(
                `/api/v1/comments/${commentId}/restore`
            );

            if (data.success) {
                toast.success('Comment restored successfully');

                // Update the comment locally
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment._id === commentId
                            ? { ...comment, status: 'active' }
                            : comment
                    )
                );

                fetchStats();
            }
        } catch (err) {
            console.error('Restore comment error:', err);
            toast.error(err.response?.data?.message || "Failed to restore comment");
        }
    };

    // Handle user deactivation
    const handleDeactivateUser = async (userId, userName, currentStatus) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${userName}?`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.patch(`/api/v1/users/${userId}/status`, {
                isActive: newStatus
            });

            if (data.success) {
                toast.success(data.message);
                fetchFlaggedComments(pagination.currentPage);
            }
        } catch (err) {
            console.error('Update user status error:', err);
            toast.error(err.response?.data?.message || "Failed to update user status");
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge variant
    const getStatusBadge = (status) => {
        switch (status) {
            case 'flagged': return 'danger';
            case 'active': return 'success';
            case 'deleted': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <section className="flex min-h-screen">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Comment Moderation</h2>
                        <p className="text-secondary">Manage reported comments and user moderation</p>
                    </div>

                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-blue-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Total Comments</p>
                                        <h3 className="text-2xl font-bold">{stats.totalComments}</h3>
                                    </div>
                                    <div className="text-blue-500">
                                        <MessageCircle />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-yellow-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Flagged Comments</p>
                                        <h3 className="text-2xl font-bold text-yellow-600">{stats.flaggedComments}</h3>
                                    </div>
                                    <div className="text-yellow-500">
                                        <Flag />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-green-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Active Comments</p>
                                        <h3 className="text-2xl font-bold text-green-600">{stats.activeComments}</h3>
                                    </div>
                                    <div className="text-green-500">
                                        <CheckCircle />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-purple-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Flags This Week</p>
                                        <h3 className="text-2xl font-bold text-purple-600">{stats.flagsThisWeek}</h3>
                                    </div>
                                    <div className="text-purple-500">
                                        <TriangleAlert />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="flagged">Flagged</option>
                                    <option value="active">Active</option>
                                    <option value="deleted">Deleted</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="recent">Recent</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Comment details model */}
                    {showDetailsModal && selectedCommentDetails && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">Comment Details</h3>
                                        <button
                                            onClick={() => setShowDetailsModal(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-6">
                                        {/* Comment Content */}
                                        <div>
                                            <h4 className="font-medium text-secondary mb-2">Comment Content</h4>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-secondary whitespace-pre-wrap">{selectedCommentDetails.content}</p>
                                            </div>
                                        </div>

                                        {/* User Information */}
                                        <div>
                                            <h4 className="font-medium text-secondary mb-3">User Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    {selectedCommentDetails.user?.avatar && (
                                                        <img
                                                            src={selectedCommentDetails.user.avatar}
                                                            alt="Avatar"
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{selectedCommentDetails.userName}</p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${selectedCommentDetails.user?.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {selectedCommentDetails.user?.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm">
                                                        <span className="font-medium">Email:</span> {selectedCommentDetails.user?.email || 'N/A'}
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">User ID:</span> {selectedCommentDetails.user?._id || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Auction Information */}
                                        <div>
                                            <h4 className="font-medium text-secondary mb-3">Auction Information</h4>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="font-medium">{selectedCommentDetails.auction?.title || selectedCommentDetails.auction?.itemName || 'N/A'}</p>
                                                <p className="text-sm text-secondary mt-1">Auction ID: {selectedCommentDetails.auction?._id || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Comment Metadata */}
                                        <div>
                                            <h4 className="font-medium text-secondary mb-3">Comment Metadata</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-medium">Status</p>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedCommentDetails.status === 'flagged'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : selectedCommentDetails.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {selectedCommentDetails.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Flags Count</p>
                                                    <p>{selectedCommentDetails.flags.length}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Created At</p>
                                                    <p>{new Date(selectedCommentDetails.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Updated At</p>
                                                    <p>{new Date(selectedCommentDetails.updatedAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Flags Details */}
                                        {selectedCommentDetails.flags.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-secondary mb-3">Flag Details</h4>
                                                <div className="space-y-2">
                                                    {selectedCommentDetails.flags.map((flag, index) => (
                                                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-medium text-red-800">Reason: {flag.reason}</p>
                                                                    <p className="text-sm text-red-600">
                                                                        Flagged by: {flag.user?.username || 'Unknown User'}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-red-500">
                                                                    {new Date(flag.flaggedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold">Comment Management</h3>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div> */}
                                    <LoadingSpinner />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageCircleMore />
                                    <p className="text-secondary">No comments found with the current filters.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Comment</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">User</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Auction</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Flags</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Date</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comments.map((comment) => (
                                                    <tr key={comment._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <div className="max-w-xs">
                                                                <p className="text-sm text-secondary line-clamp-2">
                                                                    {comment.content.length > 100
                                                                        ? `${comment.content.substring(0, 100)}...`
                                                                        : comment.content
                                                                    }
                                                                </p>
                                                                {comment.flags.length > 0 && (
                                                                    <div className="mt-1">
                                                                        <p className="text-xs text-red-600">
                                                                            <strong>Flags: </strong>
                                                                            {comment.flags.map((flag, index) => (
                                                                                <span key={index}>
                                                                                    {flag.reason}
                                                                                    {index < comment.flags.length - 1 ? ', ' : ''}
                                                                                </span>
                                                                            ))}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                {comment.user?.avatar && (
                                                                    <img
                                                                        src={comment.user.avatar}
                                                                        alt="Avatar"
                                                                        className="w-8 h-8 rounded-full object-cover"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-medium">{comment.userName}</p>
                                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${comment.user?.isActive
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {comment.user?.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <p className="text-sm text-secondary">
                                                                {comment.auction?.title || comment.auction?.itemName || 'N/A'}
                                                            </p>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${comment.flags.length > 0
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {comment.flags.length}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${comment.status === 'flagged'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : comment.status === 'active'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {comment.status}
                                                                </span>
                                                                {comment.flags.length > 0 && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                                                                        <Flag />
                                                                        {comment.flags.length} flag{comment.flags.length !== 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <p className="text-sm text-secondary">
                                                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </td>

                                                        <td className="py-3 px-4">
                                                            <div className="relative">
                                                                {/* Three dots menu button */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActionMenuOpen(actionMenuOpen === comment._id ? null : comment._id);
                                                                    }}
                                                                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <MoreVertical />
                                                                </button>

                                                                {/* Dropdown menu */}
                                                                {actionMenuOpen === comment._id && (
                                                                    <div
                                                                        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10 py-2"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {/* View Details */}
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedCommentDetails(comment);
                                                                                setShowDetailsModal(true);
                                                                                setActionMenuOpen(null);
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-secondary hover:bg-gray-50 transition-colors"
                                                                        >
                                                                            <Info size={18} />
                                                                            View Details
                                                                        </button>

                                                                        {/* Delete Comment - for active and flagged comments */}
                                                                        {(comment.status === 'flagged' || comment.status === 'active') && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedComment(comment);
                                                                                    setShowDeleteModal(true);
                                                                                    setActionMenuOpen(null);
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                            >
                                                                                <Trash size={18} />
                                                                                Delete Comment
                                                                            </button>
                                                                        )}

                                                                        {/* Approve & Clear Flags - for flagged comments */}
                                                                        {comment.status === 'flagged' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleClearFlags(comment._id);
                                                                                    setActionMenuOpen(null);
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                            >
                                                                                <CheckCircle size={18} />
                                                                                Approve & Clear Flags
                                                                            </button>
                                                                        )}

                                                                        {/* Clear Flags - for active comments with flags */}
                                                                        {comment.status === 'active' && comment.flags.length > 0 && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleClearFlags(comment._id);
                                                                                    setActionMenuOpen(null);
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                                                            >
                                                                                <Flag size={18} /> 
                                                                                Clear Flags ({comment.flags.length})
                                                                            </button>
                                                                        )}

                                                                        {/* Restore Comment - for deleted comments */}
                                                                        {comment.status === 'deleted' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleRestoreComment(comment._id);
                                                                                    setActionMenuOpen(null);
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                            >
                                                                                <Undo size={18} />
                                                                                Restore Comment
                                                                            </button>
                                                                        )}

                                                                        {/* User Management */}
                                                                        <button
                                                                            onClick={() => {
                                                                                handleDeactivateUser(
                                                                                    comment.user?._id,
                                                                                    comment.userName,
                                                                                    comment.user?.isActive
                                                                                );
                                                                                setActionMenuOpen(null);
                                                                            }}
                                                                            className={`flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${comment.user?.isActive ? 'text-orange-600' : 'text-green-600'
                                                                                }`}
                                                                        >
                                                                            {
                                                                                comment.user?.isActive
                                                                                ?
                                                                                <UserRoundMinus className='text-orange-500' />
                                                                                :
                                                                                <UserCheck className='text-green-500' />
                                                                            }
                                                                            {comment.user?.isActive ? 'Deactivate User' : 'Activate User'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Close dropdown when clicking outside */}
                                                            {actionMenuOpen === comment._id && (
                                                                <div
                                                                    className="fixed inset-0 z-0"
                                                                    onClick={() => setActionMenuOpen(null)}
                                                                ></div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-6">
                                            <button
                                                onClick={() => fetchFlaggedComments(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft />
                                                Previous
                                            </button>

                                            <div className="flex gap-1">
                                                {[...Array(pagination.totalPages)].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        onClick={() => fetchFlaggedComments(index + 1)}
                                                        className={`w-8 h-8 rounded-lg text-sm ${index + 1 === pagination.currentPage
                                                            ? 'bg-black text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => fetchFlaggedComments(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                                <ChevronRight />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Delete Comment</h3>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        Reason for deletion (optional)
                                    </label>
                                    <textarea
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        placeholder="Enter reason for deletion..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                {selectedComment && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Comment Preview:</strong><br />
                                            "{selectedComment.content}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteComment}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Comment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Comments;