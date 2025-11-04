import React, { useState, useEffect } from 'react';
import type { Quote } from '../types';
import { StarIcon, ClockIcon, ShieldCheckIcon, MapPinIcon, CheckBadgeIcon, WrenchIcon } from './Icons';

interface QuoteCardProps {
  quote: Quote;
  onAcceptQuote: (quote: Quote) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onAcceptQuote }) => {
  const { provider, price, estimatedHours, warrantyDays } = quote;
  const [isHighlighted, setIsHighlighted] = useState(quote.isNew);

  useEffect(() => {
    if (quote.isNew) {
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [quote.isNew]);


  if (!provider) {
    return null;
  }

  return (
    <div className={`group relative rounded-xl shadow-md border overflow-hidden transition-all duration-500 ease-out ${isHighlighted ? 'border-indigo-400 bg-indigo-50 scale-[1.02]' : 'border-gray-100 bg-white hover:shadow-xl hover:border-indigo-300'}`}>
      
      <div role="tooltip" className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-sm p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          <div className="flex items-center gap-2 font-semibold border-b border-gray-600 pb-2 mb-2">
            <MapPinIcon className="h-5 w-5 flex-shrink-0 text-gray-300" />
            <span>{provider.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <WrenchIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-300" />
            <div>
              <span className="font-semibold">Specialties:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {provider.specialties.map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
      </div>

      {isHighlighted && (
        <span className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-fade-in">
          NEW
        </span>
      )}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{provider.businessName}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-semibold">{provider.rating}</span>
                <span className="ml-1">({provider.reviewsCount} reviews)</span>
              </div>
              <div className="flex items-center">
                 <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                 <span>{provider.address.split(',')[0]}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <p className="text-3xl font-extrabold text-indigo-600">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)}
            </p>
            <p className="text-sm text-gray-500">Total Price</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                <ClockIcon className="h-4 w-4 text-gray-500 mr-2"/>
                <span>{estimatedHours} hour{estimatedHours > 1 ? 's' : ''} repair time</span>
            </div>
             <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                <ShieldCheckIcon className="h-4 w-4 text-gray-500 mr-2"/>
                <span>{warrantyDays}-day warranty</span>
            </div>
        </div>

        <div className="mt-6">
            <button 
                onClick={() => onAcceptQuote(quote)}
                className="w-full sm:w-auto sm:float-right bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-transform duration-200 transform hover:scale-105 flex items-center justify-center"
            >
                <CheckBadgeIcon className="h-5 w-5 mr-2"/>
                Accept Quote & Schedule
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;