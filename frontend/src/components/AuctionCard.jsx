import { Gavel, Heart } from "lucide-react";
import { heroImg } from "../assets";
import { useState } from "react";
import { Link } from "react-router-dom";

function AuctionCard() {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Adjust the threshold value to control the tilt effect
    const threshold = 5;

    const handleMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setTilt({ x: y * -threshold, y: x * threshold });
    };
    return (
        <div className="border border-gray-200 p-4 bg-white rounded-xl shadow-lg transition-transform duration-200 ease-out" onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
            <div className="relative">
                <img src={heroImg} alt="" className="w-full h-56 object-cover rounded-tr-3xl rounded-bl-3xl" />
                <div className="bg-white/70 absolute bottom-5 left-5 py-3 px-6 rounded-lg flex items-center gap-2">
                    <span>0D</span>
                    <span>:</span>
                    <span>10H</span>
                    <span>:</span>
                    <span>15M</span>
                    <span>:</span>
                    <span>8S</span>
                </div>
            </div>
            <div className="my-3 flex flex-col">
                <Link to={`/`} className="my-2 font-medium text-lg uppercase inline-block">2005 Diamond DA42 NG</Link>

                {/* <p className="py-0.5 mb-2 px-2 rounded-full bg-primary text-white text-xs font-light self-start">No Reserve</p> */}

                <div className="flex flex-col gap-1">
                    <p className="flex gap-2">
                        <span className="text-secondary">No. of Bids:</span>
                        <span className="font-medium">12</span>
                    </p>

                    <p className="flex gap-2">
                        <span className="text-secondary">Current Bid:</span>
                        <span className="font-medium text-green-600">$1,000</span>
                    </p>
                </div>
            </div>

            <div className="flex gap-3 items-center">
                <button className="bg-primary py-3 px-6 cursor-pointer text-white rounded-lg w-full flex gap-2 items-center justify-center hover:bg-black/90">
                    <Gavel />
                    <span>Bid Now</span>
                </button>
                <div className="border border-gray-200 p-3 rounded-lg cursor-pointer text-secondary hover:bg-gray-100">
                    <Heart />
                </div>
            </div>
        </div>
    );
}

export default AuctionCard;