import { Outlet } from "react-router-dom";
import { Footer, ScrollToTop, ScrollToTopIcon, BidderHeader, MobileNav, SearchFormPopUp } from "../../components";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { usePopUp } from "../../contexts/PopUpContextProvider";

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
            {/* <BidderHeader /> */}
            <MobileNav />
            <Outlet />
            <Footer />
            {isSearchFormPopUpOpen && <SearchFormPopUp closePopup={closePopup} />}
            {isCategoryImagesSectionOpen && <Suspense><CategoryImagesSection closePopup={closePopup} /></Suspense>}
        </>
    );
}

export default Layout;