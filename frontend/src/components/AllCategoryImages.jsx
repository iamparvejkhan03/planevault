import { Link } from "react-router-dom";
import { airCrafts, memorabilia, parts } from "../assets";
import { CategoryImg } from "./";
import { ArrowUp, X } from "lucide-react";

const categoryImg = [
    {
        title: 'Aircrafts',
        image: airCrafts,
        link: '/category/aircraft'
    },
    {
        title: 'Parts & Engines',
        image: parts,
        link: '/category/parts'
    },
    {
        title: 'Memorabilia',
        image: memorabilia,
        link: '/category/memorabilia'
    }
];

function AllCategoryImages() {
    return (
        <section className="bg-white lg:px-10 lg:py-16 w-full relative">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-5">Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {
                    categoryImg.map(category => (
                        <CategoryImg key={category.title} title={category.title} image={category.image} link={category.link} />
                    ))
                }
                <Link to={'/auctions'} className="group hover:scale-[101%] transition-all duration-200 relative h-44 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                    <p className="absolute bottom-5 left-5 text-primary">Explore All Auctions</p>
                    <ArrowUp className="absolute group-hover:top-4 group-hover:right-4 transition-all duration-200 top-5 right-5 text-primary rotate-45" strokeWidth={1.5} size={30} />
                </Link>
            </div>

            <X className="text-primary absolute right-5 top-5" size={30} />
        </section>
    );
}

export default AllCategoryImages;