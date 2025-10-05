import { Outlet } from "react-router-dom";
import { Footer, Header, MobileNav, ScrollToTop, ScrollToTopIcon, SearchFormPopUp } from "./components";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { usePopUp } from "./contexts/PopUpContextProvider";

const CategoryImagesSection = lazy(() => import('./components/CategoryImagesSection'));

function App(){
    const { isPopupOpen, closePopup } = usePopUp();
    const isSearchFormPopUpOpen = isPopupOpen('searchForm');
    const isCategoryImagesSectionOpen = isPopupOpen('category');
    return (
        <main className="bg-gray-50">
            <Header />
            <Outlet />
            <Footer />
            <MobileNav />
            <Toaster />
            <ScrollToTop />
            <ScrollToTopIcon />
            {isSearchFormPopUpOpen && <SearchFormPopUp closePopup={closePopup} />}
            {isCategoryImagesSectionOpen && <Suspense><CategoryImagesSection closePopup={closePopup} /></Suspense>}
        </main>
    );
}

export default App;