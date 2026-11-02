import 'server-only';
import { apiBaseUrl, getSessionToken } from '@/lib/auth';

export type OrderItem = {
  id: number;
  product_id: number;
  name_snapshot: string;
  unit_price_cents: number;
  subtotal_cents: number;
  quantity: number;
};

export type CustomerOrder = {
  id: number;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  items: OrderItem[];
  payment: {
    status: string;
    stripe_checkout_session_id: string | null;
  } | null;
};

type ApiResponse<T> = { success?: boolean; data?: T };
type Pagination<T> = { data: T[]; current_page: number; last_page: number; total: number };

export class OrderApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'OrderApiError';
  }
}

async function fetchAuthed<T>(path: string): Promise<T> {
  const token = await getSessionToken();
  if (!token) throw new OrderApiError(401, 'Inicia sesión para consultar tus pedidos.');
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new OrderApiError(503, 'No pudimos consultar tus pedidos. Inténtalo de nuevo.');
  }
  if (!response.ok) {
    throw new OrderApiError(response.status, response.status === 404
      ? 'Pedido no encontrado.' : 'No fue posible consultar tus pedidos.');
  }
  const body = (await response.json()) as ApiResponse<T>;
  if (!body.success || !body.data) throw new OrderApiError(502, 'La información del pedido no está disponible.');
  return body.data;
}

export async function getOrders(page = 1): Promise<Pagination<CustomerOrder>> {
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000) throw new OrderApiError(400, 'Página no válida.');
  return fetchAuthed<Pagination<CustomerOrder>>(`/orders?page=${page}`);
}

export async function getOrder(id: number): Promise<CustomerOrder> {
  if (!Number.isSafeInteger(id) || id <= 0) throw new OrderApiError(404, 'Pedido no encontrado.');
  return fetchAuthed<CustomerOrder>(`/orders/${id}`);
}

export function orderStatus(status: string): string {
  switch (status) {
    case 'paid': return 'Pagado';
    case 'pending': return 'Pendiente de pago';
    case 'cancelled': return 'Cancelado';
    case 'expired': return 'Expirado';
    case 'failed': return 'No completado';
    default: return 'En revisión';
  }
}
