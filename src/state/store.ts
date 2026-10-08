/**
 * ESTADO GLOBAL (MOCK) — store simples com persistência em localStorage.
 * Cada ação aqui corresponde a um endpoint futuro (ver README → "APIs necessárias").
 */
import { useSyncExternalStore } from "react";
import { DEFAULT_CITY, STORAGE_KEY } from "@/config/app.config";
import { BUYER_NAME, CURRENT_COURIER_ID, PRODUCERS, PRODUCTS, SEED_ORDERS } from "@/data/mock";
import {
  ORDER_STATUS_LABEL, canCancelOrder, checkStock, courierEarning, nextDeliveryStatus, nextOrderStatus, summarizeCart,
} from "@/domain/rules";
import type {
  Address, CartItem, CityId, DeliveryOptionId, Order, OrderStatus, PaymentMethod, Product, Role,
} from "@/domain/types";

export interface AppState {
  role: Role | null;
  city: CityId;
  cart: CartItem[];
  products: Product[];
  orders: Order[];
  /** Produtor "logado" no painel (simulado). */
  producerId: string;
  orderSeq: number;
}

const initial = (): AppState => ({
  role: null, city: DEFAULT_CITY, cart: [], products: PRODUCTS, orders: SEED_ORDERS, producerId: PRODUCERS[0].id, orderSeq: 1002,
});

let state: AppState = initial();
let hydrated = false;
const listeners = new Set<() => void>();

function set(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as AppState;
      // imagens vêm do bundle; reaplica a partir do seed
      saved.products = saved.products.map((p) => ({ ...p, image: PRODUCTS.find((x) => x.id === p.id)?.image ?? p.image }));
      state = { ...initial(), ...saved };
    }
  } catch { /* storage corrompido: mantém seed */ }
  listeners.forEach((l) => l());
}

export function useAppStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => selector(state),
    () => selector(initial()),
  );
}
export const getState = () => state;

type Result = { ok: true; message?: string } | { ok: false; error: string };
const now = () => new Date().toISOString();
const findProduct = (id: string) => state.products.find((p) => p.id === id);

