import { Plane, PlaneTakeoff } from "lucide-react";
import { useNavigate } from "react-router";
import { cta } from "../assets";

function CTA(){
    const navigate = useNavigate();
    return (
        <section 
        className="max-w-full bg-center bg-cover text-white rounded-2xl relative overflow-hidden"
        style={{ backgroundImage: `url(${cta})` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60" />
            <div className="flex flex-col items-center justify-center text-center py-12 px-2 gap-6">  
                <div className="flex items-center justify-center bg-white px-3 py-1.5 shadow gap-1 rounded-full text-xs z-10">
                    <Plane size={18} className="text-primary" />
                    <span className="text-primary">
                        Trusted Auctions, Anytime
                    </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-medium z-10">
                   Where Aviation Meets Opportunity
                    <br />
                    — Buy and Sell with Confidence
                </h2>
                <p className="text-gray-300 max-w-5xl max-md:text-sm z-10">
                    Join a trusted marketplace built for aviation enthusiasts. From aircraft to parts and collectibles, every transaction is transparent, secure, and backed by expert support.
                </p>
                
                <div className="flex gap-3 flex-wrap items-center justify-center">
                    <button onClick={() => navigate('/login')} type="button" className="inline-flex items-center justify-center gap-1 text-primary whitespace-nowrap rounded-md font-medium h-12 px-8 bg-white hover:bg-gray-50 cursor-pointer z-10"> 
                    Get Started

                    <PlaneTakeoff strokeWidth={2} />
                    </button>
                </div>

                <p className="text-gray-300 max-w-5xl max-md:text-sm z-10">
                    Transparent Auctions • Fair Bidding • Guaranteed Support
                </p>
            </div>
        </section>
    );
}

export default CTA;