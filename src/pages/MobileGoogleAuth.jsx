// src/pages/MobileGoogleAuth.jsx
// Lightweight page for mobile app Google Sign-In via Chrome Custom Tab.
// The mobile app opens this page, the user clicks Google Sign-In,
// and on success we redirect back to the app via deep link.

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import apiClient from "../api/axios";

const MOBILE_SCHEME = "househuntkenya";

const MobileGoogleAuth = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse) => {
        setError("");
        setLoading(true);
        try {
            const { credential } = credentialResponse;

            // Call the same backend endpoint the website uses
            const response = await apiClient.post(
                "/auth/google",
                { token: credential },
                { withCredentials: true }
            );

            const userData = response.data;

            // Build deep link URL with auth data
            const params = new URLSearchParams({
                token: userData.token || "",
                refreshToken: userData.refreshToken || "",
                _id: userData._id || "",
                name: userData.name || "",
                email: userData.email || "",
                role: userData.role || "user",
                profilePicture: userData.profilePicture || "",
                isVerified: String(userData.isVerified || false),
            });

            // Redirect back to the mobile app with auth data
            window.location.href = `${MOBILE_SCHEME}://auth-callback?${params.toString()}`;
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError(
                err.response?.data?.message || "Google sign-in failed. Please try again."
            );
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9fafb",
                fontFamily:
                    "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                padding: "24px",
            }}
        >
            {/* Logo & Branding */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <img
                    src="/logo.png"
                    alt="HouseHunt Kenya"
                    style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        marginBottom: "16px",
                    }}
                    onError={(e) => {
                        e.target.style.display = "none";
                    }}
                />
                <h1
                    style={{
                        fontSize: "24px",
                        fontWeight: "800",
                        color: "#111827",
                        margin: "0 0 8px 0",
                    }}
                >
                    HouseHunt Kenya
                </h1>
                <p
                    style={{
                        fontSize: "14px",
                        color: "#6B7280",
                        margin: 0,
                    }}
                >
                    Sign in to continue to your account
                </p>
            </div>

            {/* Google Sign-In Button */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "32px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "center",
                }}
            >
                {loading ? (
                    <div style={{ padding: "20px" }}>
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                border: "3px solid #E5E7EB",
                                borderTopColor: "#2563EB",
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                                margin: "0 auto 12px",
                            }}
                        />
                        <p style={{ color: "#6B7280", fontSize: "14px" }}>
                            Signing you in...
                        </p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError("Google Sign In Failed. Please try again.")}
                                theme="filled_blue"
                                shape="pill"
                                size="large"
                                width="350"
                                text="continue_with"
                            />
                        </div>

                        {error && (
                            <div
                                style={{
                                    marginTop: "16px",
                                    padding: "12px 16px",
                                    backgroundColor: "#FEF2F2",
                                    border: "1px solid #FECACA",
                                    borderRadius: "8px",
                                    color: "#DC2626",
                                    fontSize: "13px",
                                    textAlign: "center",
                                }}
                            >
                                {error}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <p
                style={{
                    marginTop: "32px",
                    fontSize: "12px",
                    color: "#9CA3AF",
                    textAlign: "center",
                }}
            >
                &copy; {new Date().getFullYear()} HouseHunt Kenya. All rights reserved.
            </p>
        </div>
    );
};

export default MobileGoogleAuth;
