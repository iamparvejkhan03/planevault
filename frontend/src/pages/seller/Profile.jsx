import { useState, useEffect } from "react";
import { LoadingSpinner, SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import {
    User, Mail, Phone, MapPin, Camera, Edit, Save, X, Shield, Lock,
    Upload, Award, Gavel, Heart, Star, TrendingUp, Bell, Newspaper,
    Target,
    DollarSign,
    BarChart3
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

// Default preferences
const defaultPreferences = {
    bidAlerts: true,
    outbidNotifications: true,
    newsletter: true,
    smsUpdates: false,
    favoriteCategories: []
};

function Profile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Fetch user data and stats on component mount
    useEffect(() => {
        fetchUserData();
        fetchUserStats();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/v1/users/profile');
            if (data.success) {
                setUserData(data.data.user);
            } else {
                setError('Failed to fetch profile data');
            }
        } catch (err) {
            setError('Error loading profile data');
            console.error('Fetch profile error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/users/stats/seller');
            if (data.success) {
                setStats(data.data.statistics);
            }
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    };

    const handleInputChange = (field, value) => {
        setUserData(prev => {
            if (field.includes('.')) {
                // Handle nested fields like address.street
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                };
            } else {
                // Handle direct fields like firstName, lastName
                return {
                    ...prev,
                    [field]: value
                };
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const formData = new FormData();

            // Add personal info - use the direct field names
            formData.append('firstName', userData.firstName || '');
            formData.append('lastName', userData.lastName || '');
            formData.append('phone', userData.phone || '');

            // Add address if it exists
            if (userData.address) {
                formData.append('street', userData.address.street || '');
                formData.append('city', userData.address.city || '');
                formData.append('state', userData.address.state || '');
                formData.append('zipCode', userData.address.zipCode || '');
                formData.append('country', userData.address.country || '');
            }

            // Add country info
            formData.append('countryCode', userData.countryCode || '');
            formData.append('countryName', userData.countryName || '');

            // Add image if changed
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const { data } = await axiosInstance.put('/api/v1/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                setUserData(data.data.user);
                setIsEditing(false);
                setImagePreview(null);
                setImageFile(null);
                // You can add a toast notification here
            }
        } catch (err) {
            setError('Failed to update profile');
            console.error('Update profile error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (passwords) => {
        try {
            setSaving(true);
            const { data } = await axiosInstance.put('/api/v1/users/change-password', passwords);
            if (data.success) {
                // You can add a toast notification here
                return true;
            }
        } catch (err) {
            setError('Failed to change password');
            console.error('Change password error:', err);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesChange = async (preferences) => {
        try {
            const { data } = await axiosInstance.put('/api/v1/users/preferences', { preferences });
            if (data.success) {
                setUserData(data.data.user);
                return true;
            }
        } catch (err) {
            setError('Failed to update preferences');
            console.error('Update preferences error:', err);
            return false;
        }
    };

    const handleCancel = () => {
        fetchUserData(); // Reload original data
        setIsEditing(false);
        setImagePreview(null);
        setImageFile(null);
        setError(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePreference = async (preference) => {
        const newPreferences = {
            ...userData.preferences,
            [preference]: !userData.preferences[preference]
        };

        const success = await handlePreferencesChange(newPreferences);
        if (success) {
            setUserData(prev => ({
                ...prev,
                preferences: newPreferences
            }));
        }
    };

    const sections = [
        { id: "personal", label: "Personal Info", icon: <User size={18} /> },
        { id: "address", label: "Address", icon: <MapPin size={18} /> },
        // { id: "preferences", label: "Preferences", icon: <Bell size={18} /> },
        { id: "security", label: "Security", icon: <Shield size={18} /> }
    ];

    if (loading) {
        return (
            <section className="flex min-h-screen">
                <SellerSidebar />
                <div className="w-full relative">
                    <SellerHeader />
                    <SellerContainer>
                        <div className="flex justify-center items-center min-h-96">
                            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> */}
                            <LoadingSpinner />
                        </div>
                    </SellerContainer>
                </div>
            </section>
        );
    }

    if (!userData) {
        return (
            <section className="flex min-h-screen">
                <SellerSidebar />
                <div className="w-full relative">
                    <SellerHeader />
                    <SellerContainer>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600">Failed to load profile data</p>
                            <button
                                onClick={fetchUserData}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </SellerContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen">
            <SellerSidebar />

            <div className="w-full relative">
                <SellerHeader />

                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Seller Profile</h2>
                        <p className="text-secondary">Manage your account settings and bidding preferences</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex flex-col gap-2">
                                    {sections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === section.id
                                                ? `text-white bg-black font-medium`
                                                : "text-secondary hover:bg-gray-100"
                                                }`}
                                        >
                                            {section.icon}
                                            <span>{section.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:w-3/4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {/* Header with Edit/Save buttons */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold">
                                        {sections.find(s => s.id === activeSection)?.label}
                                    </h3>
                                    {activeSection !== 'preferences' && activeSection !== 'security' && (
                                        <div className="flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={saving}
                                                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50"
                                                    >
                                                        <Save size={16} />
                                                        {saving ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        disabled={saving}
                                                        className="flex items-center gap-2 bg-gray-200 text-secondary px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                                    >
                                                        <X size={16} />
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Personal Information Section */}
                                {activeSection === "personal" && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="flex flex-col items-center">
                                                {/* Avatar upload section remains the same */}
                                                <div className="relative group">
                                                    <img
                                                        src={imagePreview || userData.image || '/api/placeholder/100/100'}
                                                        alt="Profile"
                                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                                    />
                                                    {isEditing && (
                                                        <>
                                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                                <label className="text-white cursor-pointer">
                                                                    <Camera size={24} />
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        onChange={handleImageChange}
                                                                        accept="image/*"
                                                                        name="image"
                                                                    />
                                                                </label>
                                                            </div>
                                                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md">
                                                                <Upload size={12} className="text-secondary" />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {isEditing && (
                                                    <p className="text-sm text-gray-500 mt-3">Click on image to upload new photo</p>
                                                )}
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-secondary">First Name</label>
                                                    <input
                                                        type="text"
                                                        value={userData.firstName || ''}
                                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-secondary">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={userData.lastName || ''}
                                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-1 md:col-span-2">
                                                    <label className="block text-sm font-medium text-secondary">Email</label>
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={18} className="text-gray-400" />
                                                        <input
                                                            type="email"
                                                            value={userData.email || ''}
                                                            disabled
                                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100"
                                                        />
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                                                </div>
                                                <div className="space-y-1 md:col-span-2">
                                                    <label className="block text-sm font-medium text-secondary">Phone</label>
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={18} className="text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            value={userData.phone || ''}
                                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                                            disabled={!isEditing}
                                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-secondary">Username</label>
                                                    <input
                                                        type="text"
                                                        value={userData.username || ''}
                                                        disabled
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-secondary">Member Since</label>
                                                    <input
                                                        type="text"
                                                        value={new Date(userData.createdAt).toLocaleDateString()}
                                                        disabled
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Address Section */}
                                {activeSection === "address" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="block text-sm font-medium text-secondary">Street Address</label>
                                            <input
                                                type="text"
                                                value={userData.address?.street || ''}
                                                onChange={(e) => handleInputChange('address.street', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">City</label>
                                            <input
                                                type="text"
                                                value={userData.address?.city || ''}
                                                onChange={(e) => handleInputChange('address.city', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">State/Province</label>
                                            <input
                                                type="text"
                                                value={userData.address?.state || ''}
                                                onChange={(e) => handleInputChange('address.state', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">ZIP/Postal Code</label>
                                            <input
                                                type="text"
                                                value={userData.address?.zipCode || ''}
                                                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">Country</label>
                                            <input
                                                type="text"
                                                value={userData.address?.country || userData.countryName || ''}
                                                onChange={(e) => handleInputChange('address.country', e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                                {/* <option value="United States">United States</option>
                                                <option value="Canada">Canada</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Germany">Germany</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Other">Other</option>
                                            </select> */}
                                        </div>
                                    </div>
                                )}

                                {/* Preferences Section */}
                                {/* {activeSection === "preferences" && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-lg">Notification Preferences</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Bell size={20} className="text-blue-500" />
                                                        <div>
                                                            <p className="font-medium">Bid Alerts</p>
                                                            <p className="text-sm text-gray-500">Get notified when new auctions match your interests</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => togglePreference('bidAlerts')}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                            userData.preferences?.bidAlerts ? 'bg-blue-600' : 'bg-gray-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                userData.preferences?.bidAlerts ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Bell size={20} className="text-red-500" />
                                                        <div>
                                                            <p className="font-medium">Outbid Notifications</p>
                                                            <p className="text-sm text-gray-500">Get notified when someone outbids you</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => togglePreference('outbidNotifications')}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                            userData.preferences?.outbidNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                userData.preferences?.outbidNotifications ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Newspaper size={20} className="text-green-500" />
                                                        <div>
                                                            <p className="font-medium">Newsletter</p>
                                                            <p className="text-sm text-gray-500">Receive weekly updates and featured auctions</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => togglePreference('newsletter')}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                            userData.preferences?.newsletter ? 'bg-blue-600' : 'bg-gray-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                userData.preferences?.newsletter ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Phone size={20} className="text-purple-500" />
                                                        <div>
                                                            <p className="font-medium">SMS Updates</p>
                                                            <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => togglePreference('smsUpdates')}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                            userData.preferences?.smsUpdates ? 'bg-blue-600' : 'bg-gray-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                userData.preferences?.smsUpdates ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )} */}

                                {/* Security Section */}
                                {activeSection === "security" && (
                                    <PasswordChangeForm
                                        onChangePassword={handlePasswordChange}
                                        saving={saving}
                                    />
                                )}
                            </div>

                            {/* Seller Stats Cards */}
                            {stats && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                        <div className="p-3 rounded-lg mr-4 bg-blue-100">
                                            <Award size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Auctions</p>
                                            <p className="font-semibold text-lg">{stats.totalAuctions}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                        <div className="p-3 rounded-lg mr-4 bg-green-100">
                                            <TrendingUp size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Sold Auctions</p>
                                            <p className="font-semibold text-lg">{stats.soldAuctions}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                        <div className="p-3 rounded-lg mr-4 bg-amber-100">
                                            <Target size={20} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Success Rate</p>
                                            <p className="font-semibold text-lg">{stats.successRate}%</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                        <div className="p-3 rounded-lg mr-4 bg-purple-100">
                                            <DollarSign size={20} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Revenue</p>
                                            <p className="font-semibold text-lg">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    minimumFractionDigits: 0
                                                }).format(stats.totalRevenue)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                        <div className="p-3 rounded-lg mr-4 bg-red-100">
                                            <Gavel size={20} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Bids Received</p>
                                            <p className="font-semibold text-lg">{stats.totalBidsReceived}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                        <div className="p-3 rounded-lg mr-4 bg-indigo-100">
                                            <BarChart3 size={20} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Avg. Sale Price</p>
                                            <p className="font-semibold text-lg">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    minimumFractionDigits: 0
                                                }).format(stats.avgSalePrice)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </SellerContainer>
            </div>
        </section>
    );
}

// Password Change Form Component
const PasswordChangeForm = ({ onChangePassword, saving }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage('New passwords do not match');
            return;
        }

        if (passwords.newPassword.length < 6) {
            setMessage('New password must be at least 6 characters long');
            return;
        }

        const success = await onChangePassword({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
        });

        if (success) {
            setMessage('Password changed successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
                <p className="text-sm text-secondary">
                    Use a strong password that's hard to guess. Strong password provides you an additional layer of security to your account and data.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-secondary">Current Password</label>
                    <div className="flex items-center gap-2">
                        <Lock size={18} className="text-gray-400" />
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-secondary">New Password</label>
                    <div className="flex items-center gap-2">
                        <Lock size={18} className="text-gray-400" />
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-secondary">Confirm New Password</label>
                    <div className="flex items-center gap-2">
                        <Lock size={18} className="text-gray-400" />
                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Changing Password...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
};

export default Profile;