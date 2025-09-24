import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Gavel, Store, CreditCard, MapPin, Phone, Building, ChevronDown } from 'lucide-react';
import { darkLogo } from '../assets';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import axios from "axios";
import { toast } from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const countries = [
    { name: 'United States', code: 'US' },
    { name: 'India', code: 'IN' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Japan', code: 'JP' },
    { name: 'China', code: 'CN' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Italy', code: 'IT' },
    { name: 'Spain', code: 'ES' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Russia', code: 'RU' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Norway', code: 'NO' },
    { name: 'Denmark', code: 'DK' },
];


// CardSection component that uses Stripe hooks
const CardSection = () => {
    const stripe = useStripe();
    const elements = useElements();

    return (
        <div className="space-y-4 border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
            <p className="text-sm text-gray-600">
                PlaneVault requires a credit card to bid. There is no charge to register.
                We will only authorize that your card is valid.
            </p>

            <div className="space-y-4">
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
            </div>

            <p className="text-sm text-gray-500 mt-4">
                Note: Your card will be verified with a small authorization that will be immediately refunded.
            </p>
        </div>
    );
};

// Main Register component
const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('');
    const navigate = useNavigate();

    // Stripe hooks - these must be used at the top level of the component
    const stripe = useStripe();
    const elements = useElements();

    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
        defaultValues: {
            email: '',
            phone: '',
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

    // Update form value when userType changes
    const handleUserTypeChange = (type) => {
        setUserType(type);
        setValue('userType', type);
    };

    const onSubmit = async (registrationData) => {
        setIsLoading(true);
        try {
            let paymentMethodId = null;

            // Handle bidder card verification
            if (registrationData.userType === 'bidder') {
                if (!stripe || !elements) {
                    toast.error('Stripe not initialized properly');
                    setIsLoading(false);
                    return;
                }

                // Validate card element
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    toast.error('Please enter your card details');
                    setIsLoading(false);
                    return;
                }

                // Create payment method with country code
                const { error, paymentMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    billing_details: {
                        name: `${registrationData.firstName} ${registrationData.lastName}`,
                        email: registrationData.email,
                        phone: registrationData.phone,
                        address: {
                            country: registrationData.country, // This should be 'US', 'IN', etc.
                        }
                    }
                });

                if (error) {
                    toast.error(`Payment error: ${error.message}`);
                    setIsLoading(false);
                    return;
                }

                paymentMethodId = paymentMethod.id;
            }

            // Prepare registration data - store both name and code
            const registrationPayload = {
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                email: registrationData.email,
                phone: registrationData.phone,
                password: registrationData.password,
                username: registrationData.username,
                countryCode: registrationData.country, // This will be the code like 'IN', 'US'
                countryName: countries.find(c => c.code === registrationData.country)?.name || registrationData.country,
                userType: registrationData.userType,
                ...(registrationData.userType === 'bidder' && { paymentMethodId })
            };

            // Send registration request
            const { data } = await axios.post(
                `${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/register`,
                registrationPayload,
                { withCredentials: true }
            );

            if (data.success) {
                const accessToken = data.data.accessToken;
                // dispatch(updateUser({ ...data.data.user, accessToken }));
                // dispatch(toggleIsUserLoggedIn(true));
                // dispatch(toggleShowUserAuthForm(false));

                // Redirect based on user type
                const redirectPath = registrationData.userType === 'seller'
                    ? '/seller/dashboard'
                    : '/bidder/dashboard';

                navigate(redirectPath);
                toast.success(data.message);
            }

        } catch (error) {
            toast.error(error?.response?.data?.message || 'Registration failed');
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
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: 'Invalid email address'
                                                }
                                            })}
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
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            {...register('phone', {
                                                required: 'Phone is required',
                                                pattern: {
                                                    value: /^[+]?[1-9][\d]{0,15}$/,
                                                    message: 'Invalid phone number'
                                                }
                                            })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Enter your contact no."
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
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
                                        {...register('firstName', {
                                            required: 'First name is required',
                                            minLength: { value: 2, message: 'First name must be at least 2 characters' }
                                        })}
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
                                        {...register('lastName', {
                                            required: 'Last name is required',
                                            minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                                        })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Last name"
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                                            {...register('username', {
                                                required: 'Username is required',
                                                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                                pattern: {
                                                    value: /^[a-zA-Z0-9_]+$/,
                                                    message: 'Username can only contain letters, numbers, and underscores'
                                                }
                                            })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="What others see when you bid"
                                        />
                                        {errors.username && (
                                            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
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
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={20} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                        {errors.country && (
                                            <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                                        )}
                                    </div>
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
                                >
                                    <input
                                        type="radio"
                                        value="bidder"
                                        {...register('userType', { required: 'Please select user type' })}
                                        className="hidden"
                                        onChange={() => handleUserTypeChange('bidder')}
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
                                >
                                    <input
                                        type="radio"
                                        value="seller"
                                        {...register('userType', { required: 'Please select user type' })}
                                        className="hidden"
                                        onChange={() => handleUserTypeChange('seller')}
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
                        {userType === 'bidder' && <CardSection />}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || (userType === 'bidder' && !stripe)}
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

// Wrap the main component with Stripe Elements provider
const RegisterWithStripe = () => (
    <Elements stripe={stripePromise}>
        <Register />
    </Elements>
);

export default RegisterWithStripe;