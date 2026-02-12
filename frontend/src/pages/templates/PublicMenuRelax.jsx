import React, { useEffect, useMemo, useRef, useState } from "react";

const money = (n) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
};

const PAYMENT_LABELS = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
  tarjeta: "Tarjeta",
  modo: "Modo",
  otro: "Otro",
};

const PublicMenuAccordion = ({ data, mode = "salon" }) => {
  const isDelivery = mode === "delivery";

  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || "#2563eb";

  const [openCategory, setOpenCategory] = useState(null);

  // ============================
  // DELIVERY STATE
  // ============================
  const [cart, setCart] = useState([]);
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [anotacion, setAnotacion] = useState("");
  const [orderName, setOrderName] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);

  const fabRef = useRef(null);
  const [bottomPad, setBottomPad] = useState(0);

  const restaurantName = data?.restaurantName || "Menú";
  const menuItems = Array.isArray(data?.menuItems) ? data.menuItems : [];

  // ============================
  // CATEGORÍAS
  // ============================
  const categories = useMemo(
    () => [...new Set(menuItems.map((i) => i.category).filter(Boolean))],
    [menuItems]
  );

  const itemsByCategory = useMemo(() => {
    const map = {};
    for (const item of menuItems) {
      if (!item?.category) continue;
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [menuItems]);

  // ============================
  // MÉTODOS DE PAGO DESDE ADMIN
  // ============================
  const paymentOptionsFromAdmin = useMemo(() => {
    const raw =
      data?.paymentMethods ||
      data?.admin?.paymentMethods ||
      data?.menu?.paymentMethods ||
      [];

    return Array.isArray(raw)
      ? raw.map((x) => String(x).trim().toLowerCase()).filter(Boolean)
      : [];
  }, [data]);

  const paymentPercentsFromAdmin = useMemo(() => {
    const raw =
      data?.paymentMethodPercents ||
      data?.admin?.paymentMethodPercents ||
      data?.menu?.paymentMethodPercents ||
      {};

    if (!raw || typeof raw !== "object") return {};

    const normalized = {};
    for (const [k, v] of Object.entries(raw)) {
      const key = String(k || "").trim().toLowerCase();
      const num = Number(v);
      if (!key) continue;
      normalized[key] = Number.isFinite(num) ? num : 0;
    }
    return normalized;
  }, [data]);

  const paymentOptionsLabeled = useMemo(() => {
    return paymentOptionsFromAdmin.map((key) => ({
      key,
      label: PAYMENT_LABELS[key] || key,
    }));
  }, [paymentOptionsFromAdmin]);

  useEffect(() => {
    if (!isDelivery) return;
    if (paymentMethod) return;
    if (!paymentOptionsFromAdmin.length) return;
    setPaymentMethod(paymentOptionsFromAdmin[0]);
  }, [isDelivery, paymentMethod, paymentOptionsFromAdmin]);

  // ============================
  // CARRITO
  // ============================
  const addToCart = (item) => {
    if (!item?.available) return;

    setCart((prev) => {
      const found = prev.find((x) => x._id === item._id);
      if (found) {
        return prev.map((x) =>
          x._id === item._id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });

    setCartOpen(true);
  };

  const decQty = (id) => {
    setCart((prev) =>
      prev
        .map((x) => (x._id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const incQty = (id) => {
    setCart((prev) =>
      prev.map((x) => (x._id === id ? { ...x, qty: x.qty + 1 } : x))
    );
  };

  const clearCart = () => setCart([]);

  const itemsCount = useMemo(
    () => cart.reduce((s, x) => s + x.qty, 0),
    [cart]
  );

  // ============================
  // SUBTOTAL
  // ============================
  const subtotal = useMemo(() => {
    return cart.reduce((sum, x) => sum + Number(x.price) * x.qty, 0);
  }, [cart]);

  // ============================
  // RECARGO
  // ============================
  const feePct = useMemo(() => {
    const key = String(paymentMethod || "").trim().toLowerCase();
    if (!key) return 0;
    return Number(paymentPercentsFromAdmin[key] || 0);
  }, [paymentMethod, paymentPercentsFromAdmin]);

  const totalFinal = useMemo(() => {
    if (!feePct) return subtotal;
    return subtotal * (1 + feePct / 100);
  }, [subtotal, feePct]);

  // ============================
  // WHATSAPP
  // ============================
  const buildWhatsAppText = () => {
    const lines = cart.map(
      (x) =>
        `• ${x.qty} x ${x.name} — $${money(x.price)} (sub: $${money(
          x.price * x.qty
        )})`
    );

    return (
      `*Pedido*\n` +
      `*Nombre:* ${orderName || "Cliente"}\n` +
      `*Comercio:* ${restaurantName}\n\n` +
      `*Detalle:*\n${lines.join("\n")}\n\n` +
      `*Subtotal:* $${money(subtotal)}\n` +
      (feePct > 0
        ? `*Recargo (${feePct}%):* $${money(totalFinal - subtotal)}\n`
        : "") +
      `*TOTAL:* $${money(totalFinal)}\n` +
      `*Forma de pago:* ${
        PAYMENT_LABELS[paymentMethod] || paymentMethod
      }\n`
    );
  };

  const sendToWhatsApp = () => {
    if (!cart.length) return;

    const comercioWhatsApp = String(data?.whatsapp || "").replace(/\D/g, "");
    if (!comercioWhatsApp) return;

    const text = buildWhatsAppText();

    window.open(
      `https://wa.me/${comercioWhatsApp}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {categories.map((category) => {
          const isOpen = openCategory === category;
          const items = itemsByCategory[category] || [];

          return (
            <div key={category} className="bg-white rounded-xl mb-3 shadow">
              <button
                onClick={() =>
                  setOpenCategory(isOpen ? null : category)
                }
                className="w-full px-5 py-4 flex justify-between font-bold"
              >
                {category}
              </button>

              {isOpen && (
                <div className="px-5 pb-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          ${money(item.price)}
                        </p>
                      </div>

                      {isDelivery && (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3 py-1 border rounded"
                          style={{ color: primaryColor }}
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDelivery && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow">
          <div className="flex justify-between font-bold mb-2">
            <span>Total:</span>
            <span>${money(totalFinal)}</span>
          </div>

          <button
            onClick={sendToWhatsApp}
            className="w-full py-2 rounded text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Enviar pedido por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicMenuAccordion;
