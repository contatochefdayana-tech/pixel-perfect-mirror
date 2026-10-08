import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShoppingBasket } from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/data/mock";
import { brl } from "@/domain/rules";
import { useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { Pill, QtyStepper, Rating, addWithFeedback, getProducer } from "@/components/shared";

export const Route = createFileRoute("/produtos/$id")({
  loader: ({ params }) => {
    const seed = PRODUCTS.find((p) => p.id === params.id);
    if (!seed) throw notFound();
    return { seed };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produto não encontrado" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.seed.name} — Feira Virtual`;
    return { meta: [{ title: t }, { name: "description", content: loaderData.seed.description }, { property: "og:title", content: t }, { property: "og:description", content: loaderData.seed.description }] };
  },
  component: ProductPage,
});

function ProductPage() {
  const { seed } = Route.useLoaderData();
  const product = useAppStore((s) => s.products.find((p) => p.id === seed.id)) ?? seed;
  const inCart = useAppStore((s) => s.cart.find((i) => i.productId === seed.id)?.quantity ?? 0);
  const [qty, setQty] = useState(1);
  const producer = getProducer(product.producerId)!;
  const unavailable = !product.available || product.stock <= 0;
  const maxAdd = Math.max(0, product.stock - inCart);

  return (
    <div className="space-y-4">
      <Link to="/produtores/$id" params={{ id: producer.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" />{producer.name}</Link>
      <div className="grid gap-6 md:grid-cols-2">
        <img src={product.image} alt={product.name} className={`aspect-square w-full rounded-3xl object-cover shadow-card ${unavailable ? "grayscale" : ""}`} />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Pill tone="info">{CATEGORIES.find((c) => c.id === product.category)?.name}</Pill>
            {unavailable ? <Pill tone="danger">Indisponível</Pill> : product.stock <= 5 ? <Pill tone="warn">Só {product.stock} em estoque</Pill> : <Pill tone="success">{product.stock} {product.unit} disponíveis</Pill>}
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">{product.name}</h1>
          <Rating value={product.rating} className="text-sm" />
          <p className="text-lg text-foreground/80">{product.description}</p>
          <div>
            {product.compareAtPrice && <div className="text-muted-foreground line-through">{brl(product.compareAtPrice)}</div>}
            <span className="price text-5xl">{brl(product.price)}</span><span className="text-muted-foreground"> /{product.unit}</span>
          </div>
          <Link to="/produtores/$id" params={{ id: producer.id }} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <img src={producer.image} alt="" className="size-12 rounded-full object-cover" />
            <div><div className="font-semibold">{producer.name}</div><div className="text-xs text-muted-foreground">{producer.location}</div></div>
          </Link>
          {unavailable ? (
            <div className="rounded-xl bg-destructive-soft p-4 text-sm font-semibold text-destructive">Este produto está indisponível no momento. Volte mais tarde!</div>
          ) : (
            <div className="flex items-center gap-3">
              <QtyStepper value={qty} onChange={(n) => setQty(Math.min(Math.max(1, n), Math.max(1, maxAdd)))} max={maxAdd} />
              <Button variant="market" size="lg" className="flex-1" disabled={maxAdd === 0} onClick={() => { addWithFeedback(product.id, qty); setQty(1); }}>
                <ShoppingBasket /> Adicionar · {brl(product.price * qty)}
              </Button>
            </div>
          )}
          {inCart > 0 && <p className="text-sm text-muted-foreground">Você já tem {inCart} no <Link to="/carrinho" className="font-semibold text-primary underline">carrinho</Link>.</p>}
        </div>
      </div>
    </div>
  );
}
