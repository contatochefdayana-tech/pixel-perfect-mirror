import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bike, RotateCcw, ShoppingBasket, Store } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/domain/types";
import { actions, useAppStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { MockNotice, PageHeader } from "@/components/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [
    { title: "Escolha seu perfil — Feira Virtual" }, { name: "description", content: "Entre como comprador, produtor ou motoboy." },
    { property: "og:title", content: "Escolha seu perfil — Feira Virtual" }, { property: "og:description", content: "Comprador, produtor ou motoboy." },
  ] }),
  component: ProfilePage,
});

const ROLES: { id: Role; title: string; text: string; icon: typeof Store; to: "/" | "/produtor" | "/motoboy" }[] = [
  { id: "buyer", title: "Sou comprador", text: "Compre direto de produtores locais.", icon: ShoppingBasket, to: "/" },
  { id: "producer", title: "Sou produtor", text: "Gerencie produtos, estoque e pedidos.", icon: Store, to: "/produtor" },
  { id: "courier", title: "Sou motoboy", text: "Aceite entregas e acompanhe ganhos.", icon: Bike, to: "/motoboy" },
];

function ProfilePage() {
  const role = useAppStore((s) => s.role);
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Como você quer entrar?" subtitle="Login simulado — troque de perfil a qualquer momento." />
      <MockNotice>Autenticação SIMULADA. Em produção: login real com contas e permissões por perfil.</MockNotice>
      <div className="mt-4 grid gap-3">
        {ROLES.map((r) => (
          <button key={r.id} onClick={() => { actions.setRole(r.id); toast.success(`Entrou como ${r.title.replace("Sou ", "")}`); navigate({ to: r.to }); }}
            className={cn("flex items-center gap-4 rounded-2xl border-2 bg-card p-5 text-left shadow-card transition-colors hover:border-primary", role === r.id ? "border-primary" : "border-transparent")}>
            <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary"><r.icon className="size-7" /></span>
            <span><span className="block text-lg font-bold">{r.title}</span><span className="text-sm text-muted-foreground">{r.text}</span></span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex gap-2">
        {role && <Button variant="outline" onClick={() => { actions.setRole(null); toast("Você saiu"); }}>Sair</Button>}
        <Button variant="ghost" onClick={() => { if (confirm("Restaurar todos os dados de demonstração?")) { actions.resetDemo(); toast.success("Dados de demonstração restaurados"); } }}><RotateCcw /> Restaurar demo</Button>
      </div>
    </div>
  );
}
