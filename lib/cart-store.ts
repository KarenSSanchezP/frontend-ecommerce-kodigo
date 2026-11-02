'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { Product } from '@/lib/types';

export type CartItem = {
  id: number;
  sku: string;
  name: string;
  price_cents: number;
  stock: number;
  quantity: number;
};

type CartSnapshot = { ready: boolean; items: CartItem[] };

const STORAGE_KEY = 'kodigo-store-cart-v1';
const SERVER_SNAPSHOT: CartSnapshot = { ready: false, items: [] };
let snapshot: CartSnapshot = SERVER_SNAPSHOT;
let initialized = false;
const subscribers = new Set<() => void>();

function notify(next: CartSnapshot) {
  snapshot = next;
  subscribers.forEach((subscriber) => subscriber());
}

function parseItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const unique = new Set<number>();
  const result: CartItem[] = [];

  for (const entry of raw.slice(0, 100)) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Partial<CartItem>;
    if (
      typeof item.id !== 'number' || !Number.isSafeInteger(item.id) || item.id < 1 ||
      typeof item.sku !== 'string' || item.sku.length > 50 ||
      typeof item.name !== 'string' || !item.name || item.name.length > 200 ||
      typeof item.price_cents !== 'number' || !Number.isSafeInteger(item.price_cents) || item.price_cents < 0 ||
      typeof item.stock !== 'number' || !Number.isSafeInteger(item.stock) || item.stock < 0 ||
      typeof item.quantity !== 'number' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
      unique.has(item.id)
    ) continue;
    unique.add(item.id);
    const quantity = Math.min(item.quantity, item.stock);
    if (quantity > 0) {
      result.push({ id: item.id, sku: item.sku, name: item.name, price_cents: item.price_cents, stock: item.stock, quantity });
    }
  }
  return result;
}

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : parseItems(JSON.parse(raw));
  } catch {
    return [];
  }
}

function loadCart() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;
  notify({ ready: true, items: readStorage() });
  // Mantener sincronizado el carrito si hay varias pestañas abiertas.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      notify({ ready: true, items: readStorage() });
    }
  });
}

function setItems(items: CartItem[]) {
  notify({ ready: true, items });
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // El carrito continúa en memoria si el navegador restringe el almacenamiento.
  }
}

function subscribe(listener: () => void) {
  subscribers.add(listener);
  return () => { subscribers.delete(listener); };
}

function getSnapshot(): CartSnapshot { return snapshot; }
function getServerSnapshot(): CartSnapshot { return SERVER_SNAPSHOT; }

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(loadCart, []);
  const count = current.items.reduce((total, item) => total + item.quantity, 0);
  const totalCents = current.items.reduce((total, item) => total + item.price_cents * item.quantity, 0);

  return {
    ...current,
    count,
    totalCents,
    add: addToCart,
    updateQuantity,
    remove: removeFromCart,
    clear: clearCart,
  };
}

export function addToCart(product: Product): boolean {
  if (typeof window === 'undefined') return false;
  loadCart();
  if (!product.is_active || !Number.isSafeInteger(product.stock) || product.stock < 1) return false;
  const current = snapshot.items.find((item) => item.id === product.id);
  if (current && current.quantity >= product.stock) return false;

  const items = current
    ? snapshot.items.map((item) => item.id === product.id
      ? { ...item, name: product.name, sku: product.sku, price_cents: product.price_cents, stock: product.stock, quantity: item.quantity + 1 }
      : item)
    : [...snapshot.items, {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price_cents: product.price_cents,
      stock: product.stock,
      quantity: 1,
    }];
  setItems(items);
  return true;
}

export function updateQuantity(id: number, quantity: number) {
  if (typeof window === 'undefined' || !Number.isSafeInteger(quantity)) return;
  loadCart();
  if (quantity <= 0) return removeFromCart(id);
  setItems(snapshot.items.map((item) => item.id === id
    ? { ...item, quantity: Math.min(quantity, item.stock) }
    : item));
}

export function removeFromCart(id: number) {
  if (typeof window === 'undefined') return;
  loadCart();
  setItems(snapshot.items.filter((item) => item.id !== id));
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  loadCart();
  setItems([]);
}
