import { Outlet } from "react-router-dom";
import { Footer, ScrollToTop, ScrollToTopIcon, BidderHeader } from "../../components";
import { Toaster } from "react-hot-toast";

function Layout(){
    return (
        <>
            <ScrollToTop />
            <ScrollToTopIcon />
            <Toaster />
            {/* <BidderHeader /> */}
            <Outlet />
            <Footer />
        </>
    );
}

export default Layout;