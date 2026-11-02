'use server';

import { revalidatePath } from 'next/cache';
import { apiBaseUrl, getSessionToken } from '@/lib/auth';

export type CreateOrderState = { error: string; orderId: number | null };
export type CancelOrderState = { error: string; success: boolean };

type ResponseData<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

async function authedPost<T>(path: string, payload: object = {}): Promise<{ status: number; data: ResponseData<T> }> {
  const token = await getSessionToken();
  if (!token) return { status: 401, data: { success: false } };
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({} as ResponseData<T>));
  return { status: response.status, data: data as ResponseData<T> };
}

export async function createOrderAction(_prev: CreateOrderState, formData: FormData): Promise<CreateOrderState> {
  void _prev;
  const failure = (error: string): CreateOrderState => ({ error, orderId: null });
  const raw = formData.get('items');
  if (typeof raw !== 'string' || raw.length > 2048) return failure('Revisa los artículos de tu carrito.');
  let items: unknown;
  try { items = JSON.parse(raw); } catch { return failure('Revisa los artículos de tu carrito.'); }
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
    return failure('Puedes incluir entre 1 y 20 productos distintos por pedido.');
  }
  const ids = new Set<number>();
  for (const entry of items) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return failure('Hay artículos no válidos en el carrito.');
    const { product_id, quantity } = entry as { product_id?: unknown; quantity?: unknown };
    if (typeof product_id !== 'number' || !Number.isSafeInteger(product_id) || product_id < 1 ||
        typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100 ||
        ids.has(product_id) || Object.keys(entry).some((key) => key !== 'product_id' && key !== 'quantity')) {
      return failure('Revisa las cantidades y vuelve a intentarlo.');
    }
    ids.add(product_id);
  }

  let result: Awaited<ReturnType<typeof authedPost<{ id: number }>>>;
  try {
    result = await authedPost<{ id: number }>('/orders', { items });
  } catch {
    // No repetir automáticamente: la creación pudo completarse aunque la conexión se cortara.
    return failure('No pudimos confirmar si se creó el pedido. Revisa Mis pedidos antes de volver a intentarlo.');
  }
  if (result.status === 401) return failure('Tu sesión ha caducado. Inicia sesión nuevamente.');
  if (result.status === 422) return failure('No hay existencias suficientes o cambió la disponibilidad de algún artículo. Revisa el catálogo.');
  if (result.status === 429) return failure('Demasiadas solicitudes. Inténtalo más tarde.');
  if (result.status !== 201 || !result.data.success ||
      !result.data.data || !Number.isSafeInteger(result.data.data.id) || result.data.data.id <= 0) {
    return failure('No se pudo crear el pedido. Revisa Mis pedidos antes de volver a intentarlo.');
  }
  revalidatePath('/pedidos');
  revalidatePath('/catalogo');
  revalidatePath('/');
  return { error: '', orderId: result.data.data.id };
}

export async function cancelOrderAction(_prev: CancelOrderState, formData: FormData): Promise<CancelOrderState> {
  void _prev;
  const raw = formData.get('order_id');
  const id = typeof raw === 'string' && /^\d{1,12}$/.test(raw) ? Number(raw) : 0;
  if (!Number.isSafeInteger(id) || id <= 0) return { error: 'El pedido no es válido.', success: false };
  let result: Awaited<ReturnType<typeof authedPost<unknown>>>;
  try { result = await authedPost(`/orders/${id}/cancel`); }
  catch { return { error: 'No se pudo confirmar la cancelación. Revisa el estado de tu pedido.', success: false }; }
  if (result.status === 401) return { error: 'Inicia sesión nuevamente.', success: false };
  if (result.status === 409) return { error: 'Este pedido ya no se puede cancelar desde aquí.', success: false };
  if (!result.data.success || result.status !== 200) return { error: 'No pudimos cancelar el pedido.', success: false };
  revalidatePath(`/pedidos/${id}`);
  revalidatePath('/pedidos');
  revalidatePath('/catalogo');
  revalidatePath('/');
  return { error: '', success: true };
}


/** Inicia el pago de una orden existente sin crear otra ni marcarla como pagada. */
export type StartPaymentState = { error: string; checkoutUrl: string | null };

export async function startStripeCheckoutAction(
  _previous: StartPaymentState,
  formData: FormData
): Promise<StartPaymentState> {
  void _previous;
  const fail = (error: string): StartPaymentState => ({ error, checkoutUrl: null });
  const raw = formData.get('order_id');
  const id = typeof raw === 'string' && /^\d{1,12}$/.test(raw) ? Number(raw) : 0;
  if (!Number.isSafeInteger(id) || id < 1) return fail('El pedido no es válido.');

  let response: Awaited<ReturnType<typeof authedPost<{ checkout_url: string }>>>;
  try {
    response = await authedPost<{ checkout_url: string }>(`/orders/${id}/checkout`);
  } catch {
    // Laravel reutiliza la sesión Stripe existente al reintentar.
    return fail('No pudimos conectar con el servicio de pago. Revisa el estado de tu pedido antes de volver a intentar.');
  }
  if (response.status === 401) return fail('Tu sesión ha caducado. Inicia sesión nuevamente.');
  if (response.status === 404) return fail('No encontramos este pedido en tu cuenta.');
  if (response.status === 409) return fail('La sesión de pago ya no está disponible. Consulta el estado del pedido.');
  if (response.status === 429) return fail('Demasiados intentos. Vuelve a probar más tarde.');
  if (response.status === 503) return fail('Los pagos con tarjeta no están disponibles en este momento.');
  if (response.status !== 200 || !response.data.success) {
    return fail('No pudimos iniciar el pago. Inténtalo de nuevo más tarde.');
  }

  const target = response.data.data?.checkout_url;
  if (typeof target !== 'string') return fail('No pudimos abrir el servicio de pago.');
  try {
    const url = new URL(target);
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || !url.pathname.startsWith('/')) {
      return fail('No pudimos validar la página de pago.');
    }
  } catch {
    return fail('No pudimos validar la página de pago.');
  }

  revalidatePath(`/pedidos/${id}`);
  revalidatePath('/pedidos');
  return { error: '', checkoutUrl: target };
}
