"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scheme } from "../types/FundScheme"; // Import the Scheme type

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState<Scheme[]>([]); // Use the Scheme type for portfolio
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchPortfolio = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/v1/portfolio", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setPortfolio(data.portfolio);
        } else {
          setError(data.message || "Failed to fetch portfolio.");
        }
      } catch (err) {
        setError("An error occurred while fetching portfolio data.");
      }
    };

    fetchPortfolio();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Portfolio</h1>
          <div className="flex gap-4">
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
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
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {portfolio.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Scheme Code</th>
                <th className="border border-gray-300 px-4 py-2">Scheme Name</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
                <th className="border border-gray-300 px-4 py-2">Units</th>
                <th className="border border-gray-300 px-4 py-2">NAV</th>
                <th className="border border-gray-300 px-4 py-2">Total Cost</th>
                <th className="border border-gray-300 px-4 py-2">Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => (
                <tr key={item.Scheme_Code}>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.Scheme_Code}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.Scheme_Name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.Scheme_Category}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {/* Assuming "units" exists but not in the Scheme type. */}
                    {"units" in item ? (item as any).units : "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.Net_Asset_Value.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {("total_cost" in item ? (item as any).total_cost : 0).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(item.Date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !error && <p className="text-center">No portfolio data available.</p>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
