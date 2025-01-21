'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Scheme, FundSchemesResponse } from '../types/FundScheme';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const Dashboard = () => {
  const [fundFamilies, setFundFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [error, setError] = useState('');
  const [openEndedSchemes, setOpenEndedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [units, setUnits] = useState<number>(1); // State for units
  const [buyStatus, setBuyStatus] = useState<string>(''); // To show purchase status message
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement | null>(null);

  const navigateToPortfolio = () => {
    router.push('/portfolio');
  };

  const handleLogout = () => {
    // Remove the token from localStorage and redirect to login page
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  useEffect(() => {
    const fetchFundFamilies = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You are not logged in.');
        router.push('/login');
        return;
      }

      try {
        const checkLoginResponse = await axios.get(`${backendUrl}/v1/auth/check_login`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (checkLoginResponse.data.message === 'Token is valid') {
          const fundFamiliesResponse = await axios.get(`${backendUrl}/v1/fund_families`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (fundFamiliesResponse.data.status === 'success') {
            setFundFamilies(fundFamiliesResponse.data.fund_families);
          }
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
    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setError('You are not logged in.');
      router.push('/login');
      return;
    }

    if (!selectedFamily) {
      setError('Please select a fund family first.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<FundSchemesResponse>(
        `${backendUrl}/v1/fund_schemes/latest/open_ended`,
        { fund_family: selectedFamily },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data) {
        setOpenEndedSchemes(response.data.data);
      } else {
        setError('Failed to fetch schemes data');
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
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedScheme(null);
    setBuyStatus('');
  };

  const handleBuy = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !selectedScheme) {
      setBuyStatus('Please log in and select a scheme.');
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/v1/buy`, 
        {
          Scheme_Code: selectedScheme.Scheme_Code,
          Scheme_Name: selectedScheme.Scheme_Name,
          Date: selectedScheme.Date,
          Scheme_Category: selectedScheme.Scheme_Category,
          Mutual_Fund_Family: selectedScheme.Mutual_Fund_Family,
          units,
          nav: selectedScheme.Net_Asset_Value,
          ISIN_Div_Payout_ISIN_Growth: selectedScheme.ISIN_Div_Payout_ISIN_Growth,
          ISIN_Div_Reinvestment: selectedScheme.ISIN_Div_Reinvestment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBuyStatus(response.data.message || 'Purchase successful!');
    } catch (error) {
      setBuyStatus('An error occurred while purchasing.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closePopup();
      }
    };

    if (isPopupOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isPopupOpen]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">Mutual Fund Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={navigateToPortfolio}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Portfolio
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mt-6">
          <label htmlFor="fund-family" className="block text-sm font-medium text-gray-700 mb-2">
            Select Fund Family:
          </label>
          <select
            id="fund-family"
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a fund family</option>
            {fundFamilies.map((family) => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <button
            onClick={fetchOpenEndedSchemes}
            disabled={loading || !selectedFamily}
            className={`w-full px-4 py-2 rounded font-medium text-white ${
              loading || !selectedFamily
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Loading...' : 'Fetch Open-Ended Schemes'}
          </button>
        </div>

        {openEndedSchemes.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Open-Ended Schemes</h3>
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheme Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheme Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {openEndedSchemes.map((scheme) => (
                      <tr 
                        key={scheme.Scheme_Code}
                        onClick={() => handleRowClick(scheme)}
                        className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {scheme.Scheme_Code}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {scheme.Scheme_Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {scheme.Date}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {scheme.Scheme_Category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Popup Modal */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              ref={popupRef}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <button 
                onClick={closePopup}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
              >
                ×
              </button>
              {selectedScheme && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Scheme Details</h3>
                  <p><strong>Scheme Name:</strong> {selectedScheme.Scheme_Name}</p>
                  <p><strong>Date:</strong> {selectedScheme.Date}</p>
                  <p><strong>Category:</strong> {selectedScheme.Scheme_Category}</p>
                  <p><strong>NAV:</strong> ₹{Number(selectedScheme.Net_Asset_Value).toFixed(4)}</p>
                  <p><strong>ISIN (Growth):</strong> {selectedScheme.ISIN_Div_Payout_ISIN_Growth}</p>
                  <p><strong>ISIN (Reinvestment):</strong> {selectedScheme.ISIN_Div_Reinvestment}</p>

                  {/* Counter */}
                  <div className="mt-4">
                    <label htmlFor="units" className="block text-sm font-medium text-gray-700">Units</label>
                    <input
                      type="number"
                      id="units"
                      value={units}
                      onChange={(e) => setUnits(Number(e.target.value))}
                      min="1"
                      className="w-full border border-gray-300 p-2 rounded mt-2"
                    />
                  </div>

                  {/* Buy Button */}
                  <div className="mt-4">
                    <button 
                      onClick={handleBuy}
                      className="w-full px-4 py-2 rounded font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Buy
                    </button>
                  </div>

                  {/* Buy Status */}
                  {buyStatus && (
                    <div className="mt-4 text-sm text-center text-gray-600">
                      {buyStatus}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
