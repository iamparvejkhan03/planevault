import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { StaffContainer, StaffHeader, StaffSidebar } from "../../components";
import { UserPlus, Mail, Lock, Phone, User, ArrowLeft, Save, X, Shield, Users, Gavel, Hand, Banknote, DollarSign, Tags, Video, MessageSquare, Settings, LayoutDashboard, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const AddStaff = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const navigate = useNavigate();
    const {user} = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            // phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const permissionOptions = [
        { value: "view_dashboard", label: "View Dashboard", icon: <LayoutDashboard size={16} /> },
        { value: "manage_users", label: "Manage Users", icon: <Users size={16} /> },
        { value: "manage_auctions", label: "Manage Auctions", icon: <Gavel size={16} /> },
        { value: "manage_bids", label: "Manage Bids", icon: <Hand size={16} /> },
        { value: "manage_offers", label: "Manage Offers", icon: <Hand size={16} /> },
        { value: "manage_transactions", label: "Manage Transactions", icon: <Banknote size={16} /> },
        { value: "manage_inquiries", label: "Manage Inquiries", icon: <MessageSquare size={16} /> },
        { value: "manage_comments", label: "Manage Comments", icon: <MessageCircle size={16} /> },
        { value: "manage_commissions", label: "Manage Commissions", icon: <Settings size={16} /> },
        { value: "manage_admins", label: "Manage Staff", icon: <Shield size={16} /> },
    ];

    const togglePermission = (permission) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                // phone: data.phone && data.phone.trim() !== "" ? data.phone : null,
                password: data.password,
                permissions: selectedPermissions,
            };

            const response = await axiosInstance.post("/api/v1/admin/staff/create", payload);

            if (response.data.success) {
                toast.success("Staff member created successfully!");
                reset();
                setSelectedPermissions([]);
                navigate("/staff/staff");
            }
        } catch (error) {
            console.error("Error creating staff:", error);
            toast.error(error?.response?.data?.message || "Failed to create staff");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <StaffSidebar />

            <div className="w-full relative">
                <StaffHeader />

                <StaffContainer>
                    <div className="pt-16 md:py-7">
                        <div className="flex items-center gap-3 mb-5">
                            <button
                                onClick={() => navigate("/staff/staff")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl md:text-4xl font-bold">Add Staff Member</h1>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Create a new staff account with specific permissions.
                        </p>

                        <div className="max-w-4xl">
                            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("firstName", {
                                                    required: "First name is required",
                                                    minLength: { value: 2, message: "Minimum 2 characters" },
                                                })}
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        {errors.firstName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("lastName", {
                                                    required: "Last name is required",
                                                    minLength: { value: 2, message: "Minimum 2 characters" },
                                                })}
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                        {errors.lastName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("email", {
                                                    required: "Email is required",
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: "Invalid email address",
                                                    },
                                                })}
                                                type="email"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="staff@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Phone (Optional) */}
                                    {/* <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone (Optional)
                                        </label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("phone")}
                                                type="tel"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                    </div> */}

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("password", {
                                                    required: "Password is required",
                                                    minLength: { value: 6, message: "Minimum 6 characters" },
                                                })}
                                                type="password"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                {...register("confirmPassword", {
                                                    required: "Please confirm your password",
                                                })}
                                                type="password"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Section */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Select which modules this staff member can access.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {permissionOptions.map((perm) => (
                                            <label
                                                key={perm.value}
                                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(perm.value)}
                                                    onChange={() => togglePermission(perm.value)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="flex items-center gap-2 text-sm text-gray-700">
                                                    {perm.icon}
                                                    {perm.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/staff/staff")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <UserPlus size={18} />
                                                Create Staff
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </StaffContainer>
            </div>
        </section>
    );
};

export default AddStaff;