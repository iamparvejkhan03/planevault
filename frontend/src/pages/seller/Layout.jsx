import { Outlet } from "react-router-dom";
import { Footer, ScrollToTop, ScrollToTopIcon, SellerHeader } from "../../components";
import { Toaster } from "react-hot-toast";

function Layout(){
    return (
        <>
            <ScrollToTop />
            <ScrollToTopIcon />
            <Toaster />
            {/* <SellerHeader /> */}
            <Outlet />
            <Footer />
        </>
    );
}

export default Layout;