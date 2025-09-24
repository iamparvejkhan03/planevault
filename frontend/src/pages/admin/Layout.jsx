import { Outlet } from "react-router-dom";
import { Footer, ScrollToTop, ScrollToTopIcon, AdminHeader } from "../../components";
import { Toaster } from "react-hot-toast";

function Layout(){
    return (
        <>
            <ScrollToTop />
            <ScrollToTopIcon />
            <Toaster />
            {/* <AdminHeader /> */}
            <Outlet />
            <Footer />
        </>
    );
}

export default Layout;