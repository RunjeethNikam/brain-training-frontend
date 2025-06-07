import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '@/types';

// API Configuration - Force HTTP for mixed content
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://brain-training-alb-1724717173.us-east-1.elb.amazonaws.com/api';
const DEFAULT_TIMEOUT = 30000; // Increased timeout for mixed content scenarios

class ApiService {
  private client: AxiosInstance;
  private isHttps: boolean;

  constructor() {
    // Detect if we're on HTTPS
    this.isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      // Mixed content configuration
      withCredentials: false,
      maxRedirects: 0,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Force HTTP for mixed content scenarios
        if (config.baseURL && config.baseURL.startsWith('https://')) {
          config.baseURL = config.baseURL.replace('https://', 'http://');
        }
        if (config.url && config.url.startsWith('https://')) {
          config.url = config.url.replace('https://', 'http://');
        }

        // Add headers for mixed content
        if (config.headers) {
          config.headers['Cache-Control'] = 'no-cache';
          config.headers['Pragma'] = 'no-cache';
        }

        // Add auth token
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        console.log('🌐 Making request to:', config.baseURL + (config.url || ''));
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (this.isMixedContentError(error)) {
          console.warn('⚠️ Mixed content blocked by browser, trying fetch fallback...');
          // Don't throw here, let the method handle fallback
          return Promise.reject({ ...error, isMixedContent: true });
        }
        
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private isMixedContentError(error: any): boolean {
    return (
      error.code === 'ERR_BLOCKED_BY_CLIENT' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('mixed content') ||
      error.message?.includes('blocked:mixed-content') ||
      error.message?.includes('net::ERR_BLOCKED_BY_CLIENT') ||
      error.message?.includes('Network Error') ||
      (error.request && !error.response && this.isHttps)
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.error || data?.message || 'Server error occurred';
      return new ApiError(message, status, data?.code);
    } else if (error.request) {
      if (this.isMixedContentError(error)) {
        return new ApiError(
          'Connection blocked due to mixed content. Using fallback...',
          0,
          'MIXED_CONTENT'
        );
      }
      return new ApiError('Network error - please check your connection', 0);
    } else {
      return new ApiError(error.message || 'An unexpected error occurred', 0);
    }
  }

  // Fetch fallback for mixed content scenarios
  private async fetchFallback<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    axiosHeaders?: any
  ): Promise<T> {
    // Ensure HTTP URL
    let baseUrl = API_BASE_URL;
    if (baseUrl.startsWith('https://')) {
      baseUrl = baseUrl.replace('https://', 'http://');
    }
    
    const url = `${baseUrl}${endpoint}`;
    
    // Convert axios headers to plain object
    const plainHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Extract headers from axios config if provided
    if (axiosHeaders) {
      // Handle both AxiosHeaders object and plain object
      if (typeof axiosHeaders === 'object') {
        Object.keys(axiosHeaders).forEach(key => {
          if (typeof axiosHeaders[key] === 'string') {
            plainHeaders[key] = axiosHeaders[key];
          }
        });
      }
    }

    const config: RequestInit = {
      method,
      mode: 'cors',
      credentials: 'omit', // Critical for mixed content
      cache: 'no-cache',
      headers: plainHeaders,
    };

    // Add request body for non-GET methods
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    // Add auth token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        plainHeaders.Authorization = `Bearer ${token}`;
      }
    }

    try {
      console.log('🔄 Fetch fallback to:', url);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return text as unknown as T;
      }
      
    } catch (error: any) {
      console.error('❌ Fetch fallback failed:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle fetch-specific errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError(
          'Unable to connect to server. Please check if the backend is running and CORS is configured.',
          0,
          'FETCH_ERROR'
        );
      }
      
      throw new ApiError(error.message || 'Request failed', 0);
    }
  }

  // HTTP Methods with automatic fallback
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      if (error.isMixedContent || this.isMixedContentError(error)) {
        console.log('🔄 Axios failed, trying fetch fallback for GET...');
        return this.fetchFallback<T>(url, 'GET', undefined, config?.headers);
      }
      throw this.handleError(error);
    }
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      if (error.isMixedContent || this.isMixedContentError(error)) {
        console.log('🔄 Axios failed, trying fetch fallback for POST...');
        return this.fetchFallback<T>(url, 'POST', data, config?.headers);
      }
      throw this.handleError(error);
    }
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      if (error.isMixedContent || this.isMixedContentError(error)) {
        console.log('🔄 Axios failed, trying fetch fallback for PUT...');
        return this.fetchFallback<T>(url, 'PUT', data, config?.headers);
      }
      throw this.handleError(error);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error: any) {
      if (error.isMixedContent || this.isMixedContentError(error)) {
        console.log('🔄 Axios failed, trying fetch fallback for DELETE...');
        return this.fetchFallback<T>(url, 'DELETE', undefined, config?.headers);
      }
      throw this.handleError(error);
    }
  }

  // Debug method to test connection
  public async testConnection(): Promise<{ message: string; timestamp: string }> {
    console.log('🧪 Testing connection...');
    console.log('Frontend protocol:', typeof window !== 'undefined' ? window.location.protocol : 'unknown');
    console.log('API Base URL:', API_BASE_URL);
    
    try {
      return await this.get('/health');
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }

  // Test leaderboard endpoint
  public async getLeaderboardStats(gameType: string): Promise<any> {
    return this.get(`/leaderboard/stats/${gameType}`);
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export additional utility for debugging
export const debugApi = {
  testMixedContent: async () => {
    console.log('🔍 Mixed content debug info:');
    console.log('Current protocol:', window.location.protocol);
    console.log('API URL:', API_BASE_URL);
    console.log('Is HTTPS frontend:', window.location.protocol === 'https:');
    console.log('Is HTTP backend:', API_BASE_URL.startsWith('http://'));
    
    try {
      const result = await apiService.testConnection();
      console.log('✅ Connection successful:', result);
      return result;
    } catch (error) {
      console.log('❌ Connection failed:', error);
      throw error;
    }
  }
};