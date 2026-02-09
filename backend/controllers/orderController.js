const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const toMoney = (n) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
};

const safeText = (t) => (typeof t === "string" ? t : "").trim();

exports.createOrderPdf = async (req, res) => {
  try {
    const { restaurantName, address, items, total } = req.body;

    if (!safeText(address)) {
      return res.status(400).json({ message: "Address is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    const orderId = Date.now().toString();

    const ordersDir = path.join(__dirname, '..', 'public', 'orders');
    fs.mkdirSync(ordersDir, { recursive: true });

    const filename = `order-${orderId}.pdf`;
    const filepath = path.join(ordersDir, filename);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream(filepath));

    doc.fontSize(18).text(safeText(restaurantName) || "Pedido Delivery", { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Pedido: #${orderId}`);
    doc.text(`Dirección: ${safeText(address)}`);
    doc.moveDown();

    doc.fontSize(14).text("Items:");
    doc.moveDown(0.5);

    let calcTotal = 0;

    items.forEach((it) => {
      const name = safeText(it?.name) || "Item";
      const qty = Number(it?.qty) || 0;
      const priceNum = typeof it?.price === "number" ? it.price : Number(it?.price);
      const price = Number.isFinite(priceNum) ? priceNum : 0;

      calcTotal += qty * price;

      doc.fontSize(12).text(`${qty} x ${name}  -  $${toMoney(price)} c/u`);
    });

    doc.moveDown();
    const finalTotal = Number.isFinite(Number(total)) ? Number(total) : calcTotal;

    doc.fontSize(14).text(`TOTAL: $${toMoney(finalTotal)}`, { align: "right" });
    doc.end();

    // Link público al PDF
    const pdfUrl = `/orders/${filename}`;

    return res.json({ orderId, pdfUrl });
  } catch (err) {
    console.error("createOrderPdf error:", err);
    return res.status(500).json({ message: "Server error generating PDF" });
  }
};
