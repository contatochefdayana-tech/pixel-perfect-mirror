import { describe, expect, it } from "vitest";
import { canCancelOrder, checkStock, deliveryFee, nextDeliveryStatus, nextOrderStatus, platformFee, summarizeCart, timelineIndex } from "./rules";
import { PRODUCTS } from "@/data/mock";

describe("regras de negócio", () => {
  it("taxa da plataforma é 5% dos produtos", () => {
    expect(platformFee(100)).toBe(5);
    expect(platformFee(41)).toBe(2.05);
  });

  it("entrega usa a tabela da cidade", () => {
    expect(deliveryFee("cabo-frio")).toBe(7.9);
    expect(deliveryFee("buzios")).toBe(9.9);
  });

  it("carrinho com 2 produtores gera 2 grupos e 2 taxas de entrega", () => {
    const s = summarizeCart([{ productId: "banana-prata", quantity: 2 }, { productId: "mel-artesanal", quantity: 1 }], PRODUCTS, "cabo-frio");
    expect(s.groups).toHaveLength(2);
    expect(s.subtotal).toBe(48);
    expect(s.platformFee).toBe(2.4);
    expect(s.deliveryFee).toBe(15.8);
    expect(s.total).toBe(66.2);
  });

  it("bloqueia produto indisponível e estoque insuficiente", () => {
    const abacate = PRODUCTS.find((p) => p.id === "abacate")!;
    const tomate = PRODUCTS.find((p) => p.id === "tomate-organico")!;
    expect(checkStock(abacate, 1)).toMatchObject({ ok: false, reason: "unavailable" });
    expect(checkStock(tomate, 4)).toMatchObject({ ok: false, reason: "insufficient", max: 3 });
  });

  it("fluxo do pedido do produtor", () => {
    expect(nextOrderStatus("NOVO")).toBe("CONFIRMADO");
    expect(nextOrderStatus("EM_PREPARACAO")).toBe("PRONTO_RETIRADA");
    expect(nextOrderStatus("PRONTO_RETIRADA")).toBeNull();
  });

  it("fluxo da entrega do motoboy", () => {
    expect(nextDeliveryStatus("DISPONIVEL")).toBe("ACEITA");
    expect(nextDeliveryStatus("EM_ENTREGA")).toBe("ENTREGUE");
    expect(nextDeliveryStatus("ENTREGUE")).toBeNull();
  });

  it("não cancela após motoboy aceitar", () => {
    expect(canCancelOrder("CONFIRMADO", "AGUARDANDO")).toBe(true);
    expect(canCancelOrder("PRONTO_RETIRADA", "ACEITA")).toBe(false);
  });

  it("timeline reflete entrega", () => {
    expect(timelineIndex("PRONTO_RETIRADA", "ACEITA")).toBe(4);
    expect(timelineIndex("ENTREGUE", "ENTREGUE")).toBe(6);
  });
});
