import { Link, NavLink, useNavigate } from "react-router-dom";
import { Container } from "../components";
import { logo, otherData } from "../assets";
import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter, X, Youtube } from "lucide-react";


function Footer() {
    const navigate = useNavigate();

    const quickLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Auctions', href: '/auctions' },
        { name: 'FAQs', href: '/faqs' },
    ];

    const legalPolicies = [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Use', href: '/terms-of-use' },
        { name: 'Seller Agreement', href: '/seller-agreement' },
        { name: 'Buyer Agreement', href: '/buyer-agreement' },
        { name: 'Payment Refund Policy', href: '/payment-refund-policy' },
    ];

    const categories = [
        { name: 'Aircrafts', href: '/aircrafts' },
        { name: 'Engines & Parts', href: '/parts' },
        { name: 'Aviation Memorabilia', href: '/memorabilia' },
    ];

    const categoryImg = [
        {
            title: 'Aircraft',
        },
        {
            title: 'Engines & Parts',
        },
        {
            title: 'Memorabilia',
        }
    ];

    const handleSearchByCategory = (title) => {
        const params = new URLSearchParams();
        params.append('category', title);

        navigate(`/auctions?${params.toString()}`);
    }

    return (
        <footer className="bg-primary text-gray-200 font-light py-12">
            <Container className=' px-6 md:px-16 lg:px-24 xl:px-32'>
                <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                    <div className='max-w-80'>
                        <Link to='/' className="flex gap-2 z-50 mb-4">
                            <img src={logo} alt="logo" className="h-12" />
                        </Link>
                        <p className=''>
                            Bid confidently on verified aircraft and rare aviation collectibles, with real-time auction updates to ensure every bidding experience is seamless, transparent, and trusted.
                        </p>
                        <div className='flex items-center gap-3 mt-4'>
                            {/* Instagram */}
                            <Link to="https://www.instagram.com/plane_vault/" target="_blank">
                                <Instagram strokeWidth={1.25} />
                            </Link>

                            {/* Facebook */}
                            <Link to="https://www.facebook.com/people/Plane-Vault/61581993906127/" target="_blank">
                                <Facebook strokeWidth={1.25} />
                            </Link>

                            {/* LinkedIn */}
                            {/* <Link to="https://www.linkedin.com/" target="_blank">
                                <Linkedin strokeWidth={1.25} />
                            </Link> */}

                            {/* YouTube */}
                            {/* <Link to="https://www.youtube.com/" target="_blank">
                                <Youtube strokeWidth={1.25} />
                            </Link> */}
                        </div>
                    </div>

                    <div>
                        <p className='text-lg text-gray-300 font-semibold'>
                            Quick Links
                        </p>
                        <ul className='mt-3 flex flex-col gap-2 '>
                            {
                                quickLinks.map(link => (
                                    <li className="relative py-1" key={link.name}>
                                        <NavLink className={({ isActive }) => `text-white after:bg-white hover:underline`} to={link.href}>{link.name}</NavLink>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div>
                        <p className='text-lg text-gray-300 font-semibold'>
                            Categories
                        </p>
                        <ul className='mt-3 flex flex-col gap-2 '>
                            {
                                categoryImg.map(category => (
                                    <li key={category.title} title={category.title} onClick={() => handleSearchByCategory(category.title)} className="cursor-pointer hover:underline" >{category.title}</li>
                                ))
                            }
                        </ul>
                    </div>

                    <div>
                        <p className='text-lg text-gray-300 font-semibold'>
                            Legal Policies
                        </p>
                        <ul className='mt-3 flex flex-col gap-2 '>
                            {
                                legalPolicies.map(service => (
                                    <li key={service.name}>
                                        <Link to={service.href} className="hover:underline">{service.name}</Link>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className='max-w-80'>
                        <p className='text-lg text-gray-300 font-semibold'>
                            Reach Out
                        </p>
                        <ul className='mt-3 flex flex-col gap-2'>
                            <li className="flex items-center gap-2">
                                <Phone size={18} />

                                <Link className="hover:underline" to={`tel:+1${otherData.phone}`}>(941) 391-1070</Link>
                            </li>

                            <li className="flex items-center gap-2">
                                <Mail size={18} />

                                <Link className="hover:underline" to={`mailto:${otherData.email}`}>{otherData.email}</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className='border-gray-300 mt-8' />

                <div className='flex flex-col md:flex-row gap-2 md:items-center justify-between py-5'>
                    <p>
                        <span>© {new Date().getFullYear()} &nbsp;</span>
                        <Link to="/" className="underline">
                            PlaneVault LLC.
                        </Link>
                        &nbsp; All rights reserved. &nbsp;
                    </p>
                    <div className="flex flex-wrap flex-row gap-4 items-center">
                        <Link to={'/terms-of-use'} className="hover:underline">Terms of Use</Link>
                        <Link to={'/privacy-policy'} className="hover:underline">Privacy Policy</Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;