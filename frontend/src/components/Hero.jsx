import { Clock, Plane, Search, Shield } from "lucide-react";
import { Container } from "../components";
import { useForm } from "react-hook-form";

function Hero() {
    const searchForm = useForm({
        defaultValues: {
        }
    });

    const handleSearchForm = (searchData) => {
        try {
            console.log(searchData);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <section className={`bg-[url('src/assets/heroImg.webp')] min-h-screen max-w-screen py-24 flex items-center bg-center bg-no-repeat bg-cover relative`}>
            <Container>
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-black/50" />

                <div className="xl:w-4/5 w-full px-2 flex flex-col items-start justify-between gap-3 relative mt-10 lg:mt-16">
                    <p className={`inline-flex items-center gap-1 bg-white text-primary px-4 py-2 rounded-full text-sm font-medium`}>
                        <Plane size={24} strokeWidth={1.5} />

                        Trusted Auctions, Anytime
                    </p>
                    <h1 className="text-5xl lg:text-6xl font-bold text-white !leading-tight tracking-tight">
                        Exclusive <span className="text-white text-shadow-sm">Aircraft Auctions</span>
                    </h1>
                    <p className="text-lg text-white leading-relaxed">Bid confidently on verified aircraft and rare aviation collectibles, with real-time auction updates to ensure every bidding experience is seamless, transparent, and trusted.</p>

                    <form onSubmit={searchForm.handleSubmit(handleSearchForm)} className="my-5 w-full">
                        <div className="bg-white p-6 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-11 gap-3 sm:gap-4 lg:gap-5 items-end w-full">

                            {/* Search */}
                            <div className="text-gray-700 col-span-1 sm:col-span-1 lg:col-span-4">
                                <label htmlFor="search" className="block mb-1">Search</label>
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Enter title here"
                                    className="w-full bg-gray-100 text-black py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                                    {...searchForm.register('search', { required: true })}
                                />
                            </div>

                            {/* Make */}
                            <div className="text-gray-700 col-span-1 sm:col-span-1 lg:col-span-2">
                                <label htmlFor="make" className="block mb-1">Make</label>
                                <select
                                    id="make"
                                    className="w-full bg-gray-100 text-gray-600 py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                                    {...searchForm.register('make')}
                                >
                                    <option value="">Select</option>
                                    <option value="airplane">Airplane</option>
                                    <option value="turbo engine">Turbo Engine</option>
                                </select>
                            </div>

                            {/* Model */}
                            <div className="text-gray-700 col-span-1 sm:col-span-1 lg:col-span-2">
                                <label htmlFor="model" className="block mb-1">Model</label>
                                <select
                                    id="model"
                                    className="w-full bg-gray-100 text-gray-600 py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                                    {...searchForm.register('model')}
                                >
                                    <option value="">Select</option>
                                    <option value="123">123</option>
                                    <option value="456">456</option>
                                </select>
                            </div>

                            {/* Year */}
                            <div className="text-gray-700 col-span-1 sm:col-span-1 lg:col-span-2">
                                <label htmlFor="year" className="block mb-1">Year</label>
                                <select
                                    id="year"
                                    className="w-full bg-gray-100 text-gray-600 py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                                    {...searchForm.register('year')}
                                >
                                    <option value="">Select</option>
                                    <option value="2010">2010</option>
                                    <option value="2018">2018</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center py-2.5 px-3.5 rounded-md bg-primary text-white hover:bg-black/90 transition"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="flex gap-5 sm:gap-10 flex-wrap text-white">
                        <div className="flex items-center gap-1">
                            <Clock />
                            <h4 className="text-white">
                                Real-Time Auction Updates
                            </h4>
                        </div>

                        <div className="flex items-center gap-1">
                            <Plane />
                            <h4 className="text-white">
                                Exclusive Collections
                            </h4>
                        </div>

                        <div className="flex items-center gap-1">
                            <Shield />
                            <h4 className="text-white">
                                Verified & Trusted Listings
                            </h4>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default Hero;