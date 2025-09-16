import { Quote, Star } from "lucide-react";

function Testimonial({ name, review, location }) {
    return (
        <div className="text-left">
            <div className="w-80 h-full flex flex-col items-start border border-gray-500/30 p-5 rounded-lg bg-white">
                <Quote size={40} className="text-secondary" />
                <div className="flex items-center justify-center mt-3 gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-sm mt-3 text-gray-500">{review}</p>
                <div className="flex items-center gap-3 mt-4">
                    <div>
                        <h2 className="text-lg text-gray-900 font-medium">{name}</h2>
                        <p className="text-gray-500">{location}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Testimonial;