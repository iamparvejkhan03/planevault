import {
    LayoutDashboard,
    LogOut,
    Users,
    Gavel,
    Shield,
    Settings,
    BarChart3,
    FileText,
    Flag,
    MessageSquare,
    CreditCard,
    Building,
    Award,
    Bell,
    X,
    Menu,
    Package,
    TrendingUp,
    UserCheck,
    DollarSign,
    UserCircle,
    MessageCircle,
    Hand,
    Tags,
    PoundSterling,
    Banknote,
    BanknoteArrowDown,
    BanknoteArrowUp,
    Video,
    UserPlus,
    ShieldUser
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logo } from "../../assets";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

// Define navigation with permissions
const allNavigation = [
    {
        name: 'Dashboard',
        path: '/staff/dashboard',
        icon: <LayoutDashboard size={20} />,
        permission: 'view_dashboard'
    },
    {
        name: 'Users',
        path: '/staff/users',
        icon: <Users size={20} />,
        permission: 'manage_users'
    },
    {
        name: 'Staff',
        path: '/staff/staff',
        icon: <ShieldUser size={20} />,
        permission: 'manage_admins'
    },
    {
        name: 'Auctions',
        path: '/staff/auctions/all',
        icon: <Gavel size={20} />,
        permission: 'manage_auctions'
    },
    {
        name: 'Bids',
        path: '/staff/bids',
        icon: <Hand size={20} />,
        permission: 'manage_bids'
    },
    {
        name: 'Offers',
        path: '/staff/offers',
        icon: <Hand size={20} />,
        permission: 'manage_offers'
    },
    {
        name: 'Transactions',
        path: '/staff/transactions',
        icon: <Banknote size={20} />,
        permission: 'manage_transactions'
    },
    {
        name: 'User Inquiries',
        path: '/staff/support/inquiries',
        icon: <MessageSquare size={20} />,
        permission: 'manage_inquiries'
    },
    {
        name: 'Commissions',
        path: '/staff/commissions',
        icon: <Settings size={20} />,
        permission: 'manage_commissions'
    },
    {
        name: 'Profile',
        path: '/staff/profile',
        icon: <UserCircle size={20} />,
        permission: null // Always show
    }
];

function Sidebar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [expandedMenus, setExpandedMenus] = useState([]);
    const { logout, user } = useAuth();
    const { permissions, loading: permissionsLoading, isAdmin } = usePermissions();

    // Filter navigation based on permissions (use permissions from hook, not user)
    const navigation = allNavigation.filter(item => {
        if (item.path === '/staff/profile') return true;
        if (!item.permission) return true;
        if (isAdmin) return true;
        return permissions.includes(item.permission);
    });

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isMobile]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    const toggleSubmenu = (menuName) => {
        setExpandedMenus(prev =>
            prev.includes(menuName)
                ? prev.filter(name => name !== menuName)
                : [...prev, menuName]
        );
    };

    const isMenuExpanded = (menuName) => expandedMenus.includes(menuName);

    // Get role display text
    const getRoleDisplay = () => {
        if (isAdmin) return { title: "Administrator", description: "Full System Access", bgColor: "bg-white", textColor: "text-black", badgeColor: "text-primary" };
        if (user?.userType === 'staff') return { title: "Staff Member", description: "Limited Access", bgColor: "bg-blue-900", textColor: "text-white", badgeColor: "text-blue-300" };
        return { title: "Admin", description: "System Access", bgColor: "bg-white", textColor: "text-black", badgeColor: "text-primary" };
    };

    const role = getRoleDisplay();

    // Show loading state while fetching permissions
    // if (permissionsLoading) {
    //     return (
    //         <aside className="fixed md:relative w-64 bg-bg-primary h-screen p-4">
    //             <div className="flex items-center justify-center h-32">
    //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    //             </div>
    //         </aside>
    //     );
    // }

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden ${isOpen && isMobile ? 'hidden' : 'fixed'} top-4 left-4 z-30 sm:z-40 p-2 rounded-md bg-primary text-pure-white`}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-[#1e2d3b] bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative w-64 bg-gradient-to-b from-black to-black/90 text-white h-screen md:h-auto md:min-h-screen overflow-y-auto z-50 p-4 flex flex-col 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo/Brand */}
                <div className="px-4 mb-8 flex items-center justify-between pb-2 border-b border-gray-700">
                    <Link to='/' className="z-50 mb-4 flex items-center gap-2">
                        <img src={logo} alt="logo" className="h-10" />
                        {/* <span className={`text-xl font-bold text-pure-white`}>JLTM</span> */}
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Role Badge */}
                <div className="px-4 mb-6">
                    <div className={`${role.bgColor} ${role.textColor} rounded-lg p-3 text-center`}>
                        <div className="flex items-center justify-center gap-2 ${role.badgeColor}">
                            <Shield size={16} />
                            <span className="text-sm font-medium">{role.title}</span>
                        </div>
                        <p className={`text-xs ${role.badgeColor} mt-1`}>{role.description}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-1">
                        {navigation.map((link) => (
                            <li key={link.name}>
                                {link.submenu ? (
                                    <div>
                                        <button
                                            onClick={() => toggleSubmenu(link.name)}
                                            className={`flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 hover:bg-white hover:text-black ${isMenuExpanded(link.name) ? 'bg-white text-black' : ''
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3">{link.icon}</span>
                                                <span>{link.name}</span>
                                            </div>
                                            <svg
                                                className={`w-4 h-4 transition-transform duration-200 ${isMenuExpanded(link.name) ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isMenuExpanded(link.name) && (
                                            <ul className="ml-6 mt-1 space-y-1">
                                                {link.submenu.map((subItem) => (
                                                    <li key={subItem.name}>
                                                        <NavLink
                                                            to={subItem.path}
                                                            onClick={() => isMobile && setIsOpen(false)}
                                                            className={({ isActive }) =>
                                                                `flex items-center p-2 rounded-lg text-sm transition-all duration-200 ${isActive
                                                                    ? 'bg-gray-800 text-white'
                                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                                }`
                                                            }
                                                        >
                                                            <span className="ml-2">{subItem.name}</span>
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={link.path}
                                        onClick={() => isMobile && setIsOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center p-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-white text-black shadow-lg'
                                                : 'text-white hover:bg-white hover:text-black'
                                            }`
                                        }
                                    >
                                        <span className="mr-3">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </NavLink>
                                )}
                            </li>
                        ))}
                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="flex items-center w-full p-3 mt-3 rounded-lg text-white hover:bg-red-600 transition-all duration-200"
                        >
                            <LogOut size={20} className="mr-3" />
                            <span>Log Out</span>
                        </button>
                    </ul>
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;