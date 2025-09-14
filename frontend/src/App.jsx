import { Outlet } from "react-router-dom";
import { Footer, Header, MobileNav } from "./components";

function App(){
    return (
        <main className="bg-gray-50">
            <Header />
            <Outlet />
            <Footer />
            <MobileNav />
        </main>
    );
}

export default App;