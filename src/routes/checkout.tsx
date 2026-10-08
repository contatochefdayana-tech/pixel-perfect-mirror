import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, CreditCard, Loader2, QrCode, ShoppingBasket } from "lucide-react";
import { CITIES, DELIVERY_OPTIONS, getCity } from "@/config/app.config";
import { brl, summarizeCart } from "@/domain/rules";
import type { Address, CityId, DeliveryOptionId, PaymentMethod } from "@/domain/types";
import { actions, useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartSummaryBox } from "@/components/CartSummaryBox";
import { EmptyState, MockNotice, PageHeader, getProducer } from "@/components/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "Checkout — Feira Virtual" }, { name: "description", content: "Endereço, entrega e pagamento do seu pedido." },
    { property: "og:title", content: "Checkout — Feira Virtual" }, { property: "og:description", content: "Finalize seu pedido na Feira Virtual." },
  ] }),
  component: Checkout,
});

const STEPS = ["Endereço", "Entrega", "Pagamento", "Revisão"];

const addressSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(80),
  phone: z.string().trim().regex(/^[\d\s()+-]{10,20}$/, "Telefone inválido"),
  street: z.string().trim().min(3, "Informe a rua").max(120),
  number: z.string().trim().min(1, "Nº obrigatório").max(10),
  complement: z.string().trim().max(60).optional(),
  neighborhood: z.string().trim().min(2, "Informe o bairro").max(60),
  city: z.enum(["buzios", "cabo-frio", "sao-pedro", "arraial"]),
});

