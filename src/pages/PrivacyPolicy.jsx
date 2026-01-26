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
      <div className="space-y-8 text-lg text-gray-700 dark:text-gray-200">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Privacy Summary</h3>
          <ol className="list-decimal pl-5 space-y-2 font-medium">
            <li>We collect your name, phone, email, and search location (e.g., “Apartments near Ruiru Bypass”).</li>
            <li>We use it to show you houses and connect you with agents.</li>
            <li>We share your info only with the agent/landlord you contact.</li>
            <li>We never sell your data.</li>
            <li>We protect your data with passwords and encryption.</li>
            <li>You can ask us to show, correct, or delete your data anytime (email support@househuntkenya.com).</li>
            <li>If something bad happens (data leak), we’ll tell you and the Data Protection Commissioner fast.</li>
            <li>This policy follows the Kenya Data Protection Act 2019.</li>
          </ol>
        </div>

        <div>
          <p className="mb-4">This Privacy Policy explains how we collect, use, share, and protect your information.</p>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">1. Information We Collect</h2>
          <p className="mb-2 font-semibold">We may collect:</p>

          <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200">1.1 Personal Information</h3>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Full name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Location (optional)</li>
            <li>Account details</li>
            <li>Messages through website chat</li>
          </ul>

          <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200">1.2 Property Information</h3>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Listing descriptions</li>
            <li>Photos</li>
            <li>Video tours</li>
            <li>Agent/landlord details</li>
          </ul>

          <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200">1.3 Automatic Data (Cookies & Analytics)</h3>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>IP address</li>
            <li>Browser type and device type</li>
            <li>Pages visited</li>
            <li>Time spent on the site</li>
            <li>Search behavior</li>
            <li>Cookies, Facebook Pixel, Google Analytics data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">2. How We Use Your Data</h2>
          <p className="mb-2">We use data to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Provide and improve our Services</li>
            <li>Connect users to agents or landlords</li>
            <li>Display personalized property recommendations</li>
            <li>Fight fraud and verify listings</li>
            <li>Respond to inquiries and customer support requests</li>
            <li>Improve website performance and reporting</li>
            <li>Send alerts or marketing messages (with consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">3. Legal Basis for Processing (Kenya DPA Requirement)</h2>
          <p className="mb-2">We process data based on:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Your consent</li>
            <li>Performance of a service</li>
            <li>Legitimate interest</li>
            <li>Legal obligations (e.g., fraud investigations)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">4. Data Sharing</h2>
          <p className="mb-2">We may share your information with:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Verified real estate agents and landlords</li>
            <li>Service providers (hosting, analytics, SMS/WhatsApp providers)</li>
            <li>Payment processors (if applicable)</li>
            <li>Law enforcement upon valid request</li>
          </ul>
          <p className="font-semibold">We do not sell personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">5. Cookies and Tracking Technologies</h2>
          <p className="mb-2">We use cookies and tracking tools to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Improve functionality</li>
            <li>Personalize user experience</li>
            <li>Run analytics</li>
            <li>Deliver relevant ads</li>
          </ul>
          <p>Users may disable cookies through their browser settings.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">6. User Rights Under the Kenya Data Protection Act</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion (“right to be forgotten”)</li>
            <li>Object to processing</li>
            <li>Withdraw consent at any time</li>
            <li>Request data portability</li>
            <li>File a complaint with the Office of the Data Protection Commissioner (ODPC)</li>
          </ul>
          <p>Requests can be made via email at <strong>support@househuntkenya.co.ke</strong>.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">7. Data Security</h2>
          <p className="mb-2">We implement measures such as:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Encryption</li>
            <li>Secure servers</li>
            <li>Restricted employee access</li>
            <li>Regular system audits</li>
            <li>Two-factor authentication (when available)</li>
          </ul>
          <p>However, no online system is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">8. Data Retention</h2>
          <p className="mb-2">We may retain data for:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Account information: until user deletes account</li>
            <li>Property listings: until removed</li>
            <li>Transaction logs (if any): up to 5 years</li>
            <li>Analytics data: up to 26 months</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">9. International Data Transfers</h2>
          <p>If our hosting or analytics providers store data outside Kenya, we ensure appropriate safeguards compliant with the Data Protection Act, 2019.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">10. Children’s Privacy</h2>
          <p>We do not intentionally collect personal information from persons under 18 years. Accounts of minors will be deleted if discovered.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">11. Updates to This Policy</h2>
          <p className="mb-2">We may update this Privacy Policy to reflect changes in law or our operations.</p>
          <p>We will notify users of significant changes via email or website notice.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">12. Contact Information</h2>
          <p className="mb-2">For questions, corrections, or data requests:</p>
          <p>Email: <a href="mailto:support@househuntkenya.co.ke" className="text-blue-600 dark:text-blue-400 hover:underline">support@househuntkenya.co.ke</a></p>
        </section>
      </div>
    </LegalPageWrapper>
  );
};

export default PrivacyPolicy;