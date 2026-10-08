/**
 * CONFIGURAÇÃO CENTRALIZADA — Feira Virtual (protótipo)
 * Todos os valores de negócio configuráveis vivem aqui.
 * Em produção: mover para tabela de configuração / painel admin.
 */
import type { CityId } from "@/domain/types";

/** Taxa da plataforma sobre o subtotal de produtos (5%). */
export const PLATFORM_FEE_RATE = 0.05;

export interface CityConfig {
  id: CityId;
  name: string;
  /** Taxa base de entrega por pedido de produtor (R$). */
  deliveryFee: number;
  /** Prazo estimado em minutos. */
  etaMinutes: [number, number];
}

/** MOCK: tabela de entrega por cidade. Em produção: cálculo por distância/rota. */
export const CITIES: CityConfig[] = [
  { id: "buzios", name: "Armação dos Búzios", deliveryFee: 9.9, etaMinutes: [40, 70] },
  { id: "cabo-frio", name: "Cabo Frio", deliveryFee: 7.9, etaMinutes: [30, 60] },
  { id: "sao-pedro", name: "São Pedro da Aldeia", deliveryFee: 8.9, etaMinutes: [35, 65] },
  { id: "arraial", name: "Arraial do Cabo", deliveryFee: 10.9, etaMinutes: [45, 80] },
];

export const DEFAULT_CITY: CityId = "cabo-frio";

/** Opções de entrega (multiplicador sobre a taxa da cidade). */
export const DELIVERY_OPTIONS = [
  { id: "standard", label: "Padrão", description: "Entrega no mesmo dia", multiplier: 1 },
  { id: "express", label: "Expressa", description: "Prioridade na fila do motoboy", multiplier: 1.6 },
] as const;

/** Percentual da taxa de entrega repassado ao motoboy. */
export const COURIER_SHARE = 0.85;

/** Chave/versão da persistência local. Incrementar ao mudar o formato dos dados. */
export const STORAGE_KEY = "feira-virtual:v1";

export const getCity = (id: CityId) => CITIES.find((c) => c.id === id) ?? CITIES[0]!;
