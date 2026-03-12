/**
 * Универсальный сервис для работы с Go REST API.
 * Используется для замены прямых вызовов Supabase.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sirena-eriophyllous-melisa.ngrok-free.dev';

interface ApiResponse<T> {
  data?: T;
  items?: T[];
  total?: number;
  error?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json() as ApiResponse<T>;
  
  if (!res.ok) {
    throw new Error(json.error || `HTTP error! status: ${res.status}`);
  }
  
  // Возвращаем либо массив items, либо объект data, либо сам json если структура иная
  if (json.items !== undefined) return json.items as any;
  if (json.data !== undefined) return json.data as T;
  
  return json as T;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export interface ApiService {
  getDistinct(resource: string, field: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<string[]>;
  list<T>(resource: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<T[]>;
  listPaginated<T>(resource: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<{ items: T[], total: number }>;
  get<T>(resource: string, id: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<T>;
  create<T>(resource: string, data: any, headers?: Record<string, string>): Promise<T>;
  update<T>(resource: string, id: string, data: any, headers?: Record<string, string>): Promise<T>;
  patch<T>(resource: string, id: string, data: any, headers?: Record<string, string>): Promise<T>;
  upload(file: File, headers?: Record<string, string>): Promise<{ url: string }>;
  delete(resource: string, id: string, headers?: Record<string, string>): Promise<void>;
}

export const api: ApiService = {
  async getDistinct(resource: string, field: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<string[]> {
    const url = new URL(`${API_URL}/api/${resource}/distinct/${field}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        url.searchParams.append(key, val.toString());
      });
    }
    
    const res = await fetch(url.toString(), {
      headers: { ...defaultHeaders, ...headers },
    });
    return handleResponse<string[]>(res);
  },

  async list<T>(resource: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<T[]> {
    const url = new URL(`${API_URL}/api/${resource}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        url.searchParams.append(key, val.toString());
      });
    }
    
    try {
      const res = await fetch(url.toString(), {
        headers: { ...defaultHeaders, ...headers },
      });
      return handleResponse<T[]>(res);
    } catch (error: any) {
      console.error(`API List error [${url.toString()}]:`, error.message || error);
      throw error;
    }
  },

  async listPaginated<T>(resource: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<{ items: T[], total: number }> {
    const url = new URL(`${API_URL}/api/${resource}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        url.searchParams.append(key, val.toString());
      });
    }
    
    try {
      const res = await fetch(url.toString(), {
        headers: { ...defaultHeaders, ...headers },
      });
      const json = await res.json();
      return {
        items: json.data || [],
        total: json.total || 0,
      };
    } catch (error: any) {
      console.error(`API ListPaginated error [${url.toString()}]:`, error.message || error);
      throw error;
    }
  },

  async get<T>(resource: string, id: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_URL}/api/${resource}/${id}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        url.searchParams.append(key, val.toString());
      });
    }
    
    try {
      const res = await fetch(url.toString(), {
        headers: { ...defaultHeaders, ...headers },
      });
      return handleResponse<T>(res);
    } catch (error: any) {
      console.error(`API Get error [${url.toString()}]:`, error.message || error);
      throw error;
    }
  },

  async create<T>(resource: string, data: any, headers?: Record<string, string>): Promise<T> {
    const url = `${API_URL}/api/${resource}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...defaultHeaders, ...headers },
        body: JSON.stringify(data),
      });
      return handleResponse<T>(res);
    } catch (error: any) {
      console.error(`API Create error [${url}]:`, error.message || error);
      throw error;
    }
  },

  async update<T>(resource: string, id: string, data: any, headers?: Record<string, string>): Promise<T> {
    const url = `${API_URL}/api/${resource}/${id}`;
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { ...defaultHeaders, ...headers },
        body: JSON.stringify(data),
      });
      return handleResponse<T>(res);
    } catch (error: any) {
      console.error(`API Update error [${url}]:`, error.message || error);
      throw error;
    }
  },

  async patch<T>(resource: string, id: string, data: any, headers?: Record<string, string>): Promise<T> {
    const url = `${API_URL}/api/${resource}/${id}`;
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { ...defaultHeaders, ...headers },
        body: JSON.stringify(data),
      });
      return handleResponse<T>(res);
    } catch (error: any) {
      console.error(`API Patch error [${url}]:`, error.message || error);
      throw error;
    }
  },

  async upload(file: File, headers?: Record<string, string>): Promise<{ url: string }> {
    const url = `${API_URL}/api/upload`;
    const formData = new FormData();
    formData.append('file', file);
    
    // Передаем папку если она есть в заголовках (прокидываем из API роута)
    const cleanHeaders = { ...headers };
    if (cleanHeaders['folder']) {
      formData.append('folder', cleanHeaders['folder']);
      delete cleanHeaders['folder'];
    }
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...cleanHeaders
        },
        body: formData,
      });
      
      return handleResponse<{ url: string }>(res);
    } catch (error: any) {
      console.error(`API Upload error [${url}]:`, error.message || error);
      throw error;
    }
  },

  async delete(resource: string, id: string, headers?: Record<string, string>): Promise<void> {
    const url = `${API_URL}/api/${resource}/${id}`;
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { ...defaultHeaders, ...headers },
      });
      
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `HTTP error! status: ${res.status}`);
      }
    } catch (error: any) {
      console.error(`API Delete error [${url}]:`, error.message || error);
      throw error;
    }
  },
};
