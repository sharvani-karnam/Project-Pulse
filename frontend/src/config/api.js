// Central API configuration for ProjectPulse
// In production (e.g. Vercel), set VITE_API_BASE_URL in your environment variables.
// In local development, it defaults to 'http://localhost:5000'.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
