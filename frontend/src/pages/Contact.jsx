import { Container, FAQs } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import toast from 'react-hot-toast';
import { lazy, useState } from "react";
import { Clock, Gavel, Mail, MapPin, MessageCircleQuestion, Phone, Star, Store, User } from "lucide-react";
import { contactUs, logo, otherData } from "../assets";
import axiosInstance from "../utils/axiosInstance";

const faqs = [
    {
        question: "Who can list items for sale on Plane Vault?",
        answer: "Sellers must be at least 18 years old, legally capable of selling the item, and have full ownership or authorization to sell.",
    },
    {
        question: "What information do I need to provide in my listing?",
        answer: "You must provide accurate details such as make, model, year, serial number, registration, FAA documents, logbooks, and clear photos. If the item is not airworthy, you must disclose this.",
    },
    {
        question: "Can I set a reserve price on my listing?",
        answer: "Yes, you may set a reserve price. Once the reserve is met, the highest bid becomes binding and the seller is obligated to complete the sale.",
    },
    {
        question: "Are there any fees for selling?",
        answer: "No, listing fees and commissions do not apply currently, so the platform is free for sellers to list. Optional upgrades, such as featured placement, will also be available soon.",
    },
    {
        question: "What happens after my item sells?",
        answer: "You are required to complete the transfer of ownership, provide necessary FAA documentation such as the Bill of Sale and registration, and coordinate pickup or delivery with the buyer.",
    },
    {
        question: "Can I cancel my listing?",
        answer: "Active listings cannot be canceled without Plane Vault approval. Canceling without valid reason may impact your account standing.",
    },
    {
        question: "Am I allowed to negotiate or complete a sale outside the platform?",
        answer: "No, off-platform transactions to avoid fees are prohibited. All transactions must be completed through Plane Vault to ensure protection for both buyers and sellers.",
    },
];

