'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { ApiError } from '@/types';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [leaderboardResult, setLeaderboardResult] = useState<string>('');

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...');
    
    try {
      const response = await apiService.testConnection();
      setTestResult(`✅ Success: ${response.message} at ${response.timestamp}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setTestResult(`❌ Error: ${error.message} (Status: ${error.status})`);
      } else {
        setTestResult(`❌ Unexpected error: ${error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testLeaderboard = async () => {
    setLoading(true);
    setLeaderboardResult('Testing leaderboard...');
    
    try {
      const response = await apiService.getLeaderboardStats('MEMORY_FLASH');
      setLeaderboardResult(`✅ Leaderboard: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setLeaderboardResult(`❌ Error: ${error.message} (Status: ${error.status})`);
      } else {
        setLeaderboardResult(`❌ Unexpected error: ${error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Backend Connection Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Backend Connection</h2>
          
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test /api/test/hello'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Test Leaderboard API</h2>
          
          <button
            onClick={testLeaderboard}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test /api/leaderboard/stats/MEMORY_FLASH'}
          </button>
          
          {leaderboardResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{leaderboardResult}</pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-white hover:text-blue-200 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}