/**
 * DADOS MOCKADOS — seed inicial. Em produção: tabelas producers, products, couriers, orders.
 */
import type { Category, Courier, Order, Producer, Product } from "@/domain/types";
import ze from "@/assets/producer-ze.jpg";
import maria from "@/assets/producer-maria.jpg";
import vale from "@/assets/producer-vale.jpg";
import banana from "@/assets/p-banana.jpg";
import morango from "@/assets/p-morango.jpg";
import queijo from "@/assets/p-queijo.jpg";
import alface from "@/assets/p-alface.jpg";
import tomate from "@/assets/p-tomate.jpg";
import rucula from "@/assets/p-rucula.jpg";
import goiaba from "@/assets/p-goiaba.jpg";
import geleia from "@/assets/p-geleia.jpg";
import abacate from "@/assets/p-abacate.jpg";
import cenoura from "@/assets/p-cenoura.jpg";
import mel from "@/assets/p-mel.jpg";

export const CATEGORIES: Category[] = [
  { id: "hortifruti", name: "Hortifruti", emoji: "🥬" },
  { id: "laticinios", name: "Laticínios Artesanais", emoji: "🧀" },
  { id: "doces", name: "Doces e Geleias", emoji: "🍓" },
  { id: "mel", name: "Mel", emoji: "🍯" },
  { id: "outros", name: "Outros", emoji: "🧺" },
];

export const PRODUCERS: Producer[] = [
  {
    id: "sitio-seu-ze", name: "Sítio Seu Zé", owner: "José Ribeiro", image: ze, city: "sao-pedro",
    location: "Zona rural, São Pedro da Aldeia",
    description: "Há 30 anos cultivando frutas e verduras com carinho. Queijo feito com leite do próprio sítio.",
    rating: 4.8, reviews: 212, servesCities: ["buzios", "cabo-frio", "sao-pedro", "arraial"], available: true,
  },
  {
    id: "horta-dona-maria", name: "Horta da Dona Maria", owner: "Maria das Graças", image: maria, city: "cabo-frio",
    location: "Tamoios, Cabo Frio",
    description: "Horta familiar com folhas frescas colhidas no dia e geleias feitas no fogão a lenha.",
    rating: 4.9, reviews: 158, servesCities: ["buzios", "cabo-frio", "sao-pedro"], available: true,
  },
  {
    id: "organicos-do-vale", name: "Orgânicos do Vale", owner: "Cooperativa do Vale", image: vale, city: "buzios",
    location: "Vale da Rasa, Armação dos Búzios",
    description: "Produção 100% orgânica certificada e apiário próprio. Do vale direto para sua mesa.",
    rating: 4.7, reviews: 96, servesCities: ["buzios", "cabo-frio", "arraial"], available: true,
  },
];

export const PRODUCTS: Product[] = [
  { id: "banana-prata", name: "Banana Prata", description: "Doce e firme, colhida no ponto.", image: banana, category: "hortifruti", producerId: "sitio-seu-ze", price: 6.5, unit: "kg", stock: 40, available: true, rating: 4.8 },
  { id: "morango", name: "Morango", description: "Bandeja de 250g, vermelhinho e perfumado.", image: morango, category: "hortifruti", producerId: "sitio-seu-ze", price: 12, compareAtPrice: 15, unit: "bandeja", stock: 18, available: true, rating: 4.9 },
  { id: "queijo-minas", name: "Queijo Minas", description: "Frescal artesanal, aprox. 500g.", image: queijo, category: "laticinios", producerId: "sitio-seu-ze", price: 28, unit: "unidade", stock: 8, available: true, rating: 4.9 },
  { id: "alface", name: "Alface Crespa", description: "Pé grande, colhido no dia.", image: alface, category: "hortifruti", producerId: "sitio-seu-ze", price: 3.5, unit: "unidade", stock: 30, available: true, rating: 4.6 },
  { id: "tomate", name: "Tomate", description: "Tomate maduro para salada e molho.", image: tomate, category: "hortifruti", producerId: "sitio-seu-ze", price: 8.9, unit: "kg", stock: 25, available: true, rating: 4.5 },
  { id: "rucula", name: "Rúcula", description: "Maço fresco, sabor marcante.", image: rucula, category: "hortifruti", producerId: "horta-dona-maria", price: 4, unit: "maço", stock: 22, available: true, rating: 4.8 },
  { id: "goiaba", name: "Goiaba Vermelha", description: "Madura e aromática.", image: goiaba, category: "hortifruti", producerId: "horta-dona-maria", price: 9.5, compareAtPrice: 11.9, unit: "kg", stock: 15, available: true, rating: 4.7 },
  { id: "geleia", name: "Geleia Artesanal", description: "Frutas vermelhas, pote de 250g, sem conservantes.", image: geleia, category: "doces", producerId: "horta-dona-maria", price: 22, unit: "pote", stock: 10, available: true, rating: 5 },
  { id: "abacate", name: "Abacate", description: "Cremoso, ótimo para vitamina.", image: abacate, category: "hortifruti", producerId: "horta-dona-maria", price: 7.9, unit: "kg", stock: 0, available: false, rating: 4.6 },
  { id: "cenoura-organica", name: "Cenoura Orgânica", description: "Certificada, com rama.", image: cenoura, category: "hortifruti", producerId: "organicos-do-vale", price: 7.5, unit: "kg", stock: 20, available: true, rating: 4.7 },
  { id: "mel-artesanal", name: "Mel Artesanal", description: "Mel silvestre puro, pote de 500g.", image: mel, category: "mel", producerId: "organicos-do-vale", price: 35, compareAtPrice: 42, unit: "pote", stock: 12, available: true, rating: 4.9 },
  { id: "alface-organica", name: "Alface Orgânica", description: "Sem agrotóxicos, crocante.", image: alface, category: "hortifruti", producerId: "organicos-do-vale", price: 4.5, unit: "unidade", stock: 24, available: true, rating: 4.8 },
  { id: "tomate-organico", name: "Tomate Orgânico", description: "Cultivo orgânico, sabor de verdade.", image: tomate, category: "hortifruti", producerId: "organicos-do-vale", price: 12.9, unit: "kg", stock: 3, available: true, rating: 4.8 },
];

