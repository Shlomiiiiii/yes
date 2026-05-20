/**
 * Frontend API client. Backend lives at VITE_BACKEND_URL (set in Vercel env).
 * Falls back to the live Render URL for convenience.
 */

export type Client = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyIds: string[];
  totalSpent: number;
  galleries: number;
  createdAt: string;
};

export type Property = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  price: number;
  clientId: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  estimatedValue: number;
  propertyType: string;
  externalListingUrl?: string;
  coverImage: string;
  images: string[];
  videos: string[];
  shareSlug: string;
  isLocked: boolean;
  published: boolean;
  createdAt: string;
};

export type Purchase = {
  id: string;
  propertyId: string;
  clientId: string;
  clientEmail: string;
  stripeSessionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'unpaid' | 'refunded';
  unlockedAt?: string;
  downloadStatus: 'downloaded' | 'not-downloaded';
  createdAt: string;
};

export type FinanceSummary = {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  pendingRevenue: number;
  paidGalleries: number;
  averageSale: number;
  growthPercent: number;
  galleriesSold: number;
};

export type RevenuePoint = { month: string; revenue: number };
export type CityRevenue = { city: string; revenue: number };
export type TopClient = {
  clientId: string;
  fullName: string;
  galleries: number;
  totalSpent: number;
};

export type AutofillResult = {
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  estimatedValue?: number;
  propertyType?: string;
  externalListingUrl?: string;
};

export type AiMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type CreateClientInput = { fullName: string; email: string; phone: string };

export type CreatePropertyInput = {
  address: string;
  city: string;
  state: string;
  zip: string;
  description?: string;
  price: number;
  clientId: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  estimatedValue?: number;
  propertyType?: string;
  externalListingUrl?: string;
};

export type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin';
};

const API_BASE =
  ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'https://solo-oy78.onrender.com';

async function call<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  backendUrl: API_BASE,
  status: () =>
    call<{
      store: 'memory' | 'firestore';
      firebase: boolean;
      firebaseError: string | null;
      gemini: boolean;
      stripe: boolean;
      stripeWebhook: boolean;
    }>('/api/status'),

  auth: {
    signIn: (email: string, password: string) =>
      call<{ user: AdminUser }>('/api/auth/sign-in', { method: 'POST', body: { email, password } }),
  },

  clients: {
    list: () => call<Client[]>('/api/clients'),
    get: (id: string) => call<Client>(`/api/clients/${id}`),
    create: (input: CreateClientInput) =>
      call<Client>('/api/clients', { method: 'POST', body: input }),
    update: (id: string, patch: Partial<CreateClientInput>) =>
      call<Client>(`/api/clients/${id}`, { method: 'PATCH', body: patch }),
    delete: (id: string) => call<{ ok: boolean }>(`/api/clients/${id}`, { method: 'DELETE' }),
  },

  properties: {
    list: () => call<Property[]>('/api/properties'),
    get: (id: string) => call<Property>(`/api/properties/${id}`),
    bySlug: (slug: string) => call<Property>(`/api/public/properties/by-slug/${slug}`),
    create: (input: CreatePropertyInput) =>
      call<Property>('/api/properties', { method: 'POST', body: input }),
    update: (id: string, patch: Partial<Property>) =>
      call<Property>(`/api/properties/${id}`, { method: 'PATCH', body: patch }),
    delete: (id: string) => call<{ ok: boolean }>(`/api/properties/${id}`, { method: 'DELETE' }),
    addMedia: (id: string, url: string, kind: 'image' | 'video' = 'image') =>
      call<Property>(`/api/properties/${id}/media`, { method: 'POST', body: { url, kind } }),
    upload: async (id: string, files: File[]) => {
      const form = new FormData();
      for (const f of files) form.append('files', f, f.name);
      const res = await fetch(`${API_BASE}/api/properties/${id}/upload`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        let message = `Upload failed: ${res.status}`;
        try {
          const d = await res.json();
          if (d?.error) message = d.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      return (await res.json()) as { property: Property; urls: string[] };
    },
    autofill: (input: { address: string; city: string; state: string; zip: string }) =>
      call<AutofillResult>('/api/properties/autofill', { method: 'POST', body: input }),
  },

  payments: {
    list: () => call<Purchase[]>('/api/payments'),
    checkout: (propertyId: string, clientEmail: string) =>
      call<{ sessionId: string; url: string }>('/api/public/payments/checkout', {
        method: 'POST',
        body: { propertyId, clientEmail },
      }),
  },

  finances: {
    summary: () => call<FinanceSummary>('/api/finances/summary'),
    revenueOverTime: () => call<RevenuePoint[]>('/api/finances/revenue-over-time'),
    revenueByCity: () => call<CityRevenue[]>('/api/finances/revenue-by-city'),
    topClients: () => call<TopClient[]>('/api/finances/top-clients'),
  },

  ai: {
    ask: (prompt: string, history: AiMessage[] = []) =>
      call<{ reply: string }>('/api/ai/ask', { method: 'POST', body: { prompt, history } }),
    generateListing: (propertyId: string) =>
      call<{ reply: string }>('/api/ai/generate-listing', { method: 'POST', body: { propertyId } }),
    generateCaption: (propertyId: string) =>
      call<{ reply: string }>('/api/ai/generate-caption', { method: 'POST', body: { propertyId } }),
  },
};
