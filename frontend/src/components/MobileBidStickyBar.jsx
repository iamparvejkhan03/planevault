import { Gavel } from 'lucide-react';

const MobileBidStickyBar = ({ currentBid, timeRemaining, onBidClick }) => {
  const { days, hours, minutes, seconds } = timeRemaining;

  return (
    <div className="lg:hidden bg-white border-t border-gray-100 shadow rounded-md p-4 z-50">
      <div className="flex items-center justify-between">
        {/* Left: Current Bid */}
        <div className="flex-1 space-y-1">
          <p className="text-xs text-gray-500 font-light">CURRENT BID</p>
          <p className="text-lg font-semibold">${currentBid.toLocaleString()}</p>
        </div>

        {/* Right: Bid Button */}
        <div className="flex-1 flex flex-col items-end gap-2 justify-end flex-wrap">
          {/* Center: Simplified Timer */}
          <div className="flex-1 flex justify-start items-center space-x-1 text-sm font-medium">
            <span className="bg-gray-100 px-1 rounded">{days}d</span>
            <span>:</span>
            <span className="bg-gray-100 px-1 rounded">{hours}h</span>
            <span>:</span>
            <span className="bg-gray-100 px-1 rounded">{minutes}m</span>
            <span className="bg-gray-100 px-1 rounded">{seconds}s</span>
          </div>
          <button
            onClick={onBidClick}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md cursor-pointer flex items-center gap-2 text-sm font-medium"
          >
            <Gavel size={16} />
            <span>Place bid</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBidStickyBar;