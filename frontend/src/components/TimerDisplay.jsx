// Simple status-based timer display
const TimerDisplay = ({ countdown, auction }) => {
    if (countdown.status === 'not-started') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-gray-700 mb-4">Auction Starts In</div>
                <div className="grid grid-cols-4 gap-2 text-xl sm:text-2xl">
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 px-2">
                        <span>{countdown.days}</span>
                        <span className="text-sm sm:text-base font-light">Days</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>{countdown.hours}</span>
                        <span className="text-sm sm:text-base font-light">Hours</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>{countdown.minutes}</span>
                        <span className="text-sm sm:text-base font-light">Minutes</span>
                    </p>
                    <p className="flex flex-col items-center gap-2">
                        <span>{countdown.seconds}</span>
                        <span className="text-sm sm:text-base font-light">Seconds</span>
                    </p>
                </div>
            </div>
        );
    }

    if (countdown.status === 'counting-down') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-red-600 mb-4">Auction Ends In</div>
                <div className="grid grid-cols-4 gap-2 text-2xl">
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 px-2">
                        <span>{countdown.days}</span>
                        <span className="text-sm sm:text-base font-light">Days</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>{countdown.hours}</span>
                        <span className="text-sm sm:text-base font-light">Hours</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>{countdown.minutes}</span>
                        <span className="text-sm sm:text-base font-light">Minutes</span>
                    </p>
                    <p className="flex flex-col items-center gap-2">
                        <span>{countdown.seconds}</span>
                        <span className="text-sm sm:text-base font-light">Seconds</span>
                    </p>
                </div>
            </div>
        );
    }

    if (countdown.status === 'ended') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-gray-600">Auction Ended</div>
                {auction?.finalPrice ? (
                    <div className="text-2xl font-bold text-green-600 mt-2">
                        Sold for ${auction.finalPrice.toLocaleString()}
                    </div>
                ) : auction?.status === 'reserve_not_met' ? (
                    <div className="text-lg text-orange-600 mt-2">
                        Reserve price not met
                    </div>
                ) : (
                    <div className="text-lg text-gray-500 mt-2">
                        No winning bid
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="text-center py-8">
            <div className="text-lg text-gray-500">Loading auction timer...</div>
        </div>
    );
};

export default TimerDisplay;