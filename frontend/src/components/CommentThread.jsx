import React, { useState } from 'react';
import { formatDate } from '../utils/formatters';
import {
  COMPLAINT_BUTTON_LABELS,
  COMPLAINT_FORM_LABELS,
  COMPLAINT_ERROR_MESSAGES,
  COMPLAINT_EMPTY_MESSAGES,
} from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

/**
 * CommentThread Component
 *
 * Displays comment thread and add comment form.
 *
 * @param {Array} comments - Array of comment objects
 * @param {Function} onAddComment - Callback to add new comment
 * @param {Function} onDeleteComment - Callback to delete comment
 * @param {boolean} loading - Loading state
 */
const CommentThread = ({ comments, onAddComment, onDeleteComment, loading }) => {
  const { user, isAdmin } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!newComment.trim()) {
      setError(COMPLAINT_ERROR_MESSAGES.commentEmpty);
      return;
    }

    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.comment?.[0] || COMPLAINT_ERROR_MESSAGES.addComment);
    } finally {
      setSubmitting(false);
    }
  };

  const canDeleteComment = (comment) => {
    // Admin can delete any comment
    if (isAdmin()) return true;
    // User can delete own comments
    return comment.user === user?.id;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        Komentar ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {COMPLAINT_EMPTY_MESSAGES.noComments}
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border-l-4 border-gray-200 pl-4 py-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {comment.user_name}
                    </span>
                    {comment.is_admin && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>

                {/* Delete Button */}
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm"
                  >
                    {COMPLAINT_BUTTON_LABELS.deleteComment}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {COMPLAINT_FORM_LABELS.comment}
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Tulis komentar Anda..."
          rows={3}
          disabled={submitting || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting || loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Mengirim...' : COMPLAINT_BUTTON_LABELS.addComment}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentThread;
