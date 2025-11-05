// src/pages/AgentPublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { FaWhatsapp } from 'react-icons/fa';

const AgentPublicProfile = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        // 1. Get the agent's public info
        const agentRes = await apiClient.get(`/users/${agentId}/public`);
        setAgent(agentRes.data);

        // 2. Get all properties for that agent
        const propertiesRes = await apiClient.get(`/properties/by-agent/${agentId}`);
        setProperties(propertiesRes.data);

      } catch (error) {
        console.error("Error fetching agent data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
        <p>Agent not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Agent Header */}
      <section className="bg-white dark:bg-gray-800 p-8 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-6">
          <img 
            src={agent.profilePicture} 
            alt={agent.name} 
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold dark:text-white">{agent.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Registered Agent</p>
            {agent.whatsappNumber && (
              <a
                href={`https://wa.me/${agent.whatsappNumber.replace(/\+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <FaWhatsapp size={20} />
                <span>Contact Agent</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Agent's Listings */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-10">
            Listings from {agent.name}
          </h2>
          {properties.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              This agent has no active listings.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AgentPublicProfile;