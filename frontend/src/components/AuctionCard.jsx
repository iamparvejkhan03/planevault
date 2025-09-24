import { Gavel, Heart } from "lucide-react";
import { heroImg } from "../assets";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuctionCountdown from "../hooks/useAuctionCountDown";

function AuctionCard({id, title, bids, currentBid, endDate}) {
    const navigate = useNavigate();
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const threshold = 5;

    const handleMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setTilt({ x: y * -threshold, y: x * threshold });
    };

    const [auctionEndDate] = useState(() => new Date(endDate));
    const auctionTime = useAuctionCountdown(auctionEndDate);

    if (!auctionTime) return <div>Loading...</div>;
    
    // if (auctionTime.completed) return <div>Auction Ended!</div>;

    return (
        <div className="border border-gray-200 p-4 h-full bg-white rounded-xl shadow-lg transition-transform duration-200 ease-out flex flex-col" onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
            {/* Image Section */}
            <div className="relative">
                <img src={heroImg} alt="" className="w-full h-56 object-cover rounded-tr-3xl rounded-bl-3xl" />
                <div className="bg-white/70 absolute bottom-5 left-2 sm:left-5 py-2 px-4 sm:py-3 sm:px-6 rounded-lg flex items-center gap-2 text-sm sm:text-base">
                {
                    !auctionTime.completed
                    ?
                    <><span>{auctionTime.days}D</span>
                    <span>:</span>
                    <span>{auctionTime.hours}H</span>
                    <span>:</span>
                    <span>{auctionTime.minutes}M</span>
                    <span>:</span>
                    <span>{auctionTime.seconds}S</span></>
                    :
                    (<>Auction Ended!</>)
                }
                </div>
            </div>
            
            {/* Content Section - This will grow to fill available space */}
            <div className="my-3 flex flex-col flex-1">
                <Link to={`/auction/${id}`} className="my-2 font-medium text-lg uppercase inline-block">{title}</Link>

                {/* <p className="py-0.5 mb-2 px-2 rounded-full bg-primary text-white text-xs font-light self-start">No Reserve</p> */}

                <div className="flex flex-col gap-1 flex-1">
                    <p className="flex gap-2">
                        <span className="text-secondary">No. of Bids:</span>
                        <span className="font-medium">{bids}</span>
                    </p>

                    <p className="flex gap-2">
                        <span className="text-secondary">Current Bid:</span>
                        <span className="font-medium text-green-600">${currentBid}</span>
                    </p>
                </div>
            </div>

            {/* Button Section - This will always stay at the bottom */}
            <div className="flex gap-3 items-center mt-auto pt-3">
                <button disabled={auctionTime.completed} onClick={() => navigate(`/auction/${id}`)} className={`${!auctionTime.completed ? 'bg-primary hover:bg-black/90' : 'bg-primary/70 hover:bg-black/70'} py-3 px-6 cursor-pointer text-white rounded-lg w-full flex gap-2 items-center justify-center`}>
                    <Gavel />
                    <span>Bid Now</span>
                </button>
                <button disabled={auctionTime.completed} className="border border-gray-200 p-3 rounded-lg cursor-pointer text-secondary hover:bg-gray-100">
                    <Heart />
                </button>
            </div>
        </div>
    );
}

export default AuctionCard;