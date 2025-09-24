import { useEffect } from "react";
// import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function AdminRoute({ children }) {
    // const userType = useSelector(state => state.user.user.userType);
    const userType = 'admin';
    // const isLoggedIn = useSelector(state => state.user.isUserLoggedIn);
    const isLoggedIn = true;
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            return navigate('/');
        }

        if (userType !== "admin") {
            return navigate('/');
        }
    }, [])

    return children;
}

export default AdminRoute;