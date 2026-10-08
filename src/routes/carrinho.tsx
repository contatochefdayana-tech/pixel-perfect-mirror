import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBasket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { summarizeCart, brl } from "@/domain/rules";
import { actions, useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, QtyStepper, getProducer } from "@/components/shared";
import { CartSummaryBox } from "@/components/CartSummaryBox";

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [
    { title: "Carrinho — Feira Virtual" }, { name: "description", content: "Revise os produtos do seu carrinho." },
    { property: "og:title", content: "Carrinho — Feira Virtual" }, { property: "og:description", content: "Revise os produtos do seu carrinho." },
  ] }),
  component: CartPage,
});

function CartPage() {
  const cart = useAppStore((s) => s.cart);
  const products = useAppStore((s) => s.products);
  const city = useAppStore((s) => s.city);
  const summary = summarizeCart(cart, products, city);

  if (!cart.length) {
    return <EmptyState icon={ShoppingBasket} title="Seu carrinho está vazio" text="Passeie pelas bancas e escolha seus produtos frescos." action={<Button asChild variant="market"><Link to="/">Ir para a feira</Link></Button>} />;
  }
  const change = (id: string, q: number) => { const r = actions.setQuantity(id, q); if (!r.ok) toast.error(r.error); };

  return (
    <div>
      <PageHeader title="Carrinho" subtitle="Cada produtor gera um pedido e uma entrega separada." right={
        <Button variant="ghost" size="sm" onClick={() => { actions.clearCart(); toast("Carrinho limpo"); }}><Trash2 /> Limpar carrinho</Button>
      } />
      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {summary.groups.map((g) => {
            const producer = getProducer(g.producerId)!;
            return (
              <section key={g.producerId} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="mb-3 flex items-center gap-2 border-b pb-3">
                  <img src={producer.image} alt="" className="size-8 rounded-full object-cover" />
                  <span className="font-bold">{producer.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Entrega {brl(g.deliveryFee)}</span>
                </div>
                <ul className="divide-y">
                  {g.lines.map((l) => {
                    const blocked = !l.product.available || l.product.stock < l.quantity;
                    return (
                      <li key={l.product.id} className="flex items-center gap-3 py-3">
                        <img src={l.product.image} alt="" className="size-16 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold">{l.product.name}</div>
                          <div className="text-xs text-muted-foreground">{brl(l.product.price)} / {l.product.unit}</div>
                          {blocked && <div className="text-xs font-semibold text-destructive">{l.product.available ? `Só ${l.product.stock} em estoque` : "Indisponível"}</div>}
                          <div className="mt-2 flex items-center gap-2 md:hidden"><QtyStepper value={l.quantity} max={l.product.stock} onChange={(n) => change(l.product.id, n)} /></div>
                        </div>
                        <div className="hidden md:block"><QtyStepper value={l.quantity} max={l.product.stock} onChange={(n) => change(l.product.id, n)} /></div>
                        <div className="w-20 text-right font-bold tabular-nums">{brl(l.lineTotal)}</div>
                        <button aria-label="Remover" onClick={() => { actions.removeFromCart(l.product.id); toast(`${l.product.name} removido`); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
        <aside className="h-fit space-y-4 rounded-2xl bg-card p-5 shadow-card md:sticky md:top-24">
          <h2 className="text-lg font-bold">Resumo</h2>
          <CartSummaryBox summary={summary} />
          <Button asChild variant="market" size="lg" className="w-full"><Link to="/checkout">Finalizar pedido</Link></Button>
        </aside>
      </div>
    </div>
  );
}
