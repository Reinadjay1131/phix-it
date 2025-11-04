
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { RepairRequest, Quote, Provider } from '../types';
import { SortOption } from '../types';
import QuoteCard from './QuoteCard';
import Spinner from './Spinner';
import { ArrowLeftIcon, AdjustmentsHorizontalIcon, CurrencyDollarIcon, StarIcon, MapPinIcon, FunnelIcon, ChevronDownIcon, WrenchIcon, MagnifyingGlassIcon } from './Icons';

interface QuoteListProps {
  request: RepairRequest;
  quotes: Quote[];
  providers: Provider[];
  isLoading: boolean;
  onNewRequest: () => void;
  onAcceptQuote: (quote: Quote) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ request, quotes, providers, isLoading, onNewRequest, onAcceptQuote }) => {
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Price);
  const [repairTimeFilter, setRepairTimeFilter] = useState<string>('any');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [isSpecialtyFilterOpen, setIsSpecialtyFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const specialtyFilterRef = useRef<HTMLDivElement>(null);

  const allSpecialties = useMemo(() => {
    const specialtiesSet = new Set<string>();
    providers.forEach(provider => {
        provider.specialties.forEach(specialty => {
            specialtiesSet.add(specialty);
        });
    });
    return Array.from(specialtiesSet).sort();
  }, [providers]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (specialtyFilterRef.current && !specialtyFilterRef.current.contains(event.target as Node)) {
            setIsSpecialtyFilterOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [specialtyFilterRef]);

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const filteredAndSortedQuotes = useMemo(() => {
    let filtered = quotes.filter(quote => {
      if (!quote.provider) return false;
      switch (repairTimeFilter) {
        case 'under_3':
          return quote.estimatedHours < 3;
        case '3_to_6':
          return quote.estimatedHours >= 3 && quote.estimatedHours <= 6;
        case 'same_day':
          return quote.estimatedHours <= 8;
        case 'any':
        default:
          return true;
      }
    });

    if (selectedSpecialties.length > 0) {
        filtered = filtered.filter(quote =>
            quote.provider?.specialties.some(s => selectedSpecialties.includes(s))
        );
    }
    
    if (searchTerm.trim() !== '') {
        filtered = filtered.filter(quote => 
            quote.provider?.businessName.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
    }

    const sorted = [...filtered];

    switch (sortOption) {
      case SortOption.Price:
        return sorted.sort((a, b) => a.price - b.price);
      case SortOption.Rating:
        return sorted.sort((a, b) => (b.provider?.rating ?? 0) - (a.provider?.rating ?? 0));
      case SortOption.Proximity:
        return sorted.sort((a, b) => (a.provider?.lng ?? 0) - (b.provider?.lng ?? 0));
      default:
        return sorted;
    }
  }, [quotes, sortOption, repairTimeFilter, selectedSpecialties, searchTerm]);

  const SortButton = ({ option, label, icon }: { option: SortOption, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setSortOption(option)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
        sortOption === option
          ? 'bg-indigo-600 text-white shadow'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onNewRequest} className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium">
          <ArrowLeftIcon className="h-5 w-5"/>
          <span>New Request</span>
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Your Request</h2>
        <p className="text-gray-600 mt-2">
          <span className="font-semibold">{request.deviceModel}</span> - {request.issueType}
        </p>
        {request.description && <p className="text-sm text-gray-500 mt-1">"{request.description}"</p>}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <AdjustmentsHorizontalIcon className="h-6 w-6 mr-2 text-indigo-500"/>
            <span>
              {!isLoading ? (
                  <>
                      <span className="font-extrabold text-indigo-600">{filteredAndSortedQuotes.length}</span>
                      {` Quote${filteredAndSortedQuotes.length !== 1 ? 's' : ''} Found`}
                  </>
              ) : (
                  'Finding Quotes...'
              )}
            </span>
          </h3>
          <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-full">
            <SortButton option={SortOption.Price} label="Price" icon={<CurrencyDollarIcon className="h-5 w-5"/>}/>
            <SortButton option={SortOption.Rating} label="Rating" icon={<StarIcon className="h-5 w-5"/>}/>
            <SortButton option={SortOption.Proximity} label="Proximity" icon={<MapPinIcon className="h-5 w-5"/>}/>
          </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 space-y-4">
        <div className="relative">
          <label htmlFor="provider-search" className="sr-only">Search by provider name</label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
              type="search"
              id="provider-search"
              placeholder="Search by provider name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-3">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <label htmlFor="repairTimeFilter" className="text-sm font-medium text-gray-700">Repair Time:</label>
            <div className="relative">
              <select
                id="repairTimeFilter"
                value={repairTimeFilter}
                onChange={(e) => setRepairTimeFilter(e.target.value)}
                className="appearance-none block w-full sm:w-auto bg-white border border-gray-300 text-gray-900 py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="any">Any</option>
                <option value="under_3">Under 3 hours</option>
                <option value="3_to_6">3-6 hours</option>
                <option value="same_day">Same Day (under 8h)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <WrenchIcon className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Specialty:</label>
            <div ref={specialtyFilterRef} className="relative">
              <button
                onClick={() => setIsSpecialtyFilterOpen(prev => !prev)}
                className="appearance-none block w-full sm:w-auto bg-white border border-gray-300 text-gray-900 py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-left min-w-[120px]"
                aria-haspopup="true"
                aria-expanded={isSpecialtyFilterOpen}
              >
                {selectedSpecialties.length === 0 ? 'Any' : `${selectedSpecialties.length} selected`}
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </button>
              {isSpecialtyFilterOpen && (
                <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {allSpecialties.map(specialty => (
                      <label key={specialty} className="flex items-center space-x-3 px-2 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(specialty)}
                          onChange={() => handleSpecialtyChange(specialty)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSpecialties.length > 0 && (
                      <div className="border-t border-gray-200 p-2">
                          <button 
                              onClick={() => {
                                setSelectedSpecialties([]);
                                setIsSpecialtyFilterOpen(false);
                              }}
                              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium p-1 rounded-md"
                          >
                              Clear All
                          </button>
                      </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {isLoading && (
        <div className="text-center py-12">
            <Spinner />
            <p className="mt-4 text-gray-600 font-medium">Generating quotes from local experts...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
        </div>
      )}
      
      {!isLoading && filteredAndSortedQuotes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700">
            {quotes.length > 0 ? 'No Quotes Match Your Filters' : 'No Quotes Yet'}
          </h3>
          <p className="text-gray-500 mt-2">
            {quotes.length > 0 ? 'Try adjusting your filter criteria or clearing your search.' : "We've notified local providers. Check back soon for quotes!"}
          </p>
        </div>
      )}

      {!isLoading && filteredAndSortedQuotes.length > 0 && (
        <div className="space-y-4">
          {filteredAndSortedQuotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} onAcceptQuote={onAcceptQuote} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteList;