/**
 * ENTIDADES DO DOMÍNIO — base para futuras tabelas/APIs.
 */

export type CityId = "buzios" | "cabo-frio" | "sao-pedro" | "arraial";
export type Role = "buyer" | "producer" | "courier";

export type CategoryId = "hortifruti" | "laticinios" | "doces" | "mel" | "outros";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
}

export interface Producer {
  id: string;
  name: string;
  owner: string;
  image: string;
  city: CityId;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  /** Cidades atendidas pelo produtor. */
  servesCities: CityId[];
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: CategoryId;
  producerId: string;
  price: number;
  unit: string;
  stock: number;
  available: boolean;
  rating: number;
  /** Preço "de" para ofertas (opcional). */
  compareAtPrice?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: CityId;
}

export type PaymentMethod = "pix" | "card";
export type PaymentStatus = "pending" | "approved" | "refused" | "refunded";
export type DeliveryOptionId = "standard" | "express";

export type OrderStatus =
  | "NOVO"
  | "CONFIRMADO"
  | "EM_PREPARACAO"
  | "PRONTO_RETIRADA"
  | "ENTREGUE"
  | "CANCELADO";

export type DeliveryStatus =
  | "AGUARDANDO" // pedido ainda não está pronto / não publicado
  | "DISPONIVEL"
  | "ACEITA"
  | "A_CAMINHO"
  | "COLETADO"
  | "EM_ENTREGA"
  | "ENTREGUE"
  | "CANCELADA";

export interface OrderLine {
  productId: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderEvent {
  label: string;
  at: string; // ISO
}

/**
 * Um Pedido pertence a UM produtor. Um checkout com vários produtores
 * gera um "Checkout" (grupo) com N pedidos.
 */
export interface Order {
  id: string;
  number: string;
  checkoutId: string;
  buyerName: string;
  producerId: string;
  lines: OrderLine[];
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
  address: Address;
  deliveryOption: DeliveryOptionId;
  payment: { method: PaymentMethod; status: PaymentStatus };
  status: OrderStatus;
  delivery: {
    status: DeliveryStatus;
    courierId?: string;
    courierEarning: number;
  };
  events: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Courier {
  id: string;
  name: string;
  vehicle: string;
}
