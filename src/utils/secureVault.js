import CryptoJS from 'crypto-js';

// The "Key" should ideally be the user's password or a specific "Vault PIN" they create.
// For this implementation, we will use a derived key from their User ID + a local secret.
// NOTE: For true "Zero Knowledge", the user must enter a PIN every time they unlock this.
const VAULT_SECRET = import.meta.env.VITE_VAULT_SECRET || 'my-super-secret-frontend-key';

export const encryptData = (data, userPin) => {
  if (!data) return null;
  // We use the user's PIN + App Secret to create a unique lock
  const key = VAULT_SECRET + userPin; 
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const decryptData = (cipherText, userPin) => {
  if (!cipherText) return null;
  try {
    const key = VAULT_SECRET + userPin;
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null; // Decryption failed (Wrong PIN)
  }
};