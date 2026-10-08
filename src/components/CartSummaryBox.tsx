import { PLATFORM_FEE_RATE } from "@/config/app.config";
import { brl, type CartSummary } from "@/domain/rules";

export function CartSummaryBox({ summary }: { summary: CartSummary }) {
  return (
    <dl className="space-y-2 text-sm">
      <Row label={`Produtos (${summary.itemCount})`} value={brl(summary.subtotal)} />
      <Row label={`Taxa da plataforma (${Math.round(PLATFORM_FEE_RATE * 100)}%)`} value={brl(summary.platformFee)} />
      <Row label={`Entrega${summary.groups.length > 1 ? ` (${summary.groups.length} produtores)` : ""}`} value={brl(summary.deliveryFee)} />
      <div className="flex items-end justify-between border-t pt-3">
        <dt className="font-bold">Total</dt>
        <dd className="price text-3xl">{brl(summary.total)}</dd>
      </div>
    </dl>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold tabular-nums">{value}</dd></div>;
}
