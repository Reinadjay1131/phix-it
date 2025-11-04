import React, { useState } from 'react';
import type { User, RepairRequest } from '../types';
import { PHONE_MODELS, ISSUE_TYPES } from '../constants';
import { WrenchScrewdriverIcon, PaperAirplaneIcon, ChevronDownIcon } from './Icons';

interface RequestFormProps {
  user: User;
  onSubmit: (request: RepairRequest) => void;
  isLoadingProviders: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({ user, onSubmit, isLoadingProviders }) => {
  const [deviceModel, setDeviceModel] = useState(PHONE_MODELS[0]);
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: RepairRequest = {
      id: `req-${Date.now()}`,
      userId: user.id,
      deviceModel,
      issueType,
      description,
      // Mock user location for demo
      userLat: 37.7749,
      userLng: -122.4194,
    };
    onSubmit(newRequest);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-full">
          <WrenchScrewdriverIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Describe Your Issue</h2>
      </div>
      <p className="text-gray-600 mb-8">
        Tell us what's wrong with your device. The more details you provide, the more accurate your quotes will be.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700">
            Device Model
          </label>
          <div className="mt-1 relative">
            <select
              id="deviceModel"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="appearance-none block w-full bg-white border border-gray-300 text-gray-900 py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {PHONE_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">
            Issue Type
          </label>
          <div className="mt-1 relative">
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="appearance-none block w-full bg-white border border-gray-300 text-gray-900 py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {ISSUE_TYPES.map((issue) => (
                <option key={issue} value={issue}>
                  {issue}
                </option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., The screen is cracked in the top right corner. The touch screen still works."
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoadingProviders}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoadingProviders ? (
              'Loading Providers...'
            ) : (
              <>
                Get Quotes Now <PaperAirplaneIcon className="ml-2 h-5 w-5"/>
              </>
            )}
          </button>
           {isLoadingProviders && <p className="text-center text-sm text-gray-500 mt-2">Preparing repair network, please wait...</p>}
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
