import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

export const useWatchlist = (auctionId) => {
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Check initial watchlist status
    useEffect(() => {
        const checkWatchlistStatus = async () => {
            if (!auctionId) return;

            const accessToken = localStorage.getItem('accessToken');

             if (!accessToken) {
                setIsWatchlisted(false);
                setLoading(false);
                return;
            }
            
            try {
                const { data } = await axiosInstance.get(`/api/v1/watchlist/status/${auctionId}`);
                if (data.success) {
                    setIsWatchlisted(data.data.isWatchlisted);
                    setWatchlistCount(data.data.watchlistCount);
                }
            } catch (error) {
                console.error('Error checking watchlist status:', error);
            }
        };

        checkWatchlistStatus();
    }, [auctionId]);

    const toggleWatchlist = async () => {
        if (loading) return;
        
        setLoading(true);
        try {
            const { data } = await axiosInstance.post(`/api/v1/watchlist/toggle/${auctionId}`);
            
            if (data.success) {
                setIsWatchlisted(data.data.isWatchlisted);
                setWatchlistCount(data.data.watchlistCount);
                
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update watchlist');
            console.error('Toggle watchlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        isWatchlisted,
        watchlistCount,
        loading,
        toggleWatchlist
    };
};