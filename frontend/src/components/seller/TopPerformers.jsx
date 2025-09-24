import { Eye, Heart, Gavel, TrendingUp } from "lucide-react";

function TopPerformers() {
    const listings = [
        { name: 'Vintage Rolex Watch', bids: 24, watches: 18, price: '$1,850' },
        { name: 'Antique Persian Rug', bids: 19, watches: 12, price: '$3,450' },
        { name: 'Rare Baseball Cards', bids: 17, watches: 9, price: '$2,200' },
        { name: 'Art Deco Lamp', bids: 14, watches: 11, price: '$850' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Top Performing Listings</h3>
                <TrendingUp size={18} className="text-gray-500" />
            </div>
            <div className="space-y-4">
                {listings.map((listing, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">{listing.name}</p>
                            <p className="text-sm font-semibold text-gray-900">{listing.price}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Gavel size={14} className="mr-1" />
                                <span>{listing.bids}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Heart size={14} className="mr-1" />
                                <span>{listing.watches}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopPerformers;