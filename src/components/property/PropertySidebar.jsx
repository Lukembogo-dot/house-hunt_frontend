// src/components/property/PropertySidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaWhatsapp, FaCalendarAlt, FaCommentDots, 
  FaUserCircle, FaTiktok, FaInstagram, FaUserSlash,
  FaFacebookF, FaTwitter, FaLinkedinIn, FaCopy, FaEnvelope, FaTimes 
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

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
              Contact {agentDetails.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6">
              This agent is available via the following channels:
            </p>

            <div className="space-y-3">
              {agentDetails.whatsapp && (
                <a 
                  href={`https://wa.me/${agentDetails.whatsapp.replace(/\+/g, '')}?text=${generateWhatsAppMessage(agentDetails.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition"
                >
                  <FaWhatsapp className="mr-2 text-xl" /> WhatsApp
                </a>
              )}
              
              {agentDetails.email && (
                <a 
                  href={`mailto:${agentDetails.email}`}
                  className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                >
                  <FaEnvelope className="mr-2" /> Email
                </a>
              )}

              {(agentDetails.tiktok || agentDetails.instagram) && (
                <div className="flex gap-3 pt-2">
                  {agentDetails.tiktok && (
                    <a 
                      href={`https://tiktok.com/${agentDetails.tiktok.startsWith('@') ? '' : '@'}${agentDetails.tiktok.replace('@', '')}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center py-3 bg-black text-white rounded-lg font-bold hover:opacity-80 transition"
                    >
                      <FaTiktok className="mr-2" /> TikTok
                    </a>
                  )}
                  {agentDetails.instagram && (
                    <a 
                      href={`https://instagram.com/${agentDetails.instagram.replace('@', '')}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:opacity-90 transition"
                    >
                      <FaInstagram className="mr-2" /> Instagram
                    </a>
                  )}
                </div>
              )}
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
      // Redirect to login, saving the current location to return to
      navigate('/login', { state: { from: location } });
      return;
    }
    // Proceed if user is logged in
    if (actionCallback) actionCallback();
  };

  // --- Sharing Functions (Public) ---
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
    if (property.listingType === 'sale') return '';
    const freq = property.priceFrequency || 'month';
    return ` / ${freq}`;
  };

  // ✅ Handle Contact Click (Restricted)
  const onContactAgent = () => {
    handleRestrictedAction(() => {
      if (hasShadowAgent) {
        setShowExternalModal(true);
        handleLogLead();
      } else {
        handleStartChat();
      }
    });
  };

  // ✅ Handle Schedule Click (Restricted)
  const onScheduleViewing = () => {
    handleRestrictedAction(() => {
        if (hasShadowAgent) {
          setShowExternalModal(true);
          handleLogLead();
        } else {
          handleScheduleClick();
        }
    });
  };

  // ✅ Generic Link Opener (Restricted)
  const openExternalLink = (url) => {
    handleRestrictedAction(() => {
        handleLogLead();
        window.open(url, '_blank');
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:border dark:border-gray-700 relative">
      <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Property Details</h3>
      <ul className="text-gray-700 dark:text-gray-300 space-y-2">
        <li className="flex justify-between">
          <span>Status:</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
            property.status === 'available' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {property.status}
          </span>
        </li>
        <li className="flex justify-between">
          <span>Listing:</span>
          <span className="font-semibold capitalize">{property.listingType}</span>
        </li>
        {property.createdAt && (
          <li className="flex justify-between">
            <span>Listed:</span>
            <span className="font-semibold">{formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}</span>
          </li>
        )}
        
        {property.type === 'land' ? (
           <li className="flex justify-between">
             <span>Land Size:</span>
             <span className="font-semibold">{property.landSize || 'N/A'}</span>
           </li>
        ) : (
           <li className="flex justify-between">
             <span>Bedrooms:</span>
             <span className="font-semibold">{property.bedrooms}</span>
           </li>
        )}

        <li>Type: <span className="capitalize">{property.type || "N/A"}</span></li>
        <li>Location: {property.location}</li>
        
        <li>
          Price: <span className="font-semibold">Ksh {property.price?.toLocaleString()}{getPriceSuffix()}</span>
        </li>
      </ul>
      
      {!isAgentOwner && property.status === 'available' && (
        <div className="mt-6 flex flex-col space-y-3">
          <button 
            onClick={onContactAgent} 
            disabled={isStartingChat} 
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 shadow-md font-bold"
          >
            <FaCommentDots size={18} /> 
            <span>{isStartingChat ? 'Starting Chat...' : 'Contact Agent'}</span>
          </button>

          <button 
            onClick={onScheduleViewing} 
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-blue-600 text-blue-600 dark:bg-transparent dark:border-blue-500 dark:text-blue-400 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150 active:scale-[0.98] font-semibold"
          >
            <FaCalendarAlt /> <span>Schedule a Viewing</span>
          </button>
        </div>
      )}

      <div className="mt-6 border-t dark:border-gray-700 pt-6">
        <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Listed By</h3>
        {displayAgent ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              {agentImage ? (
                <Link to={`/agent/${displayAgent._id}`}>
                  <img src={agentImage} alt={agentName} className="w-16 h-16 rounded-full object-cover transition hover:opacity-90" />
                </Link>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FaUserCircle className="text-gray-500 dark:text-gray-400" size={40} />
                </div>
              )}
              
              <div className="flex flex-col">
                <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-1">
                  {hasShadowAgent ? agentName : <Link to={`/agent/${displayAgent._id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition">{agentName}</Link>}
                </p>
                
                {/* ✅ STANDARDIZED SHADOW AGENT ICONS (Same size as WhatsApp) */}
                {hasShadowAgent ? (
                  <div className="flex items-center space-x-2">
                    {/* Email */}
                    {agentEmail && (
                        <button 
                            onClick={() => openExternalLink(`mailto:${agentEmail}`)} 
                            className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition shadow-sm"
                            title="Send Email"
                        >
                            <FaEnvelope size={20} />
                        </button>
                    )}
                    
                    {/* TikTok */}
                    {shadowTiktok && (
                        <button 
                            onClick={() => openExternalLink(`https://tiktok.com/${shadowTiktok.startsWith('@') ? '' : '@'}${shadowTiktok.replace('@', '')}`)} 
                            className="p-3 bg-gray-100 text-black dark:bg-gray-700 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
                            title="View TikTok"
                        >
                            <FaTiktok size={20} />
                        </button>
                    )}
                    
                    {/* Instagram */}
                    {shadowInstagram && (
                        <button 
                            onClick={() => openExternalLink(`https://instagram.com/${shadowInstagram.replace('@', '')}`)} 
                            className="p-3 bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/50 transition shadow-sm"
                            title="View Instagram"
                        >
                            <FaInstagram size={20} />
                        </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Registered Agent</p>
                )}
              </div>
            </div>
            
            {/* ✅ Direct WhatsApp Button (Locked & Size 20) */}
            {agentWhatsapp && (
              <button 
                onClick={() => openExternalLink(`https://wa.me/${agentWhatsapp.replace(/\+/g, '')}?text=${generateWhatsAppMessage(agentName)}`)}
                className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition shadow-sm"
                title="Chat on WhatsApp"
              >
                <FaWhatsapp size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3 opacity-60">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><FaUserSlash className="text-gray-500 dark:text-gray-400" size={24} /></div>
            <div><p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Agent Not Available</p></div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t dark:border-gray-700 pt-6">
        <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Share This Property</h3>
        <div className="flex flex-wrap gap-3 justify-start">
          <button onClick={shareOnFacebook} className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 shadow-md"><FaFacebookF size={20} /></button>
          <button onClick={shareOnTwitter} className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 shadow-md"><FaTwitter size={20} /></button>
          <button onClick={shareOnWhatsApp} className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md"><FaWhatsapp size={20} /></button>
          <button onClick={shareOnLinkedIn} className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 shadow-md"><FaLinkedinIn size={20} /></button>
          <button onClick={copyToClipboard} className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-md"><FaCopy size={20} /></button>
        </div>
      </div>

      <ExternalContactModal 
        show={showExternalModal} 
        onClose={() => setShowExternalModal(false)} 
        agentDetails={displayAgent} 
      />
    </div>
  );
};

export default PropertySidebar;