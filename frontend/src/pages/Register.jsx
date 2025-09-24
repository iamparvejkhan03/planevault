import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Gavel, Store, CreditCard, MapPin, Phone, Building, ChevronDown} from 'lucide-react';
import { darkLogo } from '../assets';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('your-publishable-key-here'); // Replace with your Stripe publishable key

const countries = [
    'United States',
    'India',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    // Add more countries as needed
];

const states = [
    'California',
    'New York',
    'Texas',
    'Florida',
    'Washington',
    // Add more states as needed
];

const CardSection = () => {
    return (
        <div className="space-y-4 border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
            <p className="text-sm text-gray-600">
                Bring a Trailer requires a credit card to bid. There is no charge to register.
                We will only authorize that your card is valid.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full name
                    </label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Please provide your full name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country or region
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Select country</option>
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address line 1
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Street address"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address line 2 (optional)
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Apt, suite, unit, etc."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="City"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                        </label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="">Select state</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP / Postal code
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="ZIP code"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone number
                    </label>
                    <input
                        type="tel"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="+1 234 567 8900"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Card Information
                    </label>
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
                Note: You will automatically be taken to two-factor authentication (2FA) setup after submitting billing information.
                2FA is required for all registered bidders for account security.
            </p>
        </div>
    );
};

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            firstName: '',
            lastName: '',
            country: '',
            userType: ''
        }
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            // Handle registration logic here
            if (userType === 'bidder') {
                // Process Stripe payment first
                // const { error, paymentMethod } = await stripe.createPaymentMethod({
                //   type: 'card',
                //   card: elements.getElement(CardElement),
                // });

                // if (error) {
                //   console.error('Payment error:', error);
                //   return;
                // }

                // Save payment method reference
                console.log('Payment method created');
            }

            console.log('Registration data:', data);
            // Proceed with registration

        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
                {/* Header */}
                <div className="pt-8 text-center flex flex-col items-center justify-center gap-3">
                    <img src={darkLogo} alt="logo" className='h-10' />
                    <p className="text-black text-lg">Create your account</p>
                </div>

                {/* Registration Form */}
                <div className="p-5 sm:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            {...register('email', { required: 'Email is required' })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            {...register('username', { required: 'Username is required' })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="What others see when you bid"
                                        />
                                        {errors.username && (
                                            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                            })}
                                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...register('confirmPassword', {
                                                required: 'Please confirm your password',
                                                validate: value => value === password || 'Passwords do not match'
                                            })}
                                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First name
                                    </label>
                                    <input
                                        type="text"
                                        {...register('firstName', { required: 'First name is required' })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="First name"
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last name
                                    </label>
                                    <input
                                        type="text"
                                        {...register('lastName', { required: 'Last name is required' })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Last name"
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country of residence
                                </label>
                                <div className="relative">
                                    <select
                                        {...register('country', { required: 'Country is required' })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                                    >
                                        <option value="">Select country</option>
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                    {errors.country && (
                                        <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Type Selection */}
                        <div className="border-t pt-6">
                            <label className="text-sm font-medium leading-none text-gray-700 flex items-center gap-2 mb-4">
                                <User size={20} />
                                <span>User Type</span>
                            </label>

                            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3 my-2">
                                <label
                                    className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer transition-colors ${userType === 'bidder' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setUserType('bidder')}
                                >
                                    <input
                                        type="radio"
                                        value="bidder"
                                        {...register('userType', { required: 'Please select user type' })}
                                        className="hidden"
                                    />
                                    <Gavel size={40} className={`flex-shrink-0 p-2 rounded ${userType === 'bidder' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-semibold">I'm a bidder</p>
                                        <p className="text-sm text-gray-600">I want to bid on the listings on the platform.</p>
                                    </div>
                                </label>

                                <label
                                    className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer transition-colors ${userType === 'seller' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setUserType('seller')}
                                >
                                    <input
                                        type="radio"
                                        value="seller"
                                        {...register('userType', { required: 'Please select user type' })}
                                        className="hidden"
                                    />
                                    <Store size={40} className={`flex-shrink-0 p-2 rounded ${userType === 'seller' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-semibold">I'm a seller</p>
                                        <p className="text-sm text-gray-600">I want to list things on the platform.</p>
                                    </div>
                                </label>
                            </div>
                            {errors.userType && (
                                <p className="text-red-500 text-sm mt-1">{errors.userType.message}</p>
                            )}
                        </div>

                        {/* Stripe Card Section for Bidders */}
                        {userType === 'bidder' && (
                            <Elements stripe={stripePromise}>
                                <CardSection />
                            </Elements>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Already have account */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white px-4 pb-4 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} PlaneVault. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;