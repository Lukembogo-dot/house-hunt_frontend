// src/components/agent/LeadSubscriptionPanel.jsx
// (UPDATED: Added PayPal Support with Toggle)

import React, { useState } from 'react';
import { FaBolt, FaCheckCircle, FaLock, FaSpinner, FaGem, FaCreditCard, FaPaypal } from 'react-icons/fa';
import apiClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
// ✅ Import PayPal Components
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// ✅ Get Client ID from environment
// Make sure to add VITE_PAYPAL_CLIENT_ID=your_client_id to your .env file
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test"; 

const LeadSubscriptionPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pesapal'); // 'pesapal' or 'paypal'

  // Calculate subscription status
  const isSubscribed = user?.isLeadSubscribed;
  const expiryDate = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
  const isActive = isSubscribed && expiryDate && expiryDate > new Date();
  const daysLeft = isActive ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  // --- PESAPAL HANDLER ---
  const handlePesapalSubscribe = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/payments/create-order', {
        orderType: 'subscription',
        amount: 2500, 
        description: `Lead Access Subscription - 30 Days (${user.name})`
      });

      if (data.paymentRedirectUrl) {
        window.location.href = data.paymentRedirectUrl;
      } else {
        alert('Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Error starting payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // --- PAYPAL HANDLERS ---
  const createPayPalOrder = async () => {
      try {
          const { data } = await apiClient.post('/payments/paypal/create-order', {
              orderType: 'subscription',
              amount: 2500,
              description: `Lead Access Subscription - 30 Days`
          });
          return data.id; // Return Order ID to PayPal
      } catch (err) {
          console.error("PayPal Create Error:", err);
          throw err; // Throwing error here will show generic error in PayPal modal
      }
  };

  const onPayPalApprove = async (data) => {
      try {
          setLoading(true);
          const { data: result } = await apiClient.post('/payments/paypal/capture-order', {
              orderID: data.orderID
          });
          
          if (result.status === 'success') {
              alert("Subscription Activated Successfully!");
              window.location.reload(); // Reload to update UI state
          }
      } catch (err) {
          console.error("PayPal Capture Error:", err);
          alert("Payment failed to capture. Please contact support.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full -mr-10 -mt-10"></div>

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <FaBolt className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Get More Leads
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Access high-intent client requests directly.
            </p>
          </div>
        </div>

        {isActive ? (
          // --- ACTIVE STATE ---
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-1">
              <FaCheckCircle /> Subscription Active
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You have access to all incoming leads. 
              <br />
              <strong>Expires in:</strong> {daysLeft} days ({expiryDate.toLocaleDateString()})
            </p>
          </div>
        ) : (
          // --- INACTIVE STATE ---
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <ul className="space-y-2">
                {[
                  "Instant email notifications for new requests",
                  "Access 'HouseHunt Request' leads instantly",
                  "Priority listing in 'Recommended Agents'",
                  "Verified Partner Badge on your profile"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between mt-4 border-b dark:border-gray-700 pb-4 mb-4">
               <div>
                   <p className="text-sm text-gray-500 line-through">Ksh 3,500</p>
                   <p className="text-2xl font-bold text-gray-900 dark:text-white">Ksh 2,500<span className="text-sm font-normal text-gray-500">/mo</span></p>
               </div>
            </div>

            {/* Payment Method Toggle */}
            <div className="flex gap-3 mb-4">
                <button 
                    onClick={() => setPaymentMethod('pesapal')}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 font-semibold transition ${
                        paymentMethod === 'pesapal' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                    }`}
                >
                    <FaCreditCard /> Pesapal / M-Pesa
                </button>
                <button 
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 font-semibold transition ${
                        paymentMethod === 'paypal' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                    }`}
                >
                    <FaPaypal /> PayPal
                </button>
            </div>

            {/* Action Buttons */}
            {paymentMethod === 'pesapal' ? (
                <button
                    onClick={handlePesapalSubscribe}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <><FaGem /> Subscribe with M-Pesa</>}
                </button>
            ) : (
                // ✅ PayPal Button Wrapper
                <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
                    <div className="relative z-0"> {/* z-0 helps prevent overlap issues */}
                        <PayPalButtons 
                            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                            createOrder={createPayPalOrder}
                            onApprove={onPayPalApprove}
                        />
                    </div>
                </PayPalScriptProvider>
            )}
            
            <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1 mt-2">
              <FaLock size={10} /> Secure payment processing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadSubscriptionPanel;