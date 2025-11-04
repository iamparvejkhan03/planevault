import { useState } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance.js';
import toast from 'react-hot-toast';

function LowerReserveModal({ isOpen, onClose, auction, onReserveLowered }) {
    const [newReservePrice, setNewReservePrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !auction) return null;

    const currentReserve = auction.reservePrice;
    const currentBid = auction.currentPrice;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newReservePrice) {
            setError('Please enter a new reserve price');
            return;
        }

        const newPrice = parseFloat(newReservePrice);
        const currentReserveNum = parseFloat(currentReserve);
        const currentBidNum = parseFloat(currentBid);

        if (isNaN(newPrice)) {
            setError('Please enter a valid number');
            return;
        }

        if (newPrice >= currentReserveNum) {
            setError('New reserve price must be lower than current reserve price');
            return;
        }

        // if (newPrice <= currentBidNum) {
        //     setError(`New reserve price must be higher than current bid ($${currentBidNum.toLocaleString()})`);
        //     return;
        // }

        if (newPrice <= 0) {
            setError('Reserve price must be greater than 0');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const { data } = await axiosInstance.patch(
                `/api/v1/auctions/${auction._id}/lower-reserve`,
                { newReservePrice: newPrice }
            );

            if (data.success) {
                toast.success('Reserve price lowered successfully!');
                onReserveLowered(data.data.auction);
                onClose();
                setNewReservePrice('');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to lower reserve price';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setNewReservePrice('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Lower Reserve Price</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Current Reserve Price */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-900">Current Reserve Price:</span>
                                <span className="text-lg font-bold text-blue-900">
                                    ${currentReserve?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Current Highest Bid */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Current Bid Price:</span>
                                <span className="text-lg font-bold text-gray-900">
                                    ${currentBid.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* New Reserve Price Input */}
                        <div>
                            <label htmlFor="newReservePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                New Reserve Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                <input
                                    type="number"
                                    id="newReservePrice"
                                    value={newReservePrice}
                                    onChange={(e) => {
                                        setNewReservePrice(e.target.value);
                                        setError('');
                                    }}
                                    step="0.01"
                                    min="0"
                                    placeholder={`Enter amount lower than $${currentReserve.toLocaleString()}`}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Info Message */}
                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Important:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Reserve price can only be lowered, not increased</li>
                                    <li>This action cannot be undone</li>
                                </ul>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    {/* <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button> */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !newReservePrice}
                        className="flex-1 px-4 py-2 text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Lower Reserve Price
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LowerReserveModal;