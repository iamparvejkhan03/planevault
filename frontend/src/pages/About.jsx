import { Verified, Upload, Tag, Gavel, BadgeCheck } from "lucide-react";
import { aboutUs } from "../assets";
import { Container, HowItWorksCard, Testimonial } from "../components";
import { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";

const stats = [
    {
        name: 'Trusted Marketplace',
        data: '100%'
    },
    {
        name: 'Completed Sales',
        data: '95%'
    },
    {
        name: 'Verified Listings',
        data: '100%'
    },
    {
        name: 'Customer Satisfaction',
        data: `5/5`
    }
];

const HowItWorks = [
    {
        icon: <Upload />,
        title: 'Create Your Listing',
        description: 'Upload details, photos, and documents for your aircraft, parts, or memorabilia.'
    },
    {
        icon: <Tag />,
        title: 'Set Terms & Reserve',
        description: 'Choose your reserve price and auction settings with full control.'
    },
    {
        icon: <Gavel />,
        title: 'Engage Bidders',
        description: 'Buyers compete in real time, driving the best possible outcome.'
    },
    {
        icon: <BadgeCheck />,
        title: 'Finalize the Sale',
        description: 'Complete secure transfer with verified documents and support every step.'
    }
];

const testimonials = [
    {
        name: 'Michael R.',
        review: 'Listing my aircraft on Plane Vault was straightforward, and I had serious bids within days. The process felt secure from start to finish.',
        location: 'Dallas, TX'
    },
    {
        name: 'Samantha L.',
        review: 'As a seller of vintage aviation memorabilia, I loved how easy it was to showcase my items. The support team guided me every step of the way.',
        location: 'Orlando, FL'
    },
    {
        name: 'James K.',
        review: 'I sold a set of aircraft parts through Plane Vault faster than I expected. The platform made payment and documentation smooth and reliable.',
        location: 'Seattle, WA'
    },
    {
        name: 'Olivia M.',
        review: 'What impressed me most was the transparency—no hidden fees, clear bidding rules, and buyers I could trust. Highly recommend Plane Vault to other sellers.',
        location: 'Miami, FL'
    },
    {
        name: 'Daniel P.',
        review: 'As a bidder, I appreciated how easy it was to track auctions and place bids. Everything felt fair and well organized.',
        location: 'Chicago, IL'
    },
    {
        name: 'Sophia H.',
        review: 'I found a rare propeller I’d been searching for. The documentation provided by the seller gave me complete confidence in my purchase.',
        location: 'New York, NY'
    },
    {
        name: 'Christopher B.',
        review: 'The escrow and FAA documentation process was seamless. I knew my money and my aircraft purchase were in safe hands.',
        location: 'Los Angeles, CA'
    },
    {
        name: 'Emma W.',
        review: 'Plane Vault made me feel like part of a real community of aviation enthusiasts. I’ve placed several bids already and plan to keep coming back.',
        location: 'Houston, TX'
    }
];

function About() {
    return (
        <section className="pt-32 pb-16 bg-gray-100 max-w-full text-gray-600">
            <Container>
                <h2 className="text-4xl md:text-5xl font-bold my-5 text-primary">About</h2>
                <p className="text-primary mt-4 mb-10">Every successful auction begins with trust and transparency. Discover how our mission is to provide both, ensuring sellers and buyers are confident at every step.</p>
            </Container>

            <Container className="grid lg:grid-cols-2 gap-5 mb-14 max-w-full items-start">
                <div className="bg-white rounded-2xl px-5 py-8 sm:p-8">
                    <h5 className="font-semibold text-secondary">How It Started</h5>
                    <h2 className="text-2xl md:text-4xl font-bold my-3 text-primary">Transforming Aircraft Auctions with Trust</h2>

                    <p>
                        PlaneVault was built on a simple idea: buying and selling aircraft shouldn’t be complicated or uncertain. Sellers needed a secure place to list, and buyers wanted confidence that what they saw was real. We created a platform designed to bridge that gap.
                        <br />
                        <br />
                        What began as a vision to simplify aviation transactions has now grown into a trusted marketplace connecting sellers and buyers worldwide. From entire aircraft to rare memorabilia and essential parts, Plane Vault makes every step clear, secure, and efficient.
                    </p>
                    <br />

                    <ul>
                        <li className="flex items-center gap-1"><Verified size={18} className="text-primary" /> Transparent, secure auction process</li>
                        <li className="flex items-center gap-1"><Verified size={18} className="text-primary" />Dedicated support for sellers and bidders</li>
                        <li className="flex items-center gap-1"><Verified size={18} className="text-primary" />Verified documentation and FAA guidance</li>
                        <li className="flex items-center gap-1"><Verified size={18} className="text-primary" />Streamlined listings with global reach</li>
                        <li className="flex items-center gap-1"><Verified size={18} className="text-primary" />Built by aviation enthusiasts, for aviation enthusiasts</li>
                    </ul>
                </div>

                <div className="flex flex-col h-full">
                    <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-grow">
                        <img src={aboutUs} loading="lazy" alt="About Us" className="absolute h-full w-full object-cover rounded-2xl" />
                    </div>
                    <div className="bg-white grid grid-cols-2 gap-5 p-5 sm:p-10 rounded-2xl mt-5">
                        {
                            stats.map(stat => (
                                <div key={stat.name}>
                                    <p className="text-3xl font-bold text-primary">{stat.data}</p>
                                    <p className="text-gray-600">{stat.name}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </Container>

            <Container>
                {/* How it works Section */}
                <section className="bg-white p-8 md:p-12 lg:p-14 rounded-2xl mb-14">
                    <h5 className="font-semibold text-secondary">How It Works</h5>
                    <h2 className="text-2xl md:text-3xl font-semibold my-5 text-primary">Quick, Clear, and Focused on Results</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-8">
                        {
                            HowItWorks && HowItWorks.map((howItWork, i) => {
                                return (
                                    <HowItWorksCard key={howItWork.title} index={i} icon={howItWork.icon} title={howItWork.title} description={howItWork.description} />
                                )
                            })
                        }
                    </div>
                </section>

                {/* Our vision and mission */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white px-5 py-8 sm:p-8 md:p-12 lg:p-14 rounded-2xl">
                    <div>
                        <h5 className="font-semibold text-secondary">Our Vision</h5>
                        <h2 className="text-2xl md:text-3xl font-semibold my-3 text-primary">A Trusted Marketplace for Aviation</h2>

                        <p className="text-gray-600">
                            We believe that buying and selling aircraft, parts, and memorabilia should be simple, secure, and transparent.
                            Our vision is to create a platform where sellers and buyers connect with confidence, backed by trust and integrity.
                        </p>
                    </div>

                    <div>
                        <h5 className="font-semibold text-secondary">Our Mission</h5>
                        <h2 className="text-2xl md:text-3xl font-semibold my-3 text-primary">Secure Auctions. Real Connections.</h2>

                        <p className="text-gray-600">
                            From streamlined listings to verified documentation and dedicated support, our mission is to make every auction
                            reliable and rewarding. We’re here to empower aviation enthusiasts and professionals
                            with a platform built for real results.
                        </p>
                    </div>
                </section>
            </Container >

            {/* Testimonials section */}
            <section className="my-14">
                <Container>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">
                        What Our Customers Say
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 mt-3">
                        Trusted by aviation enthusiasts worldwide — see why sellers and buyers rely on Plane Vault for every auction.
                    </p>
                    <Marquee speed={50} gradient={false} pauseOnHover={true}>
                        <div className="flex flex-wrap justify-between items-stretch gap-5 mt-8 mx-5 text-left">
                            {
                                testimonials.map(testimonial => (
                                    <Testimonial key={testimonial.name} name={testimonial.name} review={testimonial.review} location={testimonial.location} />
                                ))
                            }
                        </div>
                    </Marquee>
                </Container>
            </section>
        </section >
    );
}

export default About;