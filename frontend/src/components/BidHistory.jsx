import { Trophy, Clock, User } from 'lucide-react';

const BidHistory = ({ bids, auction }) => {
  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown time';

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace(',', '');
  };

  // Get winner bid (if auction is ended/sold)
  const getWinnerBid = () => {
    if (!auction || !auction.winner || auction.status !== 'sold') return null;

    // Find the highest bid from the winner
    const winnerBids = bids.filter(bid =>
      bid.bidder && bid.bidder._id === auction.winner._id
    );

    return winnerBids.length > 0 ? winnerBids[winnerBids.length - 1] : null;
  };

  // Sort bids by timestamp (newest first)
  const sortedBids = [...bids].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Get highest bid amount
  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;

  const winnerBid = getWinnerBid();

  if (bids.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md sm:px-6 py-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-primary mb-4 flex items-center px-6">
          <Trophy className="mr-2 w-5 h-5 text-green-600" />
          Bid History
        </h2>

        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No bids yet</p>
          <p className="text-sm">Be the first to place a bid!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md sm:px-6 py-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center px-6">
        <Trophy className="mr-2 w-5 h-5 text-green-600" />
        Bid History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-secondary">Bid Time</th>
              <th className="text-left py-3 px-4 font-medium text-secondary">Bidder</th>
              <th className="text-right py-3 px-4 font-medium text-secondary">Amount</th>
            </tr>
          </thead>

          <tbody>
            {sortedBids.map((bid, index) => {
              const isWinner = winnerBid && bid._id === winnerBid._id;
              const isCurrentHighest = index === 0; // Since sorted newest first

              return (
                <tr
                  key={bid._id || index}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isWinner ? 'bg-green-50 hover:bg-green-100' : ''
                    } ${isCurrentHighest ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                >
                  {/* Bid Time */}
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center text-secondary">
                      <Clock className="w-3 h-3 mr-2 text-gray-400" />
                      {formatDate(bid.timestamp)}
                    </div>
                  </td>

                  {/* Bidder */}
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-2 text-gray-400" />
                      <span className={`font-medium ${isWinner ? 'text-green-600' :
                          isCurrentHighest ? 'text-blue-600' :
                            'text-primary'
                        }`}>
                        {bid.bidderUsername || 'Unknown Bidder'}
                      </span>

                      {/* Badges */}
                      <div className="ml-2 flex gap-1">
                        {isWinner && (
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                            <Trophy className="w-3 h-3 mr-1" />
                            Winner
                          </span>
                        )}
                        {isCurrentHighest && !isWinner && auction.status === 'active' && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                            Highest
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${isWinner ? 'text-green-600' :
                        isCurrentHighest ? 'text-blue-600' :
                          'text-primary'
                      }`}>
                      ${bid.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="mt-4 pt-4 px-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 justify-between items-center text-sm text-secondary">
          <div className="flex items-center gap-2">
            <span>Total Bids: <strong className="text-primary">{bids.length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span>Highest Bid: <strong className="text-primary">${highestBid.toLocaleString()}</strong></span>
          </div>

          {auction && auction.bidCount > 0 && (
            <div className="flex items-center gap-2">
              <span>Bid Increment: <strong className="text-primary">${auction.bidIncrement.toLocaleString()}</strong></span>
            </div>
          )}
        </div>

        {/* Auction Status Info */}
        {auction && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">Auction Status:</span>
              <span className={`font-medium ${auction.status === 'active' ? 'text-green-600' :
                  auction.status === 'sold' ? 'text-green-600' :
                    auction.status === 'ended' ? 'text-gray-600' :
                      'text-orange-600'
                }`}>
                {auction.status === 'active' && '🟢 Active'}
                {auction.status === 'sold' && '✅ Sold'}
                {auction.status === 'ended' && '⚫ Ended'}
                {auction.status === 'draft' && '📝 Draft'}
                {auction.status === 'cancelled' && '❌ Cancelled'}
                {auction.status === 'reserve_not_met' && '⚠️ Reserve Not Met'}
              </span>
            </div>

            {winnerBid && (
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-secondary">Winning Bidder:</span>
                <span className="font-medium text-green-600">
                  {winnerBid.bidderUsername}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidHistory;