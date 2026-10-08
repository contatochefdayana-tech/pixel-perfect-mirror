import { Link } from "@tanstack/react-router";
import { Bike, Home, Package, ShoppingBasket, Store, UserRound } from "lucide-react";
import { useAppStore } from "@/state/store";
import { CitySelect } from "./shared";

const ROLE_LABEL = { buyer: "Comprador", producer: "Produtor", courier: "Motoboy" } as const;

export function SiteHeader() {
  const count = useAppStore((s) => s.cart.reduce((n, i) => n + i.quantity, 0));
  const role = useAppStore((s) => s.role);
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg">🧺</span>
            <span className="font-display text-xl font-extrabold text-primary">Feira<span className="text-accent">Virtual</span></span>
          </Link>
          <CitySelect className="ml-auto hidden md:block" />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/pedidos">Pedidos</NavLink>
            <NavLink to="/produtor">Produtor</NavLink>
            <NavLink to="/motoboy">Motoboy</NavLink>
            <Link to="/perfil" className="ml-1 inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-medium">
              <UserRound className="size-4" />{role ? ROLE_LABEL[role] : "Entrar"}
            </Link>
          </nav>
          <Link to="/carrinho" aria-label="Carrinho" className="relative ml-auto grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-pop md:ml-1">
            <ShoppingBasket className="size-5" />
            {count > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{count}</span>}
          </Link>
        </div>
      </header>
      {/* Navegação inferior mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <TabLink to="/" icon={Home} label="Feira" />
        <TabLink to="/pedidos" icon={Package} label="Pedidos" />
        <TabLink to="/produtor" icon={Store} label="Produtor" />
        <TabLink to="/motoboy" icon={Bike} label="Motoboy" />
        <TabLink to="/perfil" icon={UserRound} label="Perfil" />
      </nav>
    </>
  );
}

function NavLink({ to, children }: { to: "/pedidos" | "/produtor" | "/motoboy"; children: string }) {
  return <Link to={to} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "!text-primary bg-primary-soft" }}>{children}</Link>;
}
function TabLink({ to, icon: Icon, label }: { to: "/" | "/pedidos" | "/produtor" | "/motoboy" | "/perfil"; icon: typeof Home; label: string }) {
  return (
    <Link to={to} activeOptions={{ exact: to === "/" }} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground" activeProps={{ className: "!text-primary" }}>
      <Icon className="size-5" />{label}
    </Link>
  );
}
