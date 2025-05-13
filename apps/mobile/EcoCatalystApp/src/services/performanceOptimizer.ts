import { InteractionManager } from 'react-native';

/**
 * Service for optimizing app performance
 */
class PerformanceOptimizer {
  /**
   * Run a task after interactions are complete to avoid UI jank
   * @param task The task to run
   * @param timeout Optional timeout to run the task anyway
   * @returns A promise that resolves when the task is complete
   */
  runAfterInteractions<T>(task: () => Promise<T> | T, timeout: number = 2000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        try {
          const result = task();
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      }, timeout);
      
      InteractionManager.runAfterInteractions(() => {
        clearTimeout(timeoutId);
        try {
          const result = task();
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Debounce a function to avoid excessive calls
   * @param func The function to debounce
   * @param wait The time to wait in milliseconds
   * @param immediate Whether to call the function immediately
   * @returns The debounced function
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 300,
    immediate: boolean = false
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function(this: any, ...args: Parameters<T>): void {
      const context = this;
      
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
  }
  
  /**
   * Throttle a function to limit how often it can be called
   * @param func The function to throttle
   * @param limit The time limit in milliseconds
   * @returns The throttled function
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 300
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    let lastFunc: NodeJS.Timeout | null = null;
    let lastRan: number = 0;
    
    return function(this: any, ...args: Parameters<T>): void {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        lastRan = Date.now();
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      } else {
        if (lastFunc) clearTimeout(lastFunc);
        
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }
  
  /**
   * Batch multiple updates into a single update
   * @param callback The callback to run with the batched items
   * @param delay The delay before processing the batch
   * @returns A function that adds items to the batch
   */
  createBatcher<T, R>(
    callback: (items: T[]) => Promise<R> | R,
    delay: number = 300
  ): (item: T) => void {
    let batch: T[] = [];
    let timeoutId: NodeJS.Timeout | null = null;
    
    const processBatch = async () => {
      const currentBatch = [...batch];
      batch = [];
      timeoutId = null;
      
      try {
        await callback(currentBatch);
      } catch (error) {
        console.error('Error processing batch:', error);
      }
    };
    
    return (item: T) => {
      batch.push(item);
      
      if (!timeoutId) {
        timeoutId = setTimeout(processBatch, delay);
      }
    };
  }
  
  /**
   * Memoize a function to cache its results
   * @param func The function to memoize
   * @param resolver Optional function to resolve the cache key
   * @returns The memoized function
   */
  memoize<T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ): (...args: Parameters<T>) => ReturnType<T> {
    const cache = new Map<string, ReturnType<T>>();
    
    return function(this: any, ...args: Parameters<T>): ReturnType<T> {
      const key = resolver ? resolver(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      
      return result;
    };
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

export default performanceOptimizer;
