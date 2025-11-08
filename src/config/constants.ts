// Application URLs

const PRODUCTION_URL = "https://subdis-th-que.netlify.app";

// Determine if we're in production based on environment
const isProduction = import.meta.env.PROD;

// Export the base URL to be used throughout the application
export const BASE_URL = PRODUCTION_URL;

// Export other application constants
export const APP_NAME = "QueueConnect Pharmacy";
