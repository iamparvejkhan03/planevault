import { ArrowUp, X } from "lucide-react";
import { CategoryImg, Container } from "./";
import { airCrafts, endingSoonAuctions, liveAuctions, memorabilia, parts, soldAuctions, upcomingAuctions } from "../assets";
import { Link, useNavigate } from "react-router-dom";

function CategoryImagesSection({ closePopup }) {
    const navigate = useNavigate();

    const handleSearchByCategory = (title) => {
        const params = new URLSearchParams();
        params.append('category', title);

        navigate(`/auctions?${params.toString()}`);
        closePopup('category');
    }

    const handleSearchByStatus = (title) => {
        const params = new URLSearchParams();
        params.append('status', title);

        navigate(`/auctions?${params.toString()}`);
        closePopup('category');
    }

    const categoryImg = [
        {
            title: 'Aircraft',
            image: airCrafts,
        },
        {
            title: 'Engines & Parts',
            image: parts,
        },
        {
            title: 'Memorabilia',
            image: memorabilia,
        }
    ];

    const statusImg = [
        {
            title: 'active',
            image: liveAuctions,
        },
        {
            title: 'sold',
            image: soldAuctions,
        },
        {
            title: 'approved',
            image: upcomingAuctions,
        }
    ];

    return (
        <Container className="w-full min-h-screen h-full fixed inset-0 bg-black/70 z-50 overflow-y-scroll">
            <section className="max-h-[95%] overflow-y-scroll lg:overflow-y-auto w-[90%] self-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 md:p-10 sm:rounded-2xl">
                <div className="flex w-full justify-between items-center">
                    <h2 className="text-2xl font-semibold mb-7 text-primary">Explore By Categories</h2>
                    <X onClick={() => closePopup('category')} size={30} className="cursor-pointer" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {
                        categoryImg.map(category => (
                            <CategoryImg key={category.title} title={category.title} image={category.image} link={category.link} onClick={handleSearchByCategory} />
                        ))
                    }
                    <div onClick={() => {navigate('/auctions'); closePopup('category')}} className="group hover:scale-[101%] transition-all duration-200 relative h-44 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 cursor-pointer">
                        <p className="absolute bottom-5 left-5 text-primary">Explore All Auctions</p>
                        <ArrowUp className="absolute group-hover:top-4 group-hover:right-4 transition-all duration-200 top-5 right-5 text-primary rotate-45" strokeWidth={1.5} size={30} />
                    </div>
                </div>

                <h2 className="text-2xl font-semibold my-7 text-primary">Explore By Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {
                        statusImg.map(category => (
                            <CategoryImg key={category.title} title={category.title} image={category.image} link={category.link} onClick={handleSearchByStatus} />
                        ))
                    }
                    <div onClick={() => {navigate('/auctions'); closePopup('category')}} className="group hover:scale-[101%] transition-all duration-200 relative h-44 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 cursor-pointer">
                        <p className="absolute bottom-5 left-5 text-primary">Explore All Auctions</p>
                        <ArrowUp className="absolute group-hover:top-4 group-hover:right-4 transition-all duration-200 top-5 right-5 text-primary rotate-45" strokeWidth={1.5} size={30} />
                    </div>
                </div>
            </section>
        </Container>
    );
}

export default CategoryImagesSection;