import { Outlet } from "react-router-dom";
import { Footer, Header, MobileNav, ScrollToTop, ScrollToTopIcon } from "./components";
import { Toaster } from "react-hot-toast";

function App(){
    return (
        <main className="bg-gray-50">
            <Header />
            <Outlet />
            <Footer />
            <MobileNav />
            <Toaster />
            <ScrollToTop />
            <ScrollToTopIcon />
        </main>
    );
}

export default App;