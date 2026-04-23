import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
    const { user, setUser } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchUserPermissions = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await axiosInstance.get('/api/v1/users/profile');
                if (data.success) {
                    const freshUser = data.data.user;
                    setPermissions(freshUser.permissions || []);
                    setIsAdmin(freshUser.userType === 'admin');

                    // Update local storage and auth context with fresh data
                    const updatedUser = { ...user, permissions: freshUser.permissions };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
                // Fallback to existing user permissions
                setPermissions(user?.permissions || []);
                setIsAdmin(user?.userType === 'admin');
            } finally {
                setLoading(false);
            }
        };

        fetchUserPermissions();
    }, [user?._id]); // Re-fetch when user ID changes

    return { permissions, loading, isAdmin };
};