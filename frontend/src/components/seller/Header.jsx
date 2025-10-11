import { Bell, Home, LayoutDashboard, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Header() {
    const [notificationsCount] = useState(3);
    const { user } = useAuth();
    const { pathname } = useLocation();
    const dashboardType = pathname.split('/')[1];
    const navigate = useNavigate();

    return (
        <header className="bg-white w-full fixed top-0 md:static shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 z-20">
            {/* Left section with search */}
            <div className="flex-1 max-w-lg flex justify-end md:justify-start px-2">
                {/* <Link to={`/`} className="text-secondary"><Home size={22} /></Link> */}
                {
                    dashboardType === 'seller'
                    ?
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md cursor-pointer" onClick={() => navigate(`/bidder/dashboard`)}><RefreshCcw size={20} /> Bid</button>
                    :
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md cursor-pointer" onClick={() => navigate(`/seller/dashboard`)}><RefreshCcw size={20} /> Sell</button>
                }
            </div>

            {/* Right section with icons and user */}
            <div className="flex items-center space-x-4 md:space-x-5">
                {/* Notifications */}
                {/* <button className="relative p-2 text-secondary hover:text-black transition-colors">
                    <Bell size={22} />
                    {notificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notificationsCount}
                        </span>
                    )}
                </button> */}

                {/* User profile */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                        <Link to={`/seller/profile`} className="text-sm font-medium text-black">{user?.firstName + ' ' + user?.lastName}</Link>
                        <p className="text-xs text-secondary">{user.username}</p>
                    </div>
                    {
                        user?.image
                            ?
                            <Link to={`/seller/profile`}><img src={user?.image} alt="userImage" className="h-10 w-10 rounded-full" /></Link>
                            :
                            <Link to={`/seller/profile`} className="h-10 w-10 rounded-full bg-gradient-to-r from-black/70 to-black flex items-center justify-center text-white font-semibold">
                                {user?.firstName[0] + user?.lastName[0]}
                            </Link>
                    }
                </div>
            </div>
        </header >
    );
}

export default Header;