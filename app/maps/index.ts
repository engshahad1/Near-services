// maps/index.ts
export type LatLng = { lat: number; lng: number };

export interface GeocodeResult {
  address: string;
  location: LatLng;
  placeId?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  placeId?: string;
  components?: Record<string, string>;
}

export interface DistanceMatrixInput {
  origin: LatLng | string;       // إحداثيات أو عنوان نصي
  destination: LatLng | string;  // إحداثيات أو عنوان نصي
  mode?: "driving" | "walking" | "bicycling" | "transit";
}

export interface DistanceMatrixResult {
  distanceText: string;  // مثال: "12.3 كم"
  distanceValue: number; // بالمتر
  durationText: string;  // مثال: "18 دقيقة"
  durationValue: number; // بالثواني
}

export interface PlaceSuggestion {
  description: string;
  placeId: string;
}

export interface MapsProvider {
  geocode(query: string): Promise<GeocodeResult | null>;
  reverseGeocode(point: LatLng): Promise<ReverseGeocodeResult | null>;
  distanceMatrix(input: DistanceMatrixInput): Promise<DistanceMatrixResult>;
  placeAutocomplete(query: string): Promise<PlaceSuggestion[]>;
  buildMapsUrl(point: LatLng): string;
}

export { GoogleMaps } from "./google-maps";
