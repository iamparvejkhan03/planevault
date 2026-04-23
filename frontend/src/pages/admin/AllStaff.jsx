import { useState, useEffect } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import { Plus, Search, Edit, Trash2, User, Mail, Phone, Shield, MoreVertical, Eye, EyeOff, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const AllStaff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navigate = useNavigate();

    const fetchStaff = async (page = 1, search = "", status = "all") => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: 10,
            });

            if (search) {
                params.append("search", search);
            }

            if (status !== "all") {
                params.append("status", status);
            }

            const { data } = await axiosInstance.get(`/api/v1/admin/staff?${params}`);

            if (data.success) {
                setStaff(data.data.staff);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff(1, searchTerm, statusFilter);
    }, [statusFilter]);

    const handleSearch = (value) => {
        setSearchTerm(value);

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            fetchStaff(1, value, statusFilter);
        }, 500);

        setDebounceTimer(timer);
    };

    const handleStatusToggle = async (staffId, currentStatus) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/staff/${staffId}/status`, {
                isActive: !currentStatus,
            });

            if (data.success) {
                toast.success(data.message);
                fetchStaff(1, searchTerm, statusFilter);
            }
        } catch (error) {
            console.error("Error updating staff status:", error);
            toast.error("Failed to update staff status");
        }
    };

    const handleDelete = async (staffId, staffName) => {
        if (!window.confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/admin/staff/${staffId}`);

            if (data.success) {
                toast.success("Staff member deleted successfully");
                fetchStaff(1, searchTerm, statusFilter);
            }
        } catch (error) {
            console.error("Error deleting staff:", error);
            toast.error(error?.response?.data?.message || "Failed to delete staff");
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest('.relative')) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getPermissionBadges = (permissions) => {
        const displayNames = {
            view_dashboard: "Dashboard",
            manage_users: "Users",
            manage_cashiers: "Cashiers",
            manage_auctions: "Auctions",
            manage_bids: "Bids",
            manage_offers: "Offers",
            manage_transactions: "Transactions",
            manage_subscriptions: "Subscriptions",
            manage_categories: "Categories",
            manage_videos: "Videos",
            manage_inquiries: "Inquiries",
            manage_commissions: "Sales Tax",
            manage_admins: "Staff",
        };

        return permissions.slice(0, 3).map((p) => (
            <span key={p} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-1 mb-1">
                {displayNames[p] || p}
            </span>
        ));
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="pt-16 md:py-7">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Staff Management</h1>
                                <p className="text-gray-600 mt-1">Manage staff accounts and permissions</p>
                            </div>
                            <button
                                onClick={() => navigate("/admin/staff/add")}
                                className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <UserPlus size={18} />
                                Add Staff
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search staff by name, email..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <select
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Staff Table */}
                        {loading ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : staff.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {staff.map((member) => (
                                                <tr key={member._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                                <User size={18} className="text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {member.firstName} {member.lastName}
                                                                </p>
                                                                <p className="text-sm text-gray-500">@{member.username}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                                <Mail size={14} /> {member.email}
                                                            </p>
                                                            {member.phone && (
                                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <Phone size={14} /> {member.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.permissions?.length > 0 ? (
                                                                getPermissionBadges(member.permissions)
                                                            ) : (
                                                                <span className="text-xs text-gray-400">No permissions</span>
                                                            )}
                                                            {member.permissions?.length > 3 && (
                                                                <span className="text-xs text-gray-400">+{member.permissions.length - 3} more</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${member.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                            }`}>
                                                            {member.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {member.createdBy?.firstName} {member.createdBy?.lastName || "System"}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => navigate(`/admin/staff/edit/${member._id}`)}
                                                                className="flex items-center gap-3 w-full py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            {/* <button
                                                                onClick={() => handleStatusToggle(member._id, member.isActive)}
                                                                className={`flex items-center gap-3 w-full py-2 text-sm ${member.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'} transition-colors`}
                                                            >
                                                                {member.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button> */}
                                                            <button
                                                                onClick={() => handleDelete(member._id, `${member.firstName} ${member.lastName}`)}
                                                                className="flex items-center gap-3 w-full py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Info */}
                                {pagination && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                        <div className="text-sm text-gray-500">
                                            Showing {staff.length} of {pagination.totalStaff} staff members
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No staff members found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm
                                        ? "No staff members match your search criteria"
                                        : "Start by adding your first staff member"}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => navigate("/admin/staff/add")}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <Plus size={18} />
                                        Add Your First Staff Member
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default AllStaff;