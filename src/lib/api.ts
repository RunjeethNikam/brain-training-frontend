import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const DEFAULT_TIMEOUT = 10000;

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
      maxRedirects: 0,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.error || data?.message || 'Server error occurred';
      return new ApiError(message, status, data?.code);
    } else if (error.request) {
      // Network error
      return new ApiError('Network error - please check your connection', 0);
    } else {
      // Other error
      return new ApiError(error.message || 'An unexpected error occurred', 0);
    }
  }

  // Generic HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
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