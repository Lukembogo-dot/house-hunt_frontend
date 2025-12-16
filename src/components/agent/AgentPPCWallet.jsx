// src/components/agent/AgentPPCWallet.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { FaWallet, FaCoins, FaInfoCircle, FaHistory, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AgentPPCWallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [depositAmount, setDepositAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch Wallet Data
    const fetchWalletData = async () => {
        try {
            const { data } = await apiClient.get('/users/profile');
            setBalance(data.walletBalance || 0);

            // Should verify if we have a transaction history endpoint
            // If not, we might need one. For now, we assume balances update correctly.
            // I'll leave transaction history fetching blank or simple if endpoint exists.
            // Currently `getMyTransactions` returns Orders, not WalletTransactions.
            // TODO: Create a route for WalletTransactions specifically? 
            // For now, let's focus on Balance & Deposit.
        } catch (error) {
            console.error("Failed to load wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || depositAmount < 50) return alert("Minimum deposit is 50 KES");

        setProcessing(true);
        try {
            const { data } = await apiClient.post('/payments/create-order', {
                orderType: 'wallet_deposit',
                amount: parseInt(depositAmount),
                description: 'Prepaid Wallet Deposit'
            });

            if (data.paymentRedirectUrl) {
                window.location.href = data.paymentRedirectUrl;
            } else {
                alert('Failed to initiate payment.');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Payment Error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <FaWallet size={150} />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-8">
                {/* Available Balance Section */}
                <div className="flex flex-col justify-center">
                    <h3 className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FaCoins /> Prepaid Wallet Balance
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold tracking-tight">
                            Ksh {loading ? '...' : balance.toLocaleString()}
                        </span>
                        <span className="text-blue-300 text-sm">Available Credits</span>
                    </div>
                    <p className="mt-4 text-blue-100/80 text-sm max-w-sm">
                        This balance is used to pay for <strong>Leads (Calls/WhatsApp)</strong> on your Rental properties.
                        Ensure you have funds to stay reachable.
                    </p>
                </div>

                {/* Deposit Section */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        Top Up Wallet
                    </h4>

                    <form onSubmit={handleDeposit} className="space-y-4">
                        <div>
                            <label className="text-xs text-blue-200 block mb-1">Amount (KES)</label>
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="e.g. 500"
                                min="50"
                                className="w-full bg-white/20 border border-blue-300/30 rounded-lg px-4 py-2.5 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-lg"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {processing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                            {processing ? 'Processing...' : 'Deposit via Mpesa / Card'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Explainer / Info Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col md:flex-row gap-4 text-sm text-blue-200 items-start">
                <div className="flex-1 bg-blue-950/30 p-3 rounded-lg">
                    <strong className="text-white block mb-1">How it works:</strong>
                    <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                        <li>Each time a user clicks <strong>Call</strong> or <strong>WhatsApp</strong> on your Rent listing, a small fee (e.g., 50 Ksh) is deducted.</li>
                        <li>If your balance runs out, your contact info is <strong>hidden</strong> and users are redirected to our Chat.</li>
                        <li><strong>Shadow Agents:</strong> (Unclaimed accounts) are currently exempt from this fee.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AgentPPCWallet;
