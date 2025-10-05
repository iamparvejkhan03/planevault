import { Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { usePopUp } from "../contexts/PopUpContextProvider";

function SearchFormPopUp({closePopup}) {
    const searchForm = useForm();
    const navigate = useNavigate();

    const handleSearchForm = (searchData) => {
        try {
            const params = new URLSearchParams();

            if (searchData.search) {
                params.append('search', searchData.search);
            }

            if (searchData.category) {
                params.append('category', searchData.category);
            }

            // Navigate to auctions page with query parameters
            navigate(`/auctions?${params.toString()}`);
            closePopup('searchForm');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={`w-full min-h-screen h-full fixed inset-0 bg-black/70 z-40`}>
            <X onClick={() => closePopup('searchForm')} className="absolute top-1/4 right-5 text-white cursor-pointer" />
            <form onSubmit={searchForm.handleSubmit(handleSearchForm)} className="w-[80%] self-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white p-6 rounded-md grid grid-cols-1 sm:grid-cols-7 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-end max-w-2xl mx-auto">

                    {/* Search */}
                    <div className="text-gray-700 col-span-1 sm:col-span-3 lg:col-span-6">
                        <label htmlFor="search" className="block mb-1">Search</label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Enter title here"
                            className="w-full bg-gray-100 text-black py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                            {...searchForm.register('search', { required: true })}
                        />
                    </div>

                    <div className="text-gray-700 col-span-1 sm:col-span-2 lg:col-span-3">
                        <label htmlFor="category" className="block mb-1">Category</label>
                        <select
                            id="category"
                            className="w-full bg-gray-100 text-gray-600 py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                            {...searchForm.register('category')}
                        >
                            <option value="">Select</option>
                            <option value="Aircraft">Aircraft</option>
                            <option value="Engines & Parts">Engines & Parts</option>
                            <option value="Memorabilia">Memorabilia</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2 md:mt-0">
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-3.5 rounded-md bg-primary text-white hover:bg-black/90 transition"
                        >
                            <Search size={20} />
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default SearchFormPopUp;