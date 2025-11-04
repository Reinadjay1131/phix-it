
import React from 'react';
import type { User, RepairRequest, Quote, Provider } from '../types';
import RequestForm from './RequestForm';
import QuoteList from './QuoteList';

interface CustomerDashboardProps {
  user: User;
  providers: Provider[];
  quotes: Quote[];
  currentRequest: RepairRequest | null;
  isLoading: boolean;
  onRequestSubmit: (request: RepairRequest) => void;
  onNewRequest: () => void;
  onAcceptQuote: (quote: Quote) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  providers,
  quotes,
  currentRequest,
  isLoading,
  onRequestSubmit,
  onNewRequest,
  onAcceptQuote,
}) => {
  return (
    <div>
      {!currentRequest ? (
        <RequestForm user={user} onSubmit={onRequestSubmit} isLoadingProviders={providers.length === 0} />
      ) : (
        <QuoteList
          request={currentRequest}
          quotes={quotes}
          providers={providers}
          isLoading={isLoading}
          onNewRequest={onNewRequest}
          onAcceptQuote={onAcceptQuote}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;