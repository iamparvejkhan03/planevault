import { useState } from "react";
import { BidderContainer, BidderHeader, BidderSidebar } from "../../components";
import { User, Mail, Phone, MapPin, Camera, Edit, Save, X, Shield, Lock, Upload, Award, Gavel, Heart, Star, TrendingUp } from "lucide-react";

const initialBidderData = {
    personalInfo: {
        firstName: "Alex",
        lastName: "Aviation",
        email: "alex@aviationenthusiast.com",
        phone: "+1 (555) 987-6543",
        avatar: "/api/placeholder/100/100",
        username: "aviation_alex",
        joinDate: "2022-03-15"
    },
    address: {
        street: "456 Skyline Drive",
        city: "Denver",
        state: "CO",
        zipCode: "80202",
        country: "United States"
    },
    preferences: {
        bidAlerts: true,
        outbidNotifications: true,
        newsletter: true,
        smsUpdates: false,
        favoriteCategories: ["Aviation Memorabilia", "Aircraft Parts"]
    }
};

function Profile() {
    const [bidderData, setBidderData] = useState(initialBidderData);
    const [isEditing, setIsEditing] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");
    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleInputChange = (section, field, value) => {
        setBidderData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        // In a real app, this would save to the backend
        setIsEditing(false);
        // toast.success("Profile updated successfully");
    };

    const handleCancel = () => {
        setBidderData(initialBidderData);
        setIsEditing(false);
        setAvatarPreview(null);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePreference = (preference) => {
        setBidderData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [preference]: !prev.preferences[preference]
            }
        }));
    };

    const sections = [
        { id: "personal", label: "Personal Info", icon: <User size={18} /> },
        { id: "address", label: "Address", icon: <MapPin size={18} /> },
        { id: "security", label: "Security", icon: <Shield size={18} /> }
    ];

    // Bidder-specific stats
    const bidderStats = {
        totalBids: 156,
        auctionsWon: 23,
        successRate: 68,
        watchlistItems: 12,
        totalSpent: 89250,
        avgBidAmount: 572,
        memberSince: "Mar 2022"
    };

    return (
        <section className="flex min-h-screen">
            <BidderSidebar />
            
            <div className="w-full relative">
                <BidderHeader />
                
                <BidderContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Bidder Profile</h2>
                        <p className="text-secondary">Manage your account settings and bidding preferences</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-1/4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex flex-col gap-2">
                                    {sections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                activeSection === section.id 
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
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={handleSave}
                                                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors"
                                                >
                                                    <Save size={16} />
                                                    Save Changes
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-2 bg-gray-200 text-secondary px-4 py-2 rounded-lg hover:bg-gray-300"
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
                                </div>

                                {/* Personal Information Section */}
                                {activeSection === "personal" && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="flex flex-col items-center">
                                                <div className="relative group">
                                                    <img 
                                                        src={avatarPreview || bidderData.personalInfo.avatar} 
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
                                                                        onChange={handleAvatarChange}
                                                                        accept="image/*"
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
                                                        value={bidderData.personalInfo.firstName}
                                                        onChange={(e) => handleInputChange("personalInfo", "firstName", e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-secondary">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={bidderData.personalInfo.lastName}
                                                        onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)}
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
                                                            value={bidderData.personalInfo.email}
                                                            onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                                                            disabled={!isEditing}
                                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1 md:col-span-2">
                                                    <label className="block text-sm font-medium text-secondary">Phone</label>
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={18} className="text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            value={bidderData.personalInfo.phone}
                                                            onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                                                            disabled={!isEditing}
                                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                        />
                                                    </div>
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
                                                value={bidderData.address.street}
                                                onChange={(e) => handleInputChange("address", "street", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">City</label>
                                            <input
                                                type="text"
                                                value={bidderData.address.city}
                                                onChange={(e) => handleInputChange("address", "city", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">State/Province</label>
                                            <input
                                                type="text"
                                                value={bidderData.address.state}
                                                onChange={(e) => handleInputChange("address", "state", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">ZIP/Postal Code</label>
                                            <input
                                                type="text"
                                                value={bidderData.address.zipCode}
                                                onChange={(e) => handleInputChange("address", "zipCode", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-secondary">Country</label>
                                            <select
                                                value={bidderData.address.country}
                                                onChange={(e) => handleInputChange("address", "country", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                            >
                                                <option value="United States">United States</option>
                                                <option value="Canada">Canada</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Germany">Germany</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Security Section */}
                                {activeSection === "security" && (
                                    <div className="space-y-6">
                                        <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
                                            <p className="text-sm text-secondary">
                                                For security reasons, password changes require additional verification. 
                                                You'll be logged out of all devices after changing your password.
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-secondary">Current Password</label>
                                                <div className="flex items-center gap-2">
                                                    <Lock size={18} className="text-gray-400" />
                                                    <input
                                                        type="password"
                                                        disabled={!isEditing}
                                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                    />
                                                </div>
                                            </div>
                                            <div></div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-secondary">New Password</label>
                                                <div className="flex items-center gap-2">
                                                    <Lock size={18} className="text-gray-400" />
                                                    <input
                                                        type="password"
                                                        disabled={!isEditing}
                                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-secondary">Confirm New Password</label>
                                                <div className="flex items-center gap-2">
                                                    <Lock size={18} className="text-gray-400" />
                                                    <input
                                                        type="password"
                                                        disabled={!isEditing}
                                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Shield size={16} />
                                            <span>Last password change: 3 months ago</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bidder Stats Cards */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                    <div className="p-3 rounded-lg mr-4 bg-blue-100">
                                        <Gavel size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Bids</p>
                                        <p className="font-semibold text-lg">{bidderStats.totalBids}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                    <div className="p-3 rounded-lg mr-4 bg-green-100">
                                        <Award size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Auctions Won</p>
                                        <p className="font-semibold text-lg">{bidderStats.auctionsWon}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
                                    <div className="p-3 rounded-lg mr-4 bg-amber-100">
                                        <TrendingUp size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Success Rate</p>
                                        <p className="font-semibold text-lg">{bidderStats.successRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BidderContainer>
            </div>
        </section>
    );
}

export default Profile;