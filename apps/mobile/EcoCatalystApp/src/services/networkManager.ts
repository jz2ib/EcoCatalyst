import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import errorHandler, { ErrorType, ErrorSeverity } from './errorHandling';

interface PendingRequest {
  id: string;
  execute: () => Promise<any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
}

export enum NetworkEvent {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  PENDING_REQUESTS_CHANGED = 'PENDING_REQUESTS_CHANGED',
}

class NetworkManager {
  private static instance: NetworkManager;
  private pendingRequests: PendingRequest[] = [];
  private networkStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    details: null,
  };
  private listeners: Map<NetworkEvent, Set<(data?: any) => void>> = new Map();
  private unsubscribe: (() => void) | null = null;
  private isProcessingQueue = false;
  private isInitialized = false;
  
  private static PENDING_REQUESTS_KEY = 'ecocatalyst_pending_requests';
  
  private static MAX_REQUEST_AGE = 24 * 60 * 60 * 1000;
  
  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }
  
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadPendingRequests();
      
      this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);
      
      const state = await NetInfo.fetch();
      this.handleNetworkChange(state);
      
      this.isInitialized = true;
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : String(error),
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        { method: 'initialize' }
      );
    }
  }
  
  private handleNetworkChange = (state: NetInfoState): void => {
    const previousStatus = { ...this.networkStatus };
    
    this.networkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details,
    };
    
    if (previousStatus.isConnected !== this.networkStatus.isConnected) {
      if (this.networkStatus.isConnected) {
        this.emit(NetworkEvent.CONNECTED, this.networkStatus);
        this.processPendingRequests();
      } else {
        this.emit(NetworkEvent.DISCONNECTED, this.networkStatus);
      }
    }
  };
  
  public addEventListener(event: NetworkEvent, listener: (data?: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener);
    
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }
  
  private emit(event: NetworkEvent, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in network event listener for ${event}:`, error);
        }
      });
    }
  }
  
  public getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }
  
  public isConnected(): boolean {
    return this.networkStatus.isConnected && this.networkStatus.isInternetReachable !== false;
  }
  
  public async enqueueRequest(
    id: string,
    execute: () => Promise<any>,
    maxRetries: number = 3
  ): Promise<void> {
    const request: PendingRequest = {
      id,
      execute,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };
    
    this.pendingRequests.push(request);
    await this.savePendingRequests();
    
    this.emit(NetworkEvent.PENDING_REQUESTS_CHANGED, this.pendingRequests.length);
    
    if (this.isConnected()) {
      this.processPendingRequests();
    }
  }
  
  private async processPendingRequests(): Promise<void> {
    if (this.isProcessingQueue || !this.isConnected() || this.pendingRequests.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      const requests = [...this.pendingRequests];
      
      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        
        if (Date.now() - request.timestamp > NetworkManager.MAX_REQUEST_AGE) {
          this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
          continue;
        }
        
        try {
          await request.execute();
          
          this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
        } catch (error) {
          const index = this.pendingRequests.findIndex(r => r.id === request.id);
          if (index !== -1) {
            this.pendingRequests[index].retryCount++;
            
            if (this.pendingRequests[index].retryCount > request.maxRetries) {
              this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
            }
          }
          
          console.error(`Failed to execute pending request ${request.id}:`, error);
        }
      }
      
      await this.savePendingRequests();
      this.emit(NetworkEvent.PENDING_REQUESTS_CHANGED, this.pendingRequests.length);
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : String(error),
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        { method: 'processPendingRequests' }
      );
    } finally {
      this.isProcessingQueue = false;
    }
  }
  
  public getPendingRequestCount(): number {
    return this.pendingRequests.length;
  }
  
  private async savePendingRequests(): Promise<void> {
    try {
      const serializable = this.pendingRequests.map(({ id, timestamp, retryCount, maxRetries }) => ({
        id,
        timestamp,
        retryCount,
        maxRetries,
      }));
      
      await AsyncStorage.setItem(
        NetworkManager.PENDING_REQUESTS_KEY,
        JSON.stringify(serializable)
      );
    } catch (error) {
      console.error('Failed to save pending requests:', error);
    }
  }
  
  private async loadPendingRequests(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NetworkManager.PENDING_REQUESTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        
        this.pendingRequests = parsed
          .filter((request: any) => {
            return Date.now() - request.timestamp <= NetworkManager.MAX_REQUEST_AGE;
          })
          .map((request: any) => ({
            ...request,
            execute: async () => {}, // Placeholder function, these can't be restored
          }));
        
        
        this.emit(NetworkEvent.PENDING_REQUESTS_CHANGED, this.pendingRequests.length);
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  }
  
  public cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    this.listeners.clear();
    this.isInitialized = false;
  }
}

export const networkManager = NetworkManager.getInstance();

export default networkManager;
