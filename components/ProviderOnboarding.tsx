import React, { useState, useCallback } from 'react';
import type { User, Provider, BusinessType, GeocodingSuggestion } from '../types';
import { ISSUE_TYPES } from '../constants';
import { deduceProviderDetails, getGeocodingSuggestions } from '../services/geminiService';
import Spinner from './Spinner';
import { 
    BuildingStorefrontIcon, SparklesIcon, CheckBadgeIcon, MapPinIcon, ChevronDownIcon, 
    DocumentTextIcon, TrophyIcon, UsersIcon, CalendarDaysIcon, CpuChipIcon, GlobeAltIcon, WrenchIcon 
} from './Icons';

interface ProviderOnboardingProps {
  user: User;
  onOnboardingComplete: (provider: Provider) => void;
}

type DeducedInfo = Omit<Partial<Provider>, 'lat' | 'lng'>;

// Simple debounce hook
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
    setTimeoutId(newTimeoutId);
  };
};

const ProviderOnboarding: React.FC<ProviderOnboardingProps> = ({ user, onOnboardingComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Repair Shop');
  const [addressInput, setAddressInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [certifications, setCertifications] = useState('');
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [deducedInfo, setDeducedInfo] = useState<DeducedInfo | null>(null);
  const [editableServiceRadius, setEditableServiceRadius] = useState<number | undefined>();


  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      const result = await getGeocodingSuggestions(query);
      setSuggestions(result);
    } catch (e) {
      console.error("Geocoding failed:", e);
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const debouncedFetchSuggestions = useDebounce(fetchSuggestions, 500);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    setSelectedCoords(null); // Invalidate coords if user types again
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: GeocodingSuggestion) => {
    setAddressInput(suggestion.fullAddress);
    setSelectedCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setSuggestions([]);
  };
  
  const handleSpecialtyChange = (specialty: string) => {
    setSpecialties(prev => 
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !addressInput || specialties.length === 0) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!selectedCoords) {
      setError("Please select a valid address from the suggestions.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const providerInput = {
        businessName,
        businessType,
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        specialties,
        certifications: certifications.split(',').map(c => c.trim()).filter(Boolean),
      };
      const deductions = await deduceProviderDetails(providerInput);
      setDeducedInfo(deductions);
      setEditableServiceRadius(deductions.serviceRadius); // Set initial value from AI
      setStep(2); // Move to review step
    } catch (err) {
      console.error(err);
      setError("Could not analyze your business information. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmProfile = () => {
    if (!deducedInfo || !selectedCoords) return;
    
    const finalProviderProfile: Provider = {
      id: user.id,
      businessName,
      address: addressInput,
      businessType,
      specialties,
      certifications: certifications.split(',').map(c => c.trim()).filter(Boolean),
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
      // All AI deduced fields
      localMarketCompetition: deducedInfo.localMarketCompetition,
      skillTier: deducedInfo.skillTier,
      generatedSummary: deducedInfo.generatedSummary,
      timeZone: deducedInfo.timeZone,
      businessAgeEstimate: deducedInfo.businessAgeEstimate,
      repairComplexityLevel: deducedInfo.repairComplexityLevel,
      suggestedEquipment: deducedInfo.suggestedEquipment,
      // Smart defaults
      serviceRadius: editableServiceRadius,
      responseTime: deducedInfo.responseTime,
      maxJobsPerDay: deducedInfo.maxJobsPerDay,
      // Default values for new providers
      rating: 4.5, 
      reviewsCount: 0,
    };
    onOnboardingComplete(finalProviderProfile);
  };

  const renderStepOne = () => (
    <form onSubmit={handleSubmitDetails} className="space-y-6">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" id="businessName" value={businessName} onChange={e => setBusinessName(e.target.value)} required className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"/>
        </div>
      </div>
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Business Type</label>
        <div className="mt-1 relative">
            <select id="businessType" value={businessType} onChange={e => setBusinessType(e.target.value as BusinessType)} required className="appearance-none block w-full bg-white border border-gray-300 text-gray-900 py-2 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option>Independent Technician</option>
              <option>Repair Shop</option>
              <option>Franchise</option>
              <option>Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
            </div>
        </div>
      </div>
      <div className="relative">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Business Address</label>
         <div className="mt-1 relative rounded-md shadow-sm">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              id="address" 
              value={addressInput} 
              onChange={handleAddressChange} 
              placeholder="Start typing your address..." 
              required 
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
            />
            {isFetchingSuggestions && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></div>}
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            {suggestions.map((s, index) => (
              <li key={index} onClick={() => handleSuggestionClick(s)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                <span>{s.fullAddress}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700">Specialties (select at least one)</label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ISSUE_TYPES.map(issue => (
                <button type="button" key={issue} onClick={() => handleSpecialtyChange(issue)} className={`px-3 py-2 text-sm rounded-full border transition-colors ${specialties.includes(issue) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    {issue}
                </button>
            ))}
        </div>
      </div>
      <div>
        <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">Certifications (Optional)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" id="certifications" value={certifications} onChange={e => setCertifications(e.target.value)} placeholder="e.g., Apple Certified, Samsung Certified" className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"/>
        </div>
        <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with a comma.</p>
      </div>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
        {isLoading ? <Spinner /> : <><SparklesIcon className="h-5 w-5 mr-2" />Analyze & Review Profile</>}
      </button>
    </form>
  );
  
  const renderStepTwo = () => {
    if(!deducedInfo) return <p>Something went wrong. Please go back.</p>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold text-indigo-800">AI-Generated Profile Summary</h3>
                <p className="text-indigo-700 mt-1 italic">"{deducedInfo.generatedSummary}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard title="Skill Tier" value={deducedInfo.skillTier} icon={<TrophyIcon className="h-6 w-6 text-indigo-500"/>} />
                <InfoCard title="Market Competition" value={deducedInfo.localMarketCompetition} icon={<UsersIcon className="h-6 w-6 text-indigo-500"/>} />
                <InfoCard title="Business Age" value={deducedInfo.businessAgeEstimate} icon={<CalendarDaysIcon className="h-6 w-6 text-indigo-500"/>} />
                <InfoCard title="Repair Complexity" value={deducedInfo.repairComplexityLevel} icon={<CpuChipIcon className="h-6 w-6 text-indigo-500"/>} />
                <InfoCard title="Estimated Time Zone" value={deducedInfo.timeZone?.replace('_', ' ')} icon={<GlobeAltIcon className="h-6 w-6 text-indigo-500"/>} />
            </div>

            <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><WrenchIcon className="h-5 w-5 mr-2 text-gray-500"/> Deduced Equipment Needs</h4>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-wrap gap-2">
                    {deducedInfo.suggestedEquipment?.map(item => (
                        <span key={item} className="bg-white text-gray-700 text-sm font-medium px-3 py-1 rounded-full border border-gray-200 shadow-sm">{item}</span>
                    ))}
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-700 mb-2">Suggested Business Settings</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="serviceRadiusSlider" className="font-medium text-gray-600">Service Radius</label>
                            <span className="font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">{editableServiceRadius} miles</span>
                        </div>
                        <input 
                            id="serviceRadiusSlider"
                            type="range"
                            min="1"
                            max="100"
                            value={editableServiceRadius || 1}
                            onChange={(e) => setEditableServiceRadius(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-indigo-600"
                            aria-label="Service Radius"
                        />
                        <p className="text-xs text-gray-500 mt-1">Adjust the slider to define your service area for job matching.</p>
                    </div>
                    <SettingItem label="Avg. Response Time" value={deducedInfo.responseTime} />
                    <SettingItem label="Daily Job Capacity" value={`${deducedInfo.maxJobsPerDay} jobs`} />
                </div>
            </div>

            <button onClick={handleConfirmProfile} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <CheckBadgeIcon className="h-5 w-5 mr-2" />
                Confirm & Complete Profile
            </button>
        </div>
    );
  };
  
  const InfoCard = ({title, value, icon}: {title: string, value?: string, icon: React.ReactNode}) => (
    <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4 border border-gray-200">
        <div className="bg-white p-3 rounded-full border border-gray-200">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-lg font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);

  const SettingItem = ({label, value, description}: {label: string, value?: string, description?: string}) => (
    <div>
        <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">{label}</span>
            <span className="font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">{value}</span>
        </div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-8">
        <div className="inline-block bg-indigo-100 p-3 rounded-full">
          <BuildingStorefrontIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-3">
          {step === 1 ? 'Tell Us About Your Business' : 'Review Your Smart Profile'}
        </h2>
        <p className="text-gray-600 mt-1">
          <span className="font-semibold text-indigo-600">Step {step} of 2: </span>
          {step === 1 
            ? 'Provide basic details and our AI will configure your profile.' 
            : 'Our AI has generated these settings to get you started.'}
        </p>
      </div>
      {step === 1 ? renderStepOne() : renderStepTwo()}
    </div>
  );
};

export default ProviderOnboarding;