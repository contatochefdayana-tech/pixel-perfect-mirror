import { Check } from "lucide-react";
import { DELIVERY_STATUS_LABEL, ORDER_STATUS_LABEL, TIMELINE_STEPS, timelineIndex } from "@/domain/rules";
import type { DeliveryStatus, Order, OrderStatus } from "@/domain/types";
import { Pill } from "./shared";
import { cn } from "@/lib/utils";

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const tone = status === "CANCELADO" ? "danger" : status === "ENTREGUE" ? "success" : status === "NOVO" ? "accent" : status === "PRONTO_RETIRADA" ? "warn" : "info";
  return <Pill tone={tone}>{ORDER_STATUS_LABEL[status]}</Pill>;
}
export function DeliveryStatusPill({ status }: { status: DeliveryStatus }) {
  const tone = status === "CANCELADA" ? "danger" : status === "ENTREGUE" ? "success" : status === "DISPONIVEL" ? "accent" : status === "AGUARDANDO" ? "neutral" : "info";
  return <Pill tone={tone}>{DELIVERY_STATUS_LABEL[status]}</Pill>;
}

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "CANCELADO") {
    return <div className="rounded-xl bg-destructive-soft p-4 text-sm font-semibold text-destructive">Pedido cancelado. Pagamento estornado (simulado).</div>;
  }
  const idx = timelineIndex(order.status, order.delivery.status);
  return (
    <ol className="relative space-y-0">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= idx;
        const current = i === idx;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("grid size-7 place-items-center rounded-full border-2 text-xs font-bold", done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground", current && "ring-4 ring-primary-soft")}>
                {done ? <Check className="size-4" /> : i + 1}
              </div>
              {i < TIMELINE_STEPS.length - 1 && <div className={cn("h-7 w-0.5", i < idx ? "bg-primary" : "bg-border")} />}
            </div>
            <div className={cn("pt-0.5 text-sm", done ? "font-semibold" : "text-muted-foreground")}>{step}{current && <span className="ml-2 text-xs font-bold text-accent">agora</span>}</div>
          </li>
        );
      })}
    </ol>
  );
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
