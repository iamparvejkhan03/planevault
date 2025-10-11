import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import toast from "react-hot-toast";

function Protected({ authetication, children, userType }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (!loading && authetication && !user) {
            navigate('/login');
        }
        // else if(!loading && authetication && userType !== user.userType){
        //     navigate(`/${user.userType}/dashboard`);
        //     toast.error(`You are not allowed to access ${userType}'s path`);
        // }
    }, [pathname, user, loading, authetication, navigate]);

    if (loading) {
        // return <div>Loading...</div>;
    }

    if (authetication && !user) {
        return null;
    }

    return <>{children}</>;
}

export default Protected;