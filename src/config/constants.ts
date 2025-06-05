
// Application URLs
const DEVELOPMENT_URL = 'https://subdisth-que.lovable.app';
const PRODUCTION_URL = 'https://subdisth-que.netlify.app';

// Determine if we're in production based on environment
const isProduction = import.meta.env.PROD;

// Export the base URL to be used throughout the application
export const BASE_URL = isProduction ? PRODUCTION_URL : DEVELOPMENT_URL;

// Export other application constants
export const APP_NAME = 'QueueConnect Pharmacy';
