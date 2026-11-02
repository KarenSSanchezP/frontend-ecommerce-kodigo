export type Product = {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  sku: string;
  stock: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ProductListResponse = ApiEnvelope<Paginated<Product>>;
export type ProductResponse = ApiEnvelope<Product>;