export const COURIERS: Courier[] = [{ id: "moto-1", name: "Carlos (Motoboy)", vehicle: "Honda CG 160" }];
export const CURRENT_COURIER_ID = "moto-1";
export const BUYER_NAME = "Ana Comprador(a)";

// Base fixa (evita divergência servidor/navegador na renderização).
const BASE = Date.parse("2026-10-08T12:00:00-03:00");
const ago = (h: number) => new Date(BASE - h * 3600_000).toISOString();
const addr = { name: BUYER_NAME, phone: "(22) 99999-0000", street: "Rua das Pedras", number: "120", neighborhood: "Centro", city: "buzios" as const };

export const SEED_ORDERS: Order[] = [
  {
    id: "o-seed-1", number: "FV-1001", checkoutId: "c-seed-1", buyerName: "Bruno Lima", producerId: "sitio-seu-ze",
    lines: [{ productId: "banana-prata", name: "Banana Prata", unit: "kg", unitPrice: 6.5, quantity: 2, lineTotal: 13 }, { productId: "queijo-minas", name: "Queijo Minas", unit: "unidade", unitPrice: 28, quantity: 1, lineTotal: 28 }],
    subtotal: 41, platformFee: 2.05, deliveryFee: 7.9, total: 50.95, address: { ...addr, name: "Bruno Lima", city: "cabo-frio" },
    deliveryOption: "standard", payment: { method: "pix", status: "approved" }, status: "NOVO",
    delivery: { status: "AGUARDANDO", courierEarning: 6.72 }, events: [{ label: "Pedido realizado", at: ago(0.5) }], createdAt: ago(0.5), updatedAt: ago(0.5),
  },
  {
    id: "o-seed-2", number: "FV-1000", checkoutId: "c-seed-2", buyerName: "Juliana Costa", producerId: "horta-dona-maria",
    lines: [{ productId: "geleia", name: "Geleia Artesanal", unit: "pote", unitPrice: 22, quantity: 2, lineTotal: 44 }],
    subtotal: 44, platformFee: 2.2, deliveryFee: 9.9, total: 56.1, address: { ...addr, name: "Juliana Costa" },
    deliveryOption: "standard", payment: { method: "card", status: "approved" }, status: "PRONTO_RETIRADA",
    delivery: { status: "DISPONIVEL", courierEarning: 8.42 },
    events: [{ label: "Pedido realizado", at: ago(3) }, { label: "Confirmado", at: ago(2.8) }, { label: "Preparando", at: ago(2) }, { label: "Pronto", at: ago(1) }], createdAt: ago(3), updatedAt: ago(1),
  },
  {
    id: "o-seed-3", number: "FV-0999", checkoutId: "c-seed-3", buyerName: "Ricardo Alves", producerId: "sitio-seu-ze",
    lines: [{ productId: "morango", name: "Morango", unit: "bandeja", unitPrice: 12, quantity: 3, lineTotal: 36 }],
    subtotal: 36, platformFee: 1.8, deliveryFee: 8.9, total: 46.7, address: { ...addr, name: "Ricardo Alves", city: "sao-pedro" },
    deliveryOption: "standard", payment: { method: "pix", status: "approved" }, status: "ENTREGUE",
    delivery: { status: "ENTREGUE", courierId: "moto-1", courierEarning: 7.57 },
    events: [{ label: "Pedido realizado", at: ago(30) }, { label: "Entregue", at: ago(28) }], createdAt: ago(30), updatedAt: ago(28),
  },
];
