import { Link } from "@tanstack/react-router";
import { Minus, Plus, Star, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { CITIES } from "@/config/app.config";
import { brl } from "@/domain/rules";
import type { CityId, Product } from "@/domain/types";
import { actions, useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", className)}>
      <Star className="size-3.5 fill-sun text-sun" /> {value.toFixed(1)}
    </span>
  );
}

export function CitySelect({ className }: { className?: string }) {
  const city = useAppStore((s) => s.city);
  return (
    <select
      aria-label="Cidade"
      value={city}
      onChange={(e) => { actions.setCity(e.target.value as CityId); toast.success("Cidade atualizada"); }}
      className={cn("h-10 rounded-full border border-input bg-card px-3 text-sm font-medium", className)}
    >
      {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  );
}

export function QtyStepper({ value, onChange, max }: { value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-full border border-input bg-card">
      <button aria-label="Diminuir" className="grid size-9 place-items-center" onClick={() => onChange(value - 1)}><Minus className="size-4" /></button>
      <span className="w-8 text-center text-sm font-bold tabular-nums">{value}</span>
      <button aria-label="Aumentar" disabled={max !== undefined && value >= max} className="grid size-9 place-items-center disabled:opacity-30" onClick={() => onChange(value + 1)}><Plus className="size-4" /></button>
    </div>
  );
}

export function addWithFeedback(productId: string, qty = 1) {
  const r = actions.addToCart(productId, qty);
  if (r.ok) toast.success(r.message); else toast.error(r.error);
}

export function ProductCard({ product }: { product: Product }) {
  const producer = useAppStore((s) => s.products) && product.producerId;
  const unavailable = !product.available || product.stock <= 0;
  const low = !unavailable && product.stock <= 5;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
      <Link to="/produtos/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} loading="lazy" width={640} height={640} className={cn("size-full object-cover transition-transform duration-500 group-hover:scale-105", unavailable && "grayscale opacity-60")} />
        {product.compareAtPrice && !unavailable && <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">Oferta</span>}
        {unavailable && <span className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-bold text-background">Indisponível</span>}
        {low && <span className="absolute left-2 top-2 rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-sun-foreground">Últimas {product.stock}</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <Link to="/produtos/$id" params={{ id: product.id }} className="line-clamp-1 font-semibold">{product.name}</Link>
          <Rating value={product.rating} />
        </div>
        <ProducerName id={producer} />
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {product.compareAtPrice && <div className="text-xs text-muted-foreground line-through">{brl(product.compareAtPrice)}</div>}
            <span className="price text-xl">{brl(product.price)}</span>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>
          <Button size="icon" variant="market" disabled={unavailable} aria-label={`Adicionar ${product.name}`} onClick={() => addWithFeedback(product.id)}>
            <Plus />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { PRODUCERS } from "@/data/mock";
export const getProducer = (id: string) => PRODUCERS.find((p) => p.id === id);
export function ProducerName({ id }: { id: string }) {
  const p = getProducer(id);
  if (!p) return null;
  return <Link to="/produtores/$id" params={{ id }} className="line-clamp-1 text-xs text-muted-foreground hover:text-primary">{p.name}</Link>;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
      <div className="mb-3 grid size-14 place-items-center rounded-full bg-primary-soft text-primary"><Icon className="size-6" /></div>
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-primary-soft text-primary",
  warn: "bg-warning-soft text-sun-foreground",
  success: "bg-success-soft text-success",
  danger: "bg-destructive-soft text-destructive",
  accent: "bg-accent text-accent-foreground",
};
export function Pill({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", TONES[tone])}>{children}</span>;
}

export function MockNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-accent/50 bg-warning-soft px-3 py-2 text-xs font-medium text-sun-foreground">🧪 {children}</div>;
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