export const actions = {
  setRole: (role: Role | null) => set({ role }),
  setCity: (city: CityId) => set({ city }),
  setProducerId: (producerId: string) => set({ producerId }),
  resetDemo: () => { set(initial()); },

  /* ----- Carrinho ----- */
  addToCart(productId: string, qty = 1): Result {
    const p = findProduct(productId);
    if (!p) return { ok: false, error: "Produto não encontrado" };
    const current = state.cart.find((i) => i.productId === productId)?.quantity ?? 0;
    const check = checkStock(p, current + qty);
    if (!check.ok) return { ok: false, error: check.reason === "unavailable" ? "Produto indisponível no momento" : `Estoque insuficiente (máx. ${check.max})` };
    set((s) => ({
      cart: current ? s.cart.map((i) => (i.productId === productId ? { ...i, quantity: current + qty } : i)) : [...s.cart, { productId, quantity: qty }],
    }));
    return { ok: true, message: `${p.name} adicionado ao carrinho` };
  },
  setQuantity(productId: string, quantity: number): Result {
    if (quantity <= 0) { actions.removeFromCart(productId); return { ok: true }; }
    const p = findProduct(productId);
    if (!p) return { ok: false, error: "Produto não encontrado" };
    const check = checkStock(p, quantity);
    if (!check.ok) return { ok: false, error: check.reason === "unavailable" ? "Produto indisponível" : `Só temos ${check.max} ${p.unit} em estoque` };
    set((s) => ({ cart: s.cart.map((i) => (i.productId === productId ? { ...i, quantity } : i)) }));
    return { ok: true };
  },
  removeFromCart: (productId: string) => set((s) => ({ cart: s.cart.filter((i) => i.productId !== productId) })),
  clearCart: () => set({ cart: [] }),

  /* ----- Checkout (MOCK: pagamento simulado) ----- */
  placeOrder(input: { address: Address; deliveryOption: DeliveryOptionId; method: PaymentMethod; simulateRefusal?: boolean }):
    { ok: true; checkoutId: string; orderIds: string[] } | { ok: false; error: string } {
    if (!state.cart.length) return { ok: false, error: "Carrinho vazio" };
    for (const item of state.cart) {
      const p = findProduct(item.productId);
      const c = p ? checkStock(p, item.quantity) : { ok: false as const, reason: "unavailable" as const, max: 0 };
      if (!c.ok) return { ok: false, error: `${p?.name ?? "Produto"}: ${c.reason === "unavailable" ? "indisponível" : `apenas ${c.max} em estoque`}` };
    }
    if (input.simulateRefusal) return { ok: false, error: "Pagamento recusado (simulação). Tente outro método." };

    const summary = summarizeCart(state.cart, state.products, input.address.city, input.deliveryOption);
    const checkoutId = `c-${Date.now()}`;
    let seq = state.orderSeq;
    const ts = now();
    const orders: Order[] = summary.groups.map((g) => ({
      id: `o-${Date.now()}-${g.producerId}`,
      number: `FV-${seq++}`,
      checkoutId,
      buyerName: input.address.name || BUYER_NAME,
      producerId: g.producerId,
      lines: g.lines.map((l) => ({ productId: l.product.id, name: l.product.name, unit: l.product.unit, unitPrice: l.product.price, quantity: l.quantity, lineTotal: l.lineTotal })),
      subtotal: g.subtotal, platformFee: g.platformFee, deliveryFee: g.deliveryFee, total: g.total,
      address: input.address, deliveryOption: input.deliveryOption,
      payment: { method: input.method, status: "approved" },
      status: "NOVO",
      delivery: { status: "AGUARDANDO", courierEarning: courierEarning(g.deliveryFee) },
      events: [{ label: "Pedido realizado", at: ts }, { label: `Pagamento ${input.method === "pix" ? "PIX" : "cartão"} aprovado (simulado)`, at: ts }],
      createdAt: ts, updatedAt: ts,
    }));
    // baixa de estoque
    const products = state.products.map((p) => {
      const item = state.cart.find((i) => i.productId === p.id);
      if (!item) return p;
      const stock = p.stock - item.quantity;
      return { ...p, stock, available: stock > 0 ? p.available : false };
    });
    set((s) => ({ orders: [...orders, ...s.orders], products, cart: [], orderSeq: seq }));
    return { ok: true, checkoutId, orderIds: orders.map((o) => o.id) };
  },

  /* ----- Produtor ----- */
  updateProduct(id: string, patch: Partial<Pick<Product, "price" | "stock" | "available">>): Result {
    if (patch.price !== undefined && (!(patch.price > 0) || patch.price > 10000)) return { ok: false, error: "Preço inválido" };
    if (patch.stock !== undefined && (!Number.isInteger(patch.stock) || patch.stock < 0)) return { ok: false, error: "Estoque inválido" };
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    return { ok: true, message: "Produto atualizado" };
  },
  advanceOrder(orderId: string): Result {
    const o = state.orders.find((x) => x.id === orderId);
    if (!o) return { ok: false, error: "Pedido não encontrado" };
    const next = nextOrderStatus(o.status);
    if (!next) return { ok: false, error: "Status não pode avançar" };
    patchOrder(orderId, (x) => ({
      status: next,
      delivery: next === "PRONTO_RETIRADA" ? { ...x.delivery, status: "DISPONIVEL" } : x.delivery,
      events: [...x.events, { label: TIMELINE_LABEL[next], at: now() }],
    }));
    return { ok: true, message: `Pedido ${o.number}: ${ORDER_STATUS_LABEL[next]}` };
  },
  cancelOrder(orderId: string): Result {
    const o = state.orders.find((x) => x.id === orderId);
    if (!o) return { ok: false, error: "Pedido não encontrado" };
    if (!canCancelOrder(o.status, o.delivery.status)) return { ok: false, error: "Este pedido não pode mais ser cancelado" };
    // devolve estoque
    set((s) => ({
      products: s.products.map((p) => {
        const l = o.lines.find((x) => x.productId === p.id);
        return l ? { ...p, stock: p.stock + l.quantity } : p;
      }),
    }));
    patchOrder(orderId, (x) => ({
      status: "CANCELADO", payment: { ...x.payment, status: "refunded" }, delivery: { ...x.delivery, status: "CANCELADA" },
      events: [...x.events, { label: "Pedido cancelado — estorno simulado", at: now() }],
    }));
    return { ok: true, message: `Pedido ${o.number} cancelado` };
  },

  /* ----- Motoboy ----- */
  acceptDelivery(orderId: string): Result {
    const o = state.orders.find((x) => x.id === orderId);
    if (!o || o.delivery.status !== "DISPONIVEL") return { ok: false, error: "Entrega não está mais disponível" };
    const busy = state.orders.some((x) => x.delivery.courierId === CURRENT_COURIER_ID && !["ENTREGUE", "CANCELADA"].includes(x.delivery.status));
    if (busy) return { ok: false, error: "Finalize a entrega atual antes de aceitar outra" };
    patchOrder(orderId, (x) => ({ delivery: { ...x.delivery, status: "ACEITA", courierId: CURRENT_COURIER_ID }, events: [...x.events, { label: "Motoboy aceitou", at: now() }] }));
    return { ok: true, message: "Entrega aceita" };
  },
  advanceDelivery(orderId: string): Result {
    const o = state.orders.find((x) => x.id === orderId);
    if (!o) return { ok: false, error: "Entrega não encontrada" };
    const next = nextDeliveryStatus(o.delivery.status);
    if (!next || next === "ACEITA") return { ok: false, error: "Ação inválida" };
    const labels: Record<string, string> = { A_CAMINHO: "Motoboy a caminho da coleta", COLETADO: "Pedido coletado", EM_ENTREGA: "Em entrega", ENTREGUE: "Entregue" };
    patchOrder(orderId, (x) => ({
      delivery: { ...x.delivery, status: next },
      status: next === "ENTREGUE" ? "ENTREGUE" : x.status,
      events: [...x.events, { label: labels[next], at: now() }],
    }));
    return { ok: true, message: labels[next] };
  },
};

const TIMELINE_LABEL: Record<OrderStatus, string> = {
  NOVO: "Pedido realizado", CONFIRMADO: "Confirmado", EM_PREPARACAO: "Preparando", PRONTO_RETIRADA: "Pronto", ENTREGUE: "Entregue", CANCELADO: "Cancelado",
};

function patchOrder(id: string, fn: (o: Order) => Partial<Order>) {
  set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...fn(o), updatedAt: now() } : o)) }));
}
