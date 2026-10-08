# Feira Virtual — Protótipo funcional

Marketplace local que conecta **compradores**, **produtores rurais** e **motoboys** na Região dos Lagos (RJ): Armação dos Búzios, Cabo Frio, São Pedro da Aldeia e Arraial do Cabo.

> ⚠️ **Protótipo.** Não há backend, autenticação, pagamento, mapas ou logística reais. Tudo é simulado e persistido em `localStorage` do navegador. Mocks são sinalizados na interface com 🧪.

## Perfis e fluxos

| Perfil | Rota | O que faz |
|---|---|---|
| Seleção de perfil | `/perfil` | Login simulado, troca de perfil, "Restaurar demo" |
| Comprador | `/`, `/produtores/:id`, `/produtos/:id`, `/carrinho`, `/checkout`, `/pedidos`, `/pedidos/:id` | Cidade, busca, categorias, carrinho multi-produtor, checkout em 4 etapas, acompanhamento com timeline, cancelamento |
| Produtor | `/produtor` | Resumo financeiro, pedidos ativos (avançar/cancelar), produtos (preço, estoque, disponibilidade), histórico. Seletor simula qual produtor está logado |
| Motoboy | `/motoboy` | Entregas disponíveis, aceitar (uma por vez), avançar status, histórico e ganhos |

**Fluxo de ponta a ponta para testar:** comprar como comprador → `/produtor` avançar até "Pronto p/ retirada" → `/motoboy` aceitar e avançar até "Entregue" → `/pedidos/:id` mostra a timeline completa.

### Máquinas de estado (`src/domain/rules.ts`)

- **Pedido (produtor):** `NOVO → CONFIRMADO → EM_PREPARACAO → PRONTO_RETIRADA → ENTREGUE` · `CANCELADO` (só antes do motoboy aceitar; devolve estoque e estorna pagamento simulado).
- **Entrega (motoboy):** `AGUARDANDO → DISPONIVEL → ACEITA → A_CAMINHO → COLETADO → EM_ENTREGA → ENTREGUE` · `CANCELADA`. A entrega fica `DISPONIVEL` quando o pedido vira `PRONTO_RETIRADA`; quando a entrega vira `ENTREGUE`, o pedido também.
- **Timeline do comprador:** derivada dos dois status (`timelineIndex`).

## Regras de negócio

- Taxa da plataforma: **5% sobre os produtos** (`PLATFORM_FEE_RATE`).
- Entrega: tabela fixa por cidade × opção (padrão/expressa) em `src/config/app.config.ts`. **Uma entrega por produtor.**
- Motoboy recebe `COURIER_SHARE` (85%) da taxa de entrega.
- Carrinho multi-produtor: o checkout gera **1 Checkout → N Pedidos** (um por produtor), cada um com subtotal, taxa e entrega próprios.
- Estoque: validado ao adicionar, alterar quantidade e no pagamento; baixado ao confirmar; devolvido ao cancelar. Produto zerado vira indisponível.
- Produtor só aparece para cidades que atende (`servesCities`); o checkout bloqueia endereços fora da área.

## Estrutura

```
src/
  config/app.config.ts   # valores configuráveis (taxas, cidades, entrega, storage)
  domain/types.ts        # ENTIDADES: Producer, Product, CartItem, Order, Address, Courier...
  domain/rules.ts        # regras puras: carrinho, taxas, estoque, estados, timeline
  domain/rules.test.ts   # testes das regras (bunx vitest run)
  data/mock.ts           # seed: categorias, produtores, produtos, motoboy, pedidos de exemplo
  state/store.ts         # estado global + persistência local; cada ação = futuro endpoint
  components/            # UI compartilhada (cards, timeline, header, resumo)
  routes/                # páginas (TanStack Router, arquivo = rota)
```

## O que vira backend / banco

**Tabelas:** `users` (+ papéis buyer/producer/courier), `producers`, `products`, `categories`, `cities`/`delivery_rates`, `addresses`, `checkouts`, `orders`, `order_items`, `order_events`, `deliveries`, `payments`, `payouts`.

**APIs necessárias (mapeadas das ações em `store.ts`):**

| Ação no protótipo | Endpoint futuro |
|---|---|
| `addToCart / setQuantity` | `POST /cart/items` (ou carrinho client-side + validação) |
| `placeOrder` | `POST /checkouts` (transação: valida estoque, reserva, cria pedidos, cria cobrança) |
| `updateProduct` | `PATCH /products/:id` (produtor dono) |
| `advanceOrder / cancelOrder` | `POST /orders/:id/transition` |
| `acceptDelivery / advanceDelivery` | `POST /deliveries/:id/accept`, `POST /deliveries/:id/transition` |
| — | Webhooks do gateway de pagamento (PIX/cartão) |

## Limitações do protótipo

- Dados por navegador (`localStorage`); sem multiusuário ou concorrência (dois motoboys podem "aceitar" em abas diferentes).
- Pagamento simulado (sempre aprova, exceto com "Simular pagamento recusado").
- Entrega por tabela fixa, sem rota/distância/GPS.
- "Meus pedidos" mostra pedidos criados neste navegador; pedidos de exemplo aparecem só nos painéis.
- Sem upload de imagens, avaliações reais, notificações ou chat.

## Necessário para produção

Autenticação com papéis e RLS; banco com transações de estoque (reserva/expiração); gateway PIX/cartão com split (produtor / plataforma / motoboy) e webhooks; cálculo de frete por distância; despacho de entregas em tempo real; notificações (push/WhatsApp); cadastro e onboarding de produtores/motoboys; painel admin; emissão fiscal; logs/auditoria.
