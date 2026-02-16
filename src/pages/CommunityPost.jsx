// src/pages/CommunityPost.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaUser, FaCalendarAlt, FaArrowLeft, FaThumbsUp, FaReply, FaSpinner, FaQuestionCircle, FaCommentDots, FaBolt } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

// ✅ IMPORT THE NEW CARD COMPONENT
import CommunityPostCard from '../components/Community/CommunityPostCard';
import DOMPurify from 'dompurify';

const CommunityPost = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');

  // Interaction State
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [votingMap, setVotingMap] = useState({});

  // ✅ NEW STATE: Related Live Updates
  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    const fetchPostAndUpdates = async () => {
      try {
        // 1. Fetch Main Post (Insight/Question)
        const { data: postData } = await apiClient.get(`/community/post/${slug}`);
        setPost(postData);

        // 2. Fetch Related Live Updates (Based on Location)
        // We assume postData.location exists (e.g., "Kilimani")
        if (postData.location) {
          try {
            const { data: updatesData } = await apiClient.get(`/living-community/posts?neighborhood=${postData.location}`);
            setLiveUpdates(updatesData);
          } catch (err) {
            console.error("Failed to load live updates:", err);
          }
        }

      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError('Post not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndUpdates();
  }, [slug]);

  const handleVote = async (replyId = null) => {
    const key = replyId || 'main';
    if (votingMap[key]) return;

    try {
      setVotingMap(prev => ({ ...prev, [key]: true }));
      if (replyId) {
        setPost(prev => ({
          ...prev,
          replies: prev.replies.map(r => r._id === replyId ? { ...r, likes: (r.likes || 0) + 1 } : r)
        }));
      } else {
        setPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      }

      await apiClient.put(`/community/${post._id}/vote`, { replyId });
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const payload = {
        content: replyContent,
        authorName: user ? user.name : (replyAuthorName || 'Local Resident'),
        avatar: user ? user.profilePicture : null
      };

      const { data: updatedReplies } = await apiClient.post(`/community/${post._id}/reply`, payload);

      setPost(prev => ({ ...prev, replies: updatedReplies }));
      setReplyContent('');
      setReplyAuthorName('');
    } catch {
      alert("Failed to post reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Post Not Found</h2>
        <Link to="/" className="text-blue-600 hover:underline">Go Home</Link>
      </div>
    );
  }

  const isQuestion = post.type === 'question';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">

      <Helmet>
        <title>{post.metaTitle || post.title} | HouseHunt Kenya Community</title>
        <meta name="description" content={post.metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://househuntkenya.com/community/${post.slug}`} />
      </Helmet>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- MAIN COLUMN: Article & Discussion --- */}
        <div className="lg:col-span-2">
          <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 mb-8">

            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-gray-700 relative">
              {isQuestion && (
                <div className="absolute top-0 right-0 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-4 py-1 rounded-bl-lg text-sm font-bold flex items-center">
                  <FaQuestionCircle className="mr-2" /> Question
                </div>
              )}

              <Link
                to={`/search/rent/${post.location}`}
                className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 mb-4 hover:underline"
              >
                <FaArrowLeft className="mr-2" /> Browse properties in {post.location}
              </Link>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4 md:gap-6">
                <span className="flex items-center">
                  <FaUser className="mr-2 text-gray-400" /> {post.authorName}
                </span>
                <span className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" /> {post.location}
                </span>
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-400" /> {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                </span>
                <button
                  onClick={() => handleVote(null)}
                  className={`flex items-center gap-1 transition ${votingMap['main'] ? 'text-blue-600' : 'hover:text-blue-600'}`}
                >
                  <FaThumbsUp /> {post.likes || 0} Helpful
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-10">
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.processedContent) }}
              />
            </div>

            {/* Discussion Section */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FaCommentDots className="mr-2 text-gray-500" />
                {isQuestion ? 'Community Answers' : 'Discussion'}
                <span className="ml-2 text-sm bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
                  {post.replies?.length || 0}
                </span>
              </h3>

              <div className="space-y-6 mb-10">
                {post.replies && post.replies.length > 0 ? (
                  post.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        {reply.avatar ? (
                          <img src={reply.avatar} alt={reply.authorName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold">
                            {reply.authorName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {reply.authorName}
                            {reply.isVerifiedResident && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1 rounded">Verified Resident</span>}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button
                            onClick={() => handleVote(reply._id)}
                            className={`flex items-center gap-1 hover:text-blue-600 transition ${votingMap[reply._id] ? 'text-blue-600 font-bold' : ''}`}
                          >
                            <FaThumbsUp /> {reply.likes || 0} Helpful
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                    No replies yet. Be the first to answer!
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmitReply} className="mt-6">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {isQuestion ? 'Know the answer? Help out:' : 'Join the discussion:'}
                </h4>
                {!user && (
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={replyAuthorName}
                    onChange={(e) => setReplyAuthorName(e.target.value)}
                    className="w-full mb-3 px-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-purple-500"
                  />
                )}
                <textarea
                  rows="3"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply here..."
                  className="w-full px-4 py-3 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-purple-500 focus:border-purple-500 mb-3"
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition flex items-center disabled:opacity-50"
                >
                  {submittingReply ? <FaSpinner className="animate-spin mr-2" /> : <FaReply className="mr-2" />}
                  Post Reply
                </button>
              </form>
            </div>
          </article>
        </div>

        {/* --- SIDEBAR: Related Live Updates (NEW) --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">

            {/* CTA Box */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {isQuestion ? 'Have a question about another area?' : 'Inspired? Share your own story.'}
              </h3>
              <Link
                to="/share-insight"
                state={{ type: isQuestion ? 'question' : 'insight' }}
                className="inline-block bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 font-bold py-3 px-6 rounded-lg transition w-full"
              >
                {isQuestion ? 'Ask a New Question' : 'Write a Review'}
              </Link>
            </div>

            {/* ✅ THE LIVE FEED SECTION */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <FaBolt className="text-yellow-500" /> Happening in {post.location}
              </h3>

              {liveUpdates.length > 0 ? (
                <div className="space-y-4">
                  {liveUpdates.map(update => (
                    // Using the Card component for consistent styling
                    <CommunityPostCard key={update._id} post={update} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  <p>No recent live updates for {post.location}.</p>
                  <Link to="/profile" className="text-blue-600 hover:underline mt-1 block">
                    Be the first to post!
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CommunityPost;