
import React from 'react';
import type { Provider } from '../types';
import { InboxStackIcon, ChartBarIcon, Cog6ToothIcon } from './Icons';

interface ProviderDashboardProps {
  provider: Provider;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ provider }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Welcome, {provider.businessName}!</h2>
        <p className="text-gray-600 mt-2">
          This is your central hub for managing repair requests, viewing your performance, and updating your profile.
        </p>
        {provider.generatedSummary && (
            <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-md">
                <strong>AI Profile Summary:</strong> "{provider.generatedSummary}"
            </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          icon={<InboxStackIcon className="h-8 w-8 text-indigo-500" />}
          title="Incoming Requests"
          description="View and respond to new repair requests from customers in your area."
          count={0} // Placeholder
          ctaText="View Requests"
        />
        <DashboardCard
          icon={<ChartBarIcon className="h-8 w-8 text-green-500" />}
          title="Analytics"
          description="Track your earnings, job completion rate, and customer ratings."
          ctaText="View Analytics"
        />
        <DashboardCard
          icon={<Cog6ToothIcon className="h-8 w-8 text-gray-500" />}
          title="Profile Settings"
          description="Update your services, business hours, and contact information."
          ctaText="Edit Profile"
        />
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">New Repair Requests</h3>
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">You have no new repair requests at the moment.</p>
          <p className="text-sm text-gray-400 mt-1">We'll notify you as soon as a new request comes in.</p>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ icon, title, description, count, ctaText }: { icon: React.ReactNode, title: string, description: string, count?: number, ctaText: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
        <div className="flex justify-between items-start">
            {icon}
            {typeof count !== 'undefined' && <span className="text-2xl font-bold text-indigo-600 bg-indigo-100 rounded-full h-10 w-10 flex items-center justify-center">{count}</span>}
        </div>
        <div className="mt-4 flex-grow">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <button className="mt-6 w-full bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            {ctaText}
        </button>
    </div>
);

export default ProviderDashboard;
