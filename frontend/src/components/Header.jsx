import { Link, NavLink, useLocation } from "react-router-dom";
import { closeMenu, darkLogo, logo, menuIcon } from "../assets";
import Container from "./Container";
import { ChevronDown, ChevronRight, LayoutDashboard, LogIn, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { usePopUp } from "../contexts/popups";

const navLinks = [
    {
        name: 'Home',
        href: '/'
    },
    {
        name: 'About',
        href: '/about'
    },
    {
        name: 'Contact',
        href: '/contact'
    },
    {
        name: 'Auctions',
        href: '/auctions'
    },
];

function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { pathname } = useLocation();

    const { popUps, setPopUps } = usePopUp();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        }

        setIsScrolled(pathname !== '/');

        pathname === '/' && window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname])

    return (
        <header className={`${isScrolled ? 'fixed bg-white bg-opacity-100 shadow-lg shadow-primary/5' : 'absolute bg-opacity-0'} w-full transition-all duration-150 z-50`}>
            <Container className={`flex items-center justify-between py-4`}>
                <Link to="/">
                    <img src={(isScrolled || isMenuOpen) ? `${darkLogo}` : `${logo}`} alt="PlaneVault Logo" className="h-10 md:h-12 z-10" />
                </Link>

                {/* Navlinks for larger screens */}
                <nav className="hidden lg:block">
                    <ul className="flex items-center gap-7">
                        <li>
                            <Search size={24} className={`${isScrolled ? 'text-black' : 'text-white'} cursor-pointer`} />
                        </li>
                        {
                            navLinks.map(link => (
                                <li key={link.name}>
                                    <NavLink to={link.href} className={({ isActive }) => `${isActive && isScrolled ? 'text-secondary' : isActive && !isScrolled ? 'text-secondary' : isScrolled ? 'text-black' : 'text-white'} hover:underline`}>
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))
                        }
                        <li className={`${isScrolled ? 'text-black' : 'text-white'}`}>
                            <button onClick={() => setPopUps({...popUps, category: true})} className="flex gap-1 items-end cursor-pointer hover:underline"><span>Categories</span> <ChevronRight /></button>
                        </li>
                        <li>
                            <button className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md cursor-pointer"><LogIn size={20} /> Log In</button>
                        </li>
                    </ul>
                </nav>

                {/* Navlinks for smaller screens */}
                <nav className={`lg:hidden bg-white absolute top-0 left-0 min-h-screen transition-all duration-200 overflow-hidden text-center flex items-center justify-center ${isMenuOpen ? 'w-full' : 'w-0'}`}>
                    <ul>
                        {
                            navLinks.map(link => (
                                <li onClick={() => setIsMenuOpen(false)} key={link.name} className="relative mx-5 py-2">
                                    <NavLink className={({ isActive }) => ``} to={link.href}>{link.name}</NavLink>
                                </li>
                            ))
                        }
                        <li>
                            {
                                <Link to='/user/dashboard' className="inline-flex items-center justify-center gap-1 text-white whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary hover:bg-blue-700">
                                    <LayoutDashboard size={24} strokeWidth={1.5} />

                                    <span>Dashboard</span>
                                </Link>
                            }
                        </li>
                    </ul>
                </nav>
                <div className="lg:hidden z-50 flex items-center gap-5">
                    <Search className={`${isMenuOpen || isScrolled ? 'text-black' : 'text-white'}`} onClick={() => ``} />
                    {
                        isMenuOpen ? (<img onClick={() => setIsMenuOpen(!isMenuOpen)} src={closeMenu} alt="menu icon" className={`h-7 cursor-pointer invert-25 z-50 ${isScrolled}`} />) : (<img onClick={() => setIsMenuOpen(!isMenuOpen)} src={menuIcon} alt="menu icon" className={`h-5 cursor-pointer ${isScrolled && 'invert'} z-50`} />)
                    }
                </div>
            </Container>
        </header>
    );
}

export default Header;