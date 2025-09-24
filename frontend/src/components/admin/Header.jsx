import {  Bell, Home } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationsCount] = useState(3);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchRef = useRef(null);

    return (
        <header className="bg-white w-full fixed top-0 md:static shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 z-20">
            {/* Left section with search */}
            <div className="flex-1 max-w-lg flex justify-end md:justify-start px-2">
                <Link to={`/`} className="text-secondary"><Home size={22} /></Link>
            </div>

            {/* Right section with icons and user */}
            <div className="flex items-center space-x-4 md:space-x-5">
                {/* Notifications */}
                <button className="relative p-2 text-secondary hover:text-black transition-colors">
                    <Bell size={22} />
                    {notificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notificationsCount}
                        </span>
                    )}
                </button>

                {/* User profile */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-black">John The Bidder</p>
                        <p className="text-xs text-secondary">john7890</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-black/70 to-black flex items-center justify-center text-white font-semibold">
                        JA
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;