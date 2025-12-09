import { useState } from "react";

function BidConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    auction,
    bidAmount,
    commissionAmount, // Add this new prop
    ref
}) {
    const [agreeToTerms, setAgreeToTerms] = useState(false);

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
                {/* <div className="py-3 px-6 md:p-6 border-b border-gray-200">
                    <strong className="text-gray-900">
                        {auction?.auctionType === 'standard' ? 'No Reserve' : 'Reserve'}: {auction?.title || '2016 Land Rover LR4 HSE'}
                    </strong>
                </div> */}

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

                {/* NEW: Commission Authorization Checkbox - Add this section */}
                {commissionAmount > 0 && (
                    <div className="py-3 px-6 md:p-6 border-b border-gray-200 bg-yellow-50">
                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="paymentAuthorization"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="mt-1 flex-shrink-0"
                            />
                            <label htmlFor="paymentAuthorization" className="text-sm text-gray-700">
                                <span className="font-medium">Payment Authorization Required</span>
                                <p className="mt-1">
                                    A <strong>${commissionAmount.toLocaleString()} temporary hold</strong> will be placed on your
                                    credit card for bidding authorization. The hold will be
                                    released after the auction ends if you're not the winning bidder.
                                </p>
                            </label>
                        </div>
                    </div>
                )}

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
                        onClick={(e) => {
                            // Check if commission is required but not agreed to
                            if (commissionAmount > 0 && !agreeToTerms) {
                                alert('You must authorize the temporary payment hold to place a bid');
                                return;
                            }
                            onConfirm(e);
                        }}
                        type="submit"
                        className={`flex-1 py-2 px-4 md:py-3 md:px-4 rounded-md font-medium transition-colors ${commissionAmount > 0 && !agreeToTerms
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-black'
                            }`}
                        disabled={commissionAmount > 0 && !agreeToTerms}
                    >
                        Place Bid
                    </button>
                </div>

                {/* Information Text */}
                <div className="pb-3 px-6 md:px-6 md:pb-6 border-b border-gray-200 space-y-4">
                    <p className="text-sm text-gray-600">
                        Note: 5% will get charged to the card on file at the close of the auction to the winning bidder, with a maximum commission of $10,000 for all sales under $500,000 and 3% for all sales over $500,000.
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
            </div>
        </div>
    );
};

export default BidConfirmationModal;