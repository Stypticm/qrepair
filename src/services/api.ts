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
  list<T>(resource: string, params?: Record<string, string | number>): Promise<T[]>;
  get<T>(resource: string, id: string): Promise<T>;
  create<T>(resource: string, data: any): Promise<T>;
  update<T>(resource: string, id: string, data: any): Promise<T>;
  patch<T>(resource: string, id: string, data: any): Promise<T>;
  upload(file: File): Promise<{ url: string }>;
  delete(resource: string, id: string): Promise<void>;
}

export const api: ApiService = {
  /**
   * Получить список ресурсов (GET /api/{resource})
   * Возвращает массив элементов.
   */
  async list<T>(resource: string, params?: Record<string, string | number>): Promise<T[]> {
    const url = new URL(`${API_URL}/api/${resource}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        url.searchParams.append(key, val.toString());
      });
    }
    
    const res = await fetch(url.toString(), {
      headers: defaultHeaders,
    });
    return handleResponse<T[]>(res);
  },

  /**
   * Получить один ресурс по ID (GET /api/{resource}/{id})
   */
  async get<T>(resource: string, id: string): Promise<T> {
    const res = await fetch(`${API_URL}/api/${resource}/${id}`, {
      headers: defaultHeaders,
    });
    return handleResponse<T>(res);
  },

  /**
   * Создать новый ресурс (POST /api/{resource})
   */
  async create<T>(resource: string, data: any): Promise<T> {
    const res = await fetch(`${API_URL}/api/${resource}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    return handleResponse<T>(res);
  },

  /**
   * Полное обновление ресурса (PUT /api/{resource}/{id})
   */
  async update<T>(resource: string, id: string, data: any): Promise<T> {
    const res = await fetch(`${API_URL}/api/${resource}/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    return handleResponse<T>(res);
  },

  /**
   * Частичное обновление ресурса (PATCH /api/{resource}/{id})
   */
  async patch<T>(resource: string, id: string, data: any): Promise<T> {
    const res = await fetch(`${API_URL}/api/${resource}/${id}`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    return handleResponse<T>(res);
  },

  /**
   * Загрузка файла (POST /api/upload)
   * Принимает File и возвращает { url: string }
   */
  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });
    
    return handleResponse<{ url: string }>(res);
  },

  /**
   * Удаление ресурса (DELETE /api/{resource}/{id})
   */
  async delete(resource: string, id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/${resource}/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `HTTP error! status: ${res.status}`);
    }
  },
};
