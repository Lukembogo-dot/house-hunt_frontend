import React from 'react';

const PropertyQuickFacts = ({ property }) => {
    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>

            <table className="w-full">
                <tbody>
                    <tr className="border-b">
                        <th className="text-left py-3 font-medium text-gray-700">Property Type</th>
                        <td className="py-3">{property.type}</td>
                    </tr>
                    <tr className="border-b">
                        <th className="text-left py-3 font-medium text-gray-700">Location</th>
                        <td className="py-3">{property.location.suburb || property.location}, {property.location.city || 'Nairobi'}</td>
                    </tr>
                    <tr className="border-b">
                        <th className="text-left py-3 font-medium text-gray-700">Price</th>
                        <td className="py-3">KSh {property.price.toLocaleString()}/{property.listingType === 'rent' ? 'month' : 'sale'}</td>
                    </tr>
                    {property.bedrooms && (
                        <tr className="border-b">
                            <th className="text-left py-3 font-medium text-gray-700">Bedrooms</th>
                            <td className="py-3">{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</td>
                        </tr>
                    )}
                    {property.bathrooms && (
                        <tr className="border-b">
                            <th className="text-left py-3 font-medium text-gray-700">Bathrooms</th>
                            <td className="py-3">{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</td>
                        </tr>
                    )}
                    <tr>
                        <th className="text-left py-3 font-medium text-gray-700">Availability</th>
                        <td className="py-3">
                            <span className={`px-3 py-1 rounded text-sm font-medium ${property.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {property.status === 'available' ? 'Available Now' : 'Not Available'}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PropertyQuickFacts;
