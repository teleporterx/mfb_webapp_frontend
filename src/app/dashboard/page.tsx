'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const [fundFamilies, setFundFamilies] = useState<string[]>([]); // List of fund families
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const validateTokenAndFetchData = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You are not logged in.');
        router.push('/login'); // Redirect to login if no token is found
        return;
      }

      try {
        // Validate token
        const checkLoginResponse = await axios.get('http://localhost:8000/v1/auth/check_login', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If token is valid, proceed to fetch fund families
        if (checkLoginResponse.data.message === 'Token is valid') {
          const fundFamiliesResponse = await axios.get('http://localhost:8000/v1/fund_families', {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFundFamilies(fundFamiliesResponse.data.fund_families); // Update fund families
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            const errorDetail = err.response.data.detail;
            if (errorDetail === 'Token has expired.') {
              setError('Your session has expired. Please log in again.');
              router.push('/login'); // Redirect to login if token has expired
            } else {
              setError(errorDetail);
            }
          } else {
            setError('An unexpected error occurred.');
          }
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };

    validateTokenAndFetchData();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Dashboard</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        
        <div className="mt-6">
          <label htmlFor="fund-family" className="block text-sm font-medium text-gray-700 text-center">Select Fund Family House:</label>
          <select
            id="fund-family"
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mt-2"
          >
            <option value="" disabled>Select a fund family</option>
            {fundFamilies.map((family, index) => (
              <option key={index} value={family}>{family}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
