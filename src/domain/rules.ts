/**
 * REGRAS DE NEGÓCIO — funções puras (sem React, sem storage).
 * Em produção estas regras devem ser reexecutadas no backend.
 */
import {
  COURIER_SHARE,
  DELIVERY_OPTIONS,
  PLATFORM_FEE_RATE,
  getCity,
} from "@/config/app.config";
import type {
  CartItem,
  CityId,
  DeliveryOptionId,
  DeliveryStatus,
  OrderStatus,
  Product,
} from "./types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/* ---------- Taxas ---------- */
export const platformFee = (subtotal: number) => round2(subtotal * PLATFORM_FEE_RATE);

export const deliveryFee = (city: CityId, option: DeliveryOptionId = "standard") => {
  const mult = DELIVERY_OPTIONS.find((o) => o.id === option)?.multiplier ?? 1;
  return round2(getCity(city).deliveryFee * mult);
};

export const courierEarning = (fee: number) => round2(fee * COURIER_SHARE);

/* ---------- Estoque ---------- */
export type StockCheck = { ok: true } | { ok: false; reason: "unavailable" | "insufficient"; max: number };

export function checkStock(product: Product, quantity: number): StockCheck {
  if (!product.available || product.stock <= 0) return { ok: false, reason: "unavailable", max: 0 };
  if (quantity > product.stock) return { ok: false, reason: "insufficient", max: product.stock };
  return { ok: true };
}

/* ---------- Carrinho (multi-produtor) ---------- */
export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}
export interface CartGroup {
  producerId: string;
  lines: CartLine[];
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
}
export interface CartSummary {
  groups: CartGroup[];
  itemCount: number;
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
}

/**
 * Agrupa o carrinho por produtor. Cada produtor gera um pedido e uma entrega
 * separada (portanto uma taxa de entrega por produtor).
 */
export function summarizeCart(
  items: CartItem[],
  products: Product[],
  city: CityId,
  option: DeliveryOptionId = "standard",
): CartSummary {
  const byProducer = new Map<string, CartLine[]>();
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const line = { product, quantity: item.quantity, lineTotal: round2(product.price * item.quantity) };
    byProducer.set(product.producerId, [...(byProducer.get(product.producerId) ?? []), line]);
  }
  const groups: CartGroup[] = [...byProducer.entries()].map(([producerId, lines]) => {
    const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
    const pf = platformFee(subtotal);
    const df = deliveryFee(city, option);
    return { producerId, lines, subtotal, platformFee: pf, deliveryFee: df, total: round2(subtotal + pf + df) };
  });
  const sum = (k: keyof Pick<CartGroup, "subtotal" | "platformFee" | "deliveryFee" | "total">) =>
    round2(groups.reduce((s, g) => s + g[k], 0));
  return {
    groups,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: sum("subtotal"),
    platformFee: sum("platformFee"),
    deliveryFee: sum("deliveryFee"),
    total: sum("total"),
  };
}

/* ---------- Máquina de estados: Pedido (produtor) ---------- */
export const ORDER_FLOW: OrderStatus[] = ["NOVO", "CONFIRMADO", "EM_PREPARACAO", "PRONTO_RETIRADA", "ENTREGUE"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  NOVO: "Novo",
  CONFIRMADO: "Confirmado",
  EM_PREPARACAO: "Em preparação",
  PRONTO_RETIRADA: "Pronto p/ retirada",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

/** Próximo status que o PRODUTOR pode aplicar. ENTREGUE é definido pela entrega. */
export function nextOrderStatus(s: OrderStatus): OrderStatus | null {
  if (s === "NOVO") return "CONFIRMADO";
  if (s === "CONFIRMADO") return "EM_PREPARACAO";
  if (s === "EM_PREPARACAO") return "PRONTO_RETIRADA";
  return null;
}

export const canCancelOrder = (s: OrderStatus, d: DeliveryStatus) =>
  (s === "NOVO" || s === "CONFIRMADO" || s === "EM_PREPARACAO") && (d === "AGUARDANDO" || d === "DISPONIVEL");

/* ---------- Máquina de estados: Entrega (motoboy) ---------- */
export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  AGUARDANDO: "Aguardando produtor",
  DISPONIVEL: "Disponível",
  ACEITA: "Aceita",
  A_CAMINHO: "A caminho da coleta",
  COLETADO: "Coletado",
  EM_ENTREGA: "Em entrega",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

export function nextDeliveryStatus(s: DeliveryStatus): DeliveryStatus | null {
  const flow: DeliveryStatus[] = ["DISPONIVEL", "ACEITA", "A_CAMINHO", "COLETADO", "EM_ENTREGA", "ENTREGUE"];
  const i = flow.indexOf(s);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1]! : null;
}

/* ---------- Timeline do comprador ---------- */
export const TIMELINE_STEPS = [
  "Pedido realizado",
  "Confirmado",
  "Preparando",
  "Pronto",
  "Motoboy aceitou",
  "Em entrega",
  "Entregue",
] as const;

/** Índice do passo atual da timeline (0..6) a partir dos dois status. */
export function timelineIndex(o: OrderStatus, d: DeliveryStatus): number {
  if (d === "ENTREGUE" || o === "ENTREGUE") return 6;
  if (d === "COLETADO" || d === "EM_ENTREGA") return 5;
  if (d === "ACEITA" || d === "A_CAMINHO") return 4;
  if (o === "PRONTO_RETIRADA") return 3;
  if (o === "EM_PREPARACAO") return 2;
  if (o === "CONFIRMADO") return 1;
  return 0;
}

/* ---------- Formatação ---------- */
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
