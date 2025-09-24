import { useState, useRef } from 'react';
import { ThumbsUp, Flag } from 'lucide-react';

const initialComments = [
    {
        id: 1,
        userName: 'Noah Pierre',
        timeAgo: '58 minutes ago',
        text: "I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?", // Plain text fallback
        likes: 25,
        isLiked: false,
        replies: []
    },
    {
        id: 2,
        userName: 'Skill Sprout',
        timeAgo: '8 minutes ago',
        text: "Condensation happens when water vapor cools down and changes back into liquid droplets. It's the step before precipitation. The example with the glass of ice water in the video was a great visual!",
        likes: 2,
        isLiked: true,
        replies: []
    },
    {
        id: 3,
        userName: 'Mollie Hall',
        timeAgo: '5 hours ago',
        text: "I really enjoyed today's lesson on the water cycle! The animations made the processes so much easier to grasp.",
        likes: 0,
        isLiked: false,
        replies: []
    }
];

const CommentSection = () => {
    const [comments, setComments] = useState(initialComments);
    const editableRef = useRef(null);

    const handleFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editableRef.current.focus();
    };

    const handleLike = (commentId) => {
        setComments(comments.map(comment =>
            comment.id === commentId
                ? {
                    ...comment,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                    isLiked: !comment.isLiked
                }
                : comment
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!editableRef.current) return;

        const htmlContent = editableRef.current.innerHTML;
        const plainTextContent = editableRef.current.innerText;

        if (!plainTextContent.trim()) return;

        const newCommentObj = {
            id: comments.length + 1,
            userName: 'Current User',
            timeAgo: 'Just now',
            text: plainTextContent,
            html: htmlContent,
            likes: 0,
            isLiked: false,
            replies: []
        };

        setComments([newCommentObj, ...comments]);
        editableRef.current.innerHTML = '';
    };

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg border border-gray-200">
            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex space-x-2 mb-2">
                    <button
                        type="button"
                        onClick={() => handleFormat('bold')}
                        className="p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded"
                    >
                        <span className="font-bold">B</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFormat('italic')}
                        className="p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded"
                    >
                        <span className="italic">I</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFormat('underline')}
                        className="p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded"
                    >
                        <span className="underline">U</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFormat('insertText', '@')}
                        className="p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded"
                    >
                        @
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    {/* Uncontrolled contentEditable div - No React state binding */}
                    <div
                        ref={editableRef}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-h-[42px] max-h-40 overflow-y-auto"
                        contentEditable="true"
                        placeholder="Add comment..."
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Submit
                    </button>
                </div>
            </form>

            {/* Comments Header */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-x-5">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <span>Comments</span>
                    <span>({comments.length})</span>
                </h3>
                <div className="flex items-center text-sm text-secondary">
                    <select className="sm:ml-2 bg-transparent border-none text-secondary focus:outline-none focus:ring-0">
                        <option>Most recent</option>
                        <option>Oldest first</option>
                        <option>Most liked</option>
                    </select>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-7">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <img
                                src={`https://i.pravatar.cc/150?img=${comment.id}`}
                                alt={comment.userName}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex flex-col sm:flex-row w-full justify-between items-start mb-1">
                                    <span className="font-medium text-primary">{comment.userName}</span>
                                    <span className="text-sm text-secondary">{comment.timeAgo}</span>
                                </div>
                        </div>
                        <div className="flex-1">
                            <div className="bg-gray-50 px-1 rounded-lg">
                                
                                {/* Check for and use HTML, fallback to plain text */}
                                <p
                                    className="text-gray-700 mb-2"
                                    dangerouslySetInnerHTML={{ __html: comment.html || comment.text }}
                                />
                                <div className="flex items-center space-x-4 text-sm text-secondary">
                                    <button
                                        onClick={() => handleLike(comment.id)}
                                        className={`flex items-center space-x-1 ${comment.isLiked ? 'text-primary' : 'hover:text-primary'}`}
                                    >
                                        <ThumbsUp size={14} fill={`${comment.isLiked ? '#000' : '#fff'}`} />
                                        <span>{comment.likes}</span>
                                    </button>
                                    <button className="hover:text-primary">
                                        <Flag size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;