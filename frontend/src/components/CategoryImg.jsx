import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

function CategoryImg({title, image, onClick}){
    return (
        <div onClick={() => onClick(title)} className="cursor-pointer group hover:scale-[101%] transition-all duration-200 relative h-44 xl:h-48 rounded-xl overflow-hidden">
            <img src={image} loading="lazy" alt={title} className="w-full h-full object-cover brightness-75" />
            <p className="absolute bottom-5 left-5 text-white capitalize">{title === 'ending_soon' ? 'Ending Soon' : title === 'approved' ? 'Upcoming' : title}</p>
            <ArrowUp className="absolute group-hover:top-4 group-hover:right-4 transition-all duration-200 top-5 right-5 text-white rotate-45" strokeWidth={1.5} size={30} />
        </div>
    );
}

export default CategoryImg;