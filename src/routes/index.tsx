import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Search, SearchX } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { CATEGORIES, PRODUCERS } from "@/data/mock";
import { getCity } from "@/config/app.config";
import { brl, deliveryFee } from "@/domain/rules";
import type { CategoryId } from "@/domain/types";
import { useAppStore } from "@/state/store";
import { CitySelect, EmptyState, ProductCard, Rating } from "@/components/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feira Virtual — Compre direto do produtor local" },
      { name: "description", content: "Frutas, verduras, queijos, geleias e mel de produtores da Região dos Lagos, entregues por motoboys locais." },
      { property: "og:title", content: "Feira Virtual — Compre direto do produtor local" },
      { property: "og:description", content: "Marketplace de produtores de Búzios, Cabo Frio, São Pedro da Aldeia e Arraial do Cabo." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const city = useAppStore((s) => s.city);
  const products = useAppStore((s) => s.products);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");

  const producersHere = PRODUCERS.filter((p) => p.servesCities.includes(city));
  const hereIds = new Set(producersHere.map((p) => p.id));
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products
      .filter((p) => hereIds.has(p.producerId))
      .filter((p) => cat === "all" || p.category === cat)
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
      .sort((a, b) => Number(b.available && b.stock > 0) - Number(a.available && a.stock > 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, q, cat, city]);
  const offers = products.filter((p) => p.compareAtPrice && hereIds.has(p.producerId) && p.available && p.stock > 0);
  const searching = q.trim() !== "" || cat !== "all";

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl">
        <img src={hero} alt="Banca de feira com frutas e verduras em Búzios" width={1536} height={864} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent" />
        <div className="relative flex min-h-[340px] flex-col justify-end gap-4 p-5 text-background md:min-h-[420px] md:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background/20 px-3 py-1 text-xs font-semibold backdrop-blur"><MapPin className="size-3.5" />Região dos Lagos · RJ</span>
          <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] md:text-6xl">A feira do seu bairro, na palma da mão.</h1>
          <p className="max-w-md text-background/85">Direto do produtor rural pra sua porta — entrega em {getCity(city).name} a partir de {brl(deliveryFee(city))}.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-12 flex-1 items-center gap-2 rounded-full bg-card px-4 text-foreground shadow-card">
              <Search className="size-5 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar banana, queijo, mel…" className="h-full flex-1 bg-transparent outline-none" />
            </label>
            <CitySelect className="h-12 text-foreground md:hidden" />
          </div>
        </div>
      </section>

      <section>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <CatChip active={cat === "all"} onClick={() => setCat("all")}>🌽 Tudo</CatChip>
          {CATEGORIES.map((c) => <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.emoji} {c.name}</CatChip>)}
        </div>
      </section>

      {!searching && (
        <>
          <section>
            <SectionTitle title="Produtores em destaque" subtitle={`${producersHere.length} entregam em ${getCity(city).name}`} />
            {producersHere.length === 0 ? (
              <EmptyState icon={MapPin} title="Nenhum produtor nesta cidade ainda" text="Estamos chegando! Tente outra cidade." />
            ) : (
              <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0">
                {producersHere.map((p) => (
                  <Link key={p.id} to="/produtores/$id" params={{ id: p.id }} className="group w-72 shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-card md:w-auto">
                    <div className="aspect-[16/10] overflow-hidden"><img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                    <div className="p-4">
                      <div className="flex items-center justify-between"><h3 className="text-lg font-bold">{p.name}</h3><Rating value={p.rating} /></div>
                      <p className="text-sm text-muted-foreground">{p.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          {offers.length > 0 && (
            <section className="rounded-3xl bg-primary p-5 text-primary-foreground md:p-8">
              <SectionTitle title="🔥 Ofertas da semana" subtitle="Preço de feira, frescor de sítio" light />
              <div className="grid grid-cols-2 gap-3 text-foreground md:grid-cols-4">{offers.map((p) => <ProductCard key={p.id} product={p} />)}</div>
            </section>
          )}
        </>
      )}

      <section>
        <SectionTitle title={searching ? `Resultados (${filtered.length})` : "Produtos frescos"} />
        {filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="Nada encontrado" text="Tente outra palavra ou categoria." />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>
    </div>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string | string[] }) {
  return (
    <button onClick={onClick} className={cn("h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary")}>
      {children}
    </button>
  );
}
function SectionTitle({ title, subtitle, light }: { title: string; subtitle?: string; light?: boolean }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      {subtitle && <p className={cn("text-sm", light ? "text-primary-foreground/75" : "text-muted-foreground")}>{subtitle}</p>}
    </div>
  );
}
