import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (loginData) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/login`, { email: loginData.email, password: loginData.password });

            if (data && data.success) {
                const userInfo = {
                    _id: data.data.user._id,
                    firstName: data.data.user.firstName,
                    lastName: data.data.user.lastName,
                    username: data.data.user.username,
                    userType: data.data.user.userType,
                    email: data.data.user.email,
                    phone: data.data.user.phone,
                    isVerified: data.data.user.isVerified,
                    isActive: data.data.user.isActive,
                    image: data.data.user.image,
                    createdAt: data.data.user.createdAt,
                    countryName: data.data.user.countryName,
                    countryCode: data.data.user.countryCode,
                };

                const accessToken = data.data.accessToken;
                const refreshToken = data.data.refreshToken;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(userInfo));

                setUser(userInfo);

                return { success: true, message: data.message, userType: data.data.user.userType }
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.log(error);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};