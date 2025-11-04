import { GoogleGenAI, Type } from "@google/genai";
import type { Provider, RepairRequest, Quote, BusinessType, GeocodingSuggestion } from '../types';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
    ai = new GoogleGenAI({ apiKey });
}

const providerSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        businessName: { type: Type.STRING },
        address: { type: Type.STRING },
        rating: { type: Type.NUMBER, description: "A rating from 1.0 to 5.0, with one decimal place." },
        reviewsCount: { type: Type.INTEGER, description: "Number of customer reviews." },
        specialties: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of repair specialties like 'Apple Screen Repair'."
        },
        lat: { type: Type.NUMBER, description: "Latitude coordinate." },
        lng: { type: Type.NUMBER, description: "Longitude coordinate." }
      },
      required: ["businessName", "address", "rating", "reviewsCount", "specialties", "lat", "lng"],
    },
};

// Fallback mock data when API is not available
const FALLBACK_PROVIDERS: Provider[] = [
    {
        id: 'provider-1',
        businessName: 'TechFix Pro',
        address: '123 Market Street, San Francisco, CA 94102',
        rating: 4.8,
        reviewsCount: 156,
        specialties: ['Apple Screen Repair', 'Battery Replacement', 'Water Damage'],
        lat: 37.7749,
        lng: -122.4194,
        businessType: 'Repair Shop' as BusinessType,
        certifications: ['Apple Certified']
    },
    {
        id: 'provider-2',
        businessName: 'QuickFix Mobile',
        address: '456 Union Square, San Francisco, CA 94108',
        rating: 4.5,
        reviewsCount: 89,
        specialties: ['Samsung Battery Replacement', 'Screen Repair', 'Charging Port'],
        lat: 37.7880,
        lng: -122.4075,
        businessType: 'Mobile Service' as BusinessType,
        certifications: []
    },
    {
        id: 'provider-3',
        businessName: 'iRepair Station',
        address: '789 Castro Street, San Francisco, CA 94114',
        rating: 4.9,
        reviewsCount: 234,
        specialties: ['Apple Screen Repair', 'Logic Board Repair', 'Data Recovery'],
        lat: 37.7609,
        lng: -122.4350,
        businessType: 'Repair Shop' as BusinessType,
        certifications: ['Apple Certified', 'Samsung Certified']
    },
    {
        id: 'provider-4',
        businessName: 'Mobile Medics',
        address: '321 Fillmore Street, San Francisco, CA 94117',
        rating: 4.6,
        reviewsCount: 112,
        specialties: ['Water Damage', 'Battery Replacement', 'Camera Repair'],
        lat: 37.7751,
        lng: -122.4331,
        businessType: 'Mobile Service' as BusinessType,
        certifications: []
    }
];

