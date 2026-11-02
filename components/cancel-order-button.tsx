'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cancelOrderAction, type CancelOrderState } from '@/app/actions/orders';

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const [state, action, pending] = useActionState<CancelOrderState, FormData>(cancelOrderAction, { error: '', success: false });
  const router = useRouter();
  useEffect(() => { if (state.success) router.refresh(); }, [state.success, router]);
  return <form action={action} className="cancel-order-form">
    <input type="hidden" name="order_id" value={orderId} />
    {state.error && <p className="auth-error" role="alert">{state.error}</p>}
    <button className="btn-secondary" type="submit" disabled={pending || state.success}>
      {pending ? 'Cancelando pedido…' : state.success ? 'Pedido cancelado' : 'Cancelar pedido'}
    </button>
  </form>;
}
