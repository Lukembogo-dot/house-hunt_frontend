import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy Load Components
const About = lazy(() => import("../../pages/About"));
const Buy = lazy(() => import("../../pages/Buy"));
const Rent = lazy(() => import("../../pages/Rent"));
const Contact = lazy(() => import("../../pages/Contact"));
const PropertyDetails = lazy(() => import("../../pages/PropertyDetails"));
const PropertyVideoWatch = lazy(() => import("../../pages/PropertyVideoWatch"));
const Login = lazy(() => import("../../pages/Login"));
const Register = lazy(() => import("../../pages/Register"));
const AdminDashboard = lazy(() => import('../../pages/AdminDashboard'));
const AdminRoute = lazy(() => import('../AdminRoute'));
const AddProperty = lazy(() => import('../../pages/AddProperty'));
const EditProperty = lazy(() => import("../../pages/EditProperty"));
const MyProfile = lazy(() => import("../../pages/MyProfile"));
const EditProfileSettings = lazy(() => import("../../pages/EditProfileSettings"));
const ProtectedRoute = lazy(() => import("../ProtectedRoute"));
const AgentPublicProfile = lazy(() => import("../../pages/AgentPublicProfile"));
const ChatPage = lazy(() => import('../../pages/ChatPage'));
const MessageStream = lazy(() => import('../MessageStream'));
const ChatPlaceholder = lazy(() => import('../ChatPlaceholder'));
const ForgotPassword = lazy(() => import('../../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../../pages/ResetPassword'));
const VerifyEmail = lazy(() => import('../../pages/VerifyEmail'));
const SEOManager = lazy(() => import('../../pages/SEOManager'));
const ServicePostDetails = lazy(() => import("../../pages/ServicePostDetails"));
const AdminAddService = lazy(() => import("../../pages/AdminAddService"));
const TermsOfService = lazy(() => import('../../pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('../../pages/PrivacyPolicy'));
const FeatureManager = lazy(() => import('../../pages/FeatureManager'));
const ForAgents = lazy(() => import('../../pages/ForAgents'));
const AgentAnalytics = lazy(() => import('../../pages/AgentAnalytics'));
const NeighbourhoodQuiz = lazy(() => import('../../pages/NeighbourhoodQuiz'));
const DynamicSearchPage = lazy(() => import('../../pages/DynamicSearchPage'));
const AgentFinderPage = lazy(() => import('../../pages/AgentFinderPage'));
const NeighbourhoodIntelPage = lazy(() => import('../../pages/NeighbourhoodIntelPage'));
const CostOfLivingCalculator = lazy(() => import('../../pages/CostOfLivingCalculator'));
const CreateIntelPost = lazy(() => import('../../pages/CreateIntelPost'));
const AgentDashboard = lazy(() => import('../../pages/AgentDashboard'));
const NotFound = lazy(() => import('../../pages/NotFound'));
const AgentWallet = lazy(() => import('../../pages/AgentWallet'));
const SoldPropertiesPage = lazy(() => import('../../pages/SoldPropertiesPage'));
const AdminFaqManager = lazy(() => import('../../pages/AdminFaqManager'));
const FaqDetails = lazy(() => import('../../pages/FaqDetails'));
const FaqIndex = lazy(() => import('../../pages/FaqIndex'));
const PaymentSuccess = lazy(() => import('../../pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('../../pages/PaymentCancel'));

// Agent Route
import AgentRoute from "../AgentRoute";

const AppRoutesConfig = ({ homeElement }) => {
  return (
    <Routes>
      <Route path="/" element={homeElement} />
      <Route path="/buy" element={<Buy />} />
      <Route path="/rent" element={<Rent />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/properties/:slug" element={<PropertyDetails />} />
      <Route path="/properties/:slug/video" element={<PropertyVideoWatch />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/agent/:agentId" element={<AgentPublicProfile />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/services/:slug" element={<ServicePostDetails />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/for-agents" element={<ForAgents />} />
      <Route path="/find-my-neighbourhood" element={<NeighbourhoodQuiz />} />
      <Route path="/tools/cost-of-living" element={<CostOfLivingCalculator />} />
      <Route path="/search/:listingType/:propertyType/:location/:bedrooms" element={<DynamicSearchPage />} />
      <Route path="/search/:listingType/:propertyType/:location" element={<DynamicSearchPage />} />
      <Route path="/search/:listingType/:location" element={<DynamicSearchPage />} />
      <Route path="/search/:listingType" element={<DynamicSearchPage />} />
      <Route path="/agents" element={<AgentFinderPage />} />
      <Route path="/agents/:location" element={<AgentFinderPage />} />
      <Route path="/neighbourhood/:location/:topic" element={<NeighbourhoodIntelPage />} />
      <Route path="/neighbourhood/:location" element={<NeighbourhoodIntelPage />} />
      <Route path="/:status/:location" element={<SoldPropertiesPage />} />
      <Route path="/faqs" element={<FaqIndex />} />
      <Route path="/faq/:slug" element={<FaqDetails />} />

      {/* Protected Routes */}
      <Route path="" element={<ProtectedRoute />}>
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/profile/edit" element={<EditProfileSettings />} />
        <Route path="/create-intel-post" element={<CreateIntelPost />} />
        <Route path="/chat" element={<ChatPage />}>
          <Route index element={<ChatPlaceholder />} />
          <Route path=":id" element={<MessageStream />} />
        </Route>
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
      </Route>

      {/* Admin Routes */}
      <Route path="" element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/seo-manager" element={<SEOManager />} />
        <Route path="/admin/faq-manager" element={<AdminFaqManager />} />
        <Route path="/admin/feature-manager" element={<FeatureManager />} />
        <Route path="/admin/add-service" element={<AdminAddService />} />
        <Route path="/admin/add-service/:id" element={<AdminAddService />} />
      </Route>

      {/* Agent Routes */}
      <Route path="" element={<AgentRoute />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/wallet" element={<AgentWallet />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/admin/property/:id/edit" element={<EditProperty />} />
        <Route path="/profile/analytics" element={<AgentAnalytics />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutesConfig;