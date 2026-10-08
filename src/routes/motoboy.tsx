import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bike, MapPin, Navigation, Wallet } from "lucide-react";
import { getCity } from "@/config/app.config";
import { COURIERS, CURRENT_COURIER_ID } from "@/data/mock";
import { DELIVERY_STATUS_LABEL, brl, nextDeliveryStatus } from "@/domain/rules";
import type { Order } from "@/domain/types";
import { actions, useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { EmptyState, MockNotice, PageHeader, getProducer } from "@/components/shared";
import { DeliveryStatusPill, fmtDate } from "@/components/orders";

export const Route = createFileRoute("/motoboy")({
  head: () => ({ meta: [
    { title: "Painel do motoboy — Feira Virtual" }, { name: "description", content: "Entregas disponíveis, rota e ganhos do entregador." },
    { property: "og:title", content: "Painel do motoboy — Feira Virtual" }, { property: "og:description", content: "Aceite entregas locais na Feira Virtual." },
  ] }),
  component: CourierDashboard,
});

const ACTION_LABEL: Record<string, string> = { A_CAMINHO: "Ir para coleta", COLETADO: "Confirmar coleta", EM_ENTREGA: "Sair para entrega", ENTREGUE: "Confirmar entrega" };

function CourierDashboard() {
  const orders = useAppStore((s) => s.orders);
  const me = COURIERS.find((c) => c.id === CURRENT_COURIER_ID)!;
  const available = orders.filter((o) => o.delivery.status === "DISPONIVEL");
  const mine = orders.filter((o) => o.delivery.courierId === CURRENT_COURIER_ID);
  const current = mine.find((o) => !["ENTREGUE", "CANCELADA"].includes(o.delivery.status));
  const history = mine.filter((o) => o.delivery.status === "ENTREGUE");
  const earnings = history.reduce((s, o) => s + o.delivery.courierEarning, 0);
  const run = (r: { ok: boolean; message?: string; error?: string }) => (r.ok ? toast.success(r.message) : toast.error(r.error));

  return (
    <div className="space-y-6">
      <PageHeader title="Painel do motoboy" subtitle={`${me.name} · ${me.vehicle}`} />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground"><Wallet className="mb-2 size-5" /><div className="font-display text-3xl font-extrabold">{brl(earnings)}</div><div className="text-xs opacity-80">Ganhos ({history.length} entregas)</div></div>
        <div className="rounded-2xl bg-card p-4 shadow-card"><Bike className="mb-2 size-5 text-primary" /><div className="price text-3xl">{available.length}</div><div className="text-xs text-muted-foreground">Entregas disponíveis</div></div>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Entrega em andamento</h2>
        {current ? (
          <div className="space-y-4 rounded-2xl border-2 border-primary bg-card p-5 shadow-card">
            <Route_ order={current} />
            <div className="flex flex-wrap gap-1">
              {(["ACEITA", "A_CAMINHO", "COLETADO", "EM_ENTREGA", "ENTREGUE"] as const).map((s) => <span key={s} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s === current.delivery.status ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{DELIVERY_STATUS_LABEL[s]}</span>)}
            </div>
            {(() => { const n = nextDeliveryStatus(current.delivery.status); return n && <Button variant="market" size="lg" className="w-full" onClick={() => run(actions.advanceDelivery(current.id))}><Navigation /> {ACTION_LABEL[n]}</Button>; })()}
            <MockNotice>Sem GPS/mapa real — status atualizado manualmente.</MockNotice>
          </div>
        ) : <EmptyState icon={Bike} title="Nenhuma entrega em andamento" text="Aceite uma entrega disponível abaixo." />}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Disponíveis</h2>
        {available.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {available.map((o) => (
              <div key={o.id} className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-center justify-between"><span className="font-bold">{o.number}</span><span className="price text-xl">{brl(o.delivery.courierEarning)}</span></div>
                <Route_ order={o} />
                <Button className="w-full" disabled={!!current} onClick={() => run(actions.acceptDelivery(o.id))}>{current ? "Finalize a entrega atual" : "Aceitar entrega"}</Button>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={MapPin} title="Nenhuma entrega disponível" text="Quando um produtor marcar um pedido como pronto, ele aparece aqui." />}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Histórico</h2>
        {history.length ? (
          <ul className="space-y-2">{history.map((o) => <li key={o.id} className="flex items-center justify-between rounded-xl bg-card p-3 text-sm shadow-card"><span><b>{o.number}</b> · {getProducer(o.producerId)?.name} → {o.address.neighborhood}<span className="block text-xs text-muted-foreground">{fmtDate(o.updatedAt)}</span></span><span className="font-bold text-success">+{brl(o.delivery.courierEarning)}</span></li>)}</ul>
        ) : <p className="text-sm text-muted-foreground">Nenhuma entrega concluída.</p>}
      </section>
    </div>
  );
}

function Route_({ order }: { order: Order }) {
  const p = getProducer(order.producerId)!;
  return (
    <div className="space-y-2 text-sm">
      <div className="flex gap-2"><span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" /><div><div className="text-xs text-muted-foreground">Origem</div><div className="font-semibold">{p.name}</div><div className="text-muted-foreground">{p.location}</div></div></div>
      <div className="flex gap-2"><span className="mt-1 size-2.5 shrink-0 rounded-full bg-accent" /><div><div className="text-xs text-muted-foreground">Destino</div><div className="font-semibold">{order.address.name}</div><div className="text-muted-foreground">{order.address.street}, {order.address.number} — {order.address.neighborhood}, {getCity(order.address.city).name}</div></div></div>
      <DeliveryStatusPill status={order.delivery.status} />
    </div>
  );
}
