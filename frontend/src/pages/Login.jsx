import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Building, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { darkLogo } from '../assets';
import { ForgotPasswordModal } from '../components';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPasswordModel, setShowForgotPasswordModal] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if(user){
            navigate(`/${user.userType}/profile`);
        }
    }, [user])

    const { register, handleSubmit } = useForm({
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const loginHandler = async (loginData) => {
        try {
            setIsLoading(true);

            const data = await login(loginData);

            if (data && data.success) {
                toast.success(data.message);
                navigate(`/${data.userType}/dashboard`);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <ForgotPasswordModal isOpen={showForgotPasswordModel} onClose={() => setShowForgotPasswordModal(false)} />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="pt-8 text-center flex flex-col items-center justify-center gap-3">
                    <img src={darkLogo} alt="logo" className='h-10' />
                    <p className="text-black text-lg">Let's sign you in</p>
                </div>

                {/* Login Form */}
                <div className="p-5 sm:p-8">
                    <form onSubmit={handleSubmit(loginHandler)} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg"
                                    placeholder="Enter your email or username"
                                    required
                                    {...register('email', { required: true })}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg "
                                    placeholder="Enter your password"
                                    required
                                    {...register('password', { required: true })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} className="text-gray-400 hover:text-secondary" />
                                    ) : (
                                        <Eye size={20} className="text-gray-400 hover:text-secondary" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-between items-center">
                            <button
                                type='button'
                                onClick={() => setShowForgotPasswordModal(true)}
                                className="text-primary hover:text-primary-dark text-sm font-medium underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-secondary">New to PlaneVault?</span>
                        </div>
                    </div>

                    {/* Get in Touch/Register */}
                    <div className="text-center">
                        <p className="text-secondary text-sm">
                            Don't have an account?{' '}
                            <Link to={`/register`} className="text-primary hover:text-primary-dark font-semibold underline">
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white px-4 pb-4 text-center">
                    <p className="text-xs text-secondary">
                        © {new Date().getFullYear()} PlaneVault. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;