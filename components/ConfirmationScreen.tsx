import React from 'react';
import type { Quote } from '../types';
import { CheckBadgeIcon, CalendarDaysIcon, MapPinIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, PaperAirplaneIcon } from './Icons';

interface ConfirmationScreenProps {
  quote: Quote;
  appointment: { date: string, time: string };
  onDone: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ quote, appointment, onDone }) => {
  const { provider } = quote;
  if (!provider) return null;

  return (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-gray-200">
            <CheckBadgeIcon className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-3xl font-extrabold text-gray-800 mt-4">Repair Scheduled!</h2>
            <p className="text-gray-600 mt-2">
                Your appointment with <span className="font-semibold text-indigo-600">{provider.businessName}</span> is confirmed.
            </p>

            <div className="text-left bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8 space-y-4">
                <InfoRow 
                    icon={<CalendarDaysIcon className="h-6 w-6 text-gray-500"/>}
                    label="When"
                    value={`${appointment.date} at ${appointment.time}`}
                />
                 <InfoRow 
                    icon={<MapPinIcon className="h-6 w-6 text-gray-500"/>}
                    label="Where"
                    value={provider.address}
                />
                 <InfoRow 
                    icon={<CurrencyDollarIcon className="h-6 w-6 text-gray-500"/>}
                    label="Quoted Price"
                    value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(quote.price)}
                />
            </div>
            
            <div className="mt-8 text-left bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-indigo-800 flex items-center">
                    <WrenchScrewdriverIcon className="h-5 w-5 mr-2"/>
                    What's next?
                </h3>
                <p className="text-indigo-700 mt-2 text-sm">
                    Please bring your device to the provider's location at the scheduled time. Payment will be handled directly with the provider upon completion of the repair.
                </p>
            </div>

            <button
                onClick={onDone}
                className="mt-8 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
                Submit Another Request <PaperAirplaneIcon className="ml-2 h-5 w-5"/>
            </button>
        </div>
    </div>
  );
};

const InfoRow: React.FC<{icon: React.ReactNode, label: string, value: string}> = ({icon, label, value}) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);

export default ConfirmationScreen;
