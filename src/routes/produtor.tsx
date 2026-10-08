import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Inbox, Package, Wallet, TrendingUp } from "lucide-react";
import { PRODUCERS } from "@/data/mock";
import { ORDER_STATUS_LABEL, brl, canCancelOrder, nextOrderStatus } from "@/domain/rules";
import type { Order, Product } from "@/domain/types";
import { actions, useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EmptyState, MockNotice, PageHeader, Pill } from "@/components/shared";
import { DeliveryStatusPill, OrderStatusPill, fmtDate } from "@/components/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produtor")({
  head: () => ({ meta: [
    { title: "Painel do produtor — Feira Virtual" }, { name: "description", content: "Pedidos, produtos, estoque e vendas do produtor." },
    { property: "og:title", content: "Painel do produtor — Feira Virtual" }, { property: "og:description", content: "Gerencie sua banca na Feira Virtual." },
  ] }),
  component: ProducerDashboard,
});

type Tab = "pedidos" | "produtos" | "historico";

function ProducerDashboard() {
  const producerId = useAppStore((s) => s.producerId);
  const allOrders = useAppStore((s) => s.orders);
  const allProducts = useAppStore((s) => s.products);
  const [tab, setTab] = useState<Tab>("pedidos");
  const orders = allOrders.filter((o) => o.producerId === producerId);
  const products = allProducts.filter((p) => p.producerId === producerId);
  const active = orders.filter((o) => !["ENTREGUE", "CANCELADO"].includes(o.status));
  const done = orders.filter((o) => ["ENTREGUE", "CANCELADO"].includes(o.status));
  const delivered = orders.filter((o) => o.status === "ENTREGUE");
  const revenue = delivered.reduce((s, o) => s + o.subtotal, 0);
  const pending = active.reduce((s, o) => s + o.subtotal, 0);

  return (
    <div>
      <PageHeader title="Painel do produtor" right={
        <select aria-label="Produtor" value={producerId} onChange={(e) => actions.setProducerId(e.target.value)} className="h-10 rounded-full border border-input bg-card px-3 text-sm font-semibold">
          {PRODUCERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      } />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Wallet} label="Vendas entregues" value={brl(revenue)} />
        <Stat icon={TrendingUp} label="A receber" value={brl(pending)} />
        <Stat icon={Inbox} label="Pedidos ativos" value={String(active.length)} highlight={active.some((o) => o.status === "NOVO")} />
        <Stat icon={Package} label="Produtos ativos" value={`${products.filter((p) => p.available && p.stock > 0).length}/${products.length}`} />
      </div>
      <div className="mb-4 flex gap-2">
        {(["pedidos", "produtos", "historico"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("h-10 rounded-full px-4 text-sm font-semibold capitalize", tab === t ? "bg-primary text-primary-foreground" : "bg-card")}>{t === "historico" ? "Histórico" : t}</button>
        ))}
      </div>
      {tab === "pedidos" && (active.length ? <div className="grid gap-3 md:grid-cols-2">{active.map((o) => <ProducerOrderCard key={o.id} order={o} />)}</div> : <EmptyState icon={Inbox} title="Nenhum pedido ativo" text="Novos pedidos aparecem aqui assim que o comprador paga." />)}
      {tab === "produtos" && <div className="space-y-3"><MockNotice>Alterações salvas localmente neste navegador.</MockNotice>{products.map((p) => <ProductRow key={p.id} product={p} />)}</div>}
      {tab === "historico" && (done.length ? (
        <div className="overflow-hidden rounded-2xl bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Pedido</th><th className="p-3">Data</th><th className="hidden p-3 md:table-cell">Comprador</th><th className="p-3">Status</th><th className="p-3 text-right">Produtos</th></tr></thead>
            <tbody>{done.map((o) => <tr key={o.id} className="border-t"><td className="p-3 font-semibold">{o.number}</td><td className="p-3">{fmtDate(o.updatedAt)}</td><td className="hidden p-3 md:table-cell">{o.buyerName}</td><td className="p-3"><OrderStatusPill status={o.status} /></td><td className="p-3 text-right font-semibold">{brl(o.subtotal)}</td></tr>)}</tbody>
          </table>
        </div>
      ) : <EmptyState icon={Package} title="Sem histórico ainda" />)}
    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight }: { icon: typeof Wallet; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl bg-card p-4 shadow-card", highlight && "ring-2 ring-accent")}>
      <Icon className="mb-2 size-5 text-primary" />
      <div className="price text-2xl">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ProducerOrderCard({ order }: { order: Order }) {
  const next = nextOrderStatus(order.status);
  const run = (r: { ok: boolean; message?: string; error?: string }) => (r.ok ? toast.success(r.message) : toast.error(r.error));
  return (
    <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-2"><span className="font-bold">{order.number}</span><OrderStatusPill status={order.status} /><DeliveryStatusPill status={order.delivery.status} /><span className="ml-auto text-xs text-muted-foreground">{fmtDate(order.createdAt)}</span></div>
      <div className="text-sm"><span className="font-semibold">{order.buyerName}</span> · <span className="text-muted-foreground">{order.address.neighborhood}</span></div>
      <ul className="text-sm text-muted-foreground">{order.lines.map((l) => <li key={l.productId}>{l.quantity}× {l.name}</li>)}</ul>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="price text-xl">{brl(order.subtotal)}</span>
        <div className="flex gap-2">
          {canCancelOrder(order.status, order.delivery.status) && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm("Cancelar pedido? O estoque será devolvido.") && run(actions.cancelOrder(order.id))}>Cancelar</Button>}
          {next ? <Button size="sm" variant={order.status === "NOVO" ? "market" : "default"} onClick={() => run(actions.advanceOrder(order.id))}>→ {ORDER_STATUS_LABEL[next]}</Button>
            : order.status === "PRONTO_RETIRADA" && <Pill tone="warn">Aguardando motoboy</Pill>}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const dirty = Number(price) !== product.price || Number(stock) !== product.stock;
  const save = () => {
    const r = actions.updateProduct(product.id, { price: Number(price), stock: Number(stock) });
    r.ok ? toast.success(r.message) : toast.error(r.error);
  };
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
      <img src={product.image} alt="" className="size-14 rounded-xl object-cover" />
      <div className="min-w-32 flex-1">
        <div className="font-semibold">{product.name}</div>
        <div className="text-xs text-muted-foreground">por {product.unit} {product.stock === 0 && <span className="font-bold text-destructive">· sem estoque</span>}</div>
      </div>
      <label className="text-xs">Preço (R$)<Input type="number" step="0.1" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="h-9 w-24 rounded-lg" /></label>
      <label className="text-xs">Estoque<Input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} className="h-9 w-20 rounded-lg" /></label>
      <label className="flex flex-col items-center gap-1 text-xs">Disponível
        <Switch checked={product.available} onCheckedChange={(v) => { actions.updateProduct(product.id, { available: v }); toast(v ? `${product.name} disponível` : `${product.name} pausado`); }} />
      </label>
      <Button size="sm" disabled={!dirty} onClick={save}>Salvar</Button>
    </div>
  );
}
