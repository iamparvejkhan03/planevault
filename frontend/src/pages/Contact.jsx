import { Container } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
// import axios from 'axios';
// import toast from 'react-hot-toast';
import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircleQuestion, Phone, Star, User } from "lucide-react";
import { contactUs, logo, otherData } from "../assets";

function Contact() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            userType: '',
            message: '',
        }
    });

    const [sending, setSending] = useState(false);

    const submitHandler = async (contactData) => {
        try {
            console.log(contactData);
            // setSending(true);
            // const { data } = await axios.post(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/emails/contact`, { name: contactData.name, email: contactData.email, phone: contactData.phone, userType: contactData.userType, message: contactData.message });

            // if (data && data.success) {
            //     setSending(false);
            //     toast.success(data.message);
            //     reset();
            //     window.scrollTo({ top: 0, behavior: 'smooth' });
            // } else {
            //     toast.error(data.message);
            // }
        } catch (error) {
            console.error(error);
            setSending(false);
        }
    }

    return (
        <Container className={`pt-32`}>
            <h2 className="text-4xl md:text-5xl font-bold my-5 text-primary text-center">Contact</h2>
            <p className="text-center text-primary">Get in touch with our team of experts. We're here to help.</p>
            <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 my-14">
                <div className="p-5 md:p-7 lg:p-8 border border-gray-200 [box-shadow:10px_10px_20px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(0,0,0,0.1)] rounded-2xl">
                    <h2 className="text-2xl font-bold text-primary mb-6">
                        Leave Us A Message
                    </h2>
                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="name">
                                <User size={20} />
                                <span>Name *</span>
                            </label>
                            <input className="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base focus:outline-1 focus:outline-blue-200 md:text-sm mt-2" id="name" placeholder="eg. Nathan" {...register('name', { required: true })} />

                            {errors.name && (
                                <p className="text-sm text-orange-500 font-light">Name is required</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="email">
                                <Mail size={20} />
                                <span>Email *</span>
                            </label>
                            <input type="email" className="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base focus:outline-1 focus:outline-blue-200 md:text-sm mt-2" id="email" placeholder="name@example.com" {...register('email', { required: true })} />

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
                                className="text-black border border-gray-200 py-1.5 px-2 rounded my-1 focus-within:outline-2 focus-within:outline-blue-200"
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

                            <input type="text" className="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base focus:outline-1 focus:outline-blue-200 md:text-sm mt-2" id="userType" placeholder="e.g. Addendum Consultation" {...register('userType', { required: false })} />
                        </div>

                        <div>
                            <label className="text-sm font-medium leading-none text-primary flex items-center gap-2" htmlFor="message">
                                <MessageCircleQuestion size={20} />
                                <span>Message *</span>
                            </label>
                            <textarea className="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base focus:outline-1 focus:outline-blue-200 md:text-sm mt-2 min-h-[120px]" id="message" placeholder={`Tell us how we can help you...`} {...register('message', { required: true })}></textarea>

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

                <div className="w-full relative rounded-2xl overflow-hidden">
                    <div className="inset-0 bg-gradient-to-r from-black/50 to-black-50 absolute" />

                    <img src={logo} alt="Logo" className="absolute top-7 left-7 h-10" />

                    <div className="text-white absolute bottom-7 right-7 left-7">
                        <p className="text-base md:text-lg">I had such a great experience with the customer support team! They were super friendly, quick to respond, and went above and beyond to help me out. Big thumbs up!</p>

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

                    <img className="max-h-[700px] w-full object-cover" src={contactUs} alt="Contact Us" />
                </div>

                <div className="flex flex-col gap-16 lg:col-span-2">
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
                </div>

            </section>
        </Container>
    );
}

export default Contact;