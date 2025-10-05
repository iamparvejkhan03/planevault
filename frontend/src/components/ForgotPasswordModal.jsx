import axios from "axios";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const { register, handleSubmit } = useForm();
    const [isSending, setIsSending] = useState(false);
    const forgotPasswordHandler = async (formData) => {
        try {
            setIsSending(true);
            const { data } = await axios.post(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/forgot-password`, { email: formData.email });

            if (data && data.success) {
                toast.success(data.message);
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message);
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit(forgotPasswordHandler)} className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
                <p className="text-gray-600 mb-4">Enter your email to receive a password reset link.</p>
                <input
                    type="email"
                    placeholder="Your email"
                    className="w-full p-3 border rounded-lg mb-4"
                    {...register('email', { required: true })}
                />
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-center flex justify-center items-center">
                        {
                            isSending ? <Loader className="animate-spin-slow" /> : 'Send Reset Link'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordModal;