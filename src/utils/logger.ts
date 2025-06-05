
/**
 * Utility for controlling log output in the application
 * Allows for controlling which components/modules log to the console
 */

// Set the application-wide log level
export enum LogLevel {
  NONE = 0,   // No logs at all
  ERROR = 1,  // Only errors
  WARN = 2,   // Errors and warnings
  INFO = 3,   // Normal information
  DEBUG = 4,  // Detailed information for debugging
  VERBOSE = 5 // Everything, including repeated component lifecycle logs
}

// Current log level - can be changed based on environment
// In production, you would typically use LogLevel.ERROR or LogLevel.WARN
const currentLogLevel = process.env.NODE_ENV === 'production' 
  ? LogLevel.ERROR 
  : (localStorage.getItem('logLevel') 
      ? Number(localStorage.getItem('logLevel')) 
      : LogLevel.WARN); // Changed from INFO to WARN to reduce logging

// Allowed modules to log, empty means allow all
// Add module names to this array to allow them to log, e.g. ['queue', 'patient']
// An empty array means allow all modules to log based on log level
const allowedModules: string[] = [];

// Define the logger interface
export interface ILogger {
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
  verbose: (message: string, ...args: any[]) => void;
}

/**
 * Creates a logger instance for a specific module
 * @param module The module name (e.g., 'queue', 'patient', etc.)
 * @returns A logger instance
 */
export function createLogger(module: string): ILogger {
  // Check if this module should log
  const shouldLog = allowedModules.length === 0 || allowedModules.includes(module);
  
  return {
    error: (message: string, ...args: any[]) => {
      if (shouldLog && currentLogLevel >= LogLevel.ERROR) {
        console.error(`[${module}] ${message}`, ...args);
      }
    },
    warn: (message: string, ...args: any[]) => {
      if (shouldLog && currentLogLevel >= LogLevel.WARN) {
        console.warn(`[${module}] ${message}`, ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      if (shouldLog && currentLogLevel >= LogLevel.INFO) {
        console.info(`[${module}] ${message}`, ...args);
      }
    },
    debug: (message: string, ...args: any[]) => {
      if (shouldLog && currentLogLevel >= LogLevel.DEBUG) {
        console.debug(`[${module}] ${message}`, ...args);
      }
    },
    verbose: (message: string, ...args: any[]) => {
      if (shouldLog && currentLogLevel >= LogLevel.VERBOSE) {
        console.log(`[${module}] ${message}`, ...args);
      }
    }
  };
}

/**
 * Sets the current log level
 * @param level The log level to set
 */
export function setLogLevel(level: LogLevel): void {
  localStorage.setItem('logLevel', level.toString());
  // We reload to take effect
  window.location.reload();
}

/**
 * Gets the current log level
 * @returns The current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

// Export a default logger for quick use
export default createLogger('app');

