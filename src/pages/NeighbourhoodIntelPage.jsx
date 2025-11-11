import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import { FaStar, FaBuilding, FaUserTie, FaPencilAlt, FaExclamationTriangle, FaUtensils, FaTools, FaCommentAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

// --- Reusable Helper Functions ---
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return '';
  return s.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- Reusable SEO Component ---
const SeoInjector = ({ seo }) => (
  <Helmet>
    <title>{seo.title}</title>
    <meta name="description" content={seo.description} />
    <meta property="og:title" content={seo.title} />
    <meta property="og:description" content={seo.description} />
  </Helmet>
);

// --- Reusable Post Card for this page ---
const ServicePostCard = ({ post }) => (
  <Link
    to={`/services/${post.slug}`}
    className="block bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl"
  >
    {post.imageUrl && (
      <img 
        src={post.imageUrl} 
        alt={post.title} 
        className="h-48 w-full object-cover" 
      />
    )}
    <div className="p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2.5 py-0.5 rounded-full">
          {post.serviceType}
        </span>
        <div className="flex items-center space-x-1">
          <FaStar className="text-yellow-400" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {post.averageRating?.toFixed(1) || 'New'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({post.numReviews})
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {post.title}
      </h3>
      <div 
        className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }} // Basic strip HTML for preview
      />
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
      </p>
    </div>
  </Link>
);

// --- The "Empty Page" Solution Component ---
const EmptyState = ({ location, topic }) => (
  <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
    <div className="text-6xl mx-auto mb-6 text-blue-500">
      {topic === 'safety' && <FaExclamationTriangle />}
      {topic === 'lifestyle' && <FaUtensils />}
      {topic === 'services' && <FaTools />}
      {topic === 'reviews' && <FaCommentAlt />}
    </div>
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
      No {capitalize(topic)} Posts for {location} ... Yet
    </h2>
    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
      Be the first to share your knowledge! Your insights help build a safer, smarter, and more connected community.
    </p>
    {/* In the future, we can link this to a "Add Post" page for users */}
    <Link
      to="/contact" 
      className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg"
    >
      Share Your Intel
    </Link>
  </div>
);


// --- This is the main pSEO Page Component ---
export default function NeighbourhoodIntelPage() {
  // 1. Read location and topic from the URL
  const { location: locationParam, topic: topicParam } = useParams();
  
  // Clean up params
  const location = capitalize(locationParam) || 'Kenya';
  const topic = topicParam || 'reviews'; // Default to 'reviews'

  // 2. State for posts, SEO, and loading
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seo, setSeo] = useState({
    title: `Loading...`,
    description: `Loading intelligence for ${location}.`,
    h1: `Loading ${location}...`
  });

  // 3. Generate Default SEO based on topic
  const generateDefaultSeo = () => {
    const topicHeadlines = {
      'safety': `Safety, Security & Alerts in ${location}`,
      'lifestyle': `Lifestyle, Restaurants & Cafes in ${location}`,
      'services': `Home Services & Utilities in ${location}`,
      'reviews': `Reviews & Guides for Living in ${location}`
    };
    
    const topicDescriptions = {
      'safety': `Get the latest safety updates, security tips, and community alerts for ${location}. Stay informed with HouseHunt.`,
      'lifestyle': `Discover the best restaurants, cafes, nightlife, and leisure spots in ${location}.`,
      'services': `Find top-rated home services in ${location}, from internet providers and plumbers to laundry and cleaning.`,
      'reviews': `Read honest reviews, pros & cons, and guides for living in ${location}. Find your perfect neighbourhood.`
    };

    const h1 = topicHeadlines[topic] || `${capitalize(topic)} in ${location}`;
    const title = `${h1} | HouseHunt Kenya`;
    const description = topicDescriptions[topic] || `Get the latest intel on ${topic} in ${location} on HouseHunt Kenya.`;
    
    return { title, description, h1 };
  };

  // 4. useEffect to fetch both SEO and Post data
  useEffect(() => {
    // Generate defaults immediately
    const defaultSeo = generateDefaultSeo();
    setSeo(defaultSeo);
    setLoading(true);

    const fetchData = async () => {
      // --- Fetch SEO Overrides ---
      const pagePath = `/neighbourhood/${locationParam}/${topicParam}`;
      try {
        const encodedPath = encodeURIComponent(pagePath);
        const { data } = await apiClient.get(`/seo/${encodedPath}`);
        
        // If manual SEO is found, use it
        setSeo(prev => ({
          ...prev,
          title: data.metaTitle || prev.title,
          description: data.metaDescription || prev.description,
          h1: data.h1Tag || prev.h1
        }));
      } catch (error) {
        console.warn(`No manual SEO for ${pagePath}. Using defaults.`);
      }

      // --- Fetch Post Data ---
      try {
        const { data } = await apiClient.get(`/services/find?location=${locationParam}&topic=${topicParam}`);
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [locationParam, topicParam, location]); // Re-run if the URL changes

  return (
    <>
      <SeoInjector seo={seo} />
      
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Main Content (Column 1) --- */}
          <div className="lg:col-span-2">
            <motion.h1 
              className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {seo.h1}
            </motion.h1>
            
            {loading ? (
              // --- Loading State ---
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border dark:border-gray-700 animate-pulse">
                    <div className="h-40 w-full bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-5 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              // --- Posts Found State ---
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map(post => (
                  <ServicePostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              // --- No Posts Found (Empty Page Solution) ---
              <EmptyState location={location} topic={topic} />
            )}
          </div>
          
          {/* --- Sidebar (Column 2) - THE MOAT --- */}
          <aside className="lg:col-span-1 space-y-8 lg:mt-20">
            {/* --- Cross-link to Property Engine --- */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FaBuilding className="text-3xl text-blue-500 mb-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Properties in {location}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                See what's available for rent or sale in this neighbourhood right now.
              </p>
              <Link 
                to={`/search/rent/${locationParam}`}
                className="block text-center font-semibold bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
              >
                Browse Properties
              </Link>
            </motion.div>
            
            {/* --- Cross-link to Agent Engine --- */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaUserTie className="text-3xl text-blue-500 mb-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Agents in {location}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Find the most active and top-rated real estate agents for {location}.
              </p>
              <Link 
                to={`/agents/${locationParam}`}
                className="block text-center font-semibold bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition"
              >
                Find Top Agents
              </Link>
            </motion.div>
          </aside>
          
        </div>
      </div>
    </>
  );
}