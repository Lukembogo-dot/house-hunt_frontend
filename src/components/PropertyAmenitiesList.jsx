import React from 'react';
import { FaCheck } from 'react-icons/fa';

const PropertyAmenitiesList = ({ property }) => {
    const amenities = property.amenities || [];

    if (amenities.length === 0) return null;

    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Property Features & Amenities</h3>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {amenities.map((amenity, index) => (
                    <li key={index} className="flex items-start">
                        <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span className="font-medium">{amenity}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PropertyAmenitiesList;
