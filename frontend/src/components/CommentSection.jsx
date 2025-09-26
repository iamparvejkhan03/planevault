import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, Flag, MessageCircle, Edit3, Trash2, Send, MoreVertical, Loader } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';

const CommentSection = ({ auctionId }) => {
    const { user } = useAuth();
    const {
        comments,
        loading,
        addingComment,
        loadingMore,
        pagination,
        addComment,
        toggleLike,
        deleteComment,
        updateComment,
        flagComment,
        loadMoreComments
    } = useComments(auctionId);

    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const editableRef = useRef(null);

    // Formatting functions for rich text
    const handleFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editableRef.current.focus();
    };

    // Handle new comment submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !editableRef.current) return;

        const htmlContent = editableRef.current.innerHTML;
        const plainTextContent = editableRef.current.innerText;

        const success = await addComment(plainTextContent, htmlContent);
        if (success) {
            editableRef.current.innerHTML = '';
            setNewComment('');
        }
    };

    // Handle comment edit
    const handleEdit = (comment) => {
        setEditingCommentId(comment._id);
        setEditContent(comment.content);
    };

    const handleSaveEdit = async (commentId) => {
        const success = await updateComment(commentId, editContent, editContent);
        if (success) {
            setEditingCommentId(null);
            setEditContent('');
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
    };

    // Handle report comment
    const handleReport = async (commentId) => {
        if (window.confirm('Report this comment for moderation?')) {
            await flagComment(commentId);
        }
    };

    const handleLoadMore = () => {
        if (pagination?.currentPage < pagination?.totalPages) {
            // Calculate the next page (current page + 1)
            const nextPage = pagination.currentPage + 1;
            loadMoreComments(nextPage, sortBy);
        }
    };

    // Replace your current useEffect with this better implementation
    useEffect(() => {
        const handleInput = () => {
            if (editableRef.current) {
                const plainText = editableRef.current.innerText;
                const htmlContent = editableRef.current.innerHTML;
                setNewComment(plainText);
            }
        };

        const handlePaste = (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        };

        const editable = editableRef.current;
        if (editable) {
            editable.addEventListener('input', handleInput);
            editable.addEventListener('paste', handlePaste);

            return () => {
                editable.removeEventListener('input', handleInput);
                editable.removeEventListener('paste', handlePaste);
            };
        }
    }, []);

    // Update comments when sortBy changes
    useEffect(() => {
        // This will be handled by the useComments hook when sortBy changes
        // The hook should refetch comments with the new sort order
    }, [sortBy]);

    // Format timestamp
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - commentTime) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return commentTime.toLocaleDateString();
    };

    // Check if user can edit/delete comment (within 15 minutes)
    const canModifyComment = (comment) => {
        if (!user) return false;
        if (comment.user._id !== user._id) return false;

        const commentTime = new Date(comment.createdAt);
        const now = new Date();
        const fifteenMinutes = 15 * 60 * 1000;

        return (now - commentTime) < fifteenMinutes;
    };

    // Sort comments locally as fallback (in case backend sorting fails)
    const getSortedComments = () => {
        const commentsCopy = [...comments];

        switch (sortBy) {
            case 'recent':
                return commentsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return commentsCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'popular':
                return commentsCopy.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
            default:
                return commentsCopy;
        }
    };

    const sortedComments = getSortedComments();

    if (loading && comments.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg border border-gray-200">
            {/* Comment Input */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex space-x-2 mb-2">
                        <button type="button" onClick={() => handleFormat('bold')} className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors">
                            <span className="font-bold text-sm">B</span>
                        </button>
                        <button type="button" onClick={() => handleFormat('italic')} className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors">
                            <span className="italic text-sm">I</span>
                        </button>
                        <button type="button" onClick={() => handleFormat('underline')} className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors">
                            <span className="underline text-sm">U</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex-1 relative">
                            <div
                                ref={editableRef}
                                className="min-w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-h-[100px] max-h-40 overflow-y-auto"
                                contentEditable="true"
                                placeholder="Add your comment..."
                                onInput={() => {
                                    const text = editableRef.current?.innerText || '';
                                    setNewComment(text);
                                }}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData('text/plain');
                                    document.execCommand('insertText', false, text);
                                }}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}
                            />
                            {!newComment && (
                                <div className="absolute top-3 left-4 text-gray-400 pointer-events-none">
                                    Add your comment...
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!newComment.trim() || addingComment}
                            className="self-start px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {addingComment ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Post Comment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">Please log in to leave a comment</p>
                </div>
            )}

            {/* Comments Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                    <MessageCircle size={20} />
                    <span>Comments</span>
                    <span className="text-gray-500 font-normal">
                        ({pagination?.totalComments || comments.length})
                    </span>
                </h3>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="recent">Most recent</option>
                        <option value="oldest">Oldest first</option>
                        <option value="popular">Most popular</option>
                    </select>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {sortedComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No comments yet</p>
                        <p className="text-sm">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <>
                        {sortedComments.map((comment) => (
                            <div key={comment._id} className="flex gap-2 sm:gap-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                {/* User Avatar */}
                                <img
                                    src={comment.user.avatar || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`}
                                    alt={comment.userName}
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                />

                                {/* Comment Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm text-gray-500">
                                                @{comment.userName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                • {formatTimeAgo(comment.createdAt)}
                                            </span>
                                        </div>

                                        {/* Comment Actions Menu */}
                                        <div className="relative group">
                                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                                <MoreVertical size={16} />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                {canModifyComment(comment) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(comment)}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                        >
                                                            <Edit3 size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteComment(comment._id)}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleReport(comment._id)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                                    <Flag size={14} />
                                                    Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comment Text */}
                                    {editingCommentId === comment._id ? (
                                        <div className="mb-3">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                rows="3"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleSaveEdit(comment._id)}
                                                    className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="text-gray-700 mb-3 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: comment.contentHtml || comment.content }}
                                        />
                                    )}

                                    {/* Comment Actions */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <button
                                            onClick={() => toggleLike(comment._id)}
                                            className={`flex items-center gap-1 transition-colors ${comment.likes.some(like => like.user === user?._id)
                                                ? 'text-primary'
                                                : 'hover:text-primary'
                                                }`}
                                        >
                                            <ThumbsUp size={16} />
                                            <span>{comment?.likeCount || comment?.likes.length}</span>
                                        </button>

                                        <button onClick={() => handleReport(comment._id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                                            <Flag size={14} />
                                            Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Load More Button */}
                        {(pagination?.currentPage < pagination?.totalPages) && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader size={16} className="animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Load More Comments
                                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                                {pagination.totalComments - comments.length} more
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* End of Comments Message */}
                        {(pagination?.currentPage >= pagination?.totalPages) && comments.length > 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                You've reached the end of comments
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentSection;