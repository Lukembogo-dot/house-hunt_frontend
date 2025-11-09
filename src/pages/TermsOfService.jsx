import React from 'react';

// This is a simple wrapper component to hold your legal text.
// You can style it however you like.
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

const TermsOfService = () => {
  return (
    <LegalPageWrapper title="Terms of Service">
      <p><strong>Last Updated:</strong> November 9, 2025</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>Welcome to HouseHunt Kenya ("we," "us," or "our"). By accessing or using our website and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Service.</p>

      <h3>2. Description of Service</h3>
      <p>HouseHunt Kenya is a technology platform that connects users (including prospective tenants and buyers) with property listings posted by third-party real estate agents, landlords, and owners ("Agents"). We are a directory and a facilitator, not a real estate agency, broker, or party to any transaction.</p>

      <h3>3. User Accounts</h3>
      <p>To access certain features, you must register for an account. You agree to provide accurate, current, and complete information. You are responsible for safeguarding your password and for all activities that occur under your account. You must be at least 18 years old to create an account.</p>

      <h3>4. User Conduct</h3>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Post false, misleading, or fraudulent information.</li>
        <li>Harass, stalk, or harm another individual.</li>
        <li>Scrape, data-mine, or harvest information without our consent.</li>
        <li>Violate any applicable local, national, or international law.</li>
      </ul>

      <h3>5. Third-Party Content and Agent Interactions</h3>
      <p>Our Service displays content provided by third-party Agents (listings, profiles) and may contain content or links to other third-party websites or resources, including social media platforms.</p>
      
      <p><strong>a. Third-Party Images:</strong> Some content, including property or profile images, may be sourced from public social media platforms or other third-party sites. The original content creators retain all sole rights to their work. HouseHunt Kenya does not claim ownership of this content and does not receive any monetary compensation for displaying or linking to it. We respect intellectual property and will promptly remove any content upon a valid request from the rights holder.</p>
      
      <p><strong>b. Engagement with Agents:</strong> HouseHunt Kenya does not endorse, guarantee, or verify the identity, qualifications, or legitimacy of any Agent. We provide a platform for connection, but we do not vet every Agent or listing.</p>

      <h3>6. Disclaimers and Limitation of Liability</h3>
      <p><strong>YOUR USE OF THE SERVICE IS ENTIRELY AT YOUR OWN RISK.</strong></p>
      
      <p><strong>a. No Warranty:</strong> The Service is provided "AS IS" and "AS AVAILABLE" without any warranties, express or implied. We do not warrant that the Service will be error-free, that listings are accurate, or that Agents are trustworthy.</p>
      
      <p><strong>b. No Liability for Agent Actions:</strong> You acknowledge that your interactions and transactions with Agents or other users are solely between you and that party. HouseHunt Kenya is not a party to, and will not be involved in, any disputes between users.</p>
      
      <p><strong>c. Release of Liability:</strong> To the fullest extent permitted by law, you release HouseHunt Kenya (and our officers, directors, and employees) from all liability, claims, and damages of every kind (including for negligence) arising out of or in connection with any disputes between you and other users, or any losses incurred as a result of using the Service. This includes, but is notlimited to, any losses arising from **scams, fraud, misrepresentation, property damage, financial loss, or personal injury** resulting from your engagement with an Agent or property listing found on our Service.</p>

      <h3>7. Termination</h3>
      <p>We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.</p>

      <h3>8. Governing Law</h3>
      <p>These Terms shall be governed and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of law provisions.</p>

      <h3>9. Changes to Terms</h3>
      <p>We may modify these Terms at any time. We will notify you by posting the updated terms on this page. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.</p>

      <h3>10. Contact Us</h3>
      <p>If you have any questions about these Terms, please contact us at <strong>support@househuntkenya.co.ke</strong>.</p>
    </LegalPageWrapper>
  );
};

export default TermsOfService;