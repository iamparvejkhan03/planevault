import { lazy, Suspense } from "react";
import { Hero, Container, Testimonial, HowItWorksCard, LoadingSpinner } from "../components";
import Marquee from "react-fast-marquee";
import { BadgeCheck, Gavel, Tag, Upload } from "lucide-react";
import { airBus, beechCraft, bell, cessna, diamond, mooney, pilatus, piper } from "../assets";

const FAQs = lazy(() => import('../components/FAQs'));
const CTA = lazy(() => import('../components/CTA'));

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

const trustedBrands = [
    // {
    //     src: cessna,
    //     alt: 'Cessna'
    // },
    {
        src: piper,
        alt: 'Piper'
    },
    {
        src: beechCraft,
        alt: 'Beech Craft'
    },
    {
        src: airBus,
        alt: 'Air Bus'
    },
    {
        src: bell,
        alt: 'Bell'
    },
    {
        src: diamond,
        alt: 'Diamond'
    },
    {
        src: mooney,
        alt: 'Mooney'
    },
    {
        src: pilatus,
        alt: 'Pilatus'
    },
];

function Home() {
    return (
        <>
            <Hero />

            {/* Marquee section */}
            <Container>
                <Marquee speed={50} gradient={false}>
                    <div className="flex gap-8 w-full mt-14 mr-8">
                        {
                            trustedBrands.map(brand => (
                                <div key={brand.alt} className="flex items-center justify-center border rounded-lg shadow hover:shadow-lg transition-all border-slate-200 p-4 md:p-5">
                                    <img src={brand.src} alt={brand.alt} className="h-5 sm:h-6 ms:h-7 lg:h-8 xl:h-9" />
                                </div>
                            ))
                        }
                    </div>
                </Marquee>
            </Container>

            {/* How it works Section */}
            <Container className="my-14">
                <section className="">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">How It Works</h2>
                    <p className="text-sm md:text-base text-gray-500 mt-3 mb-8">
                        Simple steps, seamless auctions — see how Plane Vault makes selling and buying aviation assets effortless.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 xl:gap-8">
                        {
                            HowItWorks && HowItWorks.map((howItWork, i) => {
                                return (
                                    <HowItWorksCard key={howItWork.title} index={i} icon={howItWork.icon} title={howItWork.title} description={howItWork.description} />
                                )
                            })
                        }
                    </div>
                </section>
            </Container>

            {/* Testimonials section */}
            <Container className="my-14">
                <section>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">
                        What Our Customers Say
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 mt-3">
                        Trusted by aviation enthusiasts worldwide — see why sellers and buyers rely on Plane Vault for every auction.
                    </p>
                    <Marquee speed={50} gradient={false} pauseOnHover={true}>
                        <div className="flex flex-wrap justify-between items-stretch gap-5 mb-1 mt-8 mx-5 text-left">
                            {
                                testimonials.map(testimonial => (
                                    <Testimonial key={testimonial.name} name={testimonial.name} review={testimonial.review} location={testimonial.location} />
                                ))
                            }
                        </div>
                    </Marquee>
                </section>
            </Container>

            {/* FAQs section */}
            <Container className="my-14">
                <Suspense fallback={<LoadingSpinner />}>
                    <FAQs faqs={faqs} />
                </Suspense>
            </Container>

            {/* CTA section */}
            <Container className="my-14">
                <Suspense fallback={<LoadingSpinner />}>
                    <CTA />
                </Suspense>
            </Container>
        </>
    )
}

export default Home;