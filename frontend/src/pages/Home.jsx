import { lazy, Suspense } from "react";
import { Hero, Container, Testimonial, HowItWorksCard, LoadingSpinner, About, AuctionCard } from "../components";
import Marquee from "react-fast-marquee";
import { BadgeCheck, Gavel, Tag, Upload, Filter, UserCog2, LucideVerified, UserPlus, Clock } from "lucide-react";
import { airBus, beechCraft, bell, cessna, cirrus, diamond, engineCategoryIcon, mooney, pilatus, piper } from "../assets";
import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        question: "Are there any fees for buying?",
        answer: "Yes, 5% will get charged to the card on file at the close of the auction to the winning bidder, with a maximum commission of $10,000 for all sales under $500,000 and 3% for all sales over $500,000.",
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

const trustedBrands = [
    {
        src: cessna,
        alt: 'Cessna'
    },
    {
        src: cirrus,
        alt: 'Cirrus'
    },
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

const categoryIcons = [
    {
        name: 'Jets',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55.1 46.7">
            <rect x="9.5" y="24.6" fill="currentColor" width="12.6" height="1.1" />
            <rect x="33" y="24.6" fill="currentColor" width="12.6" height="1.1" />
            <path fill="currentColor" d="M53.9,21.2c0-0.3-0.5-0.6-1.1-0.6l-20.7-3.6l0,1V25l0.7,0v-0.6h13V25l6.7,0c0.8,0,1.4-0.3,1.4-0.7L53.9,21.2z" />
            <path fill="currentColor" d="M22.3,25l0.7,0l0-8L2.2,20.7c-0.6,0-1.1,0.3-1.1,0.6l0,3.1c0,0.4,0.6,0.7,1.4,0.7l6.7,0v-0.6h13V25z" />
            <path fill="currentColor" d="M20.7,27.6l0.7,6.7c0,0.3,0.2,0.5,0.6,0.5h2.8c0.3,0,0.6-0.2,0.6-0.5v-6.9c0-0.3-0.2-0.5-0.5-0.5l-3.5,0.2C21,27.1,20.7,27.3,20.7,27.6z" />
            <path fill="currentColor" d="M29.9,27.4v6.9c0,0.3,0.2,0.5,0.6,0.5h2.8c0.3,0,0.6-0.2,0.6-0.5l0.7-6.7c0-0.3-0.2-0.5-0.6-0.5l-3.5-0.2C30.1,26.9,29.9,27.1,29.9,27.4z" />
            <path fill="currentColor" d="M27.2,1l-0.5,0.6c-1.8,2.1-2.8,6.7-2.9,9.5c0,0,0,0,0,0c0,0,0,0,0,0l0.2,15l0,0.5l0.7,0c0.4,0,0.8,0.3,0.8,0.8v7.4L24,36.9l0.1,2.1l1.3-0.4c-0.1,0.1-0.2,0.3-0.3,0.3l-5.3,3.2v2.1l6.1-1.9l1.5-0.5c0,0,0.1,0,0.1,0l1.6,0.5l6,1.8v-2.1L30,38.8c-0.1,0-0.1-0.1-0.2-0.2l1.2,0.3l0.1-2.1l-1.5-2.1v-7.4c0-0.4,0.4-0.8,0.8-0.8l0.6,0l0-0.6l0.2-15c-0.1-2.8-1.1-7.4-2.9-9.5L27.8,1" />
        </svg>,
    },
    {
        name: 'Light Sport',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="15 0 100 80">
            <path fill="currentColor" d="M56.32,17.11h19.42c.44,0,.79-.35.79-.79s-.35-.79-.79-.79h-7.21l-2.27-2.6-2.75,2.6h-7.18c-.44,0-.79.35-.79.79s.35.79.79.79Z" />
            <polygon fill="currentColor" points="72.12 53.01 72.48 27.48 72.48 18.65 60.02 18.65 60.02 27.48 60.13 53.01 61.38 69.11 53.1 69.86 53.1 77.28 79.15 77.28 79.15 69.86 70.87 69.11 72.12 53.01" />
            <path fill="currentColor" d="M106.67,30.35c-16.5-3.54-32.46-1.28-32.46-1.28v21.11s15.96,2.26,32.46-1.28c.69-.15,1.17-.76,1.17-1.46v-15.62c0-.7-.49-1.32-1.17-1.46Z" />
            <path fill="currentColor" d="M58.2,29.06s-15.96-2.26-32.46,1.28c-.69.15-1.17.76-1.17,1.46v15.62c0,.7.49,1.32,1.17,1.46,16.5,3.54,32.46,1.28,32.46,1.28v-21.11Z" />
        </svg>,
    },
    {
        name: 'Multi Engine',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.7 39.3">
            <path fill="currentColor" d="M17.2,7.9h-3.6l-0.5,0.2l-1.4-1.4c-0.1-0.1-0.2-0.1-0.3,0l-1.4,1.4L9.6,7.9H6c-0.6,0-1,0.2-1,0.5s0.4,0.5,1,0.5h5.5c0.1,0,0.2,0,0.2,0h5.5c0.6,0,1-0.2,1-0.5S17.7,7.9,17.2,7.9z" />
            <path fill="currentColor" d="M45.6,7.9H42l-0.5,0.2l-1.4-1.4c-0.1-0.1-0.2-0.1-0.3,0l-1.4,1.4L38,7.9h-3.6c-0.6,0-1,0.2-1,0.5s0.4,0.5,1,0.5h5.5c0.1,0,0.2,0,0.2,0h5.5c0.6,0,1-0.2,1-0.5S46.2,7.9,45.6,7.9z" />
            <path fill="currentColor" d="M28.9,33.5c-0.1-0.2-0.1-0.4-0.1-0.6l0.7-9.9l0.2-13c-0.1-3-1.1-5.9-2.9-8.1l-0.5-0.7C26,1,25.7,1,25.5,1.1L25,1.8c-1.8,2.2-2.8,5.1-2.9,8.1c0,0,0,0,0,0c0,0,0,0,0,0l0.2,13l0,0l0.1,0L23,33c0,0.2,0,0.4-0.1,0.6l-4.7,0.3l0,4.4l7.7,0l7.7-0.1l0-4.3L28.9,33.5z" />
            <path fill="currentColor" d="M21.6,22.9l-0.1-13l-7.1,0V9.2H8.8v0.7l-6.2,0c-0.7,0-1.3,0.6-1.3,1.3l0,9.3c0,0.6,0.4,1,1,1.1L21.6,22.9L21.6,22.9z" />
            <path fill="currentColor" d="M50.3,11.1c0-0.7-0.6-1.3-1.3-1.3l-6.2,0V9.2h-5.6v0.6l-7,0l-0.1,13l19.3-1.5c0.6,0,1-0.5,1-1.1L50.3,11.1z" />
        </svg>,
    },
    {
        name: 'Single Engine',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.7 39.3">
            <path fill="currentColor" d="M29,33.6c-0.1-0.2-0.1-0.4-0.1-0.6l0.7-8.9l-7.2,0l0.8,9.1c0,0.2,0,0.4-0.1,0.6L18.3,34l0,4.4l7.7,0l7.7-0.1l0-4.3L29,33.6z" />
            <path fill="currentColor" d="M29.7,23l20-0.6c0.4,0,0.8-0.4,0.8-0.8l0-10c0-0.4-0.3-0.8-0.8-0.8l-20-0.8l0,0c0,0,0,0-0.1,0l-7.4,0c0,0,0,0,0,0c0,0,0,0,0,0l0,0l-20,1c-0.4,0-0.8,0.4-0.8,0.8l0,10c0,0.4,0.3,0.8,0.8,0.8L21.7,23L29.7,23z" />
            <path fill="currentColor" d="M24.9,3.5l-2.5,0.2c-0.1,0.2-0.2,0.7-0.2,1l0,4.4c0,0,0,0,0.1,0l7.4,0c0,0,0,0,0,0c0,0,0,0,0.1,0l0-4.4c0-0.3-0.1-0.6-0.3-0.9l-2.3-0.2L24.9,3.5z" />
            <path fill="currentColor" d="M31.5,2h-3.6l-0.5,0.2l-1.4-1.4c-0.1-0.1-0.2-0.1-0.3,0l-1.4,1.4L23.9,2h-3.6c-0.6,0-1,0.2-1,0.5s0.4,0.5,1,0.5h5.5c0.1,0,0.2,0,0.2,0h5.5c0.6,0,1-0.2,1-0.5S32.1,2,31.5,2z" />
        </svg>,
    },
    {
        name: 'Special Use',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 40.5">
            <path fill="currentColor" d="M51.5,21.8c0,0.4-0.3,0.8-0.8,0.8l-9.4,0.3L36.3,23l-5.6,0.2l-8,0L3.3,22.8c-0.4,0-0.8-0.4-0.8-0.8l0-10c0-0.4,0.3-0.8,0.8-0.8l20-1v0c0,0,0,0,0.1,0l7.3,0c0,0,0,0,0.1,0v0l10.7,0.5l9.4,0.4c0.4,0,0.8,0.4,0.8,0.8L51.5,21.8z" />
            <path fill="currentColor" d="M25.9,3.7l-2.5,0.2c-0.1,0.2-0.2,0.7-0.2,1l0,4.4c0,0,0,0,0.1,0l7.4,0c0,0,0,0,0,0c0,0,0,0,0.1,0l0-4.4c0-0.3-0.1-0.6-0.3-0.9L28,3.7L25.9,3.7z" />
            <path fill="currentColor" d="M32.5,2.2h-3.6l-0.5,0.2L27.1,1c-0.1-0.1-0.2-0.1-0.3,0l-1.4,1.4l-0.5-0.2h-3.6c-0.6,0-1,0.2-1,0.5s0.4,0.5,1,0.5h5.5c0.1,0,0.2,0,0.2,0h5.5c0.6,0,1-0.2,1-0.5S33.1,2.2,32.5,2.2z" />
            <path fill="currentColor" d="M41.3,10.1V7.5c0-1.6-1-3.1-2.5-3.7c-1.5,0.6-2.5,2.1-2.5,3.7v2.4L41.3,10.1z" />
            <path fill="currentColor" d="M36.3,23.6V28l-6-0.3l0.3-3.5l-7.2,0l0.3,3.6L17.9,28v-4.4l-5.1-0.2v12.4c0,1.6,1,3.1,2.5,3.7c1.5-0.6,2.5-2.1,2.5-3.7V32l6.2-0.2l0.1,1.5c0,0.2,0,0.4-0.1,0.6l-4.7,0.3l0,4.4l7.7,0l7.7-0.1l0-4.3L30,33.7c-0.1-0.2-0.1-0.4-0.1-0.6l0.1-1.4l6.3,0.3v3.7c0,1.6,1,3.1,2.5,3.7c1.5-0.6,2.5-2.1,2.5-3.7V23.4L36.3,23.6z M17.9,31V29l5.9-0.2l0.2,1.9L17.9,31z M36.3,31l-6.2-0.3l0.2-2l6,0.3V31z" />
            <path fill="currentColor" d="M12.8,10.1V7.5c0-1.6,1-3.1,2.5-3.7c1.5,0.6,2.5,2.1,2.5,3.7v2.4L12.8,10.1z" />
        </svg>,
    },
    {
        name: 'Turbo Prop',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54.3 41.1">
            <path fill="currentColor" d="M21,8.7h-3.6L17,8.9l-1.4-1.4c-0.1-0.1-0.2-0.1-0.3,0l-1.4,1.4l-0.5-0.2H9.9c-0.6,0-1,0.2-1,0.5s0.4,0.5,1,0.5h5.5c0.1,0,0.2,0,0.2,0H21c0.6,0,1-0.2,1-0.5S21.6,8.7,21,8.7z" />
            <path fill="currentColor" d="M30.1,33.3c-0.1-0.2-0.1-0.4-0.1-0.6l0.7-9.9l0.2-13c-0.1-3-1.1-5.9-2.9-8.1l-0.5-0.7c-0.2-0.2-0.4-0.2-0.6,0l-0.5,0.7c-1.8,2.2-2.8,5.1-2.9,8.1c0,0,0,0,0,0c0,0,0,0,0,0l0.2,13l0,0l0.1,0l0.8,10.1c0,0.2,0,0.4-0.1,0.6l-4.7,2.3l0,4.4l7.7-2l7.7,1.9l0-4.3L30.1,33.3z" />
            <path fill="currentColor" d="M22.3,13.2l-3.7,0.1c0.2-1.2,0.1-1.4,0.1-2.7c0,0,0,0,0,0c0,0,0,0,0,0l0-0.2h-6.8l0,0.2c-0.1,2.2,0.4,3.9,0.6,2.9l-10.8,1c-0.5,0-0.8,0.4-0.8,0.8l0,7.3c0,0.5,0.4,0.8,0.8,0.8l20.7,0.3l0.3,0L22.3,13.2z" />
            <path fill="currentColor" d="M33.1,8.7h3.6l0.5,0.2l1.4-1.4c0.1-0.1,0.2-0.1,0.3,0l1.4,1.4l0.5-0.2h3.6c0.6,0,1,0.2,1,0.5s-0.4,0.5-1,0.5h-5.5c-0.1,0-0.2,0-0.2,0h-5.5c-0.6,0-1-0.2-1-0.5S32.5,8.7,33.1,8.7z" />
            <path fill="currentColor" d="M31.8,13.2l3.7,0.1c-0.2-1.2-0.1-1.4-0.1-2.7c0,0,0,0,0,0c0,0,0,0,0,0l0-0.2h6.8l0,0.2c0.1,2.2-0.4,3.9-0.6,2.9l10.8,1c0.5,0,0.8,0.4,0.8,0.8l0,7.3c0,0.5-0.4,0.8-0.8,0.8l-20.7,0.3l-0.3,0L31.8,13.2z" />
        </svg>,
    },
    {
        name: 'War Birds',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 71.3 58.9">
            <path fill="currentColor" d="M70.7,17.2c-0.5-3.5-18.3-3.3-18.3-3.3v0.6h-3.2v-1.2h-2.3v-1.4h-1v1.4h-6.5c0-3.3,0-5.5,0-5.5l0,0V4.4c0-0.5-0.4-0.9-0.9-0.9h-2.5v-1c2.3,1.2,9.3,0,9.3,0s-7.7-0.8-9.3-0.5V0.2c0,0,0-0.1-0.1-0.1h-0.7c0,0-0.1,0-0.1,0.1v2c-2.3-1.3-9.3,0-9.3,0s7.7,0.8,9.3,0.5v0.8h-2.3c-0.5,0-0.9,0.4-0.9,0.9V10c0,0,0,0,0,0c0,0.9,0,2,0,3.2h-6.4v-1.4h-1.2v1.4h-2.3v1.2h-3.2v-0.6c0,0-17.8-0.2-18.3,3.3c-0.5,3.5,1.6,8,5,8.9c3.4,0.9,14.7,2.3,16.5,2.4c1.3,0.1,7.1,0,10,0c0.1,5.7,0.3,11.1,0.6,14.3c0.2,1.6,0.5,3.9,1,6.1L24,51.4c0,0-1.7,1.3-1.4,3C23,56.1,29,56.6,35.2,57c0.2,1,0.4,1.7,0.4,1.7s0.2-0.6,0.4-1.7c6.2-0.5,12.3-0.9,12.6-2.6c0.4-1.7-1.4-3-1.4-3l-9.7-2.6c0.4-2.3,0.8-4.5,1-6.1c0.3-3.2,0.5-8.6,0.6-14.3c2.9,0,8.7,0,10,0c1.8-0.1,13.1-1.5,16.5-2.4C69.2,25.2,71.2,20.7,70.7,17.2z M14,19h-2.9l-1-2.9C12,16.2,13.5,17.4,14,19z M10,16.2l-1,2.9H6.2C6.7,17.4,8.2,16.2,10,16.2z M6,20.3c0-0.4,0.1-0.8,0.2-1.1l2.3,1.7l-0.9,2.7C6.6,22.8,6,21.6,6,20.3z M10.1,24.4c-0.8,0-1.6-0.3-2.3-0.7l2.3-1.6l2.3,1.6C11.7,24.1,10.9,24.4,10.1,24.4z M12.6,23.5l-0.9-2.7l2.4-1.7c0.1,0.4,0.2,0.7,0.2,1.1C14.2,21.6,13.6,22.8,12.6,23.5z M37.5,29h-3.8l-0.2-3.8c-0.1-1.2,0.6-2.4,1.4-2.8l0.1,0c0.4-0.2,1-0.2,1.4,0l0,0c0.9,0.4,1.5,1.6,1.4,2.8L37.5,29z M65.3,19h-2.9l-1-2.9C63.3,16.2,64.8,17.4,65.3,19z M61.3,16.2l-1,2.9h-2.9C58,17.4,59.5,16.2,61.3,16.2z M57.3,20.3c0-0.4,0.1-0.8,0.2-1.1l2.3,1.7l-0.9,2.7C57.9,22.8,57.3,21.6,57.3,20.3z M61.4,24.4c-0.8,0-1.6-0.3-2.3-0.7l2.3-1.6l2.3,1.6C63,24.1,62.2,24.4,61.4,24.4z M63.9,23.5L63,20.9l2.4-1.7c0.1,0.4,0.2,0.7,0.2,1.1C65.5,21.6,64.9,22.8,63.9,23.5z" />
        </svg>,
    },
    {
        name: 'Helicopters',
        icon: <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42.8 44.1">
            <path fill="currentColor" d="M18.8,20.9l-2.3-1v5.8c0,0.4,0.5,1.2,1,1.9l2.1-4.7L18.8,20.9z" />
            <path fill="currentColor" d="M41.7,30.3L27,23.8l-3.3-1.4l-2.5,1l-2.4,5.5l-5,11.3c-0.3,0.6-0.9,0.9-1.5,0.8L18,28.1l2.3-5.2l-1-2.5l-2.8-1.2L2.5,13c-0.3-0.2-0.6-0.4-0.7-0.8c-0.1-0.2-0.1-0.5-0.1-0.7L16.5,18l3.2,1.4l2.5-1l2.4-5.4l5.1-11.5c0.3-0.6,0.9-0.9,1.5-0.8l-5.7,13l-2.3,5.2l1,2.5L41,28.8C41.5,29.1,41.9,29.7,41.7,30.3z" />
            <path fill="currentColor" d="M24.6,20.9l2.4,1v-5.2c0-1-0.4-1.9-1.1-2.6l-2.1,4.8L24.6,20.9z" />
            <path fill="currentColor" d="M19.7,18.8l2-0.8l2.3-5.3l-0.5-0.4c-1.1-0.8-2.6-0.8-3.7,0l-2,1.6c-0.9,0.7-1.4,1.8-1.4,3v0.6L19.7,18.8z" />
            <path fill="currentColor" d="M27,25.7v-1.2L23.7,23l-2,0.8L19.4,29l1.1,10.3l-4,0.6v3.2l5.3-0.8l5.3,0.8v-3.2l-3.8-0.6L24.1,29C25,29,27,26.6,27,25.7z" />
        </svg>
    },
    {
        name: 'Engines',
        icon: engineCategoryIcon,
        type: 'img'
    },
    {
        name: 'Explore',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13">
            <path fill="currentColor" d="M6.5,1A5.5,5.5,0,1,1,1,6.5,5.51,5.51,0,0,1,6.5,1m0-1A6.5,6.5,0,1,0,13,6.5,6.49,6.49,0,0,0,6.5,0Z" />
            <path fill="currentColor" d="M9.7,5.78V7.15a.07.07,0,0,1-.07.07H7.28V9.57a.07.07,0,0,1-.07.07H5.79a.07.07,0,0,1-.07-.07V7.22H3.37a.07.07,0,0,1-.07-.07V5.78a.1.1,0,0,1,.1-.1H5.72V3.33a.07.07,0,0,1,.07-.07H7.21a.07.07,0,0,1,.07.07V5.68H9.6A.1.1,0,0,1,9.7,5.78Z" />
        </svg>,
    }
];

function Home() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active'); // 'sold', 'active', 'approved'

    // Map tab values to API status values
    const tabStatusMap = {
        'sold': 'sold',
        'active': 'active',
        'approved': 'approved'
    };

    const tabTitles = {
        'active': 'Live Auctions',
        'sold': 'Closed Auctions',
        'approved': 'Upcoming Auctions'
    };

    const tabDescriptions = {
        'active': 'Browse through our selection of premium aircraft auctions — find your perfect plane with transparent bidding and expert verification.',
        'sold': 'Review completed aircraft auction outcomes — including sold, ended, and reserve-not-met listings — to inform your aviation market analysis and purchase decisions.',
        'approved': 'Get ready for exciting new aircraft listings — preview upcoming auctions and prepare your bids for these premium aviation assets.'
    };

    const fetchAuctions = async (tab = activeTab, category = null, limit = 4, sortBy = 'highestBid') => {
        setLoading(true);
        try {
            const status = tabStatusMap[tab];
            const params = new URLSearchParams();
            params.append('status', status);
            params.append('limit', limit.toString());
            params.append('sortBy', sortBy);
            if (category && category !== 'all') {
                params.append('category', category);
            }

            const { data } = await axiosInstance.get(`/api/v1/auctions/top?${params}`);
            if (data.success) {
                setAuctions(data.data.auctions);
            }
        } catch (err) {
            console.error('Fetch auctions error:', err);
            toast.error("Failed to load auctions");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchAuctions(tab);
    };

    useEffect(() => {
        fetchAuctions('active'); // Load sold auctions by default
    }, []);

    const handleLoadByStatus = () => {
        const status = tabStatusMap[activeTab];
        const params = new URLSearchParams();
        params.append('status', status);
        navigate(`/auctions?${params.toString()}`);
    };

    const handleSearchByTitle = (title) => {
        const params = new URLSearchParams();
        if(title === 'Explore'){
            navigate(`/auctions`);
        }else{
            params.append('search', title);
            navigate(`/auctions?${(params.toString()).toLocaleLowerCase()}`);
        }
    }

    return (
        <>
            <Hero />

            {/* Marquee section */}
            <Container>
                <Marquee speed={50} gradient={false}>
                    <div className="flex gap-8 w-full my-14 mr-8">
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

            {/* Category Icons Section */}
            <Container className="mb-14">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-7">
                    {
                        categoryIcons.map(categoryIcon => (
                            <div onClick={() => handleSearchByTitle(categoryIcon.name)} key={categoryIcon.name} className="flex flex-col gap- items-center justify-center p-3 rounded-lg shadow-md max-h-28 cursor-pointer">
                                {categoryIcon.type && categoryIcon.type === 'img' ? <img className="max-h-16" src={categoryIcon.icon} alt={categoryIcon.name} /> : categoryIcon.icon}
                                <p className="text-base sm:text-lg font-medium">{categoryIcon.name}</p>
                            </div>
                        ))
                    }
                </div>
            </Container>

            {/* Dynamic Auctions section */}
            <Container className="mb-14 flex flex-col">
                <div className="flex items-center justify-between flex-wrap gap-y-3">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary order-1">{tabTitles[activeTab]}</h2>
                    <p className="text-sm md:text-base text-gray-500 order-2 md:order-3">
                        {tabDescriptions[activeTab]}
                    </p>
                    <div className="flex items-center gap-5 order-2 mb-3">
                        <div className="flex space-x-2 bg-white p-1 border border-gray-500/50 rounded-md text-sm">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="options"
                                    id="active"
                                    className="hidden peer"
                                    checked={activeTab === 'active'}
                                    onChange={() => handleTabChange('active')}
                                />
                                <label htmlFor="active" className="cursor-pointer rounded py-2 px-4 sm:px-8 text-gray-500 transition-colors duration-200 peer-checked:bg-black peer-checked:text-white">
                                    Live
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="options"
                                    id="sold"
                                    className="hidden peer"
                                    checked={activeTab === 'sold'}
                                    onChange={() => handleTabChange('sold')}
                                />
                                <label htmlFor="sold" className="cursor-pointer rounded py-2 px-4 sm:px-8 text-gray-500 transition-colors duration-200 peer-checked:bg-black peer-checked:text-white">
                                    Closed
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="options"
                                    id="approved"
                                    className="hidden peer"
                                    checked={activeTab === 'approved'}
                                    onChange={() => handleTabChange('approved')}
                                />
                                <label htmlFor="approved" className="cursor-pointer rounded py-2 px-4 sm:px-8 text-gray-500 transition-colors duration-200 peer-checked:bg-black peer-checked:text-white">
                                    Upcoming
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-10 mt-8">
                            {auctions.map((auction) => (
                                <AuctionCard
                                    key={auction._id}
                                    auction={auction}
                                />
                            ))}
                        </section>

                        {auctions.length > 0 && (
                            <button
                                onClick={handleLoadByStatus}
                                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mt-10 mx-auto"
                            >
                                View More
                            </button>
                        )}

                        {auctions.length === 0 && !loading && (
                            <div className="text-center py-16 text-gray-500">
                                <Filter size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No auctions found</p>
                                <p className="text-sm">Try adjusting your filters or search terms</p>
                            </div>
                        )}
                    </>
                )}
            </Container>

            {/* Who we are section */}
            <Container className="my-14">
                <About />
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

            <Container className="my-14">
                <Suspense fallback={<LoadingSpinner />}>
                    <FAQs faqs={faqs} />
                </Suspense>
            </Container>

            <Container className="my-14">
                <Suspense fallback={<LoadingSpinner />}>
                    <CTA />
                </Suspense>
            </Container>
        </>
    )
}

export default Home;