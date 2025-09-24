import { useEffect } from "react";
import { LoadingSpinner, QuickActions, RecentActivity, StatCard, TopPerformers, SellerContainer, SellerHeader, SellerSidebar } from "../../components";
import toast from "react-hot-toast";
import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { TrendingUp, TrendingDown, Users, Gavel, Award, Heart, DollarSign, BarChart3, Clock } from "lucide-react";
import { Link } from "react-router-dom";
// import useRefreshToken from "../../hooks/useRefreshToken";
// import { updateUser } from "../../features/forms/UserAuthSlice.js";
// import cleanFileName from "../../hooks/CleanFileName.jsx";

const statsData = [
    {
        title: "Total Revenue",
        value: "28,452",
        change: "+1,240",
        icon: <DollarSign size={24} />,
        trend: "up",
        currency: "$"
    },
    {
        title: "Items Sold",
        value: "42",
        change: "+8",
        icon: <Award size={24} />,
        trend: "up"
    },
    {
        title: "Success Rate",
        value: "78",
        change: "+5",
        icon: <TrendingUp size={24} />,
        trend: "up",
        suffix: "%"
    },
    {
        title: "Total Bids",
        value: "1,452",
        change: "+210",
        icon: <Gavel size={24} />,
        trend: "up"
    },
    {
        title: "Average Sale Price",
        value: "677",
        change: "+42",
        icon: <DollarSign size={24} />,
        trend: "up",
        currency: "$"
    },
    {
        title: "Watchlist Items",
        value: "156",
        change: "+24",
        icon: <Heart size={24} />,
        trend: "up"
    },
    {
        title: "Ending Soon",
        value: "7",
        change: "-2",
        icon: <Clock size={24} />,
        trend: "down"
    }
];

function Dashboard() {
    // const user = useSelector(state => state.user.user);
    const [userSessions, setUserSessions] = useState(null);
    const [userAccommodations, setUserAccommodations] = useState(null);
    // const dispatch = useDispatch();
    // const refreshAccessToken = useRefreshToken();

    // useEffect(() => {
    //     const getUserSessions = async () => {
    //         try {
    //             const { data } = await axios.get(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/sessions/user`, { headers: { Authorization: `Bearer ${user.accessToken}` } });

    //             if (data.success) {
    //                 setUserSessions(data.data);
    //             }
    //         } catch (error) {
    //             const message = error?.response?.data?.message;
    //             if (message === 'accessToken') {
    //                 try {
    //                     const newAccessToken = await refreshAccessToken();

    //                     const { data } = await axios.get(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/sessions/user`, { headers: { Authorization: `Bearer ${newAccessToken}` } });

    //                     if (data && data.success) {
    //                         dispatch(updateUser({ ...user, accessToken: newAccessToken }));
    //                         setUserSessions(data.data);
    //                     }
    //                 } catch (error) {
    //                     const message = error?.response?.data?.message;
    //                     toast.error(message);
    //                 }
    //             } else {
    //                 toast.error(message);
    //             }
    //         }
    //     }
    //     getUserSessions();

    //     const getUserAccommodations = async () => {
    //         try {
    //             const { data } = await axios.get(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/accommodations/user`, { headers: { Authorization: `Bearer ${user.accessToken}` } });

    //             if (data.success) {
    //                 setUserAccommodations(data.data);
    //             }
    //         } catch (error) {
    //             const message = error?.response?.data?.message;
    //             if (message === 'accessToken') {
    //                 try {
    //                     const newAccessToken = await refreshAccessToken();

    //                     const { data } = await axios.get(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/accommodations/user`, { headers: { Authorization: `Bearer ${newAccessToken}` } });

    //                     if (data && data.success) {
    //                         dispatch(updateUser({ ...user, accessToken: newAccessToken }));
    //                         setUserAccommodations(data.data);
    //                     }
    //                 } catch (error) {
    //                     const message = error?.response?.data?.message;
    //                     toast.error(message);
    //                 }
    //             } else {
    //                 toast.error(message);
    //             }
    //         }
    //     }
    //     getUserAccommodations();
    // }, [])

    return (
        <section className="flex min-h-[70vh]">
            <SellerSidebar />

            <div className="w-full relative">
                <SellerHeader />

                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Dashboard</h2>
                        <p className="text-secondary">Easily track your consultations and documents in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {
                            statsData.map(stat => (
                                <StatCard key={stat.title} {...stat} />
                            ))
                        }
                    </div>

                    <div className="space-y-6 mb-16">
                        <QuickActions />
                        <TopPerformers />
                        <RecentActivity />
                    </div>
                </SellerContainer>
            </div>
        </section>
    );
}

export default Dashboard;