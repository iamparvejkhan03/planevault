import { Gavel, Heart, MapPin, Eye, Users, Shield, Clock, Zap } from "lucide-react";
import { heroImg } from "../assets";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import { useWatchlist } from "../hooks/useWatchlist";

function AuctionCard({ auction }) {
    const navigate = useNavigate();
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isLiked, setIsLiked] = useState(false);

    const threshold = 5;

    const handleMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setTilt({ x: y * -threshold, y: x * threshold });
    };

    const [auctionEndDate] = useState(() => new Date(auction.endDate));
    const auctionTime = useAuctionCountdown(auction);
    const { isWatchlisted, watchlistCount, loading, toggleWatchlist } = useWatchlist(auction._id);

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWatchlist();
    };

    // Check if reserve is met
    const isReserveMet = auction.currentPrice >= auction.reservePrice;
    const isAuctionActive = auction.status === 'active' && !auctionTime.completed;

    // Calculate status badges
    const getStatusBadges = () => {
        const badges = [];

        if (auction.auctionType === 'reserve' && isReserveMet) {
            badges.push({
                label: 'Reserve Met',
                icon: Shield,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        } else if (auction.auctionType === 'reserve') {
            badges.push({
                label: 'Reserve',
                icon: Shield,
                color: 'bg-orange-100 text-orange-700 border-orange-200'
            });
        }

        if (auction.auctionType === 'standard') {
            badges.push({
                label: 'No Reserve',
                icon: Shield,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        }

        // if (auction.autoExtend) {
        //     badges.push({
        //         label: 'Auto Extend',
        //         icon: Zap,
        //         color: 'bg-blue-100 text-blue-700 border-blue-200'
        //     });
        // }

        if (auction.status === 'active') {
            badges.push({
                label: 'Live',
                icon: Clock,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        }

        if (auction.status === 'draft') {
            badges.push({
                label: 'Starting Soon',
                icon: Clock,
                color: 'bg-orange-100 text-orange-700 border-orange-200'
            });
        }

        if (auction.status === 'ended') {
            badges.push({
                label: 'Ended',
                icon: Clock,
                color: 'bg-red-100 text-red-700 border-red-200'
            });
        }

        if (auction.status === 'sold') {
            badges.push({
                label: 'Sold',
                icon: Clock,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        }

        return badges;
    };

    const statusBadges = getStatusBadges();

    if (!auctionTime) return (
        <div className="border border-gray-200 p-4 h-full bg-white rounded-xl shadow-lg animate-pulse">
            <div className="w-full h-56 bg-gray-200 rounded-tr-3xl rounded-bl-3xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    );

    return (
        <div
            className="border border-gray-200 p-4 h-full bg-white rounded-xl shadow-lg transition-all duration-200 ease-out flex flex-col hover:shadow-xl cursor-pointer group"
            onMouseMove={handleMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
            onClick={() => navigate(`/auction/${auction._id}`)}
        >
            {/* Image Section */}
            <div className="relative overflow-hidden rounded-tr-3xl rounded-bl-3xl">
                <img
                    src={auction.photos?.[0]?.url || heroImg}
                    alt={auction.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {statusBadges.map((badge, index) => {
                        const IconComponent = badge.icon;
                        return (
                            <span
                                key={index}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                            >
                                <IconComponent size={12} />
                                {badge.label}
                            </span>
                        );
                    })}
                </div>

                {/* Countdown Timer */}
                <div className="bg-white/90 absolute bottom-3 left-3 right-3 py-2 px-4 rounded-lg flex items-center justify-center gap-1 text-sm">
                    {!auctionTime.completed ? (
                        <>
                            <Clock size={14} />
                            {!auctionTime.completed ? (
                                <>
                                    <span>{auctionTime.days}D</span>
                                    <span>:</span>
                                    <span>{auctionTime.hours}H</span>
                                    <span>:</span>
                                    <span>{auctionTime.minutes}M</span>
                                    <span>:</span>
                                    <span>{auctionTime.seconds}S</span>
                                </>
                            ) : (
                                <span>Auction Ended!</span>
                            )}
                        </>
                    ) : (
                        <span className="font-medium text-red-600">Auction Ended</span>
                    )}
                </div>

                {/* Views Counter */}
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Eye size={12} />
                    {auction.views?.toLocaleString() || 0}
                </div>
            </div>

            {/* Content Section */}
            <div className="my-4 flex flex-col flex-1">
                {/* Title */}
                <Link
                    to={`/auction/${auction._id}`}
                    className="font-semibold text-lg leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    {auction.title}
                </Link>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin size={14} />
                    <span className="truncate">{auction.location}</span>
                </div>

                {/* Auction Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Current Bid */}
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Current Bid</div>
                        <div className="font-bold text-lg text-green-600">
                            ${(auction.currentPrice || auction.startPrice).toLocaleString()}
                        </div>
                    </div>

                    {/* Bid Count */}
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Bids</div>
                        <div className="font-bold text-lg text-primary flex items-center justify-center gap-1">
                            <Users size={16} />
                            {auction.bidCount || 0}
                        </div>
                    </div>
                </div>

                {/* Reserve Price Info */}
                {/* {auction.auctionType === 'reserve' && (
                    <div className={`p-2 rounded-lg text-sm text-center mb-3 ${isReserveMet
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                        {isReserveMet ? (
                            <span>✅ Reserve met at ${auction.reservePrice?.toLocaleString()}</span>
                        ) : (
                            <span>⚠️ Reserve: ${auction.reservePrice?.toLocaleString()}</span>
                        )}
                    </div>
                )} */}

                {/* Bid Increment */}
                <div className="text-xs text-gray-500 text-center flex items-center justify-around">
                    <div>
                        Bid increment: ${auction.bidIncrement?.toLocaleString()}
                    </div>
                    {auction.watchlistCount > 0 && (
                        <div className="text-xs text-gray-500 text-center">
                            {auction.watchlistCount} user{auction.watchlistCount !== 1 ? 's' : ''} watching
                        </div>)}
                </div>
            </div>

            {/* Button Section */}
            <div className="flex gap-2 items-center mt-auto pt-3 border-t border-gray-100">
                <button
                    // disabled={!isAuctionActive}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auction/${auction._id}`);
                    }}
                    className={`flex-1 py-3 px-4 cursor-pointer text-white rounded-lg flex gap-2 items-center justify-center transition-all ${isAuctionActive
                        ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                        : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                        }`}
                >
                    <Gavel size={18} />
                    <span className="font-medium">
                        {!isAuctionActive ? 'View Auction' : 'Place Bid'}
                    </span>
                </button>

                {/* Watchlist Button */}
                <button
                    onClick={handleWatchlist}
                    className={`p-3 rounded-lg cursor-pointer transition-all relative ${isWatchlisted
                        ? 'bg-red-50 text-red-500 border border-red-200 shadow-md hover:bg-red-100'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                    title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                    <Heart
                        size={20}
                        fill={isWatchlisted ? 'currentColor' : 'none'}
                    />
                </button>

            </div>

            {/* Watchlist Count */}
            {/* {auction.watchlistCount > 0 && (
                <div className="text-xs text-gray-500 text-center mt-2">
                    {auction.watchlistCount} user{auction.watchlistCount !== 1 ? 's' : ''} watching
                </div>
            )} */}
        </div>
    );
}

export default AuctionCard;