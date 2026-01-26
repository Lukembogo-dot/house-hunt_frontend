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
      <div className="space-y-8 text-lg text-gray-700 dark:text-gray-200">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Key Points</h3>
          <ol className="list-decimal pl-5 space-y-2 font-medium">
            <li>You must be 18+ to use the site.</li>
            <li>HouseHunt Kenya only connects people – we are not the seller, landlord, or agent.</li>
            <li>We are not responsible if a deal goes wrong or someone lies about a house.</li>
            <li>All disputes follow Kenyan law and will be solved in Kenyan courts.</li>
          </ol>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">1. Introduction</h2>
          <p className="mb-4">
            Welcome to HouseHunt Kenya ("we," "our," "us"). These Terms of Service ("Terms") govern your access to and use of our website, mobile site, and related services ("Services").
          </p>
          <p className="mb-4">
            By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please do not use our platform.
          </p>
          <p>
            We may update these Terms at any time. Continued use of the Services after updates constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">2. Eligibility</h2>
          <p className="mb-2">You must:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be at least 18 years old.</li>
            <li>Provide accurate and truthful information when creating an account or submitting a listing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">3. Nature of Service</h2>
          <p className="mb-2">HouseHunt Kenya provides:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>A platform for listing, browsing, and discovering rental and sale properties.</li>
            <li>A connection point between users, agents, and landlords.</li>
            <li>Verified listings where stated, although not all listings are verified.</li>
          </ul>
          <p className="mb-4">
            We are not a real estate agency and do not own or manage listed properties.
          </p>
          <p>
            We do not participate in negotiations, tenancy agreements, payments, or property inspections unless explicitly stated.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">4. User Responsibilities</h2>
          <p className="mb-2">Users agree to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Provide accurate personal and property information.</li>
            <li>Avoid fraud, impersonation, and misleading content.</li>
            <li>Not upload harmful content, malware, or spam.</li>
            <li>Abide by Kenyan law when using the platform.</li>
          </ul>
          <p>
            Agents must ensure that listing details, pricing, and images are accurate and up to date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">5. Listing Information & Third-Party Content</h2>
          <p className="mb-2">HouseHunt Kenya shall not be held responsible for:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Inaccurate prices.</li>
            <li>Incorrect photos.</li>
            <li>Misrepresentations by landlords or agents.</li>
            <li>Delays, cancellations, or false listings.</li>
            <li>Loss of money or disputes between buyers, tenants, landlords, or agents.</li>
          </ul>
          <p>
            All listings are submitted by third parties unless verified by us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">6. Payments and Fees (If Applicable)</h2>
          <p className="mb-2">If the platform charges listing or service fees:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fees are clearly stated before payment.</li>
            <li>Payments may be made through M-Pesa, bank transfer, or card.</li>
            <li>Fees are non-refundable unless otherwise stated.</li>
            <li>HouseHunt Kenya is not liable for payment disputes outside the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">7. Limitation of Liability</h2>
          <p className="mb-2">To the maximum extent permitted by law, HouseHunt Kenya is not liable for:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Financial loss.</li>
            <li>Property fraud.</li>
            <li>Disputes between users and agents.</li>
            <li>Inability to find housing.</li>
            <li>Errors or downtime on the website.</li>
            <li>Loss of data or unauthorized access.</li>
          </ul>
          <p>
            The platform is provided “as is” and “as available.”
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">8. Prohibited Activities</h2>
          <p className="mb-2">Users may not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Scrape, copy, or duplicate content without permission.</li>
            <li>Reverse engineer the platform.</li>
            <li>Post illegal or offensive content.</li>
            <li>Submit fraudulent listings.</li>
            <li>Misuse agent or user contact details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">9. Account Suspension and Termination</h2>
          <p className="mb-2">We may suspend or terminate accounts that:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Violate these Terms.</li>
            <li>Engage in fraud or misuse.</li>
            <li>Provide false information.</li>
            <li>Abuse other users or agents.</li>
          </ul>
          <p>
            Users may delete their accounts at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">10. Governing Law</h2>
          <p className="mb-2">These Terms are governed by the Laws of Kenya, including:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>The Data Protection Act, 2019.</li>
            <li>The Consumer Protection Act.</li>
            <li>The Kenya Information and Communications Act (KICA).</li>
          </ul>
          <p>
            Any disputes shall be resolved in the courts of Kenya.
          </p>
        </section>
      </div>


    </LegalPageWrapper>
  );
};

export default TermsOfService;