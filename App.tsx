
import React, { useState, useCallback, useEffect } from 'react';
import type { User, RepairRequest, Quote, Provider } from './types';
import { AppState, UserType } from './types';
import Header from './components/Header';
import Auth from './components/Auth';
import CustomerDashboard from './components/CustomerDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import ProviderOnboarding from './components/ProviderOnboarding';
import SchedulingModal from './components/SchedulingModal';
import ConfirmationScreen from './components/ConfirmationScreen';
import { generateMockProviders, generateQuotesForRequest, generateSingleLateQuote } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Authentication);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRequest, setCurrentRequest] = useState<RepairRequest | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for scheduling flow
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [scheduledAppointment, setScheduledAppointment] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    // Pre-load mock providers on initial app load for a better demo experience
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const mockProviders = await generateMockProviders(5, 'San Francisco, CA');
        setProviders(mockProviders);
      } catch (err) {
        setError('Failed to load repair providers. Please check your API key and try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.userType === UserType.Consumer) {
      setAppState(AppState.UserDashboard);
    } else if (user.userType === UserType.Provider) {
      setAppState(AppState.ProviderOnboarding);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRequest(null);
    setQuotes([]);
    setSelectedQuote(null);
    setScheduledAppointment(null);
    setAppState(AppState.Authentication);
  };

  const handleRequestSubmit = useCallback(async (request: RepairRequest) => {
    setCurrentRequest(request);
    setAppState(AppState.ViewingQuotes);
    setIsLoading(true);
    setError(null);
    setQuotes([]);
    try {
      if(providers.length === 0) {
        setError("Providers not loaded yet. Please wait a moment and try again.");
        setIsLoading(false);
        return;
      }
      const generatedQuotes = await generateQuotesForRequest(request, providers);
      setQuotes(generatedQuotes);
      
      setTimeout(async () => {
        try {
          const lateQuote = await generateSingleLateQuote(request, generatedQuotes);
          setQuotes(prevQuotes => [{...lateQuote, isNew: true}, ...prevQuotes]);
        } catch (lateQuoteError) {
          console.error("Failed to generate late quote:", lateQuoteError);
        }
      }, 3500);

    } catch (err) {
      setError('An error occurred while generating quotes. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [providers]);

  const handleNewRequest = () => {
    setCurrentRequest(null);
    setQuotes([]);
    setSelectedQuote(null);
    setScheduledAppointment(null);
    setAppState(AppState.UserDashboard);
  };

  const handleOnboardingComplete = (providerProfile: Provider) => {
    setCurrentUser({
        id: providerProfile.id,
        email: currentUser!.email,
        userType: UserType.Provider,
        isVerified: true,
    });
    setProviders(prev => [...prev, providerProfile]);
    setAppState(AppState.ProviderDashboard); 
    alert(`Welcome, ${providerProfile.businessName}! Your profile has been created.`);
  };
  
  // --- New handlers for Scheduling Flow ---
  
  const handleAcceptQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setAppState(AppState.Scheduling);
  };

  const handleCancelScheduling = () => {
    setSelectedQuote(null);
    setAppState(AppState.ViewingQuotes);
  };

  const handleSchedulingComplete = (details: { date: string; time: string }) => {
    setScheduledAppointment(details);
    setAppState(AppState.Confirmation);
  };


  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">An Error Occurred</h2>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Make sure your Gemini API key is configured correctly.</p>
        </div>
      );
    }

    switch (appState) {
      case AppState.Authentication:
        return <Auth onLogin={handleLogin} />;

      case AppState.ProviderOnboarding:
        if (!currentUser || currentUser.userType !== UserType.Provider) return <Auth onLogin={handleLogin} />;
        return <ProviderOnboarding user={currentUser} onOnboardingComplete={handleOnboardingComplete} />;

      case AppState.ProviderDashboard:
        if (!currentUser || currentUser.userType !== UserType.Provider) return <Auth onLogin={handleLogin} />;
        const providerProfile = providers.find(p => p.id === currentUser.id);
        if (!providerProfile) {
            setAppState(AppState.ProviderOnboarding);
            return null; 
        }
        return <ProviderDashboard provider={providerProfile} />;
      
      case AppState.UserDashboard:
      case AppState.ViewingQuotes:
      case AppState.Scheduling:
        if (!currentUser || currentUser.userType !== UserType.Consumer) return <Auth onLogin={handleLogin} />;
        return (
          <>
            <CustomerDashboard
              user={currentUser}
              providers={providers}
              quotes={quotes}
              currentRequest={currentRequest}
              isLoading={isLoading}
              onRequestSubmit={handleRequestSubmit}
              onNewRequest={handleNewRequest}
              onAcceptQuote={handleAcceptQuote}
            />
            {appState === AppState.Scheduling && selectedQuote && (
              <SchedulingModal 
                quote={selectedQuote}
                onConfirm={handleSchedulingComplete}
                onCancel={handleCancelScheduling}
              />
            )}
          </>
        );

      case AppState.Confirmation:
        if (!currentUser || !selectedQuote || !scheduledAppointment) {
          handleNewRequest(); // Reset if state is inconsistent
          return null;
        }
        return (
          <ConfirmationScreen 
            quote={selectedQuote}
            appointment={scheduledAppointment}
            onDone={handleNewRequest}
          />
        );
        
      default:
        return <Auth onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        <p>&copy; {new Date().getFullYear()} PHIX-IT. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;