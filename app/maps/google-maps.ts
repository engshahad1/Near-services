// maps/google-maps.ts
import type {
  GeocodeResult,
  ReverseGeocodeResult,
  DistanceMatrixInput,
  DistanceMatrixResult,
  PlaceSuggestion,
  LatLng,
  MapsProvider,
} from "./index";

/** Helpers */
const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
const hasKey = Boolean(API_KEY);

function encodePoint(p: LatLng | string) {
  if (typeof p === "string") return encodeURIComponent(p);
  return `${p.lat},${p.lng}`;
}

function haversineMeters(a: LatLng, b: LatLng) {
  const R = 6371e3;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function formatKm(m: number) {
  if (m < 1000) return `${Math.round(m)} م`;
  return `${(m / 1000).toFixed(1)} كم`;
}

function formatMinutes(sec: number) {
  const mins = Math.round(sec / 60);
  if (mins < 60) return `${mins} دقيقة`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} س ${m} د`;
}

/**
 * Singleton object that implements MapsProvider.
 * هذا يحل مشكلة "Class incorrectly implements interface".
 */
export const GoogleMaps: MapsProvider = {
  async geocode(query: string): Promise<GeocodeResult | null> {
    if (!query?.trim()) return null;

    if (!hasKey) {
      // Fallback: نقطة افتراضية (الرياض)
      return {
        address: query,
        location: { lat: 24.7136, lng: 46.6753 },
        placeId: "mock-place-id",
      };
    }

    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query
      )}&key=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const r = data.results?.[0];
    if (!r) return null;

    return {
      address: r.formatted_address,
      location: {
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
      },
      placeId: r.place_id,
    };
  },

  async reverseGeocode(point: LatLng): Promise<ReverseGeocodeResult | null> {
    if (!hasKey) {
      return {
        address: "موقع بالقرب من الرياض، السعودية",
        placeId: "mock-place-id",
        components: { country: "SA", city: "Riyadh" },
      };
    }

    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${point.lat},${point.lng}&key=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const r = data.results?.[0];
    if (!r) return null;

    const components: Record<string, string> = {};
    r.address_components?.forEach((c: any) => {
      if (c.types?.includes("country")) components.country = c.short_name;
      if (c.types?.includes("locality")) components.city = c.long_name;
      if (c.types?.includes("route")) components.street = c.long_name;
      if (c.types?.includes("street_number")) components.number = c.long_name;
    });

    return {
      address: r.formatted_address,
      placeId: r.place_id,
      components,
    };
  },

  async distanceMatrix(input: DistanceMatrixInput): Promise<DistanceMatrixResult> {
    const mode = input.mode || "driving";

    // Fallback بدون API KEY باستخدام Haversine + تقدير زمن داخل المدن (40 كم/س)
    if (!hasKey) {
      const toPoint = async (p: LatLng | string): Promise<LatLng> => {
        if (typeof p !== "string") return p;
        const g = await GoogleMaps.geocode(p);
        return g?.location || { lat: 24.7136, lng: 46.6753 };
      };
      const [o, d] = await Promise.all([toPoint(input.origin), toPoint(input.destination)]);
      const meters = haversineMeters(o, d);
      const seconds = Math.max(300, (meters / (40 * 1000)) * 3600);

      return {
        distanceText: formatKm(meters),
        distanceValue: Math.round(meters),
        durationText: formatMinutes(seconds),
        durationValue: Math.round(seconds),
      };
    }

    const origins = encodePoint(input.origin);
    const destinations = encodePoint(input.destination);

    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric` +
      `&origins=${origins}&destinations=${destinations}&mode=${mode}&key=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
      // فشل؟ رجّع تقدير
      return GoogleMaps.distanceMatrix({ ...input, mode });
    }
    const data = await res.json();
    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return GoogleMaps.distanceMatrix({ ...input, mode });
    }

    return {
      distanceText: element.distance.text,
      distanceValue: element.distance.value,
      durationText: element.duration.text,
      durationValue: element.duration.value,
    };
  },

  async placeAutocomplete(query: string): Promise<PlaceSuggestion[]> {
    if (!query?.trim()) return [];
    if (!hasKey) {
      return [
        { description: `${query}، الرياض`, placeId: "mock-1" },
        { description: `${query}، جدة`, placeId: "mock-2" },
        { description: `${query}، الدمام`, placeId: "mock-3" },
      ];
    }

    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      `input=${encodeURIComponent(query)}&language=ar&key=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    return (data.predictions || []).map((p: any) => ({
      description: p.description,
      placeId: p.place_id,
    }));
  },

  buildMapsUrl(point: LatLng): string {
    return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
  },
};
