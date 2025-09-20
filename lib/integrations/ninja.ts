// lib/integrations/ninja.ts
// Mock Ninja client — يشبه المنصة الحقيقية لكنه محلي للديمو

export type NinjaQuoteInput = {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  weightKg?: number;
};

export type NinjaQuote = {
  etaMinutes: number;
  distanceKm: number;
  base: number;
  fuel: number;
  vat: number;
  total: number;
  currency: 'SAR';
};

export type NinjaCreateOrderInput = {
  orderId: string;
  pickupAddress: string;
  dropoffAddress: string;
  recipientName: string;
  recipientPhone: string;
};

export type NinjaOrder = {
  externalId: string;
  trackingUrl: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
};

export function quote(input: NinjaQuoteInput): NinjaQuote {
  const { pickup, dropoff, weightKg = 1 } = input;
  const dLat = (dropoff.lat - pickup.lat);
  const dLng = (dropoff.lng - pickup.lng);
  const distanceKm = Math.max(1, Math.sqrt(dLat * dLat + dLng * dLng) * 111);
  const base = 15 + distanceKm * 2 + Math.max(0, weightKg - 1) * 1.5;
  const fuel = base * 0.05;
  const vat = (base + fuel) * 0.15;
  const total = Math.round((base + fuel + vat) * 100) / 100;
  return {
    etaMinutes: Math.round(distanceKm * 6) || 15,
    distanceKm: Math.round(distanceKm * 10) / 10,
    base: Math.round(base * 100) / 100,
    fuel: Math.round(fuel * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total,
    currency: 'SAR',
  };
}

export async function createOrder(_: NinjaCreateOrderInput): Promise<NinjaOrder> {
  // ديمو: نرجّع ExternalId وهمي + رابط تتبّع
  const externalId = `ninja_${Date.now()}`;
  const trackingUrl = `https://track.ninja.example/${externalId}`;
  return { externalId, trackingUrl, status: 'ASSIGNED' };
}
