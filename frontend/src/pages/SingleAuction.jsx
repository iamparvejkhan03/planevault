import { CalendarDays, CheckSquare, Clock, Download, File, Fuel, Gauge, Gavel, Heart, Loader, MapPin, MessageCircle, PaintBucket, Plane, ShieldCheck, Tag, User, Users, Weight } from "lucide-react";
import { Container, LoadingSpinner, MobileBidStickyBar, SpecificationsSection, TabSection, TimerDisplay, WatchlistButton } from "../components";
import { Link, useParams } from "react-router-dom";
import { lazy, Suspense, useRef, useState, useEffect } from "react";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useComments } from "../hooks/useComments";
import { useWatchlist } from "../hooks/useWatchlist";

const YouTubeEmbed = lazy(() => import('../components/YouTubeEmbed'));
const ImageLightBox = lazy(() => import('../components/ImageLightBox'));

function SingleAuction() {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const bidSectionRef = useRef(null);
    const commentSectionRef = useRef(null);
    const auctionTime = useAuctionCountdown(auction);
    const countdown = useAuctionCountdown(auction);
    const [activeTab, setActiveTab] = useState('comments');
    const { pagination } = useComments(id);
    const { isWatchlisted, toggleWatchlist, watchlistCount } = useWatchlist(id);
    const hasFetchedRef = useRef(false);

    // useEffect(() => {
    //     const fetchAuction = async () => {
    //         try {
    //             setLoading(true);
    //             const { data } = await axiosInstance.get(`/api/v1/auctions/${id}`);
    //             if (data.success) {
    //                 setAuction(data.data.auction);
    //             }
    //         } catch (error) {
    //             toast.error(error?.response?.data?.message || 'Failed to fetch auction');
    //             console.error('Fetch auction error:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     // Only refetch if countdown status changes to 'ended' and auction might need update
    //     if (countdown?.status === 'ended') {
    //         // Add a small delay to ensure backend has processed the auction end
    //         const timer = setTimeout(() => {
    //             fetchAuction();
    //         }, 2000); // 2 seconds delay

    //         return () => clearTimeout(timer);
    //     } else {
    //         fetchAuction();
    //     }
    // }, [id, countdown?.status]);

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/auctions/${id}`);
                if (data.success) {
                    setAuction(data.data.auction);
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to fetch auction');
                console.error('Fetch auction error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (countdown?.status === 'ended') {
            const timer = setTimeout(() => {
                fetchAuction();
            }, 2000);
            return () => clearTimeout(timer);
        } else if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchAuction();
        }
    }, [id, countdown?.status]);

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

    // Update both activeTab and scroll
    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'comments' || tabId === 'bids') {
            scrollToCommentSection();
        }
    };

    const handleBid = async (e) => {
        e.preventDefault();

        if (!bidAmount || (parseFloat(bidAmount) <= auction.currentPrice && auction.bidCount > 0)) {
            toast.error(`Bid must be higher than current price: $${auction.currentPrice}`);
            return;
        }

        try {
            setBidding(true);

            // Check if user needs to make payment intent (first bid by this user)
            const { data: userBidPayments } = await axiosInstance.get(`/api/v1/bid-payments/auction/${id}`);
            const hasExistingPayment = userBidPayments.data.bidPayments.length > 0;

            if (!hasExistingPayment) {
                // Get commission amount from backend
                const { data: commissionData } = await axiosInstance.get(`/api/v1/admin/commissions`);
                const commission = commissionData.data.commissions.find(c => c.category === auction.category);
                const commissionAmount = commission ? commission.commissionAmount : 0;

                if (commissionAmount > 0) {
                    const userConfirmed = window.confirm(
                        `A $${commissionAmount} temporary hold will be placed on your card for bidding. This amount will be released after the auction ends. Continue?`
                    );

                    if (!userConfirmed) {
                        toast.error('Payment is required to place bid');
                        setBidding(false);
                        return;
                    }

                    // Create payment intent only after user confirms
                    const { data: paymentData } = await axiosInstance.post('/api/v1/bid-payments/create-intent', {
                        auctionId: id,
                        bidAmount: parseFloat(bidAmount)
                    });
                }
            }

            // Place the bid after payment is handled
            const { data } = await axiosInstance.post(`/api/v1/auctions/bid/${id}`, {
                amount: parseFloat(bidAmount)
            });

            if (data.success) {
                setAuction(data.data.auction);
                setBidAmount('');
                toast.success('Bid placed successfully!');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to place bid');
            console.error('Bid error:', error);
        } finally {
            setBidding(false);
        }
    };

    // Payment confirmation handler
    const handlePaymentConfirmation = async (paymentData) => {
        // You'll need to create a modal component for this
        // For now, using a simple confirm
        const userConfirmed = window.confirm(
            `A commission fee of $${paymentData.totalAmount} is required to place your first bid on this auction. Continue?`
        );

        if (userConfirmed) {
            try {
                // Confirm the payment with Stripe
                const { data } = await axiosInstance.post('/api/v1/bid-payments/confirm', {
                    paymentIntentId: paymentData.paymentIntentId
                });

                return data.success;
            } catch (error) {
                console.error('Payment confirmation error:', error);
                return false;
            }
        }

        return false;
    };

    // Handle document download
    const handleDocumentDownload = (documentUrl, filename) => {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = filename;
        link.target = '_blank';
        link.click();
    };

    // Extract YouTube ID from URL
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // const auctionTime = useAuctionCountdown(auction ? new Date(auction.endDate) : null);
    // const auctionTime = "";
    const youtubeVideoId = getYouTubeId(auction?.videoLink);
    // const minBidAmount = auction?.currentPrice + auction?.bidIncrement;
    // const minBidAmount = auction?.bidCount > 0 ?  auction?.currentPrice + auction?.bidIncrement : auction?.startPrice;
    const minBidAmount = auction?.bidCount > 0 ? auction?.currentPrice + auction?.bidIncrement : auction?.currentPrice;

    if (loading) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (!auction) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600">Auction not found</h2>
                    <Link to="/auctions" className="text-blue-600 hover:underline mt-4 inline-block">
                        Back to Auctions
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className={`pt-32 pb-16 min-h-[70vh] grid grid-cols-1 lg:grid-cols-3 items-start gap-10`}>
            <section className="col-span-1 lg:col-span-2">
                {/* Title and top section */}
                <div className="flex flex-wrap gap-2 justify-between items-center text-secondary">
                    <Link to={`/auctions?category=${auction.category}`} className="underline">
                        Category: {auction.category}
                    </Link>
                    <div className="flex items-center gap-3">
                        <p onClick={toggleWatchlist}
                            className={`flex items-center gap-2 py-1 px-3 border border-gray-200 rounded-full transition-colors ${isWatchlisted
                                ? 'bg-gray-100 text-black hover:bg-gray-200'
                                : 'text-secondary hover:bg-gray-200'
                                } disabled:opacity-50`}>
                            <Heart size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />
                            <span>{watchlistCount || auction?.watchlistCount || 0}</span>
                        </p>

                        <p onClick={() => handleTabClick('comments')}
                            className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                            <MessageCircle size={18} />
                            <span>{pagination?.totalComments || 0}</span>
                        </p>

                        <p onClick={() => handleTabClick('bids')}
                            className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                            <Gavel size={20} />
                            <span>{auction.bids?.length || 0}</span>
                        </p>
                    </div>
                </div>

                <div className="my-5">
                    <MobileBidStickyBar
                        currentBid={auction.currentPrice}
                        timeRemaining={countdown}
                        onBidClick={() => scrollToBidSection()}
                    />
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold my-6 text-primary">{auction.title}</h2>

                {/* Image section */}
                {/* <Suspense fallback={<LoadingSpinner />}> */}
                <ImageLightBox images={auction.photos} auctionType={auction?.auctionType} isReserveMet={auction.currentPrice >= auction.reservePrice} />
                {/* </Suspense> */}

                <hr className="my-8" />

                {/* Info section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Auction Overview</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
                        {/* <div className="flex items-center gap-3">
                            <Plane className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Title</p>
                                <p className="text-base">{auction.title}</p>
                            </div>
                        </div> */}

                        <div className="flex items-center gap-3">
                            <Tag className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Category</p>
                                <p className="text-base">{auction.category}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Location</p>
                                <p className="text-base">{auction.location || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <CalendarDays className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Start Date</p>
                                <p className="text-base">
                                    {new Date(auction.startDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">End Date</p>
                                <p className="text-base">
                                    {new Date(auction.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Seller</p>
                                <p className="text-base break-all">{auction.sellerUsername}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Gavel className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Auction Type</p>
                                <p className="text-base capitalize">
                                    {auction.auctionType === 'reserve' ? 'Reserve Price' : 'Standard'}
                                </p>
                            </div>
                        </div>

                        {/* <div className="flex items-center gap-3">
                            <ShieldCheck className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Status</p>
                                <p className="text-base capitalize">
                                    {auction.status}
                                </p>
                            </div>
                        </div> */}
                    </div>

                    {/* Dynamic Specifications Section */}
                    <SpecificationsSection auction={auction} />
                </div>

                <hr className="my-8" />

                {/* Document section */}
                {auction.documents && auction.documents.length > 0 && (
                    <div>
                        <h3 className="my-5 text-primary text-xl font-semibold">Document(s)</h3>
                        <div className="flex gap-5 max-w-full flex-wrap">
                            {auction.documents.map((doc, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDocumentDownload(doc.url, doc.originalName || doc.filename)}
                                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary"
                                >
                                    <File size={20} className="flex-shrink-0" />
                                    <span className="group-hover:underline max-w-[125px] truncate">
                                        {doc.originalName || doc.filename}
                                    </span>
                                    <Download size={20} className="flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video section */}
                {youtubeVideoId && (
                    <>
                        <hr className="my-8" />
                        <div>
                            <h3 className="my-5 text-primary text-xl font-semibold">Video Look</h3>
                            <Suspense fallback={<LoadingSpinner />}>
                                <YouTubeEmbed videoId={youtubeVideoId} title={auction.title} />
                            </Suspense>
                        </div>
                    </>
                )}

                <hr className="my-8" />

                <Suspense fallback={<LoadingSpinner />}>
                    <TabSection
                        ref={commentSectionRef}
                        description={auction.description}
                        bids={auction.bids}
                        auction={auction}
                        activatedTab={activeTab} // Pass the active tab state
                    />
                </Suspense>

            </section>

            {/* Bid Section */}
            <section ref={bidSectionRef} className="col-span-1 lg:col-span-1 border border-gray-200 bg-gray-100 rounded-lg sticky top-24">
                {/* Timer section */}
                <TimerDisplay countdown={countdown} auction={auction} />

                <hr className="mx-6" />

                {/* Current bid section */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <p className="font-light">{auction.bidCount > 0 ? 'Current Bid' : 'Start Bidding At'}</p>
                        <p className="flex items-center gap-1 text-3xl sm:text-4xl font-medium">
                            <span>$ </span>
                            {/* <span> {auction?.bidCount > 0 ? auction.currentPrice.toLocaleString() : auction.startPrice.toLocaleString()}</span> */}
                            <span> {auction.currentPrice.toLocaleString()}</span>
                        </p>
                    </div>

                    {auction.auctionType === 'reserve' && (
                        <p className={`${auction.currentPrice >= auction.reservePrice ? 'text-green-600' : 'text-secondary'}`}>
                            {auction.currentPrice >= auction.reservePrice ? 'Reserve Met' : 'Reserve Not Met'}
                        </p>
                    )}

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">Starting Bid</span>
                        <span className="font-medium">$ {auction.startPrice.toLocaleString()}</span>
                    </p>

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">No. of Bids</span>
                        <span className="font-medium">{auction.bidCount}</span>
                    </p>

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">Min. Bid Increment</span>
                        <span className="font-medium">${auction.bidIncrement.toLocaleString()}</span>
                    </p>

                    {/* Conditional Bid Form based on auction status */}
                    {countdown.status === 'counting-down' ? (
                        <form onSubmit={handleBid} className="flex flex-col gap-4">
                            <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                className="py-3 px-5 w-full rounded-lg focus:outline-2 focus:outline-primary"
                                placeholder={`Bid $${auction.bidCount > 0 ? minBidAmount : auction.startPrice} or higher`}
                                min={minBidAmount}
                            // step={auction.bidIncrement}
                            />
                            <button
                                type="submit"
                                disabled={bidding}
                                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 px-6 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                            >
                                {bidding ? (
                                    <Loader size={16} className="animate-spin-slow" />
                                ) : (
                                    <>
                                        <Gavel />
                                        <span>Place Bid</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : countdown.status === 'approved' ? (
                        <div className="text-center py-4 bg-blue-100 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-700">Auction Not Started</p>
                            <p className="text-sm text-blue-600 mt-1">Bidding will begin when the auction starts</p>
                        </div>
                    ) : countdown.status === 'ended' ? (
                        <div className="text-center py-4 bg-yellow-100 rounded-lg border border-yellow-200">
                            <p className="font-medium text-yellow-700">Auction Ended</p>
                            {auction.winner ? (
                                <p className="text-sm text-yellow-600 mt-1">Winner: {auction.winner.username}</p>
                            ) : auction.status === 'sold' ? (
                                <p className="text-sm text-green-600 mt-1">Item Sold</p>
                            ) : auction.status === 'reserve_not_met' ? (
                                <p className="text-sm text-yellow-600 mt-1">Reserve Not Met</p>
                            ) : (
                                <p className="text-sm text-yellow-600 mt-1">No winning bidder</p>
                            )}
                        </div>
                    ) : countdown.status === 'cancelled' ? (
                        <div className="text-center py-4 bg-yellow-100 rounded-lg border border-yellow-200">
                            <p className="font-medium text-yellow-700">Auction Cancelled</p>
                            {auction.winner ? (
                                <p className="text-sm text-yellow-600 mt-1">Winner: {auction.winner.username}</p>
                            ) : auction.status === 'sold' ? (
                                <p className="text-sm text-green-600 mt-1">Item Sold</p>
                            ) : (
                                <p className="text-sm text-yellow-600 mt-1">No winning bidder</p>
                            )}
                        </div>
                    ) : countdown.status === 'draft' ? (
                        <div className="text-center py-4 bg-yellow-100 rounded-lg border border-yellow-200">
                            <p className="font-medium text-yellow-700">Auction Pending</p>
                            {auction.winner ? (
                                <p className="text-sm text-yellow-600 mt-1">Winner: {auction.winner.username}</p>
                            ) : auction.status === 'sold' ? (
                                <p className="text-sm text-green-600 mt-1">Item Sold</p>
                            ) : (
                                <p className="text-sm text-yellow-600 mt-1">Needs Admin Approval</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-gray-100 rounded-lg">
                            <p className="font-medium text-gray-600">Loading auction status...</p>
                        </div>
                    )}

                    {/* Watchlist Count */}
                    {auction.watchlistCount > 0 && (
                        <p className="text-center bg-white p-3 text-secondary text-sm flex items-center justify-center gap-2 border border-gray-200 rounded-lg">
                            <Users className="w-4 h-4" />
                            <span>{auction.watchlistCount} user{auction.watchlistCount !== 1 ? 's' : ''} watching</span>
                        </p>
                    )}

                    <p className="text-center bg-white p-3 text-secondary text-sm flex items-center justify-center gap-2 border border-gray-200 rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{auction.views} views</span>
                    </p>

                    {/* Additional auction info */}
                    {auction.bids && auction.bids.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-secondary mb-2">Recent Bids</p>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {auction.bids.slice(-3).reverse().map((bid, index) => (
                                    <div key={index} className="flex justify-between text-xs">
                                        <span className="text-gray-600">{bid.bidderUsername}</span>
                                        <span className="font-medium">${bid.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Container>
    );
}

export default SingleAuction;