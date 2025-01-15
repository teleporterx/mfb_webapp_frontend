'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Scheme, FundSchemesResponse } from '../types/FundScheme'; // Import the type we just created

const Dashboard = () => {
  const [fundFamilies, setFundFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [error, setError] = useState('');
  const [openEndedSchemes, setOpenEndedSchemes] = useState<Scheme[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFundFamilies = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You are not logged in.');
        router.push('/login');
        return;
      }

      try {
        const checkLoginResponse = await axios.get('http://localhost:8000/v1/auth/check_login', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (checkLoginResponse.data.message === 'Token is valid') {
          const fundFamiliesResponse = await axios.get('http://localhost:8000/v1/fund_families', {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFundFamilies(fundFamiliesResponse.data.fund_families);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            const errorDetail = err.response.data.detail;
            if (errorDetail === 'Token has expired.') {
              setError('Your session has expired. Please log in again.');
              router.push('/login');
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

    fetchFundFamilies();
  }, [router]);

  const fetchOpenEndedSchemes = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setError('You are not logged in.');
      router.push('/login');
      return;
    }

    if (!selectedFamily) {
      setError('Please select a fund family first.');
      return;
    }

    try {
      const response = await axios.get<FundSchemesResponse>('http://localhost:8000/v1/fund_schemes/latest/open_ended', 
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { fund_family: selectedFamily }  // Pass the selected family as a query parameter
        }
      );

      setOpenEndedSchemes(response.data.data); 
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorDetail = err.response.data.detail;
          if (errorDetail === 'Token has expired.') {
            setError('Your session has expired. Please log in again.');
            router.push('/login');
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

        <div className="mt-4">
          <button
            onClick={fetchOpenEndedSchemes}
            className="bg-blue-500 text-white p-2 rounded mt-4 w-full"
          >
            Fetch Open-Ended Schemes
          </button>
        </div>

        {openEndedSchemes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Open-Ended Schemes:</h3>
            <table className="min-w-full table-auto border-collapse border border-gray-200 rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Scheme Name</th>
                  <th className="border border-gray-300 px-4 py-2">Net Asset Value</th>
                  <th className="border border-gray-300 px-4 py-2">Scheme Type</th>
                  <th className="border border-gray-300 px-4 py-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {openEndedSchemes.map((scheme, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-2">{scheme.Scheme_Name}</td>
                    <td className="border border-gray-300 px-4 py-2">{scheme.Net_Asset_Value}</td>
                    <td className="border border-gray-300 px-4 py-2">{scheme.Scheme_Type}</td>
                    <td className="border border-gray-300 px-4 py-2">{scheme.Scheme_Category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
