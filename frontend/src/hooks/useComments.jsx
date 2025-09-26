import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

export const useComments = (auctionId) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingComment, setAddingComment] = useState(false);
    const [pagination, setPagination] = useState({});
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch comments with pagination
    const fetchComments = async (page = 1, limit = 10, sortBy = 'recent') => {
        if (!auctionId) return;

        const loadingState = page > 1 ? setLoadingMore : setLoading;
        loadingState(true);

        try {
            const { data } = await axiosInstance.get(
                `/api/v1/comments/auction/${auctionId}?page=${page}&limit=${limit}&sortBy=${sortBy}`
            );

            if (data.success) {
                if (page > 1) {
                    setComments(prev => [...prev, ...data.data.comments]);
                } else {
                    setComments(data.data.comments);
                }

                // Calculate hasNextPage based on your pagination structure
                const paginationData = data.data.pagination;
                const hasNextPage = paginationData.currentPage < paginationData.totalPages;

                setPagination({
                    ...paginationData,
                    hasNextPage: hasNextPage
                });
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to load comments');
        } finally {
            loadingState(false);
        }
    };

    // Load more comments
    const loadMoreComments = async (page, sortBy) => {
        await fetchComments(page, 10, sortBy);
    };

    // Update comment
    const updateComment = async (commentId, content, contentHtml) => {
        try {
            const { data } = await axiosInstance.put(
                `/api/v1/comments/${commentId}`,
                { content, contentHtml }
            );

            if (data.success) {
                setComments(prev => prev.map(comment =>
                    comment._id === commentId ? data.data.comment : comment
                ));
                toast.success('Comment updated successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update comment');
            console.error('Update comment error:', error);
        }
        return false;
    };

    // Flag comment
    const flagComment = async (commentId, reason = 'Inappropriate content') => {
        try {
            const { data } = await axiosInstance.post(
                `/api/v1/comments/${commentId}/flag`,
                { reason }
            );

            if (data.success) {
                toast.success('Comment reported for moderation');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to report comment');
            console.error('Flag comment error:', error);
        }
        return false;
    };

    // Add new comment
    const addComment = async (content, contentHtml) => {
        if (!auctionId || !content.trim()) return;

        setAddingComment(true);
        try {
            const { data } = await axiosInstance.post(
                `/api/v1/comments/auction/${auctionId}`,
                { content, contentHtml }
            );

            if (data.success) {
                setComments(prev => [data.data.comment, ...prev]);
                toast.success('Comment added successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add comment');
            console.error('Add comment error:', error);
        } finally {
            setAddingComment(false);
        }
        return false;
    };

    // Toggle like
    const toggleLike = async (commentId) => {
        try {
            const { data } = await axiosInstance.post(`/api/v1/comments/${commentId}/like`);

            if (data.success) {
                setComments(prev => prev.map(comment =>
                    comment._id === commentId
                        ? {
                            ...comment,
                            likes: data.data.isLiked
                                ? [...comment.likes, { user: 'current-user' }]
                                : comment.likes.filter(like => like.user !== 'current-user'),
                            likeCount: data.data.likeCount
                        }
                        : comment
                ));
                return data.data.isLiked;
            }
        } catch (error) {
            toast.error('Failed to update like');
            console.error('Toggle like error:', error);
        }
    };

    // Delete comment
    const deleteComment = async (commentId) => {
        try {
            const { data } = await axiosInstance.delete(`/api/v1/comments/${commentId}`);

            if (data.success) {
                setComments(prev => prev.filter(comment => comment._id !== commentId));
                toast.success('Comment deleted successfully');
                return true;
            }
        } catch (error) {
            toast.error('Failed to delete comment');
            console.error('Delete comment error:', error);
        }
        return false;
    };

    // Initial fetch
    useEffect(() => {
        fetchComments(1, 10, 'recent');
    }, [auctionId]);

    return {
        comments,
        loading,
        loadingMore,
        addingComment,
        pagination,
        addComment,
        updateComment,
        deleteComment,
        toggleLike,
        flagComment,
        loadMoreComments,
        fetchComments
    };
};