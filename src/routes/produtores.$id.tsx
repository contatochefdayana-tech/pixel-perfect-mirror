import { createFileRoute, notFound } from "@tanstack/react-router";
import { MapPin, Truck } from "lucide-react";
import { CITIES } from "@/config/app.config";
import { PRODUCERS } from "@/data/mock";
import { useAppStore } from "@/state/store";
import { ProductCard, Rating, Pill } from "@/components/shared";

export const Route = createFileRoute("/produtores/$id")({
  loader: ({ params }) => {
    const producer = PRODUCERS.find((p) => p.id === params.id);
    if (!producer) throw notFound();
    return { producer };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produtor não encontrado" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.producer.name} — Feira Virtual`;
    return { meta: [{ title: t }, { name: "description", content: loaderData.producer.description }, { property: "og:title", content: t }, { property: "og:description", content: loaderData.producer.description }] };
  },
  component: ProducerPage,
});

function ProducerPage() {
  const { producer } = Route.useLoaderData();
  const products = useAppStore((s) => s.products.filter((p) => p.producerId === producer.id));
  const available = products.filter((p) => p.available && p.stock > 0).length;
  return (
    <div className="space-y-8">
      <section className="grid gap-6 overflow-hidden rounded-3xl bg-card shadow-card md:grid-cols-[1fr_1.2fr]">
        <img src={producer.image} alt={producer.name} className="aspect-[4/3] size-full object-cover md:aspect-auto" />
        <div className="flex flex-col gap-3 p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={producer.available ? "success" : "danger"}>{producer.available ? "Aberto para pedidos" : "Fechado"}</Pill>
            <Rating value={producer.rating} /> <span className="text-xs text-muted-foreground">({producer.reviews} avaliações)</span>
          </div>
          <h1 className="text-4xl font-extrabold">{producer.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4" />{producer.location} · {producer.owner}</p>
          <p className="text-foreground/80">{producer.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-sm">
            <Truck className="size-4 text-primary" /> Entrega em:
            {producer.servesCities.map((c) => <Pill key={c} tone="info">{CITIES.find((x) => x.id === c)?.name}</Pill>)}
          </div>
          <p className="text-sm font-semibold text-primary">{available} de {products.length} produtos disponíveis hoje</p>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-extrabold">Produtos da banca</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
    </div>
  );
}
