import { Product, Order, Company, LedgerTransaction, AnalyticsSummary } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`API Fetch Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetchJson<{ status: string }>('/health');
      return res.status === 'ok';
    } catch {
      return false;
    }
  },

  // Analytics
  getAnalytics: async (companyId?: string): Promise<{ success: boolean; analytics: AnalyticsSummary }> => {
    const qs = companyId ? `?companyId=${companyId}` : '';
    return fetchJson(`/analytics/dashboard${qs}`);
  },

  // Products
  getProducts: async (params?: { category?: string; search?: string; companyId?: string }): Promise<{ success: boolean; count: number; products: Product[] }> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.companyId) query.append('companyId', params.companyId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/products${qs}`);
  },

  getProductById: async (id: string): Promise<{ success: boolean; product: Product }> => {
    return fetchJson(`/products/${id}`);
  },

  createProduct: async (productData: Partial<Product>): Promise<{ success: boolean; product: Product; message?: string }> => {
    return fetchJson('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<{ success: boolean; product: Product; message?: string }> => {
    return fetchJson(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  getOrders: async (params?: { sellerId?: string; companyId?: string; status?: string; paymentStatus?: string }): Promise<{ success: boolean; count: number; orders: Order[] }> => {
    const query = new URLSearchParams();
    if (params?.sellerId) query.append('sellerId', params.sellerId);
    if (params?.companyId) query.append('companyId', params.companyId);
    if (params?.status) query.append('status', params.status);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/orders${qs}`);
  },

  updateOrderStatus: async (orderId: string, status: string, notes?: string): Promise<{ success: boolean; order: Order }> => {
    return fetchJson(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  updatePaymentStatus: async (orderId: string, paymentStatus: string, paidAmount?: number): Promise<{ success: boolean; order: Order }> => {
    return fetchJson(`/orders/${orderId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus, paidAmount }),
    });
  },

  // Ledger
  getLedger: async (params?: { sellerId?: string; companyId?: string }): Promise<{ success: boolean; transactions: LedgerTransaction[]; summary: any }> => {
    const query = new URLSearchParams();
    if (params?.sellerId) query.append('sellerId', params.sellerId);
    if (params?.companyId) query.append('companyId', params.companyId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson(`/ledger${qs}`);
  },

  payLedgerDue: async (data: {
    sellerId: string;
    companyId: string;
    amount: number;
    paymentMethod: string;
    orderId?: string;
    notes?: string;
  }): Promise<{ success: boolean; transaction: LedgerTransaction; message?: string }> => {
    return fetchJson('/ledger/pay', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Companies
  getCompanies: async (): Promise<{ success: boolean; count: number; companies: Company[] }> => {
    return fetchJson('/companies');
  },

  verifyCompany: async (id: string, verified: boolean): Promise<{ success: boolean; company: Company }> => {
    return fetchJson(`/companies/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    });
  },
};

