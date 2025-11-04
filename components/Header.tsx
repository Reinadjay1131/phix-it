
import React from 'react';
import type { User } from '../types';
import { MobilePhoneIcon, UserCircleIcon, LogoutIcon } from './Icons';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MobilePhoneIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            PHIX-IT
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6 text-gray-500" />
                <span className="text-gray-700 font-medium hidden sm:block">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
                aria-label="Logout"
              >
                <LogoutIcon className="h-5 w-5" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <span className="text-gray-600 font-medium">Welcome! Please sign in.</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
