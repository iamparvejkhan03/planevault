import { useEffect, useState } from "react";
import { LoadingSpinner, SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import { CreditCard, Shield, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card Section Component
const CardSection = ({ isUpdating }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Credit Card Information
                </label>
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#fa755a',
                                    iconColor: '#fa755a',
                                },
                            },
                        }}
                    />
                </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Shield size={18} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Secure Payment Information</p>
                        <p>Your card details are encrypted and processed securely by Stripe. We never store your full card information on our servers.</p>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
            >
                {isUpdating ? (
                    <>
                        <RefreshCw size={18} className="animate-spin" />
                        Updating Card...
                    </>
                ) : (
                    <>
                        <CreditCard size={18} />
                        Update Payment Method
                    </>
                )}
            </button>
        </div>
    );
};

// Main Billing Component
const Billing = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [cardDetails, setCardDetails] = useState(null);

    const fetchCardDetails = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/users/billing');
            if (data.success) {
                setCardDetails(data.data);
            }
        } catch (err) {
            console.error('Fetch card details error:', err);
            toast.error('Failed to load card details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCardDetails();
    }, []);

    const handleUpdateCard = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            toast.error('Stripe not initialized');
            return;
        }

        setUpdating(true);

        try {
            const cardElement = elements.getElement(CardElement);
            
            if (!cardElement) {
                toast.error('Please enter your card details');
                return;
            }

            // Create new payment method
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                toast.error(`Card error: ${error.message}`);
                return;
            }

            // Update card on backend
            const { data } = await axiosInstance.put('/api/v1/users/billing/update-card', {
                paymentMethodId: paymentMethod.id
            });

            if (data.success) {
                toast.success('Card updated successfully!');
                setCardDetails(data.data);
                // Clear the card element
                cardElement.clear();
                await fetchCardDetails(); // Refresh card details
            }

        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update card');
            console.error('Update card error:', error);
        } finally {
            setUpdating(false);
        }
    };

    const getCardBrandIcon = (brand) => {
        const icons = {
            visa: '💳',
            mastercard: '💳',
            amex: '💳',
            discover: '💳',
            jcb: '💳',
            diners: '💳',
            unionpay: '💳',
        };
        return icons[brand?.toLowerCase()] || '💳';
    };

    const formatExpiryDate = (month, year) => {
        return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
    };

    return (
        <section className="flex min-h-[70vh]">
            <SellerSidebar />

            <div className="w-full relative">
                <SellerHeader />

                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Billing & Payment Methods</h2>
                        <p className="text-secondary">Manage your payment methods and billing information.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="max-w-2xl">
                            {/* Current Card Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <CreditCard size={20} />
                                        Current Payment Method
                                    </h3>
                                    {cardDetails?.isPaymentVerified && (
                                        <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                            <CheckCircle size={14} />
                                            Verified
                                        </span>
                                    )}
                                </div>

                                {cardDetails?.card ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getCardBrandIcon(cardDetails.card.brand)}</span>
                                                <div>
                                                    <p className="font-medium">
                                                        {cardDetails.card.brand?.charAt(0).toUpperCase() + cardDetails.card.brand?.slice(1)} •••• {cardDetails.card.last4}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Expires {formatExpiryDate(cardDetails.card.expMonth, cardDetails.card.expYear)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Default</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Shield size={16} />
                                            <span>Your card details are securely stored with Stripe</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <AlertCircle size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-600">No payment method found</p>
                                    </div>
                                )}
                            </div>

                            {/* Update Card Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <CreditCard size={20} />
                                    Update Payment Method
                                </h3>

                                <form onSubmit={handleUpdateCard}>
                                    <CardSection isUpdating={updating} />
                                </form>
                            </div>

                            {/* Billing Information */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Stripe Customer ID</p>
                                        <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                                            {cardDetails?.stripeCustomerId || 'Not available'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Account Type</p>
                                        <p className="font-medium capitalize">{cardDetails?.userType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Status</p>
                                        <p className={`font-medium ${cardDetails?.isPaymentVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {cardDetails?.isPaymentVerified ? 'Verified' : 'Not Verified'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SellerContainer>
            </div>
        </section>
    );
};

// Wrap with Stripe Elements
const BillingWithStripe = () => (
    <Elements stripe={stripePromise}>
        <Billing />
    </Elements>
);

export default BillingWithStripe;