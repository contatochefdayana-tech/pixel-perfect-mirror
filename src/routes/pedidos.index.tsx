import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, ChevronRight, Package } from "lucide-react";
import { brl } from "@/domain/rules";
import { BUYER_NAME } from "@/data/mock";
import { useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, getProducer } from "@/components/shared";
import { OrderStatusPill, fmtDate } from "@/components/orders";

export const Route = createFileRoute("/pedidos/")({
  validateSearch: z.object({ checkout: z.string().optional() }),
  head: () => ({ meta: [
    { title: "Meus pedidos — Feira Virtual" }, { name: "description", content: "Acompanhe o status dos seus pedidos." },
    { property: "og:title", content: "Meus pedidos — Feira Virtual" }, { property: "og:description", content: "Acompanhe seus pedidos e entregas." },
  ] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { checkout } = Route.useSearch();
  const all = useAppStore((s) => s.orders);
  // Protótipo: pedidos do comprador = pedidos criados neste navegador (sem prefixo "seed").
  const orders = all.filter((o) => !o.id.startsWith("o-seed"));
  const justPlaced = checkout ? orders.filter((o) => o.checkoutId === checkout) : [];

  return (
    <div>
      <PageHeader title="Meus pedidos" subtitle={`Comprador: ${BUYER_NAME} (simulado)`} />
      {justPlaced.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-success-soft p-5">
          <CheckCircle2 className="size-8 shrink-0 text-success" />
          <div>
            <h2 className="text-xl font-bold">Pedido confirmado!</h2>
            <p className="text-sm text-foreground/80">
              {justPlaced.length > 1 ? `Seu checkout gerou ${justPlaced.length} pedidos, um por produtor.` : "Seu pedido foi enviado ao produtor."} Total {brl(justPlaced.reduce((s, o) => s + o.total, 0))}.
            </p>
          </div>
        </div>
      )}
      {orders.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum pedido ainda" text="Quando você comprar, seus pedidos aparecem aqui." action={<Button asChild variant="market"><Link to="/">Ir para a feira</Link></Button>} />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to="/pedidos/$id" params={{ id: o.id }} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
                <img src={getProducer(o.producerId)?.image} alt="" className="size-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold">{o.number}</span><OrderStatusPill status={o.status} /></div>
                  <div className="truncate text-sm text-muted-foreground">{getProducer(o.producerId)?.name} · {o.lines.length} itens · {fmtDate(o.createdAt)}</div>
                </div>
                <div className="price text-lg">{brl(o.total)}</div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
