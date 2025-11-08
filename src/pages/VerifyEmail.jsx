import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the 'login' function from context
  const [status, setStatus] = useState('Verifying...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('Error');
        setError('No verification token provided.');
        return;
      }

      try {
        // The backend route handles verification AND logs the user in
        const { data } = await apiClient.get(`/auth/verify-email/${token}`);
        
        setStatus('Success!');
        login(data); // Log the user in on the frontend
        
        // Redirect to profile after a short delay
        setTimeout(() => navigate('/profile'), 2000); 

      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        setStatus('Error');
      }
    };
    
    verify();
  }, [token, navigate, login]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4 text-center">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-xl max-w-md w-full">
        {status === 'Verifying...' && (
          <FaSpinner className="animate-spin text-5xl text-blue-500 mx-auto mb-6" />
        )}
        {status === 'Success!' && (
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-6" />
        )}
        {status === 'Error' && (
          <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-6" />
        )}

        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          {status === 'Verifying...' && 'Verifying Your Account'}
          {status === 'Success!' && 'Verification Successful!'}
          {status === 'Error' && 'Verification Failed'}
        </h1>
        
        {status === 'Verifying...' && (
          <p className="text-gray-600 dark:text-gray-400">Please wait, this won't take long...</p>
        )}
        {status === 'Success!' && (
          <p className="text-gray-600 dark:text-gray-400">You are now logged in. Redirecting you to your profile...</p>
        )}
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;