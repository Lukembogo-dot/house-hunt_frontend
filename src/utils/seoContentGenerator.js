// src/utils/seoContentGenerator.js

/**
 * Generates dynamic SEO content (Title, Intro, Market Insight) 
 * based on the location, listing type, and stats provided.
 */
export const generateDynamicLocationContent = (location, listingType, count, avgPrice) => {
  // 1. Safety Check: If no location, return defaults
  if (!location || location === 'all') {
    return {
      title: `Search ${listingType === 'rent' ? 'Rental' : 'For Sale'} Properties in Kenya`,
      intro: `Browse our latest verified listings for ${listingType} in Kenya. Use the filters to narrow down your search by location, price, and property type.`,
      marketInsight: ''
    };
  }

  // 2. Format the Data
  // "kilimani" -> "Kilimani", "westlands" -> "Westlands"
  const locName = location
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  const typeName = listingType === 'rent' ? 'Rental Properties' : 'Properties for Sale';
  const action = listingType === 'rent' ? 'rent' : 'buy';
  
  const date = new Date();
  const currentMonth = date.toLocaleString('default', { month: 'long' });
  const currentYear = date.getFullYear();

  // 3. Generate Dynamic Title (H1 & Meta Title)
  const title = `${count > 0 ? count + '+' : 'Best'} ${typeName} in ${locName} | Updated ${currentMonth} ${currentYear}`;

  // 4. Generate Dynamic Introduction (Meta Description & Page Intro)
  const intro = `Looking to ${action} in ${locName}? You are in the right place. As of ${currentMonth} ${currentYear}, HouseHunt Kenya has listed ${count} verified properties in ${locName}. This neighbourhood is becoming increasingly popular for its convenient amenities and diverse housing options.`;

  // 5. Generate "Market Insights" (For the blue box)
  let priceText = 'negotiable';
  if (avgPrice && avgPrice > 0) {
    priceText = `Ksh ${avgPrice.toLocaleString()}`;
  }

  const marketInsight = `The real estate market in ${locName} is active. The average price for ${listingType} listings here is currently trending around ${priceText}. Properties in ${locName} typically move fast, so we recommend contacting agents immediately if you see a listing you like.`;

  return { title, intro, marketInsight };
};

/**
 * NEW: Generates JSON-LD Schema for FAQs
 * This helps you rank in the "People Also Ask" section of Google
 */
export const generateFAQSchema = (location, listingType, avgPrice) => {
  if (!location || !avgPrice) return null;

  const locName = location.charAt(0).toUpperCase() + location.slice(1).replace(/-/g, ' ');
  const action = listingType === 'rent' ? 'rent' : 'buy';
  const priceText = `KES ${avgPrice.toLocaleString()}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How much does it cost to ${action} a property in ${locName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `As of this month, the average price to ${action} a property in ${locName} is approximately ${priceText}. Prices vary based on amenities and size.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${locName} a good place to live?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${locName} is a popular area in Nairobi offering a blend of residential comfort and accessibility. It is known for its proximity to schools, shopping centers, and public transport.`
        }
      },
      {
        "@type": "Question",
        "name": `How can I list my property in ${locName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can list your property in ${locName} for free on HouseHunt Kenya. Simply create an agent account and upload your listing details to reach thousands of verified house hunters.`
        }
      }
    ]
  };

  return JSON.stringify(schema);
};