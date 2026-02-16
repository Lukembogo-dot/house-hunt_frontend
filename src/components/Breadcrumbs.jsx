import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show on home page
  if (pathnames.length === 0) return null;

  // Generate structured data (JSON-LD) for Google
  const siteUrl = 'https://househuntkenya.com'; // ✅ Standardized domain

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      // ✅ Add Home as first item
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      // ✅ Add remaining path segments
      ...pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        return {
          "@type": "ListItem",
          "position": index + 2, // Start at position 2 since Home is position 1
          "name": name.charAt(0).toUpperCase() + name.slice(1),
          "item": `${siteUrl}${routeTo}`
        };
      })
    ]
  };

  return (
    <nav className="text-gray-500 dark:text-gray-400 text-sm mb-6" aria-label="Breadcrumb">
      {/* Inject Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <ol className="list-none p-0 inline-flex items-center">
        <li className="flex items-center">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
            <FaHome />
          </Link>
          <FaChevronRight className="mx-2 text-xs" />
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = name.replace(/-/g, ' ').charAt(0).toUpperCase() + name.replace(/-/g, ' ').slice(1);

          return (
            <li key={name} className="flex items-center">
              {isLast ? (
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {displayName}
                </span>
              ) : (
                <>
                  <Link
                    to={routeTo}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    {displayName}
                  </Link>
                  <FaChevronRight className="mx-2 text-xs" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;