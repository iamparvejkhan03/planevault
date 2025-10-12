import { Verified, Upload, Tag, Gavel, BadgeCheck, UserCog2, UserPlus, Clock } from "lucide-react";
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

const HowItWorksSelling = [
    {
        icon: <Upload />,
        title: 'Submit Your Listing',
        description: 'Begin by submitting your aircraft, aviation parts, or memorabilia through our secure online form. Upload clear photos, accurate details, and any supporting documents to showcase your aircraft or aviation related item.'
    },
    {
        icon: <UserCog2 />,
        title: 'Expert Curation',
        description: `Our aviation specialists carefully review and refine each submission to ensure it's presented in the most compelling way possible. Every listing is tailored for maximum visibility, credebility, and results - giving both you and the buyer confidence in every transaction.`
    },
    {
        icon: <Gavel />,
        title: 'Go Live and Engage',
        description: `Once approved, your listing is published on PlaneVault for our global audience of qualified buyers. You'll have the opportunity to answer questions, share insights, and help your auction reach its highest potential.`
    },
    {
        icon: <BadgeCheck />,
        title: 'Complete the Sale',
        description: 'When the auction closes, PlaneVault connects the winning bidder and seller directly. From there, both parties finalize the transaction on their own terms. For security and convenience, we recommend completing payment through wire transfer or a trusted escrow service'
    }
];

const HowItWorksBuying = [
    {
        icon: <UserPlus />,
        title: 'Register to Bid',
        description: 'Create your Plane Vault account and register with a valid credit card. A temporary authorization hold verifies bidder commitment and ensures a trustworthy marketplace for all participants.'
    },
    {
        icon: <Clock />,
        title: 'Explore Auctions',
        description: 'Explore the live and timed auctions in a secure online environment. Follow active listings, place competitive bids, and monitor results in real time. Our platform ensures fairness and transparency.'
    },
    {
        icon: <Gavel />,
        title: 'Place Your Bid',
        description: `Once verified, you can place bids on any active listing. A hold is placed for the buyer's fee amount - this is only captured if you win. When the auction ends, all holds for non-winning bidders are automatically released.`
    },
    {
        icon: <BadgeCheck />,
        title: 'Finalize the Purchase',
        description: `After the auction closes, Plane Vault provides both parties with direct contact information. The buyer and seller then arrange payment and delivery through their preferred method. We recommend using wire transfer or escrow for secure transactions.`
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
        <section className="pt-24 md:pt-32 pb-16 bg-gray-100 max-w-full text-gray-600">
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
                        <li className="flex items-start gap-2">
                            <Verified size={18} className="text-primary flex-shrink-0 mt-1" />
                            <span>Transparent, secure auction process</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Verified size={18} className="text-primary flex-shrink-0 mt-1" />
                            <span>Dedicated support for sellers and bidders</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Verified size={18} className="text-primary flex-shrink-0 mt-1" />
                            <span>Verified documentation and FAA guidance</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Verified size={18} className="text-primary flex-shrink-0 mt-1" />
                            <span>Streamlined listings with global reach</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Verified size={18} className="text-primary flex-shrink-0 mt-1" />
                            <span>Built by aviation enthusiasts, for aviation enthusiasts</span>
                        </li>
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

            <Container className="my-14">
                <section className="">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">How It Works - Selling on PlaneVault</h2>
                    <p className="text-sm md:text-base text-gray-500 mt-3 mb-8">
                        Simple steps, seamless auctions — see how Plane Vault makes listing and selling aviation assets effortless.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 xl:gap-8">
                        {
                            HowItWorksSelling && HowItWorksSelling.map((howItWork, i) => {
                                return (
                                    <HowItWorksCard key={howItWork.title} index={i} icon={howItWork.icon} title={howItWork.title} description={howItWork.description} />
                                )
                            })
                        }
                    </div>
                </section>
            </Container>

            <Container className="my-14">
                <section className="">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">How It Works - Buying on PlaneVault</h2>
                    <p className="text-sm md:text-base text-gray-500 mt-3 mb-8">
                        Simple steps, seamless auctions — see how Plane Vault makes bidding and buying aviation assets effortless.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 xl:gap-8">
                        {
                            HowItWorksBuying && HowItWorksBuying.map((howItWork, i) => {
                                return (
                                    <HowItWorksCard key={howItWork.title} index={i} icon={howItWork.icon} title={howItWork.title} description={howItWork.description} />
                                )
                            })
                        }
                    </div>
                </section>
            </Container>

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