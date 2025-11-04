import React, { useState } from 'react';
import type { User } from '../types';
import { UserType } from '../types';
import { UserIcon, BuildingStorefrontIcon, ArrowRightIcon, AtSymbolIcon, KeyIcon } from './Icons';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState<UserType>(UserType.Consumer);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (authMode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Simulate successful login/signup
    onLogin({
      id: `user-${Date.now()}`,
      email,
      userType: activeTab,
      isVerified: true, // Auto-verify for demo
    });
  };

  const toggleAuthMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const TabButton = ({ type, label, icon }: { type: UserType, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex-1 py-3 px-4 text-center font-semibold flex items-center justify-center space-x-2 rounded-t-lg transition-colors duration-200 ${
        activeTab === type
          ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const isSigningUp = authMode === 'signup';

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="flex">
        <TabButton type={UserType.Consumer} label="I Need a Repair" icon={<UserIcon className="h-5 w-5"/>} />
        <TabButton type={UserType.Provider} label="I'm a Provider" icon={<BuildingStorefrontIcon className="h-5 w-5"/>} />
      </div>
      <div className="bg-white p-8 rounded-b-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
          {isSigningUp ? 'Create Your Account' : `Welcome ${activeTab === UserType.Consumer ? 'Back' : 'Provider'}!`}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {isSigningUp ? `Sign up to get started as a ${activeTab}.` : 'Sign in to continue to your dashboard.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <AtSymbolIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
              />
            </div>
          </div>
          {isSigningUp && (
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                 </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-200 transform hover:scale-105"
            >
              {isSigningUp ? 'Sign Up' : 'Sign In'} <ArrowRightIcon className="ml-2 h-5 w-5"/>
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a href="#" onClick={toggleAuthMode} className="font-medium text-indigo-600 hover:text-indigo-500">
            {isSigningUp ? 'Sign In' : 'Sign Up'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;