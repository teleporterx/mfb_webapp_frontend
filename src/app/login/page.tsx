'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const response = await axios.get(`${backendUrl}/v1/auth/check_login`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.message === 'Token is valid') {
            router.push('/dashboard'); // Redirect to dashboard if token is valid
          }
        } catch (error) {
          // If token is invalid or expired, allow the user to login
          console.log('Token is invalid. User needs to log in.');
        }
      }
    };

    checkIfLoggedIn();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous message

    try {
      const response = await axios.post(`${backendUrl}/v1/auth/login`, {
        email,
        password,
      });

      // Store the token in local storage
      localStorage.setItem('access_token', response.data.access_token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          setMessage(error.response.data.detail);
        } else {
          setMessage('An unexpected error occurred during login.');
        }
      } else {
        setMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border border-gray-300 p-2 rounded" 
            required 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border border-gray-300 p-2 rounded" 
            required 
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Login</button>
      </form>
      <p className="mt-4 text-sm text-gray-600 text-center">
        Don't have an account? 
        <Link href="/register" legacyBehavior><a className="text-blue-500">Register</a></Link>
      </p>
      {message && <p className="mt-4 text-sm text-center text-red-500">{message}</p>}
    </div>
  );
};

export default LoginPage;
