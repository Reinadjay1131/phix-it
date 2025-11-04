import React, { useState, useMemo } from 'react';
import type { Quote } from '../types';
import { MapPinIcon, CurrencyDollarIcon, CalendarDaysIcon, ClockIcon } from './Icons';

interface SchedulingModalProps {
  quote: Quote;
  onConfirm: (details: { date: string, time: string }) => void;
  onCancel: () => void;
}

const generateTimeSlots = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i < 4; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(
            new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date)
        );
    }
    return {
        dates,
        times: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
    };
};

const SchedulingModal: React.FC<SchedulingModalProps> = ({ quote, onConfirm, onCancel }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const { dates, times } = useMemo(() => generateTimeSlots(), []);

    const { provider, price } = quote;

    if (!provider) return null;

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            onConfirm({ date: selectedDate, time: selectedTime });
        }
    };
    
    const isConfirmDisabled = !selectedDate || !selectedTime;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all scale-100 animate-slide-up-fade">
                <h2 className="text-2xl font-bold text-gray-800 text-center">Schedule Your Repair</h2>
                <p className="text-center text-gray-500 mt-1 mb-6">Confirm details and select a time to meet the provider.</p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mb-6">
                    <h3 className="font-bold text-lg text-gray-700">{provider.businessName}</h3>
                    <div className="flex items-start space-x-2 text-gray-600">
                        <MapPinIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span>{provider.address}</span>
                    </div>
                     <div className="flex items-center space-x-2 text-gray-600">
                        <CurrencyDollarIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                        <span className="font-semibold text-indigo-600">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)}</span>
                        <span>- Quoted Price</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500"/>Select a Date</h4>
                        <div className="flex flex-wrap gap-2">
                           {dates.map(date => (
                               <button 
                                key={date} 
                                onClick={() => setSelectedDate(date)}
                                className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${selectedDate === date ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}
                               >
                                {date}
                               </button>
                           ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><ClockIcon className="h-5 w-5 mr-2 text-gray-500"/>Select a Time</h4>
                        <div className="flex flex-wrap gap-2">
                            {times.map(time => (
                                <button 
                                key={time} 
                                onClick={() => setSelectedTime(time)}
                                className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${selectedTime === time ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}
                                >
                                {time}
                                </button>
                           ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                     <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className="w-full sm:w-auto flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                     >
                        Confirm & Schedule
                     </button>
                      <button
                        onClick={onCancel}
                        className="w-full sm:w-auto flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                </div>
            </div>
        </div>
    );
};

export default SchedulingModal;
