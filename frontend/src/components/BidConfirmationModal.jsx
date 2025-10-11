function BidConfirmationModal ({
    isOpen,
    onClose,
    onConfirm,
    auction,
    bidAmount,
    ref
}) {
    if (!isOpen) return null;

    // const serviceFee = Math.max(250, Math.min(7500, bidAmount * 0.05));
    const total = bidAmount;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center py-3 px-6 md:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Confirm your bid</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                    >
                        ×
                    </button>
                </div>

                {/* Vehicle Info */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200">
                    <strong className="text-gray-900">
                        {auction?.auctionType === 'standard' ? 'No Reserve' : 'Reserve'}: {auction?.title || '2016 Land Rover LR4 HSE'}
                    </strong>
                </div>

                {/* Bid Details */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="py- text-gray-600 font-semibold">Bid Amount:</td>
                                <td className="py- text-right font-medium text-gray-900">
                                    USD ${Number(bidAmount)?.toLocaleString()}
                                </td>
                            </tr>
                            {/* <tr>
                                <td className="py-2 text-gray-600">Bar Service Fee:</td>
                                <td className="py-2 text-right font-medium text-gray-900">
                                    USD ${serviceFee}
                                </td>
                            </tr> */}
                            {/* <tr className="border-t border-gray-200">
                                <td className="py-3 font-semibold text-gray-900">Total:</td>
                                <td className="py-3 text-right font-semibold text-gray-900">
                                    USD ${total}
                                </td>
                            </tr> */}
                        </tbody>
                    </table>
                </div>

                {/* Information Text */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200 space-y-4">
                    <p className="text-sm text-gray-600">
                        5% will get charged to the card on file at the close of the auction to the winning bidder, with a maximum commission of $10,000 for all sales under $500,000 and 3% for all sales over $500,000. 
                    </p>

                    <p className="text-sm text-gray-600">
                        For more info,{' '}
                        <a href="/faqs" className="text-blue-600 hover:text-blue-800 underline">
                            read about FAQs
                        </a>{' '}
                        or{' '}
                        <a href="/contact" className="text-blue-600 hover:text-blue-800 underline">
                            contact us
                        </a>{' '}
                        with any questions.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="py-3 px-6 md:p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 md:py-3 md:px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        ref={ref}
                        onClick={(e) => onConfirm(e)}
                        type="submit"
                        className="flex-1 py-2 px-4 md:py-3 md:px-4 bg-black text-white rounded-md hover:bg-black font-medium transition-colors"
                    >
                        Place Bid
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BidConfirmationModal;