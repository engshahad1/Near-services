export async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...init,
  });
  const data = await res.json();
  if (!res.ok || (data && data.ok === false)) {
    const msg = data?.error || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data?.data ?? data;
}

export function getProviderId(): string | null {
  try {
    return localStorage.getItem('demo_provider_id');
  } catch { return null; }
}

export function setProviderId(id: string) {
  try { localStorage.setItem('demo_provider_id', id); } catch {}
}
