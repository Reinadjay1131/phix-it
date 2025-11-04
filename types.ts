export enum UserType {
  Consumer = 'consumer',
  Provider = 'provider',
}

export enum AppState {
  Authentication = 'authentication',
  UserDashboard = 'user_dashboard',
  ViewingQuotes = 'viewing_quotes',
  ProviderDashboard = 'provider_dashboard',
  ProviderOnboarding = 'provider_onboarding',
  Scheduling = 'scheduling',
  Confirmation = 'confirmation',
}

export interface User {
  id: string;
  email: string;
  userType: UserType;
  isVerified: boolean;
}

export type BusinessType = 'Independent Technician' | 'Repair Shop' | 'Franchise' | 'Other';

export interface Provider {
  id: string; // Corresponds to the User ID
  
  // Manually inputted by provider during onboarding
  businessName: string;
  address: string;
  businessType: BusinessType;
  specialties: string[];
  certifications: string[];

  // Deduced by AI
  lat: number;
  lng: number;
  localMarketCompetition?: 'Low' | 'Medium' | 'High';
  skillTier?: 'Generalist' | 'Specialist' | 'Expert';
  generatedSummary?: string;
  timeZone?: string;
  businessAgeEstimate?: string;
  repairComplexityLevel?: 'Standard' | 'Advanced' | 'Expert';
  suggestedEquipment?: string[];

  // Smart Defaults set by AI
  serviceRadius?: number; // in miles
  responseTime?: string; // e.g., '30 minutes'
  maxJobsPerDay?: number;
  
  // Existing fields for consumer view
  rating: number;
  reviewsCount: number;
}


export interface RepairRequest {
  id: string;
  userId: string;
  deviceModel: string;
  issueType: string;
  description: string;
  userLat: number;
  userLng: number;
}

export interface Quote {
  id: string;
  providerId: string;
  price: number;
  estimatedHours: number;
  warrantyDays: number;
  provider?: Provider; // Denormalized for easy access in UI
  isNew?: boolean; // Flag for new quote animation
}

export enum SortOption {
    Proximity = 'proximity',
    Price = 'price',
    Rating = 'rating',
}

export interface GeocodingSuggestion {
  fullAddress: string;
  lat: number;
  lng: number;
}