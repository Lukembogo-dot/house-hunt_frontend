import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTimes } from 'react-icons/fa';

export default function PreviewBanner() {
  const { previewRole, stopPreview } = useAuth();

  // This component should only be rendered if previewRole is active,
  // but we'll double-check here.
  if (!previewRole) {
    return null;
  }

  // Capitalize the first letter of the role
  const roleName = previewRole.charAt(0).toUpperCase() + previewRole.slice(1);

  return (
    <div className="sticky top-0 z-[100] flex items-center justify-center space-x-4 bg-yellow-400 p-2 text-center text-sm font-semibold text-gray-900 shadow-lg">
      <span>
        You are currently previewing the site as a{' '}
        <span className="font-extrabold">{roleName}</span>.
      </span>
      <button
        onClick={stopPreview}
        className="flex items-center space-x-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs text-white transition hover:bg-gray-700"
      >
        <FaTimes />
        <span>Exit Preview</span>
      </button>
    </div>
  );
}