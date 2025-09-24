import { useState, useEffect, lazy, Suspense } from "react";
import { Filter, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Container } from "../components";

// For lazy loading if needed
const AuctionCard = lazy(() => import("../components/AuctionCard"));

function Auctions() {
    // State for filters
    const [filters, setFilters] = useState({
        aircraftType: "",
        make: "",
        yearMin: "",
        yearMax: "",
        priceMin: "",
        priceMax: "",
        location: "",
        hoursMin: "",
        hoursMax: "",
        searchQuery: ""
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [auctions, setAuctions] = useState([]);

    // Mock data - replace with your actual data source
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockAuctions = [
                { id: 1, title: "2005 Diamond DA42 NG", bids: 12, currentBid: 1000, endDate: "2025-10-19T23:59:59" },
                { id: 2, title: "2010 Cessna 172S", bids: 8, currentBid: 850, endDate: "2025-11-15T23:59:59" },
                { id: 3, title: "1999 Piper PA-28-181", bids: 15, currentBid: 1200, endDate: "2025-09-30T23:59:59" },
                { id: 4, title: "2015 Beechcraft G36", bids: 22, currentBid: 2500, endDate: "2025-12-05T23:59:59" },
                { id: 5, title: "2008 Cirrus SR22", bids: 18, currentBid: 1800, endDate: "2025-10-28T23:59:59" },
                { id: 6, title: "1975 Cessna 150", bids: 6, currentBid: 500, endDate: "2025-09-15T23:59:59" },
                { id: 7, title: "2012 Piper M350", bids: 14, currentBid: 2200, endDate: "2025-11-20T23:59:59" },
                { id: 8, title: "2003 Cessna 182T", bids: 9, currentBid: 1100, endDate: "2025-10-10T23:59:59" },
            ];
            setAuctions(mockAuctions);
            setLoading(false);
        }, 1000);
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        setLoading(true);
        // Close mobile filters after applying
        setShowMobileFilters(false);
        // In a real app, this would call an API with the filter parameters
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const resetFilters = () => {
        setFilters({
            aircraftType: "",
            make: "",
            yearMin: "",
            yearMax: "",
            priceMin: "",
            priceMax: "",
            location: "",
            hoursMin: "",
            hoursMax: "",
            searchQuery: ""
        });
    };

    // Aircraft types for filter dropdown
    const aircraftTypes = [
        "Single Engine",
        "Twin Engine",
        "Turbine",
        "Experimental",
        "Warbird",
        "Helicopter",
        "Light Sport",
        "Amphibian"
    ];

    // Aircraft manufacturers
    const aircraftMakes = [
        "Cessna",
        "Piper",
        "Beechcraft",
        "Diamond",
        "Cirrus",
        "Mooney",
        "Airbus",
        "Boeing",
        "Embraer",
        "Bell"
    ];

    // Filter section component
    const FiltersSection = () => (
        <div className="bg-white px-4 py-6 rounded-lg shadow-md h-fit">
            <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Search Query Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search auctions..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange(e)}
                            name="searchQuery"
                        />
                    </div>
                </div>

                {/* Aircraft Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aircraft Type</label>
                    <div className="relative">
                        <select
                            name="aircraftType"
                            value={filters.aircraftType}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                        >
                            <option value="">All Types</option>
                            {aircraftTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Make Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                    <div className="relative">
                        <select
                            name="make"
                            value={filters.make}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                        >
                            <option value="">All Makes</option>
                            {aircraftMakes.map(make => (
                                <option key={make} value={make}>{make}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Year Range Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year Range</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            min="1900"
                            max="2025"
                            name="yearMin"
                            value={filters.yearMin}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            min="1900"
                            max="2025"
                            name="yearMax"
                            value={filters.yearMax}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Price Range Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            min="0"
                            name="priceMin"
                            value={filters.priceMin}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            min="0"
                            name="priceMax"
                            value={filters.priceMax}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Location Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                        type="text"
                        placeholder="City, State or Country"
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Hours Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Hours</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            min="0"
                            name="hoursMin"
                            value={filters.hoursMin}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            min="0"
                            name="hoursMax"
                            value={filters.hoursMax}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col gap-3 mt-8">
                <button
                    onClick={applyFilters}
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Apply Filters
                </button>
                <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );

    return (
        <Container>
            <div className="min-h-screen pt-32 pb-16 bg-gray-50">
                {/* Header */}
                <div className="">
                    <div className="container mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900">All Auctions</h1>
                        <p className="text-gray-600 mt-2">Browse through our selection of aircraft auctions</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar - Visible on large screens */}
                        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                            <FiltersSection />
                        </div>

                        {/* Content Area */}
                        <div className="w-full lg:w-3/4 xl:w-4/5">
                            {/* Mobile Filter Toggle */}
                            <div className="flex flex-col md:flex-row gap-4 mb-8 lg:hidden">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search auctions..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={filters.searchQuery}
                                        onChange={(e) => handleFilterChange(e)}
                                        name="searchQuery"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 md:w-auto"
                                >
                                    <SlidersHorizontal size={20} />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {/* Results Count and Sort */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                                <p className="text-gray-600">
                                    {loading ? "Loading auctions..." : `Showing ${auctions.length} auctions`}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 text-sm">Sort by:</span>
                                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <option>Ending Soonest</option>
                                        <option>Newly Listed</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Auction Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-12">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="border border-gray-200 p-4 bg-white rounded-xl shadow-sm h-96 animate-pulse">
                                            <div className="bg-gray-200 h-56 rounded-tr-3xl rounded-bl-3xl"></div>
                                            <div className="my-3 h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="my-2 h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="my-2 h-3 bg-gray-200 rounded w-2/3"></div>
                                            <div className="flex gap-3 items-center mt-4">
                                                <div className="h-10 bg-gray-200 rounded-lg flex-grow"></div>
                                                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : auctions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-12">
                                    <Suspense fallback={<div>Loading auction cards...</div>}>
                                        {auctions.map(auction => (
                                            <AuctionCard key={auction.id} {...auction} />
                                        ))}
                                    </Suspense>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">No auctions found</h3>
                                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
                        <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto p-6">
                            <FiltersSection />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default Auctions;