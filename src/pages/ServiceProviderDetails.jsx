// src/pages/ServiceProviderDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext'; // Import Auth Context
import { 
  FaMapMarkerAlt, FaPhone, FaWhatsapp, FaStar, 
  FaUserCheck, FaArrowLeft, FaUserCircle
} from 'react-icons/fa';
// ✅ 1. REMOVE Helmet, IMPORT SEO Tools
import useSeoData from '../hooks/useSeoData';
import SeoInjector from '../components/SeoInjector';

const ServiceProviderDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth(); // Get current user
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // ✅ 2. FETCH DYNAMIC SEO DATA
  // This connects the page to your Admin SEO Manager
  const pagePath = `/services/${slug}`;
  const { seo } = useSeoData(pagePath);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/service-providers/${slug}`);
      setProvider(data);
    } catch (err) {
      console.error(err);
      setError('Service Provider not found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
        alert("Please log in to leave a review.");
        navigate('/login');
        return;
    }
    
    setReviewSubmitting(true);
    try {
      await apiClient.post(`/service-providers/${provider._id}/reviews`, 
        { rating, comment },
        { withCredentials: true }
      );
      alert('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchProvider(); // Refresh to show new review
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !provider) return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-2">404 Not Found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <Link to="/services" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Back to Directory
      </Link>
    </div>
  );

  // ✅ 3. MERGE SEO DATA
  // Prioritize Admin SEO settings, fallback to provider details
  const finalSeo = {
    ...seo,
    metaTitle: seo.metaTitle && seo.metaTitle !== 'HouseHunt Kenya' ? seo.metaTitle : `${provider.title} | HouseHunt Services`,
    metaDescription: seo.metaDescription && seo.metaDescription !== 'Find your next home in Kenya.' ? seo.metaDescription : provider.description,
    pagePath: pagePath,
    // Pass specific business schema details if needed by SeoInjector
    schemaDescription: provider.description
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter pb-20">
      {/* ✅ 4. INJECT SEO */}
      <SeoInjector seo={finalSeo} />

      {/* --- Hero Header --- */}
      <div className="relative h-64 md:h-80 bg-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img 
          src={provider.imageUrl || "https://placehold.co/1200x600/1e293b/ffffff?text=Service+Provider"} 
          alt={provider.title} 
          className="w-full h-full object-cover blur-sm scale-110"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
           <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{provider.title}</h1>
           <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
             {provider.serviceType}
           </span>
        </div>
        <Link to="/services" className="absolute top-6 left-6 z-30 bg-white/20 hover:bg-white/30 backdrop-blur text-white p-3 rounded-full transition">
           <FaArrowLeft />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* --- Left Sidebar (Contact Card) --- */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
               <div className="w-32 h-32 mx-auto bg-white rounded-full p-1 shadow-md -mt-20 mb-4 overflow-hidden">
                 <img 
                   src={provider.imageUrl} 
                   alt="Logo" 
                   className="w-full h-full object-cover rounded-full"
                 />
               </div>
               
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{provider.title}</h2>
               <div className="flex justify-center items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                 <FaMapMarkerAlt className="mr-1 text-red-500" /> {provider.location}
               </div>

               <div className="flex justify-center gap-1 mb-6 text-yellow-400">
                 {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.round(provider.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                 ))}
                 <span className="text-gray-400 ml-2 text-sm">({provider.numReviews} Verified Reviews)</span>
               </div>

               <div className="space-y-3">
                 {provider.phoneNumber && (
                   <a href={`tel:${provider.phoneNumber}`} className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/30">
                     <FaPhone /> Call Now
                   </a>
                 )}
                 {provider.whatsappNumber && (
                   <a href={`https://wa.me/${provider.whatsappNumber.replace('+', '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition shadow-lg shadow-green-500/30">
                     <FaWhatsapp size={20} /> WhatsApp
                   </a>
                 )}
               </div>

               {provider.author && provider.author.isAccountClaimed && (
                 <div className="mt-6 pt-4 border-t dark:border-gray-700 flex items-center justify-center gap-2 text-green-600 text-sm font-semibold">
                   <FaUserCheck /> Verified Provider
                 </div>
               )}
            </div>
          </div>

          {/* --- Right Content (Details) --- */}
          <div className="md:col-span-2 space-y-8 mt-4 md:mt-0">
             
             {/* About Section */}
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Us</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {provider.description}
                </p>
                {/* ✅ Content here is now Auto-Linked from Backend */}
                {provider.content && (
                  <div 
                    className="mt-6 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: provider.content }}
                  />
                )}
             </div>

             {/* Service Areas */}
             {provider.serviceAreas && provider.serviceAreas.length > 0 && (
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Areas We Serve</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.serviceAreas.map((area, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
               </div>
             )}

             {/* ✅ REVIEWS SECTION */}
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                   Reviews & Ratings ({provider.numReviews})
                </h3>

                {/* Review List */}
                <div className="space-y-6 mb-10">
                   {provider.reviews && provider.reviews.length > 0 ? (
                      provider.reviews.map((rev, index) => (
                         <div key={index} className="border-b dark:border-gray-700 pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                  <FaUserCircle className="text-gray-400 text-2xl" />
                                  <span className="font-bold text-gray-800 dark:text-white">{rev.name}</span>
                               </div>
                               <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(rev.createdAt).toLocaleDateString()}
                               </span>
                            </div>
                            <div className="flex items-center mb-2 text-yellow-400">
                               {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className={i < rev.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} size={14} />
                               ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{rev.comment}</p>
                         </div>
                      ))
                   ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
                   )}
                </div>

                {/* Write Review Form */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                   <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leave a Review</h4>
                   <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                         <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                               <FaStar 
                                 key={star} 
                                 className={`cursor-pointer text-2xl transition ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
                                 onClick={() => setRating(star)}
                               />
                            ))}
                         </div>
                      </div>
                      
                      <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                         <textarea 
                           rows="3"
                           value={comment}
                           onChange={(e) => setComment(e.target.value)}
                           placeholder="Share your experience with this provider..."
                           className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                           required
                         />
                      </div>

                      <button 
                        type="submit" 
                        disabled={reviewSubmitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                   </form>
                </div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDetails;