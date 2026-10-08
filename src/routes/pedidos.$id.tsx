import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PackageX } from "lucide-react";
import { toast } from "sonner";
import { getCity } from "@/config/app.config";
import { brl, canCancelOrder } from "@/domain/rules";
import { actions, useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { EmptyState, Pill, getProducer } from "@/components/shared";
import { DeliveryStatusPill, OrderStatusPill, OrderTimeline, fmtDate } from "@/components/orders";

export const Route = createFileRoute("/pedidos/$id")({
  head: () => ({ meta: [
    { title: "Acompanhar pedido — Feira Virtual" }, { name: "description", content: "Status e linha do tempo do seu pedido." },
    { property: "og:title", content: "Acompanhar pedido — Feira Virtual" }, { property: "og:description", content: "Status do seu pedido." }, { name: "robots", content: "noindex" },
  ] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const order = useAppStore((s) => s.orders.find((o) => o.id === id));
  if (!order) return <EmptyState icon={PackageX} title="Pedido não encontrado" action={<Button asChild variant="outline"><Link to="/pedidos">Ver pedidos</Link></Button>} />;
  const producer = getProducer(order.producerId)!;

  return (
    <div className="space-y-4">
      <Link to="/pedidos" search={{}} className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Pedidos</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold">Pedido {order.number}</h1>
        <OrderStatusPill status={order.status} />
        <DeliveryStatusPill status={order.delivery.status} />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl bg-card p-5 shadow-card">
          <h2 className="mb-4 font-bold">Acompanhamento</h2>
          <OrderTimeline order={order} />
        </section>
        <section className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <img src={producer.image} alt="" className="size-10 rounded-full object-cover" />
            <div><div className="font-bold">{producer.name}</div><div className="text-xs text-muted-foreground">Feito em {fmtDate(order.createdAt)}</div></div>
          </div>
          <ul className="space-y-1 text-sm">{order.lines.map((l) => <li key={l.productId} className="flex justify-between"><span>{l.quantity}× {l.name} <span className="text-muted-foreground">({brl(l.unitPrice)}/{l.unit})</span></span><span className="font-semibold">{brl(l.lineTotal)}</span></li>)}</ul>
          <dl className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Produtos</dt><dd>{brl(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Taxa da plataforma</dt><dd>{brl(order.platformFee)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Entrega</dt><dd>{brl(order.deliveryFee)}</dd></div>
            <div className="flex justify-between pt-1"><dt className="font-bold">Total</dt><dd className="price text-2xl">{brl(order.total)}</dd></div>
          </dl>
          <div className="rounded-xl bg-muted p-3 text-sm">
            <div className="font-semibold">Entregar em</div>
            <div className="text-muted-foreground">{order.address.street}, {order.address.number} — {order.address.neighborhood}, {getCity(order.address.city).name}</div>
            <div className="mt-2 flex items-center gap-2"><span className="font-semibold">Pagamento:</span> {order.payment.method === "pix" ? "PIX" : "Cartão"} <Pill tone={order.payment.status === "approved" ? "success" : "warn"}>{order.payment.status === "approved" ? "Aprovado (simulado)" : order.payment.status === "refunded" ? "Estornado (simulado)" : order.payment.status}</Pill></div>
          </div>
          {canCancelOrder(order.status, order.delivery.status) && (
            <Button variant="outline" className="w-full text-destructive" onClick={() => { if (confirm("Cancelar este pedido?")) { const r = actions.cancelOrder(order.id); r.ok ? toast.success(r.message) : toast.error(r.error); } }}>Cancelar pedido</Button>
          )}
          <details className="text-xs text-muted-foreground"><summary className="cursor-pointer font-semibold">Histórico de eventos</summary>
            <ul className="mt-2 space-y-1">{order.events.map((e, i) => <li key={i}>{fmtDate(e.at)} — {e.label}</li>)}</ul>
          </details>
        </section>
      </div>
    </div>
  );
}
