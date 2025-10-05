import { Outlet } from "react-router-dom";
import { Footer, ScrollToTop, ScrollToTopIcon, AdminHeader, MobileNav, SearchFormPopUp } from "../../components";
import { Toaster } from "react-hot-toast";
import { usePopUp } from "../../contexts/PopUpContextProvider";
import { lazy, Suspense } from "react";

const CategoryImagesSection = lazy(() => import('../../components/CategoryImagesSection'));

function Layout(){
    const { isPopupOpen, closePopup } = usePopUp();
    const isSearchFormPopUpOpen = isPopupOpen('searchForm');
    const isCategoryImagesSectionOpen = isPopupOpen('category');
    return (
        <>
            <ScrollToTop />
            <ScrollToTopIcon />
            <Toaster />
            {/* <AdminHeader /> */}
            <MobileNav />
            <Outlet />
            <Footer />
            {isSearchFormPopUpOpen && <SearchFormPopUp closePopup={closePopup} />}
            {isCategoryImagesSectionOpen && <Suspense><CategoryImagesSection closePopup={closePopup} /></Suspense>}
        </>
    );
}

export default Layout;