import { Heart } from "lucide-react";
import { useWatchlist } from "../hooks/useWatchlist";

const WatchlistButton = ({ auctionId }) => {
    const { isWatchlisted, watchlistCount, loading, toggleWatchlist } = useWatchlist(auctionId);

    return (
        <button
            onClick={toggleWatchlist}
            disabled={loading}
            className={`flex items-center gap-2 py-1 px-3 border border-gray-200 rounded-full transition-colors ${
                isWatchlisted 
                    ? 'bg-gray-100 text-black hover:bg-gray-200' 
                    : 'text-secondary hover:bg-gray-200'
            } disabled:opacity-50`}
        >
            <Heart 
                size={20} 
                fill={isWatchlisted ? 'currentColor' : 'none'} 
            />
            <span>{watchlistCount}</span>
            {loading && <span className="ml-2">...</span>}
        </button>
    );
};

export default WatchlistButton;