function Checkout() {
  const navigate = useNavigate();
  const cart = useAppStore((s) => s.cart);
  const products = useAppStore((s) => s.products);
  const city = useAppStore((s) => s.city);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>({ name: "", phone: "", street: "", number: "", complement: "", neighborhood: "", city });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [option, setOption] = useState<DeliveryOptionId>("standard");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [refuse, setRefuse] = useState(false);
  const [paying, setPaying] = useState(false);

  const summary = summarizeCart(cart, products, address.city, option);

  if (!cart.length && !paying) {
    return <EmptyState icon={ShoppingBasket} title="Nada para finalizar" text="Seu carrinho está vazio." action={<Button asChild variant="market"><Link to="/">Ir para a feira</Link></Button>} />;
  }

  const nextFromAddress = () => {
    const r = addressSchema.safeParse(address);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      toast.error("Confira os campos do endereço");
      return;
    }
    // Produtores que não atendem a cidade escolhida
    const blocked = summary.groups.filter((g) => !getProducer(g.producerId)?.servesCities.includes(address.city));
    if (blocked.length) { toast.error(`${blocked.map((b) => getProducer(b.producerId)?.name).join(", ")} não entrega em ${getCity(address.city).name}`); return; }
    setErrors({}); setStep(1);
  };

  const pay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1600)); // MOCK: simula processamento
    const r = actions.placeOrder({ address, deliveryOption: option, method, simulateRefusal: refuse });
    if (!r.ok) { setPaying(false); toast.error(r.error); return; }
    toast.success("Pagamento aprovado! Pedido enviado ao produtor.");
    navigate({ to: "/pedidos", search: { checkout: r.checkoutId } });
  };

  const field = (k: keyof Address, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <Input value={(address[k] as string) ?? ""} onChange={(e) => setAddress({ ...address, [k]: e.target.value })} className="h-11 rounded-xl bg-card" aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <span className="text-xs font-medium text-destructive">{errors[k]}</span>}
    </label>
  );

  return (
    <div>
      <PageHeader title="Finalizar pedido" />
      <ol className="mb-6 flex items-center gap-2 overflow-x-auto">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={cn("grid size-7 place-items-center rounded-full text-xs font-bold", i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>{i < step ? <Check className="size-4" /> : i + 1}</span>
            <span className={cn("whitespace-nowrap text-sm font-semibold", i > step && "text-muted-foreground")}>{s}</span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold">Onde vamos entregar?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {field("name", "Nome completo")}
                {field("phone", "Telefone / WhatsApp", { inputMode: "tel", placeholder: "(22) 99999-0000" })}
                <div className="sm:col-span-2">{field("street", "Rua")}</div>
                {field("number", "Número")}
                {field("complement", "Complemento (opcional)")}
                {field("neighborhood", "Bairro")}
                <label className="block space-y-1">
                  <span className="text-sm font-medium">Cidade</span>
                  <select value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value as CityId })} className="h-11 w-full rounded-xl border border-input bg-card px-3">
                    {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              </div>
              <Button variant="market" size="lg" className="w-full" onClick={nextFromAddress}>Continuar</Button>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold">Como prefere receber?</h2>
              <MockNotice>Valores de entrega simulados por cidade. Sem cálculo de rota real.</MockNotice>
              {DELIVERY_OPTIONS.map((o) => {
                const fee = summarizeCart(cart, products, address.city, o.id).deliveryFee;
                return (
                  <button key={o.id} onClick={() => setOption(o.id)} className={cn("flex w-full items-center justify-between rounded-xl border-2 p-4 text-left", option === o.id ? "border-primary bg-primary-soft" : "border-border")}>
                    <div><div className="font-bold">{o.label}</div><div className="text-sm text-muted-foreground">{o.description} · {getCity(address.city).etaMinutes.join("–")} min</div></div>
                    <div className="font-bold">{brl(fee)}</div>
                  </button>
                );
              })}
              {summary.groups.length > 1 && <p className="text-sm text-muted-foreground">Seu carrinho tem {summary.groups.length} produtores: serão {summary.groups.length} entregas.</p>}
              <Nav back={() => setStep(0)} next={() => setStep(2)} />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold">Pagamento</h2>
              <MockNotice>Pagamento SIMULADO — nenhum valor é cobrado. Não há integração com gateway.</MockNotice>
              <div className="grid gap-3 sm:grid-cols-2">
                <PayOption active={method === "pix"} onClick={() => setMethod("pix")} icon={<QrCode />} title="PIX" text="Aprovação imediata" />
                <PayOption active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard />} title="Cartão" text="Crédito ou débito" />
              </div>
              {method === "pix" ? (
                <div className="flex items-center gap-4 rounded-xl bg-muted p-4">
                  <div className="grid size-24 place-items-center rounded-lg bg-card text-xs text-muted-foreground"><QrCode className="size-16" /></div>
                  <p className="text-sm text-muted-foreground">O QR Code PIX real será gerado pelo gateway na versão de produção.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input className="h-11 rounded-xl sm:col-span-2" placeholder="Número do cartão (simulado)" defaultValue="4242 4242 4242 4242" />
                  <Input className="h-11 rounded-xl" placeholder="MM/AA" defaultValue="12/30" />
                  <Input className="h-11 rounded-xl" placeholder="CVV" defaultValue="123" />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={refuse} onChange={(e) => setRefuse(e.target.checked)} /> Simular pagamento recusado</label>
              <Nav back={() => setStep(1)} next={() => setStep(3)} />
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold">Revise seu pedido</h2>
              <div className="rounded-xl bg-muted p-3 text-sm">
                <div className="font-semibold">{address.name} · {address.phone}</div>
                <div className="text-muted-foreground">{address.street}, {address.number} {address.complement} — {address.neighborhood}, {getCity(address.city).name}</div>
                <div className="mt-1 text-muted-foreground">{DELIVERY_OPTIONS.find((o) => o.id === option)?.label} · {method === "pix" ? "PIX" : "Cartão"}</div>
              </div>
              {summary.groups.map((g, i) => (
                <div key={g.producerId} className="rounded-xl border p-3">
                  <div className="mb-2 flex justify-between text-sm font-bold"><span>Pedido {i + 1} · {getProducer(g.producerId)?.name}</span><span>{brl(g.total)}</span></div>
                  <ul className="space-y-1 text-sm">{g.lines.map((l) => <li key={l.product.id} className="flex justify-between text-muted-foreground"><span>{l.quantity}× {l.product.name}</span><span>{brl(l.lineTotal)}</span></li>)}</ul>
                  <div className="mt-2 flex justify-between border-t pt-2 text-xs text-muted-foreground"><span>Taxa {brl(g.platformFee)} · Entrega {brl(g.deliveryFee)}</span></div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="lg" onClick={() => setStep(2)} disabled={paying}>Voltar</Button>
                <Button variant="market" size="lg" className="flex-1" onClick={pay} disabled={paying}>
                  {paying ? <><Loader2 className="animate-spin" /> Processando pagamento…</> : `Pagar ${brl(summary.total)}`}
                </Button>
              </div>
            </>
          )}
        </div>
        <aside className="h-fit space-y-3 rounded-2xl bg-card p-5 shadow-card md:sticky md:top-24">
          <h2 className="text-lg font-bold">Resumo</h2>
          <CartSummaryBox summary={summary} />
        </aside>
      </div>
    </div>
  );
}

function Nav({ back, next }: { back: () => void; next: () => void }) {
  return <div className="flex gap-2"><Button variant="outline" size="lg" onClick={back}>Voltar</Button><Button variant="market" size="lg" className="flex-1" onClick={next}>Continuar</Button></div>;
}
function PayOption({ active, onClick, icon, title, text }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; text: string }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left [&_svg]:size-6", active ? "border-primary bg-primary-soft text-primary" : "border-border")}>
      {icon}<div><div className="font-bold">{title}</div><div className="text-xs text-muted-foreground">{text}</div></div>
    </button>
  );
}
