import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

export function useStats(){
    const [stats, setStats] = useState({
        activeAuctions: 0,
        newToday: 0,
        endingSoon: 0,
        totalBidders: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/auctions/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Use default stats if API fails
            setStats({
                activeAuctions: auctions.length,
                newToday: 0,
                endingSoon: auctions.filter(auction => {
                    const end = new Date(auction.endDate);
                    const now = new Date();
                    return (end - now) / (1000 * 60 * 60) < 24;
                }).length,
                totalBidders: 0
            });
        }
    };

    return {
        stats,
        fetchStats,
    }
}