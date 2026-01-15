import React from 'react';

const AIPropertySummary = ({ property }) => {
    if (!property.aiSummary) return null;

    return (
        <div className="sr-only" aria-label="AI-readable property summary">
            <h2>Property Summary for AI Search Engines</h2>
            <p>{property.aiSummary}</p>

            {property.aiQuickFacts && (
                <>
                    <h3>Quick Facts</h3>
                    <dl>
                        <dt>Property Type:</dt>
                        <dd>{property.aiQuickFacts.propertyType}</dd>

                        <dt>Number of Bedrooms:</dt>
                        <dd>{property.aiQuickFacts.bedrooms}</dd>

                        <dt>Price:</dt>
                        <dd>{property.aiQuickFacts.price}</dd>

                        <dt>Location:</dt>
                        <dd>{property.aiQuickFacts.location}</dd>

                        <dt>Availability:</dt>
                        <dd>{property.aiQuickFacts.availability}</dd>
                    </dl>
                </>
            )}

            {property.aiAmenitiesList && property.aiAmenitiesList.length > 0 && (
                <>
                    <h3>Amenities Included:</h3>
                    <ul>
                        {property.aiAmenitiesList.map((amenity, i) => (
                            <li key={i}>{amenity}</li>
                        ))}
                    </ul>
                </>
            )}

            {property.aiFaqPairs && property.aiFaqPairs.length > 0 && (
                <>
                    <h3>Frequently Asked Questions:</h3>
                    {property.aiFaqPairs.map((faq, i) => (
                        <div key={i}>
                            <h4>{faq.question}</h4>
                            <p>{faq.answer}</p>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default AIPropertySummary;
