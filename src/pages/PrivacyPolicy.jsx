import React from 'react';

// This is a simple wrapper component to hold your legal text.
// You can copy this from TermsOfService.jsx or import it.
const LegalPageWrapper = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-900 py-16">
    <div className="container mx-auto px-6 md:px-10 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <LegalPageWrapper title="Privacy Policy">
      <p><strong>Last Updated:</strong> November 9, 2025</p>

      <h3>1. Introduction</h3>
      <p>HouseHunt Kenya ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Service. By using our Service, you consent to the data practices described in this policy.</p>

      <h3>2. Information We Collect</h3>
      <p>We may collect personal information directly from you, such as when you create an account, as well as automatically as you use our Service.</p>
      <ul>
        <li><strong>Personal Information:</strong> Name, email address, phone number (including WhatsApp number), password (hashed), profile picture, and any information you provide in messages or forms.</li>
        <li><strong>Usage Data:</strong> IP address, browser type, operating system, pages viewed, time spent on pages, and the dates/times of your visits.</li>
        <li><strong>Cookies:</strong> We use cookies to enhance your experience, remember your preferences, and analyze site traffic.</li>
      </ul>

      <h3>3. How We Use Your Information</h3>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, operate, and maintain our Service.</li>
        <li>Create and manage your account.</li>
        <li>Facilitate communication between you and Agents (e.g., for viewing requests or chat).</li>
        <li>Improve, personalize, and expand our Service.</li>
        <li>Communicate with you (e.g., for support or marketing, with your consent).</li>
        <li>Detect and prevent fraud and security issues.</li>
      </ul>

      <h3>4. How We Share Your Information</h3>
      <p>We do not sell your personal information. We may share it in the following limited circumstances:</p>
      <ul>
        <li><strong>With Agents:</strong> When you initiate contact (e.g., schedule a viewing, start a chat), we will share your relevant information (like your name, email, or phone) with the Agent to facilitate that connection.</li>
        <li><strong>With Service Providers:</strong> With third-party vendors who perform services for us (e.g., data hosting, analytics), but only as needed for them to perform those services.</li>
        <li><strong>For Legal Reasons:</strong> If required by law or in response to a valid legal request (e.g., a court order).</li>
      </ul>

      <h3>5. Third-Party Links and Content</h3>
      <p>Our Service may contain links to third-party websites, services, or content (including images on social media platforms) that are not owned or controlled by us. We are not responsible for the privacy practices or content of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.</p>

      <h3>6. Data Security</h3>
      <p>We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>

      <h3>7. Your Data Rights</h3>
      <p>In accordance with Kenyan law and other applicable regulations, you may have the right to access, correct, update, or request deletion of your personal information. You can manage most of this information directly in your account settings or by contacting us.</p>
      
      <h3>8. Children's Privacy</h3>
      <p>Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have, we will take steps to delete it.</p>

      <h3>9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>

      <h3>10. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at <strong>support@househuntkenya.co.ke</strong>.</p>
    </LegalPageWrapper>
  );
};

export default PrivacyPolicy;