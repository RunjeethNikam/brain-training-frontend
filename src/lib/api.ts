import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const DEFAULT_TIMEOUT = 30000; // Increased timeout for mixed content

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      // Mixed content configuration
      withCredentials: false,           // Don't send credentials with HTTP requests
      maxRedirects: 0,                 // Prevent automatic HTTPS redirects
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token and mixed content handling
    this.client.interceptors.request.use(
      (config) => {
        // Ensure we're always using HTTP for mixed content
        if (config.url && config.url.startsWith('https://')) {
          config.url = config.url.replace('https://', 'http://');
        }
        if (config.baseURL && config.baseURL.startsWith('https://')) {
          config.baseURL = config.baseURL.replace('https://', 'http://');
        }

        // Add headers to help with mixed content
        config.headers = {
          ...config.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        };

        // Add auth token if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        console.log('Making request to:', config.baseURL + config.url);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        // Handle mixed content errors specifically
        if (this.isMixedContentError(error)) {
          console.error('Mixed content blocked:', error);
          const mixedContentError = new ApiError(
            'Connection blocked due to security settings. The request was blocked because the page is HTTPS but trying to access HTTP content.',
            0,
            'MIXED_CONTENT_BLOCKED'
          );
          return Promise.reject(mixedContentError);
        }

        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private isMixedContentError(error: any): boolean {
    return (
      error.code === 'ERR_BLOCKED_BY_CLIENT' ||
      error.message?.includes('mixed content') ||
      error.message?.includes('blocked:mixed-content') ||
      error.message?.includes('net::ERR_BLOCKED_BY_CLIENT') ||
      (error.request && !error.response && error.message?.includes('Network Error'))
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.error || data?.message || 'Server error occurred';
      return new ApiError(message, status, data?.code);
    } else if (error.request) {
      // Network error - could be mixed content
      if (this.isMixedContentError(error)) {
        return new ApiError(
          'Connection blocked: Mixed content security restriction. Please contact support.',
          0,
          'MIXED_CONTENT_BLOCKED'
        );
      }
      return new ApiError('Network error - please check your connection', 0);
    } else {
      // Other error
      return new ApiError(error.message || 'An unexpected error occurred', 0);
    }
  }

  // Fallback method using fetch for mixed content scenarios
  private async fetchFallback<T>(
    url: string,
    method: string = 'GET',
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const fullUrl = `${API_BASE_URL}${url}`;
    
    const config: RequestInit = {
      method,
      mode: 'cors',
      credentials: 'omit', // Critical for mixed content
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(fullUrl, config);
      
      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }
    } catch (error: any) {
      console.error('Fetch fallback failed:', error);
      throw new ApiError(error.message || 'Fetch request failed', 0);
    }
  }

  // Generic HTTP methods with fallback
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      if (this.isMixedContentError(error)) {
        console.warn('Axios failed due to mixed content, trying fetch fallback...');
        return this.fetchFallback<T>(url, 'GET', undefined, config?.headers);
      }
      throw error;
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
      if (this.isMixedContentError(error)) {
        console.warn('Axios failed due to mixed content, trying fetch fallback...');
        return this.fetchFallback<T>(url, 'POST', data, config?.headers);
      }
      throw error;
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
      if (this.isMixedContentError(error)) {
        console.warn('Axios failed due to mixed content, trying fetch fallback...');
        return this.fetchFallback<T>(url, 'PUT', data, config?.headers);
      }
      throw error;
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error: any) {
      if (this.isMixedContentError(error)) {
        console.warn('Axios failed due to mixed content, trying fetch fallback...');
        return this.fetchFallback<T>(url, 'DELETE', undefined, config?.headers);
      }
      throw error;
    }
  }

  // Test endpoint to verify backend connection
  public async testConnection(): Promise<{ message: string; timestamp: string }> {
    return this.get('/test/hello');
  }

  // Test leaderboard endpoint
  public async getLeaderboardStats(gameType: string): Promise<any> {
    return this.get(`/leaderboard/stats/${gameType}`);
  }
}

// Create singleton instance
export const apiService = new ApiService();