export const generateMockProviders = async (count: number, location: string): Promise<Provider[]> => {
    // If no API key or placeholder key, return fallback data
    if (!ai) {
        return FALLBACK_PROVIDERS.slice(0, count);
    }

    try {
        const prompt = `Generate ${count} realistic phone repair shop profiles near ${location}. For each, provide a business name, a realistic street address in that location, an average rating out of 5 (e.g., 4.7), number of reviews, a list of 3-4 specialties (e.g., 'Apple Screen Repair', 'Samsung Battery Replacement', 'Water Damage'), and plausible lat/lng coordinates.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: providerSchema,
            },
        });

        const jsonResponse = JSON.parse(response.text);
        // Adapt mock providers to the more complex Provider type
        return jsonResponse.map((p: any, index: number) => ({ 
            ...p, 
            id: `provider-${index + 1}`,
            businessType: 'Repair Shop' as BusinessType,
            certifications: [],
        }));
    } catch (error) {
        console.warn('Failed to generate providers with AI, using fallback data:', error);
        return FALLBACK_PROVIDERS.slice(0, count);
    }
};


const quoteSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            providerId: { type: Type.STRING, description: "The ID of the provider giving the quote." },
            price: { type: Type.NUMBER, description: "The total price for the repair in Nigerian Naira (NGN)." },
            estimatedHours: { type: Type.NUMBER, description: "The estimated time for the repair in hours." },
            warrantyDays: { type: Type.INTEGER, description: "The number of days the repair is under warranty." }
        },
        required: ["providerId", "price", "estimatedHours", "warrantyDays"],
    },
};


// Fallback quote generation
const generateFallbackQuotes = (request: RepairRequest, providers: Provider[]): Quote[] => {
    const basePrices: { [key: string]: number } = {
        'Cracked Screen': 150,
        'Battery Replacement': 80,
        'Water Damage': 200,
        'Charging Port': 90,
        'Speaker Issues': 70,
        'Camera Problems': 120
    };

    const basePrice = basePrices[request.issueType] || 100;

    return providers.map((provider, index) => {
        // Vary price based on provider rating and random factor
        const ratingMultiplier = (provider.rating - 3) * 0.2 + 1; // 4.0 rating = 1.2x, 5.0 rating = 1.4x
        const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
        const finalPrice = Math.round(basePrice * ratingMultiplier * randomVariation);

        return {
            id: `quote-${index + 1}`,
            providerId: provider.id,
            price: finalPrice,
            estimatedHours: 1 + Math.random() * 3, // 1-4 hours
            warrantyDays: [30, 60, 90][Math.floor(Math.random() * 3)], // 30, 60, or 90 days
            provider
        };
    });
};

export const generateQuotesForRequest = async (request: RepairRequest, providers: Provider[]): Promise<Quote[]> => {
    // If no API key, use fallback generation
    if (!ai) {
        return generateFallbackQuotes(request, providers);
    }

    try {
        const prompt = `
        A user needs a "${request.deviceModel}" repaired for the issue: "${request.issueType}".
        The user described the problem as: "${request.description}".
        
        Here are the available providers:
        ${JSON.stringify(providers, null, 2)}
        
        Generate a realistic and varied quote from each provider. Consider their specialties and ratings.
        Prices should be in USD and range realistically from $50 to $400. For example, a simple screen repair might be $150, while a water damage treatment could be $250.
        Return the quotes as a JSON array.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quoteSchema,
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        // Combine generated quote data with provider data for UI
        const enrichedQuotes = jsonResponse.map((q: any, index: number) => {
            const provider = providers.find(p => p.id === q.providerId);
            return {
                ...q,
                id: `quote-${index + 1}`,
                provider,
            };
        });
        
        return enrichedQuotes;
    } catch (error) {
        console.warn('Failed to generate quotes with AI, using fallback data:', error);
        return generateFallbackQuotes(request, providers);
    }
};


// --- New Geocoding Autocomplete Service ---
const geocodingSchema = {
    type: Type.ARRAY,
    description: "A list of geocoding suggestions.",
    items: {
        type: Type.OBJECT,
        properties: {
            fullAddress: { type: Type.STRING, description: "The full, formatted address string." },
            lat: { type: Type.NUMBER, description: "Latitude coordinate." },
            lng: { type: Type.NUMBER, description: "Longitude coordinate." }
        },
        required: ["fullAddress", "lat", "lng"],
    },
};

