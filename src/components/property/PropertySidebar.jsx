// src/components/property/PropertySidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { formatPrice } from '../../utils/formatPrice';
import {
  FaWhatsapp, FaCalendarAlt, FaCommentDots,
  FaUserCircle, FaTiktok, FaInstagram, FaUserSlash,
  FaFacebookF, FaTwitter, FaLinkedinIn, FaCopy, FaEnvelope, FaTimes,
  FaMapMarkerAlt, FaTag, FaBed, FaRulerCombined, FaClock, FaFlag, FaPhone
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import InvestmentYieldWidget from './InvestmentYieldWidget';
import RentalMoveInWidget from './RentalMoveInWidget';
import useAnalytics from '../../hooks/useAnalytics';
import toast from 'react-hot-toast';

// --- EXTERNAL CONTACT MODAL (For Shadow Agents) ---
const ExternalContactModal = ({ show, onClose, agentDetails }) => {
  if (!show || !agentDetails) return null;

  const generateWhatsAppMessage = (name) => {
    const greeting = name ? `Hello ${name},` : "Hello,";
    const currentUrl = window.location.href;
    return encodeURIComponent(`${greeting} I am interested in this property on HouseHunt Kenya. \n\nLink: ${currentUrl}`);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
              <FaTimes size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Connect with {agentDetails.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6 leading-relaxed">
              Ready to take the next step? Choose your preferred way to start the conversation.
            </p>

            <div className="space-y-3">
              {agentDetails.whatsapp && (
                <a
                  href={`https://wa.me/${agentDetails.whatsapp.replace(/\+/g, '')}?text=${generateWhatsAppMessage(agentDetails.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition shadow-lg shadow-green-500/30"
                >
                  <FaWhatsapp className="mr-2 text-xl" /> Start WhatsApp Chat
                </a>
              )}

              {agentDetails.email && (
                <a
                  href={`mailto:${agentDetails.email}`}
                  className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-lg shadow-blue-500/30"
                >
                  <FaEnvelope className="mr-2" /> Send an Email
                </a>
              )}

              {(agentDetails.tiktok || agentDetails.instagram) && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <p className="text-xs text-center text-gray-500 mb-2">See more listings & tours on:</p>
                  <div className="flex gap-3">
                    {agentDetails.tiktok && (
                      <a
                        href={`https://tiktok.com/${agentDetails.tiktok.startsWith('@') ? '' : '@'}${agentDetails.tiktok.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-80 transition text-sm"
                      >
                        <FaTiktok className="mr-2" /> TikTok
                      </a>
                    )}
                    {agentDetails.instagram && (
                      <a
                        href={`https://instagram.com/${agentDetails.instagram.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:opacity-90 transition text-sm"
                      >
                        <FaInstagram className="mr-2" /> Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ReportModal = ({ show, onClose, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    if (!reason.trim() || reason.length < 5) return alert("Please provide a valid reason (min 5 chars).");
    onSubmit(reason);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
              <FaTimes size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center flex items-center justify-center gap-2">
              <FaFlag className="text-red-500" /> Report Listing
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6 leading-relaxed">
              Help us keep HouseHunt safe. Why are you reporting this property?
            </p>

            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-red-500 mb-4"
              rows="4"
              placeholder="Describe the issue (e.g., Fake listing, Wrong price, Scammer)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Sending...' : 'Submit Report'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PropertySidebar = ({
  property,
  user,
  isAgentOwner,
  handleScheduleClick,
  handleStartChat,
  isStartingChat,
  handleLogLead
}) => {

  const [showExternalModal, setShowExternalModal] = useState(false);

  // Repoort State
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Import locally to avoid conflict if not at top? Ideally move imports to top, but here for locality.
  // Actually, standard practice is top. I'll rely on existing imports or assume I need to add them if missing.
  // Wait, I need to add imports at the top of the file as well. I'll do that in a separate chunk or careful overwrite if I can't seeing them.
  // Assuming `apiClient` needs to be imported. I'll check top first.

  const navigate = useNavigate();
  const location = useLocation();

  // --- Helpers ---
  const currentUrl = window.location.href;
  const shareTitle = `Check out this amazing property on HouseHunt Kenya: ${property?.title || 'Property Listing'}`;

  const generateWhatsAppMessage = (name) => {
    const greeting = name ? `Hello ${name},` : "Hello,";
    const title = property?.title || "this property";
    const loc = property?.location || "Nairobi";
    const price = property?.price ? ` listed for Ksh ${property.price.toLocaleString()}` : "";
    return encodeURIComponent(`${greeting} I am interested in *${title}* located in *${loc}*${price}. Is it still available? \n\nLink: ${currentUrl}`);
  };

  // --- Auth Guard Helper ---
  const handleRestrictedAction = (actionCallback) => {
    if (!user) {
      toast((t) => (
        <div className="flex flex-col gap-2 items-start">
          <span className="font-semibold text-gray-800">Login Required</span>
          <span className="text-sm text-gray-600">You must be logged in to contact agents or view details.</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/login', { state: { from: location } });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-blue-700 transition"
          >
            Log In to Continue
          </button>
        </div>
      ), { duration: 5000, icon: '🔒' });
      return;
    }
    if (actionCallback) actionCallback();
  };

  // --- Sharing Functions ---
  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  const shareOnWhatsApp = () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this property: ${property?.title} \n${currentUrl}`)}`, '_blank');
  const shareOnLinkedIn = () => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`, '_blank');
  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(currentUrl); alert('Link copied!'); }
    catch (err) { console.error(err); }
  };

  // --- Agent Logic ---
  const hasShadowAgent = property.ownerDetails && property.ownerDetails.name;
  const displayAgent = hasShadowAgent ? property.ownerDetails : property.agent;
  const agentName = hasShadowAgent ? displayAgent.name : displayAgent?.name;
  const agentWhatsapp = hasShadowAgent ? displayAgent.whatsapp : displayAgent?.whatsappNumber;
  const agentImage = hasShadowAgent ? null : displayAgent?.profilePicture;
  const shadowTiktok = hasShadowAgent ? displayAgent.tiktok : null;
  const shadowInstagram = hasShadowAgent ? displayAgent.instagram : null;
  const agentEmail = hasShadowAgent ? displayAgent.email : displayAgent?.email;

  const getPriceSuffix = () => {
    if (property.type === 'land' && property.pricePer && property.pricePer !== 'total') {
      const mapping = { acre: ' / Acre', plot: ' / Plot', sqm: ' / Sq Meter' };
      return mapping[property.pricePer] || '';
    }
    if (property.listingType === 'sale') return '';
    const freq = property.priceFrequency || 'month';
    return ` / ${freq}`;
  };

  // ✅ Interactive Handlers - STRICT INTERNAL MODE
  // ✅ Interactive Handlers - STRICT INTERNAL MODE
  const { trackEvent } = useAnalytics();

  const onContactAgent = () => {
    handleRestrictedAction(() => {
      trackEvent('chat_start', 'property_sidebar', displayAgent?._id, { propertyId: property._id });
      // Force Internal Chat for everyone
      handleStartChat();
    });
  };

  const onScheduleViewing = () => {
    handleRestrictedAction(() => {
      // Viewing tracking might be done in the scheduling flow, but we can track the click too
      trackEvent('schedule_viewing_click', 'property_sidebar', displayAgent?._id, { propertyId: property._id });
      handleScheduleClick();
    });
  };

  const openExternalLink = (url, type, platform) => {
    handleRestrictedAction(() => {
      handleLogLead();
      trackEvent(type || 'external_link_click', 'property_sidebar', displayAgent?._id, { propertyId: property._id, platform });
      window.open(url, '_blank');
    });
  };

  // Handle Report
  const handleOpenReport = () => {
    handleRestrictedAction(() => {
      setShowReportModal(true);
    });
  };

  const submitReport = async (reason) => {
    setIsReporting(true);
    try {
      // Dynamic import to avoid top-level issues if not present? 
      // No, I'll assume axios is available or import it at top in next step.
      // Ideally I should have checked imports. I'll assume `apiClient` is needed.
      // Wait, this file imports React, etc. but NOT `apiClient`. Use `window.apiClient` or just `axios`?
      // I will use `import apiClient from '../../api/axios';` at the top in a separate Op.
      // For now, I'll write the logic.
      const { default: apiClient } = await import('../../api/axios');

      await apiClient.post('/reports', {
        propertyId: property._id,
        reason
      }, { withCredentials: true });

      alert("Report submitted. Thank you.");
      setShowReportModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:border dark:border-gray-700 relative">

      {/* --- NARRATIVE PROPERTY SUMMARY --- */}
      <h3 className="text-xl font-bold mb-4 dark:text-gray-100 flex items-center gap-2">
        <FaTag className="text-blue-600" /> The Deal Details
      </h3>

      <div className="text-gray-600 dark:text-gray-300 space-y-4 mb-6 text-sm leading-relaxed">
        <p>
          {property.status === 'available' ? (
            <span className="text-green-600 font-bold">This unit is available</span>
          ) : (
            <span className="text-red-600 font-bold">Full/Sold</span>
          )}
          {' '}and is currently listed for <strong className="text-gray-900 dark:text-white capitalize">{property.listingType}</strong>.
          It was posted <strong>{formatDistanceToNow(new Date(property.createdAt))} ago</strong>.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-2">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>Located in <strong className="text-gray-900 dark:text-white">{property.location}</strong></span>
          </div>

          {property.type === 'land' ? (
            <div className="flex items-center gap-2">
              <FaRulerCombined className="text-blue-500" />
              <span>Land Size: <strong>{property.landSize || 'N/A'}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FaBed className="text-blue-500" />
              <span>Features <strong className="text-gray-900 dark:text-white">{Number(property.bedrooms) === 0 ? "Bedsitter Unit" : `${property.bedrooms} Bedroom(s)`}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800 mt-2">
            <span className="text-lg font-black text-blue-700 dark:text-blue-400">
              Ksh {formatPrice(property.price)}{getPriceSuffix()}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Investment Yield Widget (Only for Sales) */}
      {property.listingType === 'sale' && (
        <div className="mb-6">
          <InvestmentYieldWidget property={property} user={user} />
        </div>
      )}

      {/* ✅ NEW: Move-In Estimator (Only for Rentals) */}
      {property.listingType === 'rent' && (
        <div className="mb-6">
          <RentalMoveInWidget property={property} />
        </div>
      )}

      {!isAgentOwner && property.status === 'available' && (
        <div className="flex flex-col space-y-3 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-1">Take Action</p>
          <button
            onClick={onContactAgent}
            disabled={isStartingChat}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-600/30 font-bold text-sm"
          >
            <FaCommentDots size={18} />
            <span>{isStartingChat ? 'Starting Chat...' : 'Speak with the Agent'}</span>
          </button>

          <button
            onClick={onScheduleViewing}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 dark:bg-transparent dark:border-gray-600 dark:text-gray-300 py-3 rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all duration-150 active:scale-[0.98] font-bold text-sm"
          >
            <FaCalendarAlt /> <span>Book a Physical Viewing</span>
          </button>

          {/* REPORT BUTTON */}
          <button
            onClick={handleOpenReport}
            className="w-full flex items-center justify-center space-x-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-xl transition text-xs font-semibold"
          >
            <FaFlag /> <span>Report This Listing</span>
          </button>
        </div>
      )}

      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-xl font-bold mb-3 dark:text-gray-100 flex items-center gap-2">
          <FaUserCircle className="text-gray-400" /> Meet Your Agent
        </h3>

        {displayAgent ? (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-4">
              {agentImage ? (
                <Link to={`/agent/${displayAgent._id}`}>
                  <img src={agentImage} alt={agentName} className="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-gray-600" />
                </Link>
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400">
                  <span className="text-xl font-bold">{(agentName || 'A').charAt(0)}</span>
                </div>
              )}

              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                  {hasShadowAgent ? agentName : <Link to={`/agent/${displayAgent._id}`} className="hover:text-blue-600 transition">{agentName}</Link>}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Responsive • Verified Lister
                </p>
              </div>
            </div>

            {/* --- NARRATIVE SOCIAL LINKS --- */}
            {hasShadowAgent && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{agentName.split(' ')[0]} is active online. You can view more property tours or send a direct email below."
                </p>

                <div className="flex items-center gap-2">
                  {agentEmail && (
                    <button
                      onClick={() => openExternalLink(`mailto:${agentEmail}`, 'email_click')}
                      className="flex-1 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-200 transition flex items-center justify-center gap-1"
                    >
                      <FaEnvelope /> Email Me
                    </button>
                  )}

                  {/* Socials Group */}
                  {(shadowTiktok || shadowInstagram) && (
                    <div className="flex gap-2">
                      {shadowTiktok && (
                        <button
                          onClick={() => openExternalLink(`https://tiktok.com/${shadowTiktok.startsWith('@') ? '' : '@'}${shadowTiktok.replace('@', '')}`, 'social_click', 'tiktok')}
                          className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition shadow-sm"
                          title="Watch Tours on TikTok"
                        >
                          <FaTiktok size={14} />
                        </button>
                      )}
                      {shadowInstagram && (
                        <button
                          onClick={() => openExternalLink(`https://instagram.com/${shadowInstagram.replace('@', '')}`, 'social_click', 'instagram')}
                          className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full hover:scale-110 transition shadow-sm"
                          title="See Photos on Instagram"
                        >
                          <FaInstagram size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp CTA - STRICT VISIBILITY */}
            {agentWhatsapp && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    openExternalLink(`https://wa.me/${agentWhatsapp.replace(/\+/g, '')}?text=${generateWhatsAppMessage(agentName)}`, 'whatsapp_click');
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition group mb-2"
                >
                  <span className="text-sm font-bold">Start WhatsApp Chat</span>
                  <FaWhatsapp className="text-xl group-hover:scale-110 transition-transform" />
                </button>

                {/* Call Button */}
                <button
                  onClick={() => {
                    openExternalLink(`tel:${agentWhatsapp}`, 'call_click');
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition group"
                >
                  <span className="text-sm font-bold">Call Agent {agentWhatsapp}</span>
                  <FaPhone className="text-lg group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 italic text-sm">
            Agent information is currently unavailable.
          </div>
        )}
      </div>

      <div className="mt-8 border-t dark:border-gray-700 pt-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Love it? Share it.</h3>
        <div className="flex justify-center gap-4">
          <button onClick={shareOnWhatsApp} className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 hover:-translate-y-1 transition shadow-lg shadow-green-200"><FaWhatsapp size={20} /></button>
          <button onClick={shareOnFacebook} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:-translate-y-1 transition shadow-lg shadow-blue-200"><FaFacebookF size={20} /></button>
          <button onClick={shareOnTwitter} className="w-10 h-10 rounded-full bg-sky-400 text-white flex items-center justify-center hover:bg-sky-500 hover:-translate-y-1 transition shadow-lg shadow-sky-200"><FaTwitter size={20} /></button>
          <button onClick={copyToClipboard} className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-800 hover:-translate-y-1 transition shadow-lg"><FaCopy size={18} /></button>
        </div>
      </div>

      <ExternalContactModal
        show={showExternalModal}
        onClose={() => setShowExternalModal(false)}
        agentDetails={displayAgent}
      />

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={submitReport}
        isSubmitting={isReporting}
      />
    </div>
  );
};

export default PropertySidebar;