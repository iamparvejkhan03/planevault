const ForgotPasswordModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
                <p className="text-gray-600 mb-4">Enter your email to receive a password reset link.</p>
                <input
                    type="email"
                    placeholder="Your email"
                    className="w-full p-3 border rounded-lg mb-4"
                />
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                        Send Reset Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;