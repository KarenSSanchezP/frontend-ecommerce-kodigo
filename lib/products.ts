import type { Product, ProductListResponse, ProductResponse, Paginated } from '@/lib/types';

// Este módulo se importa únicamente desde componentes de servidor.
// La API escucha en el puerto 8091 de Windows, accesible para el proceso Node.js local.
const apiBase = () => {
  const base = process.env.API_BASE_URL;
  if (!base) {
    throw new Error('Falta API_BASE_URL en .env.local. Copia .env.example y reinicia Next.js.');
  }
  return base.replace(/\/$/, '');
};

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new ApiRequestError('La API Laravel no responde. Comprueba Docker y el puerto 8091.', 503);
  }

  if (!response.ok) {
    throw new ApiRequestError(
      response.status === 404 ? 'El producto solicitado no existe.' : `La API respondió con HTTP ${response.status}.`,
      response.status
    );
  }

  const payload = (await response.json()) as T;
  return payload;
}

export async function getProducts(): Promise<Paginated<Product>> {
  const response = await getJson<ProductListResponse>('/products');
  if (!response.success || !Array.isArray(response.data?.data)) {
    throw new Error('La API no devolvió el formato esperado para el catálogo.');
  }
  return response.data;
}

export async function getProduct(id: number): Promise<Product | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  try {
    const response = await getJson<ProductResponse>(`/products/${id}`);
    return response.success ? response.data : null;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}

export function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
