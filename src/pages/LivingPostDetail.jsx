// src/pages/LivingPostDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaUserSecret, FaShieldAlt, FaMapMarkerAlt, 
  FaReply, FaPaperPlane, FaSpinner, FaCrown, FaHome 
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async'; // ✅ IMPORT HELMET

const LivingPostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch the post and its replies
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await apiClient.get(`/living-community/posts/${id}`);
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const { data: updatedReplies } = await apiClient.post(`/living-community/posts/${id}/reply`, {
        content: replyContent
      });
      
      // Update local state with new replies
      setPost(prev => ({ ...prev, replies: updatedReplies }));
      setReplyContent('');
    } catch (error) {
      alert("Failed to post reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-500 text-3xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Post not found</h2>
        <Link to="/living-feed" className="text-blue-600 mt-2 hover:underline">Back to Feed</Link>
      </div>
    );
  }

  // Check if the logged-in user is the original author (for highlighting)
  const isCurrentUserAuthor = user && post.user === user._id;

  // ✅ 1. GENERATE SCHEMA FOR SEO
  const discussionSchema = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": `${post.category} in ${post.neighborhood}`,
    "text": post.content,
    "author": {
      "@type": "Person",
      "name": post.authorAlias
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/CommentAction",
      "userInteractionCount": post.replies.length
    },
    "contentLocation": {
      "@type": "Place",
      "name": post.neighborhood
    },
    "datePublished": post.createdAt
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      
      {/* ✅ 2. INJECT SEO META DATA */}
      <Helmet>
        <title>{post.category}: {post.neighborhood} Updates | HouseHunt Kenya</title>
        <meta name="description" content={`Real-time ${post.category} update from residents in ${post.neighborhood}: "${post.content.substring(0, 100)}..."`} />
        <link rel="canonical" href={`https://www.househuntkenya.co.ke/living-feed/${id}`} />
        <script type="application/ld+json">{JSON.stringify(discussionSchema)}</script>
      </Helmet>

      {/* Header / Nav */}
      <div className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link to="/living-feed" className="text-gray-500 hover:text-blue-600 transition flex items-center gap-2 text-sm font-medium">
            <FaArrowLeft /> Back to Feed
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">
        
        {/* --- MAIN POST --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                  {post.authorAlias.includes('Resident') ? <FaShieldAlt /> : <FaUserSecret />}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {post.authorAlias}
                    {post.authorAlias.includes('Resident') && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold">
                        Verified
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    <span>•</span>
                    
                    {/* ✅ 3. pSEO LINK: Neighborhood clicks go to Real Estate Search */}
                    <Link 
                      to={`/search/rent/${post.neighborhood.toLowerCase()}`} 
                      className="flex items-center gap-1 text-blue-600 hover:underline font-bold"
                      title={`See apartments in ${post.neighborhood}`}
                    >
                      <FaMapMarkerAlt size={10} /> {post.neighborhood}
                    </Link>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">
                {post.category}
              </span>
            </div>

            <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* ✅ 4. CTA to Search Properties in this area */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link 
                  to={`/search/rent/${post.neighborhood.toLowerCase()}`}
                  className="flex items-center gap-2 text-sm text-purple-600 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 rounded-lg transition w-max"
                >
                   <FaHome /> View Homes for Rent in {post.neighborhood}
                </Link>
            </div>
          </div>
        </div>

        {/* --- DISCUSSION SECTION --- */}
        <div className="mb-24">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 pl-2">
            Discussion ({post.replies.length})
          </h3>

          <div className="space-y-4">
            {post.replies.map((reply) => {
              const isReplyAuthorOriginalPoster = reply.user === post.user;

              return (
                <div key={reply._id} className={`p-4 rounded-xl border ${isReplyAuthorOriginalPoster ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                        {reply.authorAlias}
                      </span>
                      
                      {/* Badges */}
                      {isReplyAuthorOriginalPoster && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                          <FaCrown size={8} /> Author
                        </span>
                      )}
                      {reply.isPassportHolder && !isReplyAuthorOriginalPoster && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                          <FaShieldAlt size={8} /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {reply.content}
                  </p>
                </div>
              );
            })}

            {post.replies.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm italic">
                No replies yet. Be the first to respond!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- FIXED REPLY BAR --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-20">
        <div className="max-w-3xl mx-auto">
          {user ? (
            <form onSubmit={handleReplySubmit} className="flex gap-3">
              <input 
                type="text" 
                placeholder={isCurrentUserAuthor ? "Update your status or reply..." : "Reply to this update..."}
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={submitting || !replyContent.trim()}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Log in to join the conversation</p>
              <Link to="/login" className="text-blue-600 font-bold text-sm hover:underline">Login Now</Link>
            </div>
          )}
          
          {/* Gamification Hint */}
          {user && (
            <p className="text-[10px] text-center text-gray-400 mt-2">
              <FaShieldAlt className="inline mr-1" />
              Passport Holders earn <strong>+3 XP</strong> per reply. Guests earn <strong>+1 XP</strong>.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default LivingPostDetail;