function Contact() {
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            userType: '',
            message: '',
        }
    });

    const userType = watch('userType');

    const [sending, setSending] = useState(false);

    const submitHandler = async (contactData) => {
        try {
            setSending(true);

            const { data } = await axiosInstance.post('/api/v1/contact/submit', {
                name: contactData.name,
                email: contactData.email,
                phone: contactData.phone,
                userType: contactData.userType,
                message: contactData.message
            });

            if (data && data.success) {
                setSending(false);
                toast.success(data.message);
                reset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(data.message || 'Failed to submit your query');
            }
        } catch (error) {
            console.error('Submit contact form error:', error);
            setSending(false);
            toast.error(error.response?.data?.message || 'Failed to submit your query. Please try again.');
        }
    };

    return (
        <Container className={`pt-24 md:pt-32`}>
            <h2 className="text-4xl md:text-5xl font-bold my-5 text-primary text-center">Contact</h2>
            <p className="text-center text-primary">Get in touch with our team of experts. We're here to help.</p>

            <section className="grid grid-cols-1 lg:grid-cols-2 items-stretch border border-gray-200 [box-shadow:10px_10px_20px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(0,0,0,0.1)] overflow-hidden rounded-2xl my-14">
                <div className="p-5 md:p-7 lg:p-8 ">
                    <h2 className="text-2xl font-bold text-primary mb-6">
                        Leave Us A Message
                    </h2>
                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="name">
                                <User size={20} />
                                <span>Name *</span>
                            </label>
                            <input className="flex h-10 w-full rounded-md border-b border-b-gray-200 bg-background px-3 py-2 text-base focus:outline-1 focus:outline-primary md:text-sm mt-2" id="name" placeholder="eg. Nathan" {...register('name', { required: true })} />

                            {errors.name && (
                                <p className="text-sm text-orange-500 font-light">Name is required</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="email">
                                <Mail size={20} />
                                <span>Email *</span>
                            </label>
                            <input type="email" className="flex h-10 w-full rounded-md border-b border-b-gray-200 bg-background px-3 py-2 text-base focus:outline-none focus:border-b focus:border-b-primary md:text-sm mt-2" id="email" placeholder="name@example.com" {...register('email', { required: true })} />

                            {errors.email && (
                                <p className="text-sm text-orange-500 font-light">Email is required</p>
                            )}
                        </div>

                        <div className="text-gray-600 grid grid-cols-1 my-2 md:my-3">
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="phone">
                                <Phone size={20} />
                                <span>Phone</span>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="(+1) 917-XXX-XXXX"
                                className="text-black border-b border-b-gray-200 py-1.5 px-2 rounded my-2 focus-within:outline-2 focus-within:outline-primary"
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/[^0-9+\s()\-]/g, '');
                                }}
                                {...register('phone', {
                                    required: false,
                                    pattern: {
                                        value: /^[0-9+\s()\-]+$/,
                                        message: "Please enter a valid phone number (numbers, +, -, () only)"
                                    }
                                })}
                            />

                            {errors.phone?.type === 'required' && (
                                <p className="text-sm text-orange-500 font-light">Phone is required</p>
                            )}

                            {errors.phone?.type === 'pattern' && (
                                <p className="text-sm text-orange-500 font-light">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="userType">
                                <User size={20} />
                                <span>User Type</span>
                            </label>

                            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3 my-2">
                                <label className={`flex items-center gap-5 border  py-3 px-5 rounded cursor-pointer ${userType === 'bidder' ? 'border-primary' : 'border-gray-200'}`}>
                                    <input type="radio" value="bidder" hidden {...register('userType', { required: false })} />
                                    <Gavel size={40} className={`flex-shrink-0 p-2 rounded ${userType === 'bidder' ? 'bg-primary text-white' : 'bg-gray-200 text-primary'}`} />
                                    <div>
                                        <p className="text-sm font-semibold">I'm a bidder</p>
                                        <p className="text-sm text-gray-600">I need help related to bidding on the platform.</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer ${userType === 'seller' ? 'border-primary' : 'border-gray-200'}`}>
                                    <input type="radio" value="seller" hidden {...register('userType', { required: false })} />
                                    <Store size={40} className={`flex-shrink-0 p-2 rounded ${userType === 'seller' ? 'bg-primary text-white' : 'bg-gray-200 text-primary'}`} />
                                    <div>
                                        <p className="text-sm font-semibold">I'm a seller</p>
                                        <p className="text-sm text-gray-600">I need help related to listing on the platform.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="message">
                                <MessageCircleQuestion size={20} />
                                <span>Message *</span>
                            </label>
                            <textarea className="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base focus:outline-1 focus:outline-primary md:text-sm mt-2 min-h-[120px]" id="message" placeholder={`Tell us how we can help you...`} {...register('message', { required: true })}></textarea>

                            {errors.name && (
                                <p className="text-sm text-orange-500 font-light">Message is required</p>
                            )}
                        </div>

                        <button className="inline-flex items-center justify-center gap-2 text-sm font-medium h-11 rounded-md px-8 w-full bg-primary hover:bg-primary/90 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer" type="submit">
                            {
                                !sending ? 'Send Message' :
                                    (<span className="flex space-x-1">
                                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.1s]"></span>
                                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.1s]"></span>
                                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></span>
                                    </span>)
                            }
                        </button>
                    </form>
                </div>

                <div className="w-full relative  overflow-hidden">
                    <div className="inset-0 bg-gradient-to-r from-black/50 to-black-50 absolute" />

                    <img src={logo} alt="Logo" className="absolute top-7 left-7 h-10" loading="lazy" />

                    <div className="text-white absolute bottom-7 right-7 left-7">
                        <p className="text-base md:text-lg">I had such a great experience with the customer support team! They were super friendly and quick to respond. Big thumbs up!</p>

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                            <div>
                                <p className="font-semibold">Leo Jepard</p>
                                <p className="text-sm">PlaneVault's Bidder</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {
                                    Array(5).fill('').map((_, i) => (
                                        <Star key={i} />
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <img className="w-full h-full sm:max-h-[600px] md:max-h-[750px] lg:max-h-full xl:max-h-[760px] object-cover" loading="lazy" src={contactUs} alt="Contact Us" />
                </div>
            </section>

            <section className="flex flex-col gap-16 my-14">
                <div>
                    <h2 className="text-3xl font-bold text-primary">
                        Get In Touch
                    </h2>
                    <p className="text-primary mt-6 mb-8">
                        Have questions about bidding or the listing process? Reach out and we'll get back to you within 24 hours.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                <Phone size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                                    Phone
                                </h3>
                                <Link to={`tel:${otherData.phone}`} className="text-primary hover:underline">(347) 745-6985</Link>
                                <p className="text-sm text-gray-500">
                                    We respond within 24 hours
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                <Mail size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                                    Email
                                </h3>
                                <Link to={`mailto:${otherData.email}`} className="text-primary break-all hover:underline">{otherData.email}</Link>
                                <p className="text-sm text-gray-500">
                                    We respond within 24 hours
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                <MapPin size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                                    Location
                                </h3>
                                <p className="text-primary break-all hover:underline">{otherData.address}</p>
                                <p className="text-sm text-gray-500">
                                    We respond within 24 hours
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                                    Business Hours
                                </h3>
                                <p className="text-primary">
                                    Mon - Fri: 9:00 AM - 6:00 PM EST <br />
                                </p>
                                <p className="text-sm text-gray-500">
                                    Emergency Support Available
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="my-14">
                <FAQs faqs={faqs} />
            </section>
        </Container>
    );
}

export default Contact;