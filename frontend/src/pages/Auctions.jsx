import { useState, useEffect, useCallback } from "react";
import { Filter, ChevronDown, Search, SlidersHorizontal, X, Loader, Plane, Cog, Trophy } from "lucide-react";
import { Container } from "../components";
import AuctionCard from "../components/AuctionCard";
import { useAuctions } from "../hooks/useAuctions";
import { useLocation } from "react-router-dom";

// Category-specific filter configurations
const categoryFilters = {
    'Aircraft': {
        basic: [
            { name: 'make', label: 'Make', type: 'text', placeholder: 'e.g., Cessna, Piper' },
            { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g., 172, PA-28' }
        ],
        technical: [
            {
                name: 'yearRange',
                label: 'Year Range',
                type: 'range',
                min: 1900,
                max: 2025,
                fields: ['yearMin', 'yearMax']
            },
            {
                name: 'seatingCapacity',
                label: 'Seating Capacity',
                type: 'range',
                min: 1,
                max: 1000,
                fields: ['seatingCapacityMin', 'seatingCapacityMax']
            },
            {
                name: 'fuelType',
                label: 'Fuel Type',
                type: 'select',
                options: ['Avgas', 'Jet A', 'Diesel', 'Electric']
            },
            {
                name: 'engineType',
                label: 'Engine Type',
                type: 'select',
                options: ['Piston', 'Turboprop', 'Jet', 'Turbofan']
            }
        ]
    },
    'Engines & Parts': {
        basic: [
            { name: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g., Lycoming, Garmin' },
            { name: 'partType', label: 'Part Type', type: 'select', options: ['Engine', 'Propeller', 'Avionics', 'Airframe'] }
        ],
        condition: [
            {
                name: 'condition',
                label: 'Condition',
                type: 'select',
                options: ['New', 'Overhauled', 'Used Serviceable', 'As-Removed']
            }
        ]
    },
    'Memorabilia': {
        basic: [
            { name: 'itemType', label: 'Item Type', type: 'select', options: ['Uniform', 'Document', 'Model', 'Photograph'] },
            { name: 'era', label: 'Historical Era', type: 'select', options: ['WWI', 'WWII', 'Cold War', 'Modern'] }
        ]
    }
};

// FiltersSection component moved outside to prevent focus loss
const FiltersSection = ({
    uiFilters,
    handleFilterChange,
    handleRangeChange,
    applyFilters,
    resetFilters,
    toggleFilterSection,
    activeFilterSections,
    setShowMobileFilters,
    updateFilters
}) => {
    const getCurrentCategoryFilters = () => {
        return categoryFilters[uiFilters.category] || {};
    };

    const renderFilterInput = (filter) => {
        switch (filter.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        name={filter.name}
                        value={uiFilters[filter.name] || ''}
                        onChange={handleFilterChange}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                );

            case 'select':
                return (
                    <select
                        name={filter.name}
                        value={uiFilters[filter.name] || ''}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">Any {filter.label}</option>
                        {filter.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'range':
                return (
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={`Min ${filter.label}`}
                            min={filter.min}
                            max={filter.max}
                            value={uiFilters[filter.fields[0]] || ''}
                            onChange={(e) => handleRangeChange(
                                filter.fields[0],
                                filter.fields[1],
                                e.target.value,
                                uiFilters[filter.fields[1]]
                            )}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder={`Max ${filter.label}`}
                            min={filter.min}
                            max={filter.max}
                            value={uiFilters[filter.fields[1]] || ''}
                            onChange={(e) => handleRangeChange(
                                filter.fields[0],
                                filter.fields[1],
                                uiFilters[filter.fields[0]],
                                e.target.value
                            )}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    const categories = [
        "Aircraft",
        "Engines & Parts",
        "Memorabilia"
    ];

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "approved", label: "Upcoming" },
        { value: "ended", label: "Ended" },
        { value: "sold", label: "Sold" }
    ];

    const currentFilters = getCurrentCategoryFilters();

    return (
        <div className="bg-white px-4 py-6 rounded-lg shadow-md h-fit">
            <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search auctions..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={uiFilters.search}
                            onChange={handleFilterChange}
                            name="search"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                        name="category"
                        value={uiFilters.category}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        name="status"
                        value={uiFilters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        {statusOptions.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            min="0"
                            name="priceMin"
                            value={uiFilters.priceMin}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            min="0"
                            name="priceMax"
                            value={uiFilters.priceMax}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                        type="text"
                        placeholder="City, State or Country"
                        name="location"
                        value={uiFilters.location}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Category-specific Filters */}
                {uiFilters.category && Object.keys(currentFilters).length > 0 && (
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            {uiFilters.category === 'Aircraft' && <Plane size={18} />}
                            {uiFilters.category === 'Engines & Parts' && <Cog size={18} />}
                            {uiFilters.category === 'Memorabilia' && <Trophy size={18} />}
                            {uiFilters.category} Filters
                        </h3>

                        {Object.entries(currentFilters).map(([section, filters]) => (
                            <div key={section} className="mb-4">
                                <button
                                    onClick={() => toggleFilterSection(section)}
                                    className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-2"
                                >
                                    <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                                    <ChevronDown
                                        size={16}
                                        className={`transform transition-transform ${activeFilterSections[section] ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                <div className={`space-y-3 ${activeFilterSections[section] ? 'block' : 'hidden'}`}>
                                    {filters.map(filter => (
                                        <div key={filter.name}>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                {filter.label}
                                            </label>
                                            {renderFilterInput(filter)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter Actions
            <div className="flex flex-col gap-3 mt-8">
                <button
                    onClick={applyFilters}
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                    Apply Filters
                </button>
                <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Reset Filters
                </button>
            </div> */}
            {/* Filter Actions */}
            <div className="flex flex-col gap-3 mt-8">
                <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Reset All Filters
                </button>
            </div>
        </div>
    );
};

const MobileSearch = ({ uiFilters, handleFilterChange, updateFilters }) => (
    <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
            type="text"
            placeholder="Search auctions..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={uiFilters.search}
            onChange={handleFilterChange}
            name="search"
        />
    </div>
);

function Auctions() {
    const {
        auctions,
        loading,
        loadingMore,
        pagination,
        filters: apiFilters,
        loadMoreAuctions,
        updateFilters
    } = useAuctions();

    const [uiFilters, setUiFilters] = useState({
        category: "",
        status: "",
        search: "",
        priceMin: "",
        priceMax: "",
        location: "",
        sortBy: "createdAt",
        sortOrder: "desc"
    });

    const location = useLocation();
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeFilterSections, setActiveFilterSections] = useState({});
    const [debounceTimer, setDebounceTimer] = useState(null);

    useEffect(() => {
        setUiFilters(prev => ({
            ...prev,
            ...apiFilters
        }));
    }, [apiFilters]);

    // const debouncedUpdateFilters = useCallback((newFilters) => {
    //     if (debounceTimer) {
    //         clearTimeout(debounceTimer);
    //     }

    //     const timer = setTimeout(() => {
    //         updateFilters(newFilters);
    //     }, 500); // 500ms debounce

    //     setDebounceTimer(timer);
    // }, [debounceTimer, updateFilters]);

    // const handleFilterChange = (e) => {
    //     const { name, value } = e.target;
    //     const newFilters = {
    //         ...uiFilters,
    //         [name]: value
    //     };

    //     setUiFilters(newFilters);

    //     if (['search', 'location', 'make', 'model', 'manufacturer'].includes(name)) {
    //         debouncedUpdateFilters(newFilters);
    //     } else {
    //         updateFilters(newFilters);
    //     }
    // };

    const debouncedUpdateFilters = useCallback((newFilters) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            updateFilters(newFilters);
        }, 500); // 500ms debounce

        setDebounceTimer(timer);
    }, [debounceTimer, updateFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = {
            ...uiFilters,
            [name]: value
        };

        setUiFilters(newFilters);

        // Auto-apply filters for all fields except search/location (which use debounce)
        if (['search', 'location'].includes(name)) {
            debouncedUpdateFilters(newFilters);
        } else {
            // Auto-apply immediately for other filters
            updateFilters(newFilters);
        }
    };
    // const handleRangeChange = (minName, maxName, minValue, maxValue) => {
    //     const newFilters = {
    //         ...uiFilters,
    //         [minName]: minValue,
    //         [maxName]: maxValue
    //     };

    //     setUiFilters(newFilters);
    //     updateFilters(newFilters);
    // };

    const handleRangeChange = (minName, maxName, minValue, maxValue) => {
        const newFilters = {
            ...uiFilters,
            [minName]: minValue,
            [maxName]: maxValue
        };

        setUiFilters(newFilters);

        // Auto-apply range filters immediately
        updateFilters(newFilters);
    };

    const applyFilters = () => {
        updateFilters(uiFilters);
        setShowMobileFilters(false);
    };

    const resetFilters = () => {
        const resetFilters = {
            category: "",
            status: "",
            search: "",
            priceMin: "",
            priceMax: "",
            location: "",
            sortBy: "createdAt",
            sortOrder: "desc"
        };
        setUiFilters(resetFilters);
        updateFilters(resetFilters);
        setShowMobileFilters(false);
    };

    const handleLoadMore = () => {
        loadMoreAuctions();
    };

    const toggleFilterSection = (section) => {
        setActiveFilterSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const sortOptions = [
        { value: "createdAt-desc", label: "Newest First" },
        { value: "createdAt-asc", label: "Oldest First" },
        { value: "endDate-asc", label: "Ending Soonest" },
        { value: "currentPrice-desc", label: "Price: High to Low" },
        { value: "currentPrice-asc", label: "Price: Low to High" },
        { value: "bidCount-desc", label: "Most Bids" }
    ];

    const handleSortChange = (e) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        const newFilters = {
            ...uiFilters,
            sortBy,
            sortOrder
        };
        setUiFilters(newFilters);
        updateFilters(newFilters);
    };

    return (
        <Container>
            <div className="min-h-screen pt-16 md:pt-32 pb-16 bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-8">
                    <div className="container mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900">All Auctions</h1>
                        <p className="text-gray-600 mt-2">Browse through our selection of premium aircraft, parts, engine, and memorabilias' auctions</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar - Visible on large screens */}
                        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                            <FiltersSection
                                uiFilters={uiFilters}
                                handleFilterChange={handleFilterChange}
                                handleRangeChange={handleRangeChange}
                                applyFilters={applyFilters}
                                resetFilters={resetFilters}
                                toggleFilterSection={toggleFilterSection}
                                activeFilterSections={activeFilterSections}
                                setShowMobileFilters={setShowMobileFilters}
                                updateFilters={updateFilters}
                            />
                        </div>

                        {/* Content Area */}
                        <div className="w-full lg:w-3/4 xl:w-4/5">
                            {/* Mobile Filter Toggle - FIXED: Now using external MobileSearch */}
                            <div className="flex flex-col md:flex-row gap-4 mb-8 lg:hidden">
                                <MobileSearch
                                    uiFilters={uiFilters}
                                    handleFilterChange={handleFilterChange}
                                    updateFilters={updateFilters}
                                />
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 md:w-auto font-medium"
                                >
                                    <SlidersHorizontal size={20} />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {/* Results Count and Sort */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                                <p className="text-gray-600">
                                    {loading ? "Loading auctions..." : `Showing ${auctions.length} of ${pagination?.totalAuctions || 0} auctions`}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 text-sm">Sort by:</span>
                                    <select
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={`${uiFilters.sortBy}-${uiFilters.sortOrder}`}
                                        onChange={handleSortChange}
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Auction Grid */}
                            {loading && auctions.length === 0 ? (
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
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-12">
                                        {auctions.map(auction => (
                                            <AuctionCard
                                                key={auction._id}
                                                auction={auction}
                                            />
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {pagination?.currentPage < pagination?.totalPages && (
                                        <div className="flex justify-center mt-12">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <Loader size={16} className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        Load More Auctions
                                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                                            {pagination.totalAuctions - auctions.length} more
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* End of Auctions Message */}
                                    {pagination?.currentPage >= pagination?.totalPages && auctions.length > 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>You've seen all {pagination.totalAuctions} auctions</p>
                                        </div>
                                    )}
                                </>
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
                            <FiltersSection
                                uiFilters={uiFilters}
                                handleFilterChange={handleFilterChange}
                                handleRangeChange={handleRangeChange}
                                applyFilters={applyFilters}
                                resetFilters={resetFilters}
                                toggleFilterSection={toggleFilterSection}
                                activeFilterSections={activeFilterSections}
                                setShowMobileFilters={setShowMobileFilters}
                                updateFilters={updateFilters}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default Auctions;