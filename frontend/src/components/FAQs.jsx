import { Gavel, MessageCircleQuestion, Store } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { faqImg } from "../assets";

const FAQs = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <>
            <div className="w-full grid grid-cols-1 gap-10 md:grid-cols-7 lg:gap-10 xl:gap-16 items-stretch md:px-0">
                <img
                    className="w-full object-cover rounded-xl h-[350px] sm:h-[500px] md:h-[625px] lg:h-[575px] md:col-span-3"
                    src={faqImg}
                    alt="FAQs"
                    loading="lazy"
                />
                <div className="md:col-span-4">
                    <p className="text-secondary text-lg font-medium">FAQ's</p>
                    <h1 className="text-3xl font-bold text-primary">Looking For Answers?</h1>
                    <p className="text-sm text-slate-500 mt-2 pb-4">
                        Auction Aircraft with Confidence — Secure, Transparent, and Built for Serious Sellers & Buyers.
                    </p>
                    {faqs.map((faq, index) => (
                        <div className="border-b border-slate-200 py-4 cursor-pointer" key={index} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-medium">
                                    {faq.question}
                                </h3>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${openIndex === index ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}>
                                    <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" stroke="#1D293D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className={`text-sm text-slate-500 transition-all duration-500 ease-in-out ${openIndex === index ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"}`} >
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                    <Link to="/contact" className="flex items-center justify-self-start gap-2 bg-primary text-white px-5 py-2 rounded-md cursor-pointer mt-5"><MessageCircleQuestion size={20} /> Contact Us</Link>
                </div>
            </div>
        </>
    );
};

export default FAQs;