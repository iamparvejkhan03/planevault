import { useEffect, useState } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import { Search, Filter, Mail, Phone, MapPin, Calendar, Award, Gavel, DollarSign, Shield, User, Edit, MoreVertical, UserX, Trash2, TrendingUp } from "lucide-react";
import { about } from "../../assets";
import toast from "react-hot-toast";

// Mock users data
const usersData = [
    {
        id: "U001",
        type: "seller",
        name: "John Aerospace",
        email: "john@aerovendors.com",
        phone: "+1 (555) 123-4567",
        company: "AeroVendors Inc.",
        joinDate: "2022-03-15",
        location: "Seattle, WA",
        status: "active",
        totalSales: 124500,
        activeListings: 12,
        rating: 4.8,
        avatar: about
    },
    {
        id: "U002",
        type: "bidder",
        name: "Alex Aviation",
        email: "alex@aviationenthusiast.com",
        phone: "+1 (555) 987-6543",
        joinDate: "2023-01-20",
        location: "Denver, CO",
        status: "active",
        totalBids: 156,
        auctionsWon: 23,
        successRate: 68,
        avatar: about
    },
    {
        id: "U003",
        type: "admin",
        name: "Sarah Management",
        email: "sarah@aviationauctions.com",
        phone: "+1 (555) 456-7890",
        joinDate: "2021-11-10",
        location: "New York, NY",
        status: "active",
        role: "Super Admin",
        lastLogin: "2023-12-19T14:30:00",
        avatar: about
    },
    {
        id: "U004",
        type: "seller",
        name: "Mike Restorations",
        email: "mike@vintageplanes.com",
        phone: "+1 (555) 234-5678",
        company: "Vintage Plane Restorations",
        joinDate: "2023-06-08",
        location: "Los Angeles, CA",
        status: "active",
        totalSales: 89200,
        activeListings: 8,
        rating: 4.6,
        avatar: about
    },
    {
        id: "U005",
        type: "bidder",
        name: "Emily Collector",
        email: "emily@aviationcollector.com",
        phone: "+1 (555) 345-6789",
        joinDate: "2023-08-12",
        location: "Chicago, IL",
        status: "active",
        totalBids: 89,
        auctionsWon: 14,
        successRate: 72,
        avatar: about
    },
    {
        id: "U006",
        type: "seller",
        name: "Robert Aviation",
        email: "robert@skycollectibles.com",
        phone: "+1 (555) 876-5432",
        company: "Sky Collectibles Ltd.",
        joinDate: "2022-09-25",
        location: "Miami, FL",
        status: "active",
        totalSales: 156800,
        activeListings: 15,
        rating: 4.9,
        avatar: about
    },
    {
        id: "U007",
        type: "bidder",
        name: "Lisa Enthusiast",
        email: "lisa@planeenthusiast.com",
        phone: "+1 (555) 765-4321",
        joinDate: "2023-03-30",
        location: "Boston, MA",
        status: "active",
        totalBids: 67,
        auctionsWon: 9,
        successRate: 58,
        avatar: about
    },
    {
        id: "U008",
        type: "admin",
        name: "David System",
        email: "david@aviationauctions.com",
        phone: "+1 (555) 654-3210",
        joinDate: "2022-01-15",
        location: "San Francisco, CA",
        status: "active",
        role: "Content Moderator",
        lastLogin: "2023-12-19T10:15:00",
        avatar: about
    }
];

function AllUsers() {
    const [users, setUsers] = useState(usersData);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === "" ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filter === "all" || user.type === filter;
        return matchesSearch && matchesFilter;
    });

    const openUserModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
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

    const getStatusBadge = (status) => {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                {status}
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

    const userStats = {
        total: users.length,
        admins: users.filter(u => u.type === 'admin').length,
        sellers: users.filter(u => u.type === 'seller').length,
        bidders: users.filter(u => u.type === 'bidder').length
    };

    const handleDeleteUser = (userId) => {
        setUsers(users.filter(user => user.id !== userId));
        toast.success("User deleted successfully");
    };

    const handleDeactivateUser = (userId) => {
        setUsers(users.map(user => 
            user.id === userId 
                ? { ...user, status: user.status === "active" ? "inactive" : "active" }
                : user
        ));
        toast.success("User status updated");
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
                                    {filteredUsers.length} users found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
                            <div className="text-sm text-gray-500">Total Users</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-purple-600">{userStats.admins}</div>
                            <div className="text-sm text-gray-500">Admins</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">{userStats.sellers}</div>
                            <div className="text-sm text-gray-500">Sellers</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">{userStats.bidders}</div>
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
                                        placeholder="Search users by name, email, or company..."
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
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                                    />
                                                    <div>
                                                        <div
                                                            className="font-medium text-gray-900 cursor-pointer hover:text-black"
                                                            onClick={() => openUserModal(user)}
                                                        >
                                                            {user.name}
                                                        </div>
                                                        {user.company && (
                                                            <div className="text-sm text-gray-500">{user.company}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getUserTypeBadge(user.type)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.phone}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(user.status)}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-900">
                                                {formatDate(user.joinDate)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openUserModal(user)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <User size={16} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {activeDropdown === user.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to deactivate ${user.name}?`)) {
                                                                            handleDeactivateUser(user.id);
                                                                            setActiveDropdown(null);
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <UserX size={16} className="text-amber-500" />
                                                                    <span>Deactivate User</span>
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                                                                            handleDeleteUser(user.id);
                                                                            setActiveDropdown(null);
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Delete User</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
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
                        </div>
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
                                            src={selectedUser.avatar}
                                            alt={selectedUser.name}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                                                {getUserTypeBadge(selectedUser.type)}
                                                {getStatusBadge(selectedUser.status)}
                                            </div>
                                            <p className="text-gray-600">{selectedUser.email}</p>
                                            {selectedUser.company && (
                                                <p className="text-gray-600">{selectedUser.company}</p>
                                            )}
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
                                                        <div className="font-medium">{selectedUser.phone}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Location</div>
                                                        <div className="font-medium">{selectedUser.location}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Member Since</div>
                                                        <div className="font-medium">{formatDate(selectedUser.joinDate)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Statistics */}
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">User Statistics</h5>
                                            <div className="space-y-3">
                                                {selectedUser.type === 'seller' && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <DollarSign size={18} className="text-green-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Total Sales</div>
                                                                <div className="font-medium">{formatCurrency(selectedUser.totalSales)}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Gavel size={18} className="text-blue-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Active Listings</div>
                                                                <div className="font-medium">{selectedUser.activeListings}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Award size={18} className="text-amber-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Seller Rating</div>
                                                                <div className="font-medium">{selectedUser.rating}/5.0</div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {selectedUser.type === 'bidder' && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <Gavel size={18} className="text-blue-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Total Bids</div>
                                                                <div className="font-medium">{selectedUser.totalBids}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Award size={18} className="text-amber-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Auctions Won</div>
                                                                <div className="font-medium">{selectedUser.auctionsWon}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <TrendingUp size={18} className="text-green-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Success Rate</div>
                                                                <div className="font-medium">{selectedUser.successRate}%</div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {selectedUser.type === 'admin' && (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={18} className="text-purple-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Role</div>
                                                                <div className="font-medium">{selectedUser.role}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Calendar size={18} className="text-gray-500" />
                                                            <div>
                                                                <div className="text-sm text-gray-500">Last Login</div>
                                                                <div className="font-medium">
                                                                    {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Today'}
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
                                        <button className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                            Send Message
                                        </button>
                                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                            Edit Profile
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