import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you use react-router-dom for routing
// import axios from 'axios'; // Removed
import apiClient from '../api/axios'; // ✅ Use centralized client
import { Home, Search, DollarSign, Clock, MapPin, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Configuration (Assuming apiClient is correctly configured to use /api)
// const apiClient = axios.create({ ... }); // REMOVED

const WantedRequestPage = () => {
  const { slug } = useParams(); // Get the slug from the URL: /wanted/2-bedroom-kilimani
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Invalid request link.");
      return;
    }

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/leads/wanted/${slug}`);
        setRequestData(response.data);
      } catch (err) {
        // Handle 404 leads that aren't public
        setError(err.response?.data?.message || "This request was not found or has been fulfilled.");
        setRequestData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [slug]);

  // --- Utility Functions ---
  const generateStructuredData = (data) => {
    if (!data || !data.details) return null;

    // A simulated answer, as per your plan for the "Shadow Profile" answer
    const recommendedAnswer = data.category === 'Property'
      ? `HouseHunt recommends checking our exclusive Landlord Listings in the area to match with this tenant instantly.`
      : `HouseHunt recommends 3 Verified ${data.category} service providers operating in the area. Contact us for the list.`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "QAPage",
      "mainEntity": {
        "@type": "Question",
        "name": data.seoTitle || `Client urgently looking for ${data.category}`,
        "text": data.details,
        "answerCount": 1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": recommendedAnswer,
          "upvoteCount": 15 // Social proof
        }
      }
    };

    return JSON.stringify(jsonLd);
  };

  // Update Schema on successful data fetch
  useEffect(() => {
    if (requestData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = generateStructuredData(requestData);
      script.id = 'qa-schema';

      // Clean up previous script if it exists
      const existingScript = document.getElementById('qa-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }

      document.head.appendChild(script);

      // Also update the document title for SEO
      document.title = requestData.seoTitle || "Tenant Waiting - HouseHunt Kenya";
    }
  }, [requestData]);

  // --- Rendering ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-700 dark:text-gray-300">Loading Request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-6 max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold text-red-600 mb-4">404 - Request Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <a href="/" className="text-blue-600 hover:underline flex items-center justify-center gap-2">
          <ArrowRight size={16} /> Back to Homepage to submit your own search
        </a>
      </div>
    );
  }

  if (!requestData) return null;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">

        {/* H1 SEO Title */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            {requestData.seoTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A verified client is waiting for a direct match. Don't miss this opportunity.
          </p>
        </header>

        {/* Request Card (The Asset) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-blue-600 p-8 mb-10">

          <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-100 dark:border-gray-700">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${requestData.category === 'Property' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
              {requestData.category} Request
            </span>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock size={16} className="mr-1" />
              Posted {formatDistanceToNow(new Date(requestData.timeSince), { addSuffix: true })}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tenant Details:
          </h2>
          <blockquote className="italic border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-md p-4">
            <p className="whitespace-pre-wrap">{requestData.details}</p>
          </blockquote>

          {/* Location/Budget extraction simulation */}
          <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <MapPin size={16} /> Location: **Kilimani/Westlands** (Inferred)
              </span>
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <DollarSign size={16} /> Budget: **Ksh 45,000 - 65,000** (Inferred)
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Home size={16} /> Bedrooms: **2** (Inferred)
              </span>
            </div>
          </div>
        </div>

        {/* Landlord/Agent CTA Block */}
        <div className="text-center p-8 bg-blue-600 rounded-xl shadow-xl transform hover:scale-[1.01] transition-transform">
          <h2 className="text-3xl font-bold text-white mb-3">
            Have the Property This Tenant Needs?
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            This request is verified and urgent. Submit your listing to be matched instantly and close the deal fast.
          </p>
          <a
            href="/list-property"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-extrabold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <CheckCircle size={20} /> List Your Property Now
          </a>
          <p className="mt-3 text-xs text-blue-200">
            (Linking directly to this request for instant lead capture)
          </p>
        </div>

        {/* Hidden Schema Markup Container (For debugging) */}
        {/* <pre className="mt-10 p-4 bg-gray-100 dark:bg-gray-700 text-xs rounded-lg overflow-auto text-left">
          {requestData && generateStructuredData(requestData)}
        </pre> */}

      </div>
    </section>
  );
};

export default WantedRequestPage;