export const getGeocodingSuggestions = async (addressFragment: string): Promise<GeocodingSuggestion[]> => {
    if (!addressFragment || addressFragment.length < 3) {
        return [];
    }

    // Fallback suggestions when API is not available
    if (!ai) {
        const fallbackSuggestions: GeocodingSuggestion[] = [
            { fullAddress: `${addressFragment} Street, San Francisco, CA 94102`, lat: 37.7749, lng: -122.4194 },
            { fullAddress: `${addressFragment} Avenue, San Francisco, CA 94108`, lat: 37.7880, lng: -122.4075 }
        ];
        return fallbackSuggestions.slice(0, 2);
    }

    try {
        const prompt = `Generate up to 5 realistic address auto-completion suggestions in the USA based on the fragment: "${addressFragment}". For each suggestion, provide the full address and its latitude/longitude coordinates.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: geocodingSchema,
            },
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.warn('Failed to get geocoding suggestions with AI, using fallback:', error);
        return [{ fullAddress: `${addressFragment} Street, San Francisco, CA 94102`, lat: 37.7749, lng: -122.4194 }];
    }
}


// --- New Smart Onboarding Service ---

const deducedProviderSchema = {
    type: Type.OBJECT,
    properties: {
        localMarketCompetition: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "Density of existing providers in the area." },
        skillTier: { type: Type.STRING, enum: ['Generalist', 'Specialist', 'Expert'], description: "Skill level based on certifications and specialties." },
        generatedSummary: { type: Type.STRING, description: "A professionally generated one-sentence summary for the provider's profile." },
        serviceRadius: { type: Type.INTEGER, description: "Suggested service radius in miles, based on business type and location density." },
        responseTime: { type: Type.STRING, description: "Suggested response time (e.g., '30 minutes', '1 hour')." },
        maxJobsPerDay: { type: Type.INTEGER, description: "Suggested maximum jobs per day based on business type." },
        timeZone: { type: Type.STRING, description: "The IANA time zone for the given coordinates, e.g., 'America/Los_Angeles'." },
        businessAgeEstimate: { type: Type.STRING, description: "A plausible estimate of the business's age, e.g., 'Newly established', '1-3 years', '5+ years'." },
        repairComplexityLevel: { type: Type.STRING, enum: ['Standard', 'Advanced', 'Expert'], description: "The overall complexity of repairs offered, based on specialties." },
        suggestedEquipment: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 essential pieces of equipment needed for the selected specialties."
        }
    },
    required: ["localMarketCompetition", "skillTier", "generatedSummary", "serviceRadius", "responseTime", "maxJobsPerDay", "timeZone", "businessAgeEstimate", "repairComplexityLevel", "suggestedEquipment"],
};

export const deduceProviderDetails = async (providerInput: { businessName: string; businessType: BusinessType; lat: number, lng: number; specialties: string[]; certifications: string[] }) => {
    const prompt = `
    A new phone repair provider is signing up. Based on their initial information, deduce additional attributes to auto-configure their profile.
    
    Provider's Input:
    - Business Name: "${providerInput.businessName}"
    - Business Type: "${providerInput.businessType}"
    - Location (Coords): Lat ${providerInput.lat}, Lng ${providerInput.lng}
    - Specialties: ${JSON.stringify(providerInput.specialties)}
    - Certifications: ${JSON.stringify(providerInput.certifications)}
    
    Deduction Tasks:
    1.  **Analyze Market Competition**: Estimate the local market competition (Low, Medium, High) based on the coordinates. Assume coordinates in a dense urban center indicate High competition.
    2.  **Assess Skill Tier**: Determine their skill tier (Generalist, Specialist, Expert). A provider with many diverse specialties is a Generalist. One with 1-2 focused specialties is a Specialist. One with certifications is an Expert.
    3.  **Estimate Business Age**: Based on the business name (e.g., "Since 2005") or type, provide a plausible age estimate (e.g., 'Newly established', '1-3 years', '5+ years').
    4.  **Determine Repair Complexity**: Based on the specialties, assess the overall repair complexity level ('Standard', 'Advanced', 'Expert'). 'Cracked Screen' is Standard. 'Water Damage' or 'Software Problem' are Advanced. Multiple advanced topics or certifications suggest Expert.
    5.  **Identify Time Zone**: Determine the IANA time zone from the coordinates (e.g., 'America/New_York').
    6.  **Suggest Equipment**: List 3-5 essential pieces of equipment required for the provider's specialties (e.g., 'Precision screwdriver set', 'Heat gun', 'Microscope').
    7.  **Generate Profile Summary**: Write a short, professional, one-sentence summary for their public profile.
    8.  **Set Smart Defaults** based strictly on Business Type:
        -   Service Radius (miles): 'Independent Technician': 15, 'Repair Shop': 25, 'Franchise': 50.
        -   Response Time: 'Independent Technician': '2 hours', 'Repair Shop': '1 hour', 'Franchise': '30 minutes'.
        -   Max Jobs Per Day: 'Independent Technician': 3, 'Repair Shop': 10, 'Franchise': 20.
    
    Return a single JSON object with the deduced data.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: deducedProviderSchema,
        },
    });

    return JSON.parse(response.text);
};


