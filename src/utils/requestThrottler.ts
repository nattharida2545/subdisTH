/**
 * Utility to throttle Supabase requests and prevent ERR_INSUFFICIENT_RESOURCES errors
 */

// Default delay between batches of requests (in milliseconds)
const DEFAULT_BATCH_DELAY = 300;

// Default maximum concurrent requests
const DEFAULT_MAX_CONCURRENT = 3;

class RequestThrottler {
  private requestQueue: Array<() => Promise<unknown>> = [];
  private inProgress = 0;
  private maxConcurrent: number;
  private batchDelay: number;
  private processing = false;
  
  constructor(maxConcurrent = DEFAULT_MAX_CONCURRENT, batchDelay = DEFAULT_BATCH_DELAY) {
    this.maxConcurrent = maxConcurrent;
    this.batchDelay = batchDelay;
  }
  
  /**
   * Queue a request to be executed when resources are available
   * @param requestFn Function that returns a promise for the request
   * @returns Promise that resolves with the result of the request
   */
  queue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Wrap the request function to capture its result
      const wrappedRequest = async () => {
        try {
          const result = await requestFn();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        } finally {
          this.inProgress--;
          this.processQueue();
        }
      };
      
      // Add to queue and start processing
      this.requestQueue.push(wrappedRequest);
      this.processQueue();
    });
  }
  
  /**
   * Process the next items in the queue if resources are available
   */
  private processQueue() {
    // If already processing or no requests, do nothing
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    // Process as many requests as we can up to maxConcurrent
    const toProcess = Math.min(
      this.maxConcurrent - this.inProgress,
      this.requestQueue.length
    );
    
    if (toProcess <= 0) {
      this.processing = false;
      return;
    }
    
    // Execute the next batch of requests
    for (let i = 0; i < toProcess; i++) {
      const request = this.requestQueue.shift();
      if (request) {
        this.inProgress++;
        request().catch(() => {
          // Error handling is done in the wrapped function
          // This catch is just to prevent unhandled rejections
        });
      }
    }
    
    // Wait before processing more to prevent overwhelming the browser
    setTimeout(() => {
      this.processing = false;
      if (this.requestQueue.length > 0) {
        this.processQueue();
      }
    }, this.batchDelay);
  }
  
  /**
   * Clear all pending requests
   */
  clear() {
    this.requestQueue = [];
  }
}

// Create a singleton instance for the application
export const requestThrottler = new RequestThrottler();

// Helper function to queue a Supabase request
export function queueSupabaseRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return requestThrottler.queue(requestFn);
}

export default requestThrottler;