import { Trophy } from 'lucide-react';

const BidHistory = () => {
  const bids = [
    { id: 1, time: '19/03/2025 09:51:21', bidder: 'Michael Smith', amount: 340, isWinner: true },
    { id: 2, time: '19/03/2025 09:51:21', bidder: 'Robert Brown', amount: 340, isWinner: false },
    { id: 3, time: '19/03/2025 09:51:21', bidder: 'Joel Gording', amount: 340, isWinner: false },
    { id: 4, time: '19/03/2025 09:51:21', bidder: 'Michael Smith', amount: 340, isWinner: false },
    { id: 5, time: '19/03/2025 09:51:21', bidder: 'Michael Smith', amount: 340, isWinner: false },
    { id: 6, time: '19/03/2025 09:51:21', bidder: 'Ted Allen', amount: 340, isWinner: false },
    { id: 7, time: '19/03/2025 09:51:21', bidder: 'Michael Smith', amount: 340, isWinner: false },
  ];

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
            {bids.map((bid) => (
              <tr 
                key={bid.id} 
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  bid.isWinner ? 'bg-green-100 hover:bg-green-200' : ''
                }`}
              >
                {/* Bid Time */}
                <td className="py-3 px-4 text-sm text-secondary">
                  {bid.time}
                </td>
                
                {/* Bidder */}
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center">
                    <span className={`font-medium ${bid.isWinner ? 'text-green-600' : 'text-primary'}`}>
                      {bid.bidder}
                    </span>
                    {bid.isWinner && (
                      <span className="ml-2 bg-green-200 text-green-700 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                        <Trophy className="w-3 h-3 mr-1" />
                        Winner
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Amount */}
                <td className="py-3 px-4 text-right">
                  <span className="font-semibold text-primary">${bid.amount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 px-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 justify-between items-center text-sm text-secondary">
          <span>Total Bids: {bids.length}</span>
          <span>Highest Bid: ${Math.max(...bids.map(b => b.amount))}</span>
        </div>
      </div>
    </div>
  );
};

export default BidHistory;