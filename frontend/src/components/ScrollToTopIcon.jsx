import { ArrowBigUp } from "lucide-react";
import { useState, useEffect } from "react";

function ScrollToTopIcon() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const manageScroll = () => {
            setScrolled(window.scrollY > 100);
        }
        window.addEventListener('scroll', manageScroll);

        return () => window.removeEventListener('scroll', manageScroll);
    }, [])

    const handleScroll = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <>
            <div className={`bg-black p-2 rounded-md fixed bottom-5 right-5 flex items-center z-50 cursor-pointer ${!scrolled && 'hidden'}`} onClick={() => handleScroll()}>
                <div className="text-white font-bold align-middle">
                    <ArrowBigUp size={32} strokeWidth={1.5} />
                </div>
            </div>
        </>
    );
}

export default ScrollToTopIcon;