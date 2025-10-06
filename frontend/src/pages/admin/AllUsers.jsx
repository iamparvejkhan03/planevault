import { useEffect, useState } from "react";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import { Search, Filter, Mail, Phone, MapPin, Calendar, Award, Gavel, DollarSign, Shield, User, Edit, MoreVertical, UserX, Trash2, TrendingUp, Eye } from "lucide-react";
import { about, dummyUserImg } from "../../assets";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

function AllUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        sellers: 0,
        bidders: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false
    });

    const fetchUsers = async (page = 1, search = searchTerm, userFilter = filter) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/v1/admin/users`, {
                params: {
                    page,
                    limit: 10,
                    search,
                    filter: userFilter !== 'all' ? userFilter : undefined
                }
            });

            if (data.success) {
                setUsers(data.data.users);
                setStats(data.data.stats);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Fetch users error:', err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        try {
            const { data } = await axiosInstance.get(`/api/v1/admin/users/${userId}`);
            if (data.success) {
                setSelectedUser(data.data.user);
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error('Fetch user details error:', err);
            toast.error("Failed to load user details");
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/admin/users/${userId}`);
            if (data.success) {
                toast.success(data.message);
                fetchUsers(); // Refresh the list
            }
        } catch (err) {
            console.error('Delete user error:', err);
            toast.error(err.response?.data?.message || "Failed to delete user");
        }
    };

    const handleDeactivateUser = async (userId, userName, currentStatus) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${userName}?`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/users/${userId}/status`, {
                isActive: newStatus
            });
            if (data.success) {
                toast.success(data.message);
                fetchUsers(); // Refresh the list
            }
        } catch (err) {
            console.error('Update user status error:', err);
            toast.error(err.response?.data?.message || "Failed to update user status");
        }
    };

    const handleUpdateUserType = async (userId, userName, newType) => {
        if (!window.confirm(`Are you sure you want to change ${userName}'s role to ${newType}?`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/users/${userId}/type`, {
                userType: newType
            });
            if (data.success) {
                toast.success(data.message);
                fetchUsers(); // Refresh the list
            }
        } catch (err) {
            console.error('Update user type error:', err);
            toast.error(err.response?.data?.message || "Failed to update user role");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers(1, searchTerm, filter);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filter]);

    const openUserModal = (user) => {
        fetchUserDetails(user._id);
    };

    const closeUserModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const getUserTypeBadge = (type) => {
        const config = {
            admin: { color: "bg-purple-100 text-purple-800", text: "Admin" },
            seller: { color: "bg-blue-100 text-blue-800", text: "Seller" },
            bidder: { color: "bg-green-100 text-green-800", text: "Bidder" }
        };
        const { color, text } = config[type];
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
    };

    const getStatusBadge = (isActive) => {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {isActive ? "active" : "inactive"}
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
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest('.relative')) {
                setActiveDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                                <h2 className="text-3xl md:text-4xl font-bold my-5">User Management</h2>
                                <p className="text-gray-600">Manage all platform users - admins, sellers, and bidders</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination.totalUsers} users found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-500">Total Users</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                            <div className="text-sm text-gray-500">Admins</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">{stats.sellers}</div>
                            <div className="text-sm text-gray-500">Sellers</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">{stats.bidders}</div>
                            <div className="text-sm text-gray-500">Bidders</div>
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
                                        placeholder="Search users by name, email, or username..."
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
                                        <option value="all">All Users</option>
                                        <option value="admin">Admins</option>
                                        <option value="seller">Sellers</option>
                                        <option value="bidder">Bidders</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">All Users</h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={user.image || dummyUserImg}
                                                            alt={`${user.firstName} ${user.lastName}`}
                                                            className="w-10 h-10 rounded-full object-cover mr-3"
                                                        />
                                                        <div>
                                                            <div
                                                                className="font-medium text-gray-900 cursor-pointer hover:text-black"
                                                                onClick={() => openUserModal(user)}
                                                            >
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">@{user.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {getUserTypeBadge(user.userType)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                    <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {getStatusBadge(user.isActive)}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-900">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openUserModal(user)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={20} />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {/* <div className="relative">
                                                            <button
                                                                onClick={() => setActiveDropdown(activeDropdown === user._id ? null : user._id)}
                                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>

                                                            {activeDropdown === user._id && (
                                                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">

                                                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                                                                        Change Role
                                                                    </div>
                                                                    {user.userType !== 'admin' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                handleUpdateUserType(user._id, `${user.firstName} ${user.lastName}`, 'admin');
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                                                                        >
                                                                            <Shield size={16} />
                                                                            <span>Make Admin</span>
                                                                        </button>
                                                                    )}
                                                                    {user.userType !== 'seller' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                handleUpdateUserType(user._id, `${user.firstName} ${user.lastName}`, 'seller');
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                                                        >
                                                                            <Gavel size={16} />
                                                                            <span>Make Seller</span>
                                                                        </button>
                                                                    )}
                                                                    {user.userType !== 'bidder' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                handleUpdateUserType(user._id, `${user.firstName} ${user.lastName}`, 'bidder');
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                        >
                                                                            <User size={16} />
                                                                            <span>Make Bidder</span>
                                                                        </button>
                                                                    )}

                                                                    <div className="border-t border-gray-100 my-1"></div>

                                                                    <button
                                                                        onClick={() => {
                                                                            handleDeactivateUser(user._id, `${user.firstName} ${user.lastName}`, user.isActive);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                                                                    >
                                                                        <UserX size={16} />
                                                                        <span>{user.isActive ? 'Deactivate' : 'Activate'} User</span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => {
                                                                            handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        <span>Delete User</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div> */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {users.length === 0 && (
                                    <div className="text-center py-12">
                                        <User size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No users found matching your criteria</p>
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

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            Showing page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchUsers(pagination.currentPage - 1)}
                                                disabled={!pagination.hasPrev}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => fetchUsers(pagination.currentPage + 1)}
                                                disabled={!pagination.hasNext}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Detail Modal */}
                    {isModalOpen && selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">User Details</h3>
                                    <button
                                        onClick={closeUserModal}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Header Section */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <img
                                            src={selectedUser.image || dummyUserImg}
                                            alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</h4>
                                                {getUserTypeBadge(selectedUser.userType)}
                                                {getStatusBadge(selectedUser.isActive)}
                                            </div>
                                            <p className="text-gray-600">{selectedUser.email}</p>
                                            <p className="text-gray-600">@{selectedUser.username}</p>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Contact Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Mail size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Email</div>
                                                        <div className="font-medium">{selectedUser.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Phone</div>
                                                        <div className="font-medium">{selectedUser.phone || 'Not provided'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Location</div>
                                                        <div className="font-medium">{selectedUser.countryName || 'Not specified'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Member Since</div>
                                                        <div className="font-medium">{formatDate(selectedUser.createdAt)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Statistics */}
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">User Statistics</h5>
                                            <div className="space-y-3">
                                                {selectedUser.userType === 'seller' && selectedUser.stats && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <DollarSign size={18} className="text-green-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Total Sales</div>
                                                                <div className="font-medium">{formatCurrency(selectedUser.stats.totalSales || 0)}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Gavel size={18} className="text-blue-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Active Listings</div>
                                                                <div className="font-medium">{selectedUser.stats.activeListings || 0}</div>
                                                            </div>
                                                        </div>
                                                        {/* <div className="flex items-center gap-3">
                                                            <Award size={18} className="text-amber-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Seller Rating</div>
                                                                <div className="font-medium">{selectedUser.stats.rating || 'N/A'}/5.0</div>
                                                            </div>
                                                        </div> */}
                                                        <div className="flex items-center gap-3">
                                                            <TrendingUp size={18} className="text-green-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Total Auctions</div>
                                                                <div className="font-medium">{selectedUser.stats.totalAuctions || 0}</div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {selectedUser.userType === 'bidder' && selectedUser.stats && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <Gavel size={18} className="text-blue-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Total Bids</div>
                                                                <div className="font-medium">{selectedUser.stats.totalBids || 0}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Award size={18} className="text-amber-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Auctions Won</div>
                                                                <div className="font-medium">{selectedUser.stats.auctionsWon || 0}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <TrendingUp size={18} className="text-green-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Success Rate</div>
                                                                <div className="font-medium">{selectedUser.stats.successRate || 0}%</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <User size={18} className="text-purple-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Watchlist Items</div>
                                                                <div className="font-medium">{selectedUser.stats.watchlistItems || 0}</div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {selectedUser.userType === 'admin' && selectedUser.stats && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={18} className="text-purple-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Role</div>
                                                                <div className="font-medium">{selectedUser.stats.role || 'Admin'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Calendar size={18} className="text-gray-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Last Activity</div>
                                                                <div className="font-medium">
                                                                    {selectedUser.stats.lastLogin ? formatDate(selectedUser.stats.lastLogin) : 'Recently'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                handleDeactivateUser(selectedUser._id, `${selectedUser.firstName} ${selectedUser.lastName}`, selectedUser.isActive);
                                                closeUserModal();
                                            }}
                                            className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors"
                                        >
                                            {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}?`)) {
                                                    handleDeleteUser(selectedUser._id, `${selectedUser.firstName} ${selectedUser.lastName}`);
                                                    closeUserModal();
                                                }
                                            }}
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Delete User
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

export default AllUsers;