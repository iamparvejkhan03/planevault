// import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
// import { toggleShowUserAuthForm } from "../features/forms/UserAuthSlice.js";
import { useEffect } from "react";

function Protected({authetication, children}){
    // const isUserLoggedIn = useSelector(state => state.user.isUserLoggedIn);

    const navigate = useNavigate();
    // const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        // if(authetication && !isUserLoggedIn){
        //     navigate('/');
        //     dispatch(toggleShowUserAuthForm(true));
        // }
        return;
    }, [pathname])

    return (
        <>
            {children}
        </>
    );
}

export default Protected;