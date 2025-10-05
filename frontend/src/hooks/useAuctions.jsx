import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useLocation } from "react-router-dom";

export const useAuctions = () => {
    const location = useLocation();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        status: 'active',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    // Fetch auctions with pagination and filters
    const fetchAuctions = async (page = 1, limit = 12, currentFilters = {}) => {
        const loadingState = page > 1 ? setLoadingMore : setLoading;
        loadingState(true);

        try {
            // Clean up filters - remove empty values
            const cleanFilters = Object.fromEntries(
                Object.entries(currentFilters).filter(([_, value]) => 
                    value !== '' && value !== null && value !== undefined
                )
            );

            // Build query string with all filters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...cleanFilters
            }).toString();

            const { data } = await axiosInstance.get(`/api/v1/auctions?${queryParams}`);

            if (data.success) {
                if (page > 1) {
                    // Append new auctions for pagination
                    setAuctions(prev => [...prev, ...data.data.auctions]);
                } else {
                    // Replace auctions for first load or filter change
                    setAuctions(data.data.auctions);
                }
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching auctions:', error);
            toast.error('Failed to load auctions');
        } finally {
            loadingState(false);
        }
    };

    // Load more auctions
    const loadMoreAuctions = async () => {
        if (pagination?.currentPage < pagination?.totalPages) {
            const nextPage = pagination.currentPage + 1;
            await fetchAuctions(nextPage, 12, filters);
        }
    };

    // Update filters and refresh auctions
    const updateFilters = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        fetchAuctions(1, 12, updatedFilters);
    };

    // FIXED: Handle URL parameters on initial load
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        
        // Extract URL parameters
        const urlFilters = {
            category: searchParams.get('category') || '',
            status: searchParams.get('status') || '',
            search: searchParams.get('search') || '', // Map 'search' param to 'search'
            priceMin: searchParams.get('priceMin') || '',
            priceMax: searchParams.get('priceMax') || '',
            location: searchParams.get('location') || '',
        };

        // Clean empty values
        const cleanUrlFilters = Object.fromEntries(
            Object.entries(urlFilters).filter(([_, value]) => value !== '')
        );

        if (Object.keys(cleanUrlFilters).length > 0) {
            // If we have URL parameters, use them for initial fetch
            const initialFilters = {
                ...filters,
                ...cleanUrlFilters
            };
            setFilters(initialFilters);
            fetchAuctions(1, 12, initialFilters);
        } else {
            // If no URL parameters, fetch with default filters
            fetchAuctions(1, 12, filters);
        }
    }, [location.search]); // Run when URL changes

    return {
        auctions,
        loading,
        loadingMore,
        pagination,
        filters,
        fetchAuctions,
        loadMoreAuctions,
        updateFilters
    };
};