// --- New Late Quote Service for Real-time Simulation ---

const singleQuoteSchema = {
    type: Type.OBJECT,
    properties: {
        provider: providerSchema.items, // Re-use the provider schema for a single object
        quote: quoteSchema.items, // Re-use the quote schema for a single object
    },
    required: ["provider", "quote"],
};

export const generateSingleLateQuote = async (request: RepairRequest, existingQuotes: Quote[]): Promise<Quote> => {
    // Generate fallback late quote when API is not available
    if (!ai) {
        const timestamp = Date.now();
        const existingPrices = existingQuotes.map(q => q.price);
        const minPrice = Math.min(...existingPrices);
        const competitivePrice = Math.round(minPrice * 0.9); // 10% cheaper than lowest existing
        
        const newProvider: Provider = {
            id: `provider-${timestamp}`,
            businessName: 'Express Mobile Fix',
            address: '555 Mission Street, San Francisco, CA 94105',
            rating: 4.7,
            reviewsCount: 78,
            specialties: ['Fast Repair', request.issueType, 'Same Day Service'],
            lat: 37.7898,
            lng: -122.3972,
            businessType: 'Mobile Service' as BusinessType,
            certifications: []
        };
        
        const newQuote: Quote = {
            id: `quote-${timestamp}`,
            providerId: newProvider.id,
            price: competitivePrice,
            estimatedHours: 0.5, // Fast service
            warrantyDays: 90, // Better warranty
            provider: newProvider
        };

        return newQuote;
    }

    try {
        const existingProviderIds = existingQuotes.map(q => q.provider?.id);
        const prompt = `
        A user needs a "${request.deviceModel}" repaired for the issue: "${request.issueType}".
        They have already received these quotes (prices are in USD):
        ${JSON.stringify(existingQuotes.map(q => ({ provider: q.provider?.businessName, price: q.price })), null, 2)}
        
        Task:
        1. Create one new, fictional but realistic phone repair provider profile near San Francisco, CA that is NOT already in the list.
        2. Create a new, competitive quote from this new provider for the user's request. The price should be in USD and be realistically priced relative to the existing quotes. For instance, it could be slightly cheaper or offer a better warranty to be competitive.
        
        Return a single JSON object containing both the new provider's full profile and their quote.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: singleQuoteSchema,
            },
        });
        
        const jsonResponse = JSON.parse(response.text);
        
        const newProvider = {
            ...jsonResponse.provider,
            id: `provider-${Date.now()}`, // Ensure a unique ID
            businessType: 'Repair Shop' as BusinessType,
            certifications: [],
        };
        
        const newQuote = {
            ...jsonResponse.quote,
            id: `quote-${Date.now()}`,
            providerId: newProvider.id,
            provider: newProvider,
        };

        return newQuote;
    } catch (error) {
        console.warn('Failed to generate late quote with AI, using fallback:', error);
        // Return the same fallback logic as above
        const timestamp = Date.now();
        const existingPrices = existingQuotes.map(q => q.price);
        const minPrice = Math.min(...existingPrices);
        const competitivePrice = Math.round(minPrice * 0.9);
        
        const newProvider: Provider = {
            id: `provider-${timestamp}`,
            businessName: 'Express Mobile Fix',
            address: '555 Mission Street, San Francisco, CA 94105',
            rating: 4.7,
            reviewsCount: 78,
            specialties: ['Fast Repair', request.issueType, 'Same Day Service'],
            lat: 37.7898,
            lng: -122.3972,
            businessType: 'Mobile Service' as BusinessType,
            certifications: []
        };
        
        return {
            id: `quote-${timestamp}`,
            providerId: newProvider.id,
            price: competitivePrice,
            estimatedHours: 0.5,
            warrantyDays: 90,
            provider: newProvider
        };
    }
};