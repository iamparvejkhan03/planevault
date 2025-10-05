import { Gavel, Grid2X2, Home, LogIn, Search, UserCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePopUp } from "../contexts/PopUpContextProvider";

function MobileNav() {
    const { user } = useAuth();
    const { openPopup } = usePopUp();
    const navLinks = [
        { name: 'Home', href: '/', icon: <Home /> },
        { name: 'Auctions', href: '/auctions', icon: <Gavel /> },
        { name: 'Categories', onClick:() => openPopup('category'), icon: <Grid2X2 /> },
        { name: 'Account', href: `/login`, icon: <UserCircle /> },
    ];
    return (
        < nav className="lg:hidden fixed bottom-0 w-full bg-white px-5 py-2.5 text-sm [box-shadow:-5px_-5px_10px_rgba(0,0,0,0.2)] z-50" >
            <ul className="flex items-center justify-between md:justify-around">
                {
                    navLinks.map(link => (
                        <li key={link.name}>
                            <NavLink onClick={link?.onClick} to={link?.href} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 ${(isActive && link.name !== 'Categories') && 'text-secondary'}`}>
                                {link.icon}
                                <span>{link.name}</span>
                            </NavLink>
                        </li>
                    ))
                }
            </ul>
        </nav >
    );
}

export default MobileNav;