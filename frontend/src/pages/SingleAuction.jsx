import { CalendarDays, CheckSquare, Clock, Download, File, Fuel, Gauge, Gavel, Heart, MapPin, MessageCircle, PaintBucket, Plane, ShieldCheck, Tag, User, Users, Weight } from "lucide-react";
import { Container, LoadingSpinner, MobileBidStickyBar, TabSection } from "../components";
import { Link } from "react-router-dom";
import { lazy, Suspense, useRef, useState } from "react";
import useAuctionCountdown from "../hooks/useAuctionCountDown";

const YouTubeEmbed = lazy(() => import('../components/YouTubeEmbed'));
const ImageLightBox = lazy(() => import('../components/ImageLightBox'));

function SingleAuction() {
    const currentBid = 80;
    const bidSectionRef = useRef(null);
    const commentSectionRef = useRef(null);

    const scrollToBidSection = () => {
        bidSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const scrollToCommentSection = () => {
        commentSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const [endDate] = useState(() => new Date('2025-10-19T15:34:59'));
    const auctionTime = useAuctionCountdown(endDate);

    if (!auctionTime) return <div>Loading...</div>;
    
    // if (auctionTime.completed) return <div>Auction Ended!</div>;

    return (
        <Container className={`py-32 min-h-[70vh] grid grid-cols-1 lg:grid-cols-3 items-start gap-10`}>
            <section className="col-span-1 lg:col-span-2">
                {/* Title and top section */}
                <div className="flex justify-between items-center text-secondary">
                    <Link to={`/`} className="underline">Category: Aircraft</Link>
                    <div className="flex items-center gap-3">
                        <p className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                            <Heart size={20} />
                            <span>21</span>
                        </p>

                        <p onClick={() => scrollToCommentSection()} className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                            <MessageCircle size={18} />
                            <span>13</span>
                        </p>
                    </div>
                </div>

                <div className="my-5">
                    <MobileBidStickyBar
                        currentBid={currentBid}
                        timeRemaining={auctionTime}
                        onBidClick={() => scrollToBidSection()}
                    />
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold my-6 text-primary">1970 Piper Cherokee 140</h2>

                {/* Image section */}
                <ImageLightBox />

                <hr className="my-8" />

                {/* Info section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Specifications</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                        <div className="flex items-center gap-3">
                            <Plane className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Make</p>
                                <p className="font-medium text-base sm:text-lg">Piper</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tag className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Model</p>
                                <p className="font-medium text-base sm:text-lg">140</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CalendarDays className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Year</p>
                                <p className="font-medium text-base sm:text-lg">2009</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckSquare className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Registration</p>
                                <p className="font-medium text-base sm:text-lg">N77310</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Location</p>
                                <p className="font-medium text-base sm:text-lg">New York</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Seats</p>
                                <p className="font-medium text-base sm:text-lg">2</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Fuel className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Fuel</p>
                                <p className="font-medium text-base sm:text-lg">3611 LB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Total Hours</p>
                                <p className="font-medium text-base sm:text-lg">5725</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Gauge className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Engine Type</p>
                                <p className="font-medium text-base sm:text-lg">Turbo</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Weight className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Weight</p>
                                <p className="font-medium text-base sm:text-lg">12,500 LB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <PaintBucket className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Color</p>
                                <p className="font-medium text-base sm:text-lg">Blue</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="flex-shrink-0 w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm sm:text-base">Condition</p>
                                <p className="font-medium text-base sm:text-lg">Air Worthy</p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-8" />

                {/* Document section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Document(s)</h3>
                    <div className="flex gap-5 max-w-full flex-wrap">
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                    </div>
                </div>

                <hr className="my-8" />

                {/* Video section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Video Look</h3>
                    <Suspense fallback={<LoadingSpinner />}>
                        <YouTubeEmbed videoId={'https://youtu.be/cIeX0-_Gt50?si=qUHCO_rFh20jKHtA'} title="video" />
                    </Suspense>
                </div>

                <hr className="my-8" />

                <Suspense fallback={<LoadingSpinner />}>
                    <TabSection ref={commentSectionRef} />
                </Suspense>

            </section>

            <section ref={bidSectionRef} className="col-span-1 lg:col-span-1 border border-gray-200 bg-gray-100 rounded-lg sticky top-24">
                {/* Timer section */}
                <div className="py-5 px-6 rounded-lg grid grid-cols-4 text-2xl">
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 px-2">
                        <span>{auctionTime.days}</span>
                        <span className="text-base font-light">Days</span>
                    </p>
                    {/* <span className="font-thin text-gray-200 text-6xl">|</span> */}
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>{auctionTime.hours}</span>
                        <span className="text-base font-light">Hours</span>
                    </p>
                    {/* <span className="font-thin text-gray-200 text-6xl">|</span> */}
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>{auctionTime.minutes}</span>
                        <span className="text-base font-light">Minutes</span>
                    </p>
                    {/* <span className="font-thin text-gray-200 text-6xl">|</span> */}
                    <p className="flex flex-col items-center gap-2">
                        <span>{auctionTime.seconds}</span>
                        <span className="text-base font-light">Seconds</span>
                    </p>
                </div>

                <hr className="mx-6" />

                {/* Current bid section */}
                <div className="p-6 flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <p className="font-light">Current Bid</p>
                        <p className="flex items-center gap-2 text-4xl font-medium">
                            <span>$</span>
                            <span>80</span>
                        </p>
                    </div>

                    <p className="text-secondary">Reserve Not Met</p>

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">Starting Bid</span>
                        <span className="font-medium">$10</span>
                    </p>

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">No. of Bids</span>
                        <span className="font-medium">21</span>
                    </p>

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">Min. Bid Increment</span>
                        <span className="font-medium">$50</span>
                    </p>

                    <form className="flex flex-col gap-4">
                        <input type="number" className="py-3 px-5 w-full rounded-lg focus:outline-2 focus:outline-primary" placeholder="Bid $85 or up" min={85} />
                        <button className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 px-6 cursor-pointer rounded-lg">
                            <Gavel />
                            <span>Place Bid</span>
                        </button>
                    </form>

                    <p className="text-center bg-white p-1 text-secondary text-sm flex items-center justify-center gap-2">
                        <Users />
                        <span>21 people are watching.</span>
                    </p>

                    <p className="text-center bg-white p-1 text-secondary text-sm flex items-center justify-center gap-2">
                        <ShieldCheck />
                        <span>Buyer's Premium: $2500</span>
                    </p>

                    {/* <table>
                        <thead>
                            <tr className="text-left text-secondary text-sm">
                                <th className="font-normal">Bidder</th>
                                <th className="font-normal">Time</th>
                                <th className="font-normal">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-sm font-medium">
                                <td className="py-2">formyclient347</td>
                                <td className="py-2">23 h ago</td>
                                <td className="py-2">$ 80</td>
                            </tr>
                            <tr className="text-sm font-medium">
                                <td className="py-2">sahidbhai9491</td>
                                <td className="py-2">1 d ago</td>
                                <td className="py-2">$ 70</td>
                            </tr>
                        </tbody>
                    </table> */}
                </div>
            </section>
        </Container>
    );
}

export default SingleAuction;